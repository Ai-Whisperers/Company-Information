import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { RepositoryScanDto, BulkScanDto, HealthOverviewDto } from './dto/repository-scan.dto';

@Injectable()
export class RepositoryMonitorService {
  private readonly logger = new Logger(RepositoryMonitorService.name);

  constructor(private prisma: PrismaService) {}

  async saveScan(scanData: RepositoryScanDto) {
    try {
      const scan = await this.prisma.repositoryScan.create({
        data: {
          repositoryName: scanData.repository,
          fullName: scanData.full_name,
          repositoryUrl: scanData.url,
          visibility: scanData.visibility,
          defaultBranch: scanData.default_branch,
          commitsLastHour: scanData.commits_last_6h,
          openPrs: scanData.open_pull_requests,
          stalePrs: scanData.stale_pull_requests,
          openIssues: scanData.open_issues,
          totalBranches: scanData.total_branches,
          healthScore: scanData.health_score,
          lastUpdated: scanData.last_updated ? new Date(scanData.last_updated) : null,
          lastPushed: scanData.last_pushed ? new Date(scanData.last_pushed) : null,
          sizeKb: scanData.size_kb,
          stars: scanData.stars || 0,
          watchers: scanData.watchers || 0,
          forks: scanData.forks || 0,
          needsAttention: scanData.needs_attention ? 1 : 0,
          hasStalePrs: scanData.has_stale_prs ? 1 : 0,
          highIssueCount: scanData.high_issue_count ? 1 : 0,
          tooManyBranches: scanData.too_many_branches ? 1 : 0,
          inactive: scanData.inactive ? 1 : 0,
          scanTimestamp: new Date(scanData.scan_timestamp),
        },
      });

      this.logger.log(`Saved scan for repository: ${scanData.repository}`);
      return { success: true, scan };
    } catch (error) {
      this.logger.error(`Error saving scan: ${error.message}`, error.stack);
      throw error;
    }
  }

  async saveBulkScans(bulkData: BulkScanDto) {
    try {
      const results = await Promise.allSettled(
        bulkData.scans.map(scan => this.saveScan(scan))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      this.logger.log(`Bulk scan complete: ${successful} successful, ${failed} failed`);

      return {
        success: true,
        summary: bulkData.summary,
        results: {
          total: bulkData.scans.length,
          successful,
          failed,
        },
      };
    } catch (error) {
      this.logger.error(`Error saving bulk scans: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getHealthOverview(): Promise<HealthOverviewDto> {
    const latestScans = await this.prisma.repositoryScan.findMany({
      orderBy: { scanTimestamp: 'desc' },
      take: 100,
    });

    // Get unique repositories (latest scan for each)
    const uniqueRepos = new Map();
    latestScans.forEach(scan => {
      if (!uniqueRepos.has(scan.repositoryName)) {
        uniqueRepos.set(scan.repositoryName, scan);
      }
    });

    const repos = Array.from(uniqueRepos.values());
    const healthyCount = repos.filter(r => r.healthScore >= 70).length;
    const needsAttentionCount = repos.filter(r => r.healthScore >= 50 && r.healthScore < 70).length;
    const criticalCount = repos.filter(r => r.healthScore < 50).length;
    const avgHealth = repos.reduce((sum, r) => sum + r.healthScore, 0) / repos.length || 0;
    const totalCommits = repos.reduce((sum, r) => sum + r.commitsLastHour, 0);
    const totalOpenPrs = repos.reduce((sum, r) => sum + r.openPrs, 0);
    const totalStalePrs = repos.reduce((sum, r) => sum + r.stalePrs, 0);

    return {
      total_repositories: repos.length,
      healthy_count: healthyCount,
      needs_attention_count: needsAttentionCount,
      critical_count: criticalCount,
      average_health_score: Math.round(avgHealth),
      last_scan: repos[0]?.scanTimestamp.toISOString() || new Date().toISOString(),
      total_commits_today: totalCommits,
      total_open_prs: totalOpenPrs,
      total_stale_prs: totalStalePrs,
    };
  }

  async getRepositoryHealth(name: string) {
    const latestScan = await this.prisma.repositoryScan.findFirst({
      where: { repositoryName: name },
      orderBy: { scanTimestamp: 'desc' },
    });

    if (!latestScan) {
      return null;
    }

    return {
      repository: latestScan.repositoryName,
      health_score: latestScan.healthScore,
      status: this.getHealthStatus(latestScan.healthScore),
      metrics: {
        commits_last_6h: latestScan.commitsLastHour,
        open_prs: latestScan.openPrs,
        stale_prs: latestScan.stalePrs,
        open_issues: latestScan.openIssues,
        total_branches: latestScan.totalBranches,
      },
      alerts: {
        needs_attention: latestScan.needsAttention === 1,
        has_stale_prs: latestScan.hasStalePrs === 1,
        high_issue_count: latestScan.highIssueCount === 1,
        too_many_branches: latestScan.tooManyBranches === 1,
        inactive: latestScan.inactive === 1,
      },
      last_scan: latestScan.scanTimestamp.toISOString(),
    };
  }

  async getAlerts(limit: number = 10) {
    const alerts = await this.prisma.repositoryScan.findMany({
      where: { needsAttention: 1 },
      orderBy: { scanTimestamp: 'desc' },
      take: limit,
    });

    return alerts.map(alert => ({
      repository: alert.repositoryName,
      health_score: alert.healthScore,
      issues: [
        alert.hasStalePrs === 1 && `${alert.stalePrs} stale PRs`,
        alert.highIssueCount === 1 && `${alert.openIssues} open issues`,
        alert.tooManyBranches === 1 && `${alert.totalBranches} branches`,
        alert.inactive === 1 && 'No recent activity',
      ].filter(Boolean),
      url: alert.repositoryUrl,
      scan_time: alert.scanTimestamp.toISOString(),
    }));
  }

  async getRepositoryTrends(name: string, days: number = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const scans = await this.prisma.repositoryScan.findMany({
      where: {
        repositoryName: name,
        scanTimestamp: { gte: since },
      },
      orderBy: { scanTimestamp: 'asc' },
    });

    return {
      repository: name,
      data_points: scans.map(scan => ({
        date: scan.scanTimestamp.toISOString(),
        health_score: scan.healthScore,
        commits: scan.commitsLastHour,
        open_prs: scan.openPrs,
        open_issues: scan.openIssues,
      })),
    };
  }

  async getSummary() {
    const overview = await this.getHealthOverview();
    const alerts = await this.getAlerts(5);
    const latestScans = await this.getLatestScans(10);

    return {
      overview,
      recent_alerts: alerts,
      latest_scans: latestScans,
    };
  }

  async getLatestScans(limit: number = 25) {
    const scans = await this.prisma.repositoryScan.findMany({
      orderBy: { scanTimestamp: 'desc' },
      take: limit,
    });

    return scans.map(scan => ({
      repository: scan.repositoryName,
      health_score: scan.healthScore,
      status: this.getHealthStatus(scan.healthScore),
      commits_last_6h: scan.commitsLastHour,
      open_prs: scan.openPrs,
      stale_prs: scan.stalePrs,
      open_issues: scan.openIssues,
      needs_attention: scan.needsAttention === 1,
      scan_time: scan.scanTimestamp.toISOString(),
    }));
  }

  async getScanHistory(params: { repository?: string; days: number; limit: number }) {
    const since = new Date();
    since.setDate(since.getDate() - params.days);

    const where: any = {
      scanTimestamp: { gte: since },
    };

    if (params.repository) {
      where.repositoryName = params.repository;
    }

    const scans = await this.prisma.repositoryScan.findMany({
      where,
      orderBy: { scanTimestamp: 'desc' },
      take: params.limit,
    });

    return scans.map(scan => ({
      repository: scan.repositoryName,
      health_score: scan.healthScore,
      commits_last_6h: scan.commitsLastHour,
      open_prs: scan.openPrs,
      stale_prs: scan.stalePrs,
      open_issues: scan.openIssues,
      total_branches: scan.totalBranches,
      needs_attention: scan.needsAttention === 1,
      scan_timestamp: scan.scanTimestamp.toISOString(),
    }));
  }

  private getHealthStatus(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'needs_attention';
    return 'critical';
  }
}
