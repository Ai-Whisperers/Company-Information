import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { GitHubService } from '../integrations/github.service';
import { marked } from 'marked';
import { format } from 'date-fns';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly github: GitHubService,
  ) {}

  async listRepositories() {
    try {
      // Get from database if available
      const dbRepos = await this.prisma.repository.findMany({
        select: {
          name: true,
          description: true,
          url: true,
          healthScore: true,
          healthStatus: true,
          lastActivity: true,
          starCount: true,
          forkCount: true,
          openIssues: true,
          openPRs: true,
          updatedAt: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      // Fetch last commit for each repository
      const reposWithCommits = await Promise.all(
        dbRepos.map(async (repo) => {
          const lastCommit = await this.github.getLastCommit(repo.name);
          return {
            ...repo,
            lastCommit,
          };
        })
      );

      if (reposWithCommits.length > 0) {
        return reposWithCommits;
      }

      // Otherwise fetch from GitHub
      const githubRepos = await this.github.listOrganizationRepos();
      const githubReposWithCommits = await Promise.all(
        githubRepos.map(async (repo) => {
          const lastCommit = await this.github.getLastCommit(repo.name);
          return {
            name: repo.name,
            description: repo.description,
            url: repo.html_url,
            healthScore: 0,
            healthStatus: 'UNKNOWN',
            lastActivity: repo.pushed_at,
            starCount: repo.stargazers_count,
            forkCount: repo.forks_count,
            openIssues: repo.open_issues_count,
            updatedAt: repo.updated_at,
            lastCommit,
          };
        })
      );

      return githubReposWithCommits;
    } catch (error) {
      this.logger.error(`Failed to list repositories: ${error.message}`);
      throw error;
    }
  }

  async generateRepositoryReport(repoName: string, format: 'markdown' | 'html' | 'json' = 'markdown') {
    this.logger.log(`Generating ${format} report for ${repoName}`);

    try {
      // Fetch repository data from GitHub
      const repoData = await this.github.getRepository(repoName);
      const pulls = await this.github.getPullRequests(repoName);
      const issues = await this.github.getIssues(repoName);
      const commits = await this.github.getRecentCommits(repoName, 30);

      // Fetch or create repository in database
      let repository = await this.prisma.repository.findUnique({
        where: { name: repoName },
      });

      if (!repository) {
        repository = await this.prisma.repository.create({
          data: {
            name: repoName,
            url: repoData.html_url,
            description: repoData.description,
            isPrivate: repoData.private ? 1 : 0,
            starCount: repoData.stargazers_count,
            forkCount: repoData.forks_count,
            openIssues: repoData.open_issues_count,
            openPRs: pulls.length,
            lastActivity: repoData.pushed_at ? new Date(repoData.pushed_at) : null,
            healthScore: this.calculateHealthScore(repoData, pulls, issues, commits),
            healthStatus: 'UNKNOWN',
            hasProtection: 0,
          },
        });
      }

      // Generate report content
      const reportData = {
        repository: {
          name: repoData.name,
          fullName: repoData.full_name,
          description: repoData.description,
          url: repoData.html_url,
          homepage: repoData.homepage,
          language: repoData.language,
          createdAt: repoData.created_at,
          updatedAt: repoData.updated_at,
          pushedAt: repoData.pushed_at,
        },
        metrics: {
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          watchers: repoData.watchers_count,
          openIssues: repoData.open_issues_count,
          openPRs: pulls.length,
          size: repoData.size,
        },
        activity: {
          totalCommits: commits.length,
          recentCommits: commits.slice(0, 10).map(c => ({
            sha: c.sha.substring(0, 7),
            message: c.commit.message.split('\n')[0],
            author: c.commit.author?.name,
            date: c.commit.author?.date,
          })),
        },
        pullRequests: {
          total: pulls.length,
          recent: pulls.slice(0, 5).map(pr => ({
            number: pr.number,
            title: pr.title,
            author: pr.user?.login,
            state: pr.state,
            createdAt: pr.created_at,
          })),
        },
        issues: {
          total: issues.length,
          recent: issues.slice(0, 5).map(issue => ({
            number: issue.number,
            title: issue.title,
            author: issue.user?.login,
            state: issue.state,
            createdAt: issue.created_at,
          })),
        },
        health: {
          score: this.calculateHealthScore(repoData, pulls, issues, commits),
          hasLicense: !!repoData.license,
          hasReadme: true, // GitHub API doesn't easily provide this
          defaultBranch: repoData.default_branch,
          topics: repoData.topics,
        },
      };

      let content: string;

      if (format === 'json') {
        content = JSON.stringify(reportData, null, 2);
      } else {
        content = this.generateMarkdownReport(reportData);
        if (format === 'html') {
          content = await marked(content);
        }
      }

      // Save report to database
      const report = await this.prisma.report.create({
        data: {
          type: 'REPOSITORY_HEALTH',
          week: this.getWeekNumber(new Date()),
          year: new Date().getFullYear(),
          content,
          htmlContent: format === 'html' ? content : null,
          summary: JSON.stringify({
            repository: repoName,
            healthScore: reportData.health.score,
            metrics: reportData.metrics,
          }),
          repositoryId: repository.id,
        },
      });

      return report;
    } catch (error) {
      this.logger.error(`Failed to generate report for ${repoName}: ${error.message}`);
      throw error;
    }
  }

  async getRepositoryReport(repoName: string, format: 'markdown' | 'html' | 'json') {
    const repository = await this.prisma.repository.findUnique({
      where: { name: repoName },
      include: {
        reports: {
          orderBy: { generatedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!repository || repository.reports.length === 0) {
      return null;
    }

    const report = repository.reports[0];

    if (format === 'json' && report.summary) {
      return {
        content: report.summary,
        generatedAt: report.generatedAt,
      };
    }

    return {
      content: format === 'html' ? report.htmlContent || report.content : report.content,
      generatedAt: report.generatedAt,
    };
  }

  async getReportHistory(repoName: string) {
    const repository = await this.prisma.repository.findUnique({
      where: { name: repoName },
      include: {
        reports: {
          select: {
            id: true,
            type: true,
            week: true,
            year: true,
            generatedAt: true,
          },
          orderBy: { generatedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!repository) {
      throw new NotFoundException(`Repository ${repoName} not found`);
    }

    return repository.reports;
  }

  async getLatestReports() {
    const repositories = await this.prisma.repository.findMany({
      include: {
        reports: {
          orderBy: { generatedAt: 'desc' },
          take: 1,
        },
      },
    });

    return repositories.map(repo => ({
      repository: repo.name,
      lastReport: repo.reports[0]?.generatedAt || null,
      reportId: repo.reports[0]?.id || null,
      healthScore: repo.healthScore,
      healthStatus: repo.healthStatus,
    }));
  }

  /**
   * DEPRECATED: Use GitHubHealthScanner.calculateHealthScore() instead
   * This method is kept for backward compatibility but should not be used for new code.
   * The canonical health score calculation is in github-health.scanner.ts
   *
   * @deprecated Use the standardized health score from RepositoryScan table
   */
  private calculateHealthScore(repoData: any, pulls: any[], issues: any[], commits: any[]): number {
    // For now, return a simple score based on basic metrics
    // This should be replaced by fetching from RepositoryScan table
    let score = 50; // Default baseline

    if (repoData.description) score += 10;
    if (repoData.license) score += 10;
    if (commits.length > 0) score += 15;
    if (pulls.length < 5) score += 15;

    return Math.min(100, Math.max(0, score));
  }

  private generateMarkdownReport(data: any): string {
    const date = format(new Date(), 'MMMM d, yyyy');

    let markdown = `# Repository Report: ${data.repository.name}\n\n`;
    markdown += `**Generated:** ${date}\n\n`;

    // Project Status for Comment-Analyzer
    if (data.repository.name === 'Comment-Analyzer') {
      markdown += `## 💰 Project Status\n\n`;
      markdown += `**Status:** 🟡 ON HOLD - Pending Client Pricing Agreement\n\n`;
      markdown += `**Pricing Information:**\n`;
      markdown += `- **Proposed Price Range:** PYG 15,000,000 - 20,000,000 (Paraguayan Guaraníes)\n`;
      markdown += `- **Status:** Awaiting client response\n`;
      markdown += `- **Next Action:** Schedule pricing discussion with client\n`;
      markdown += `- **Blocker:** Project development paused until pricing is agreed\n\n`;
      markdown += `**Priority Level:** HIGH\n\n`;
      markdown += `---\n\n`;
    }

    // Overview
    markdown += `## Overview\n\n`;
    markdown += `- **Repository:** [${data.repository.fullName}](${data.repository.url})\n`;
    markdown += `- **Description:** ${data.repository.description || 'No description'}\n`;
    markdown += `- **Primary Language:** ${data.repository.language || 'Not specified'}\n`;
    markdown += `- **Created:** ${new Date(data.repository.createdAt).toLocaleDateString()}\n`;
    markdown += `- **Last Updated:** ${new Date(data.repository.updatedAt).toLocaleDateString()}\n\n`;

    // Metrics
    markdown += `## Metrics\n\n`;
    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| ⭐ Stars | ${data.metrics.stars} |\n`;
    markdown += `| 🍴 Forks | ${data.metrics.forks} |\n`;
    markdown += `| 👀 Watchers | ${data.metrics.watchers} |\n`;
    markdown += `| 🐛 Open Issues | ${data.metrics.openIssues} |\n`;
    markdown += `| 🔄 Open PRs | ${data.metrics.openPRs} |\n`;
    markdown += `| 💾 Size | ${(data.metrics.size / 1024).toFixed(2)} MB |\n\n`;

    // Health
    markdown += `## Health Score: ${data.health.score}/100\n\n`;
    markdown += `- **Has License:** ${data.health.hasLicense ? '✅ Yes' : '❌ No'}\n`;
    markdown += `- **Default Branch:** ${data.health.defaultBranch}\n`;
    if (data.health.topics && data.health.topics.length > 0) {
      markdown += `- **Topics:** ${data.health.topics.join(', ')}\n`;
    }
    markdown += `\n`;

    // TODO Summary for Comment-Analyzer
    if (data.repository.name === 'Comment-Analyzer') {
      markdown += `## 📋 TODO Summary\n\n`;
      markdown += `**Overall Progress:** 20% Complete (1/5 tasks completed)\n\n`;

      markdown += `### ✅ High Priority Tasks (1/3 Complete - 33%)\n\n`;
      markdown += `- [x] **Implement batch processing for multiple files** \`COMPLETED\`\n`;
      markdown += `- [ ] **Add support for additional file formats** \`IN PROGRESS\`\n`;
      markdown += `  - CSV format support\n`;
      markdown += `  - JSON format support\n`;
      markdown += `  - XML format support\n`;
      markdown += `- [ ] **Improve error handling for malformed input data** \`PENDING\`\n`;
      markdown += `  - Add validation for corrupted files\n`;
      markdown += `  - Implement graceful error messages\n`;
      markdown += `  - Add error logging and reporting\n\n`;

      markdown += `### 📋 Medium Priority Tasks (0/2 Complete - 0%)\n\n`;
      markdown += `- [ ] **Redesign UI with modern Streamlit components** \`PENDING\`\n`;
      markdown += `- [ ] **Add data visualization charts and graphs** \`PENDING\`\n\n`;

      markdown += `### 🔧 Technical Issues\n\n`;
      markdown += `**Build Status:** ❌ Failing - Requires immediate attention\n\n`;
      markdown += `**Recommendations:**\n`;
      markdown += `- Fix failing build before resuming development\n`;
      markdown += `- Triage and close resolved issues (${data.metrics.openIssues} open)\n`;
      markdown += `- Review and merge open pull requests (${data.metrics.openPRs} open)\n`;
      markdown += `- Complete existing TODOs before adding new features\n\n`;
    }

    // Recent Activity
    markdown += `## Recent Activity\n\n`;
    markdown += `### Recent Commits (${data.activity.totalCommits} in last 30 days)\n\n`;
    if (data.activity.recentCommits.length > 0) {
      markdown += `| SHA | Message | Author | Date |\n`;
      markdown += `|-----|---------|--------|------|\n`;
      for (const commit of data.activity.recentCommits) {
        const date = new Date(commit.date).toLocaleDateString();
        markdown += `| ${commit.sha} | ${commit.message} | ${commit.author} | ${date} |\n`;
      }
    } else {
      markdown += `No recent commits.\n`;
    }
    markdown += `\n`;

    // Pull Requests
    if (data.pullRequests.total > 0) {
      markdown += `### Open Pull Requests (${data.pullRequests.total} total)\n\n`;
      markdown += `| # | Title | Author | Created |\n`;
      markdown += `|---|-------|--------|------|\n`;
      for (const pr of data.pullRequests.recent) {
        const date = new Date(pr.createdAt).toLocaleDateString();
        markdown += `| #${pr.number} | ${pr.title} | ${pr.author} | ${date} |\n`;
      }
      markdown += `\n`;
    }

    // Issues
    if (data.issues.total > 0) {
      markdown += `### Open Issues (${data.issues.total} total)\n\n`;
      markdown += `| # | Title | Author | Created |\n`;
      markdown += `|---|-------|--------|------|\n`;
      for (const issue of data.issues.recent) {
        const date = new Date(issue.createdAt).toLocaleDateString();
        markdown += `| #${issue.number} | ${issue.title} | ${issue.author} | ${date} |\n`;
      }
      markdown += `\n`;
    }

    markdown += `---\n\n`;
    markdown += `*Generated by AI-Whisperers Org OS*\n`;

    return markdown;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}