'use client';

import { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle, GitBranch, GitPullRequest, Users } from 'lucide-react';
import HealthIndicator from './components/HealthIndicator';
import RepoCard from './components/RepoCard';
import StatsCard from './components/StatsCard';

interface RepoHealth {
  name: string;
  health: 'good' | 'warning' | 'critical';
  commits: number;
  prs: number;
  issues: number;
  lastActivity: string;
  protection: boolean;
}

interface OrgStats {
  totalRepos: number;
  activeRepos: number;
  totalCommits: number;
  openPRs: number;
  openIssues: number;
  healthScore: number;
}

export default function DashboardPage() {
  const [repos, setRepos] = useState<RepoHealth[]>([]);
  const [stats, setStats] = useState<OrgStats>({
    totalRepos: 0,
    activeRepos: 0,
    totalCommits: 0,
    openPRs: 0,
    openIssues: 0,
    healthScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetch - will connect to backend later
    setTimeout(() => {
      setRepos([
        {
          name: 'Comment-Analyzer',
          health: 'good',
          commits: 45,
          prs: 3,
          issues: 2,
          lastActivity: '2 hours ago',
          protection: true,
        },
        {
          name: 'AI-Investment',
          health: 'warning',
          commits: 128,
          prs: 7,
          issues: 12,
          lastActivity: '1 day ago',
          protection: true,
        },
        {
          name: 'clockify-ADO-automated-report',
          health: 'good',
          commits: 32,
          prs: 1,
          issues: 0,
          lastActivity: '3 hours ago',
          protection: true,
        },
      ]);
      setStats({
        totalRepos: 9,
        activeRepos: 5,
        totalCommits: 245,
        openPRs: 11,
        openIssues: 14,
        healthScore: 82,
      });
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                AI-Whisperers Org OS
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Central control plane for repository management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/reports"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition inline-block"
              >
                View Reports
              </a>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Sync Now
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Repositories"
            value={stats.totalRepos}
            icon={<GitBranch className="w-5 h-5" />}
            trend="neutral"
          />
          <StatsCard
            title="Active This Week"
            value={stats.activeRepos}
            icon={<Activity className="w-5 h-5" />}
            trend="up"
          />
          <StatsCard
            title="Total Commits"
            value={stats.totalCommits}
            icon={<CheckCircle className="w-5 h-5" />}
            trend="up"
          />
          <StatsCard
            title="Open PRs"
            value={stats.openPRs}
            icon={<GitPullRequest className="w-5 h-5" />}
            trend="down"
          />
          <StatsCard
            title="Open Issues"
            value={stats.openIssues}
            icon={<AlertCircle className="w-5 h-5" />}
            trend="down"
          />
          <StatsCard
            title="Health Score"
            value={`${stats.healthScore}%`}
            icon={<Users className="w-5 h-5" />}
            trend={stats.healthScore > 80 ? 'up' : 'down'}
          />
        </div>

        {/* Repository Health Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Repository Health
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Loading repositories...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {repos.map((repo) => (
                <RepoCard key={repo.name} repo={repo} />
              ))}
            </div>
          )}
        </section>

        {/* Recent Activity Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h2>
          <div className="card">
            <div className="space-y-4">
              {[
                { type: 'commit', repo: 'AI-Investment', message: 'feat: Add portfolio analysis endpoint', time: '2 hours ago' },
                { type: 'pr', repo: 'Comment-Analyzer', message: 'Update GPT-4 integration', time: '3 hours ago' },
                { type: 'issue', repo: 'clockify-ADO-automated-report', message: 'Pattern matching improvements', time: '5 hours ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <span className={`badge ${activity.type === 'commit' ? 'badge-success' : activity.type === 'pr' ? 'badge-warning' : 'badge-danger'}`}>
                      {activity.type}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.repo}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.message}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}