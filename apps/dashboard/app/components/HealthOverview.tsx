'use client';

interface HealthOverviewProps {
  overview: {
    total_repositories: number;
    healthy_count: number;
    needs_attention_count: number;
    critical_count: number;
    average_health_score: number;
    last_scan: string;
    total_commits_today: number;
    total_open_prs: number;
    total_stale_prs: number;
  };
}

export function HealthOverview({ overview }: HealthOverviewProps) {
  /**
   * Health color coding - aligned with backend thresholds
   * - >= 70: Healthy (Green)
   * - 50-69: Needs Attention (Yellow/Orange)
   * - < 50: Critical (Red)
   */
  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 70) return 'Healthy';
    if (score >= 50) return 'Needs Attention';
    return 'Critical';
  };

  const stats = [
    {
      label: 'Total Repositories',
      value: overview.total_repositories,
      icon: '📦',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Healthy',
      value: overview.healthy_count,
      icon: '✅',
      color: 'text-green-600 bg-green-50',
      percentage: Math.round((overview.healthy_count / overview.total_repositories) * 100),
    },
    {
      label: 'Needs Attention',
      value: overview.needs_attention_count,
      icon: '⚠️',
      color: 'text-yellow-600 bg-yellow-50',
      percentage: Math.round((overview.needs_attention_count / overview.total_repositories) * 100),
    },
    {
      label: 'Critical',
      value: overview.critical_count,
      icon: '🚨',
      color: 'text-red-600 bg-red-50',
      percentage: Math.round((overview.critical_count / overview.total_repositories) * 100),
    },
  ];

  const activityStats = [
    {
      label: 'Commits (Last Hour)',
      value: overview.total_commits_today,
      icon: '💻',
    },
    {
      label: 'Open PRs',
      value: overview.total_open_prs,
      icon: '🔀',
    },
    {
      label: 'Stale PRs',
      value: overview.total_stale_prs,
      icon: '⏰',
      warning: overview.total_stale_prs > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Overall Health Score</h3>
            <p className="text-gray-500 text-sm mt-1">
              Average across all repositories
            </p>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getHealthColor(overview.average_health_score)}`}>
              <span className="text-3xl font-bold">{overview.average_health_score}</span>
            </div>
            <div className="mt-2 text-sm font-medium text-gray-600">
              {getHealthLabel(overview.average_health_score)}
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                {stat.percentage !== undefined && (
                  <p className="text-sm text-gray-500 mt-1">{stat.percentage}% of total</p>
                )}
              </div>
              <div className={`text-4xl ${stat.color} rounded-full w-16 h-16 flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Activity Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activityStats.map((stat) => (
            <div key={stat.label} className="flex items-center space-x-4">
              <div className="text-3xl">{stat.icon}</div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.warning ? 'text-orange-600' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
