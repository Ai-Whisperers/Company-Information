import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../db/prisma.service';
import { GitHubService } from '../integrations/github.service';
// HealthStatus type - using string for SQLite compatibility
type HealthStatus = 'GOOD' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';

@Injectable()
export class GitHubHealthScanner {
  private readonly logger = new Logger(GitHubHealthScanner.name);

  constructor(
    private prisma: PrismaService,
    private github: GitHubService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async scanAllRepositories() {
    this.logger.log('Starting repository health scan');
    const startTime = Date.now();

    try {
      const repos = await this.github.listOrganizationRepos();
      let processed = 0;
      let failed = 0;

      for (const repo of repos) {
        try {
          await this.scanRepository(repo.name);
          processed++;
        } catch (error) {
          this.logger.error(`Failed to scan ${repo.name}: ${error.message}`);
          failed++;
        }
      }

      const duration = Math.round((Date.now() - startTime) / 1000);

      await this.prisma.syncLog.create({
        data: {
          syncType: 'GITHUB_SCAN',
          status: failed > 0 ? 'PARTIAL' : 'COMPLETED',
          itemsProcessed: processed,
          itemsFailed: failed,
          startedAt: new Date(startTime),
          completedAt: new Date(),
          duration,
        },
      });

      this.logger.log(`Health scan completed: ${processed} processed, ${failed} failed in ${duration}s`);
    } catch (error) {
      this.logger.error(`Health scan failed: ${error.message}`);

      await this.prisma.syncLog.create({
        data: {
          syncType: 'GITHUB_SCAN',
          status: 'FAILED',
          errorMessage: error.message,
          startedAt: new Date(startTime),
          completedAt: new Date(),
        },
      });
    }
  }

  async scanRepository(repoName: string) {
    this.logger.debug(`Scanning repository: ${repoName}`);

    // Fetch repository details
    const repoData = await this.github.getRepository(repoName);
    const protection = await this.github.getBranchProtection(repoName, repoData.default_branch);
    const pulls = await this.github.getPullRequests(repoName);

    // Fetch commits from last 1 hour for hourly metrics
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCommits = await this.github.getRecentCommits(repoName, 7);
    const commitsLastHour = recentCommits.filter(commit => {
      if (!commit.commit.author?.date) return false;
      const commitDate = new Date(commit.commit.author.date);
      return commitDate >= oneHourAgo;
    }).length;

    // Calculate health metrics (still based on 7-day activity for health score)
    const stalePRs = pulls.filter(pr => {
      // FIX: Check updated_at instead of created_at for stale PRs
      const lastActivity = pr.updated_at || pr.created_at;
      const daysOld = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);
      return daysOld > 7;
    });

    const healthScore = this.calculateHealthScore({
      hasProtection: !!protection,
      stalePRs: stalePRs.length,
      openPRs: pulls.length,
      recentCommits: recentCommits.length,  // 7-day commits for health score
      openIssues: repoData.open_issues_count,
    });

    const healthStatus = this.getHealthStatus(healthScore);

    // Upsert repository data
    const repository = await this.prisma.repository.upsert({
      where: { name: repoName },
      update: {
        url: repoData.html_url,
        description: repoData.description,
        isPrivate: repoData.private ? 1 : 0,
        starCount: repoData.stargazers_count,
        forkCount: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        openPRs: pulls.length,
        lastActivity: repoData.pushed_at ? new Date(repoData.pushed_at) : null,
        healthScore,
        healthStatus: healthStatus as any,
        hasProtection: protection ? 1 : 0,
        requiredChecks: JSON.stringify(protection?.required_status_checks?.checks) || null,
        updatedAt: new Date(),
      },
      create: {
        name: repoName,
        url: repoData.html_url,
        description: repoData.description,
        isPrivate: repoData.private ? 1 : 0,
        starCount: repoData.stargazers_count,
        forkCount: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        openPRs: pulls.length,
        lastActivity: repoData.pushed_at ? new Date(repoData.pushed_at) : null,
        healthScore,
        healthStatus: healthStatus as any,
        hasProtection: protection ? 1 : 0,
        requiredChecks: JSON.stringify(protection?.required_status_checks?.checks) || null,
      },
    });

    // Record health checks
    const checks = [
      {
        checkType: 'branch_protection',
        status: protection ? 'PASS' : 'FAIL',
        message: protection ? 'Branch protection enabled' : 'Branch protection not configured',
      },
      {
        checkType: 'stale_prs',
        status: stalePRs.length === 0 ? 'PASS' : stalePRs.length > 3 ? 'FAIL' : 'PASS',
        message: `${stalePRs.length} stale PRs (>7 days old)`,
        details: { stalePRs: stalePRs.map(pr => ({ number: pr.number, title: pr.title })) },
      },
      {
        checkType: 'activity',
        status: recentCommits.length > 0 ? 'PASS' : 'FAIL',
        message: `${recentCommits.length} commits in last 7 days`,
      },
    ];

    for (const check of checks) {
      await this.prisma.healthCheck.create({
        data: {
          repositoryId: repository.id,
          checkType: check.checkType,
          status: check.status as any,
          message: check.message,
          details: JSON.stringify(check.details) || null,
        },
      });
    }

    /**
     * SAVE TO REPOSITORYSCAN TABLE
     * This table is used by the dashboard for hourly metrics and trends.
     * Alert flags are determined based on thresholds.
     */
    const needsAttention = healthScore < 70;
    const hasStalePrs = stalePRs.length > 0;
    const highIssueCount = repoData.open_issues_count > 10;
    const inactive = recentCommits.length === 0;

    await this.prisma.repositoryScan.create({
      data: {
        repositoryName: repoName,
        fullName: repoData.full_name,
        repositoryUrl: repoData.html_url,
        visibility: repoData.private ? 'private' : 'public',
        defaultBranch: repoData.default_branch,
        commitsLastHour,  // Actual hourly commits
        openPrs: pulls.length,
        stalePrs: stalePRs.length,
        openIssues: repoData.open_issues_count,
        totalBranches: 1,  // TODO: Fetch actual branch count
        healthScore,
        lastUpdated: repoData.updated_at ? new Date(repoData.updated_at) : null,
        lastPushed: repoData.pushed_at ? new Date(repoData.pushed_at) : null,
        sizeKb: repoData.size,
        stars: repoData.stargazers_count,
        watchers: repoData.watchers_count,
        forks: repoData.forks_count,
        needsAttention: needsAttention ? 1 : 0,
        hasStalePrs: hasStalePrs ? 1 : 0,
        highIssueCount: highIssueCount ? 1 : 0,
        tooManyBranches: 0,  // TODO: Implement branch count threshold
        inactive: inactive ? 1 : 0,
        scanTimestamp: new Date(),
      },
    });

    this.logger.debug(`Scan complete for ${repoName}: health=${healthScore}, commits(1h)=${commitsLastHour}`);

    return repository;
  }

  /**
   * CANONICAL HEALTH SCORE CALCULATION
   * This is the single source of truth for repository health scores.
   * All other health score calculations should be deprecated in favor of this method.
   *
   * Scoring System (max 100 points):
   *
   * 1. Branch Protection (30 points)
   *    - Protected main branch: +30 points
   *    - No protection: +0 points
   *    Rationale: Branch protection ensures code review and prevents direct pushes
   *
   * 2. Pull Request Health (25 points)
   *    - 0 stale PRs (>7 days old): +25 points
   *    - 1-2 stale PRs: +15 points
   *    - 3-5 stale PRs: +5 points
   *    - >5 stale PRs: +0 points
   *    Rationale: Stale PRs indicate poor code review hygiene
   *
   * 3. Activity Level (25 points) - Based on last 7 days
   *    - ≥10 commits: +25 points
   *    - 5-9 commits: +15 points
   *    - 1-4 commits: +10 points
   *    - 0 commits: +0 points
   *    Rationale: Active development shows healthy project engagement
   *
   * 4. Issue Management (20 points)
   *    - 0 open issues: +20 points
   *    - 1-5 issues: +15 points
   *    - 6-10 issues: +10 points
   *    - 11-20 issues: +5 points
   *    - >20 issues: +0 points
   *    Rationale: Controlled issue count shows good project maintenance
   *
   * Health Categories (Aligned with Frontend):
   * - GOOD: ≥70 points (Green - Healthy)
   * - WARNING: 50-69 points (Yellow/Orange - Needs Attention)
   * - CRITICAL: <50 points (Red - Critical)
   */
  private calculateHealthScore(metrics: {
    hasProtection: boolean;
    stalePRs: number;
    openPRs: number;
    recentCommits: number;
    openIssues: number;
  }): number {
    let score = 0;

    // Branch protection (30 points)
    if (metrics.hasProtection) score += 30;

    // PR health (25 points)
    if (metrics.stalePRs === 0) score += 25;
    else if (metrics.stalePRs <= 2) score += 15;
    else if (metrics.stalePRs <= 5) score += 5;

    // Activity (25 points)
    if (metrics.recentCommits >= 10) score += 25;
    else if (metrics.recentCommits >= 5) score += 15;
    else if (metrics.recentCommits >= 1) score += 10;

    // Issue management (20 points)
    if (metrics.openIssues === 0) score += 20;
    else if (metrics.openIssues <= 5) score += 15;
    else if (metrics.openIssues <= 10) score += 10;
    else if (metrics.openIssues <= 20) score += 5;

    return Math.min(100, score);
  }

  /**
   * Get health status based on score
   * Thresholds aligned with frontend and repository monitor service
   */
  private getHealthStatus(score: number): HealthStatus {
    if (score >= 70) return 'GOOD';      // Healthy repos
    if (score >= 50) return 'WARNING';   // Needs attention
    return 'CRITICAL';                   // Critical issues
  }
}