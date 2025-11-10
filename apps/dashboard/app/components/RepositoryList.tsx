'use client';

import { useState } from 'react';

interface Repository {
  repository: string;
  health_score: number;
  status: string;
  commits_last_6h: number;
  open_prs: number;
  stale_prs: number;
  open_issues: number;
  needs_attention: boolean;
  scan_time: string;
}

interface RepositoryListProps {
  repositories: Repository[];
}

export function RepositoryList({ repositories }: RepositoryListProps) {
  const [sortBy, setSortBy] = useState<'health' | 'name' | 'activity'>('health');
  const [filterStatus, setFilterStatus] = useState<'all' | 'healthy' | 'attention' | 'critical'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    if (score >= 50) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (score: number) => {
    if (score >= 90) return '✅';
    if (score >= 70) return '⚠️';
    if (score >= 50) return '🟠';
    return '🚨';
  };

  // Filter repositories
  let filteredRepos = repositories.filter((repo) => {
    // Search filter
    if (searchTerm && !repo.repository.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filterStatus === 'healthy' && repo.health_score < 70) return false;
    if (filterStatus === 'attention' && (repo.health_score < 50 || repo.health_score >= 70)) return false;
    if (filterStatus === 'critical' && repo.health_score >= 50) return false;

    return true;
  });

  // Sort repositories
  filteredRepos = filteredRepos.sort((a, b) => {
    switch (sortBy) {
      case 'health':
        return a.health_score - b.health_score;
      case 'name':
        return a.repository.localeCompare(b.repository);
      case 'activity':
        return b.commits_last_6h - a.commits_last_6h;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full">
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="healthy">Healthy</option>
            <option value="attention">Needs Attention</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="health">Sort by Health</option>
            <option value="name">Sort by Name</option>
            <option value="activity">Sort by Activity</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredRepos.length} of {repositories.length} repositories
      </div>

      {/* Repository Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRepos.map((repo) => (
          <div
            key={repo.repository}
            className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
              repo.needs_attention ? 'border-orange-300' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {repo.repository}
                </h3>
                <p className="text-sm text-gray-500">{repo.status}</p>
              </div>
              <div className="text-2xl ml-2">{getStatusIcon(repo.health_score)}</div>
            </div>

            {/* Health Score */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Health Score</span>
                <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getHealthColor(repo.health_score)}`}>
                  {repo.health_score}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    repo.health_score >= 70 ? 'bg-green-500' : repo.health_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${repo.health_score}%` }}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-1">
                <span className="text-gray-500">💻</span>
                <span className="text-gray-700">{repo.commits_last_6h} commits</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-500">🔀</span>
                <span className="text-gray-700">{repo.open_prs} PRs</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-500">⏰</span>
                <span className={repo.stale_prs > 0 ? 'text-orange-600 font-medium' : 'text-gray-700'}>
                  {repo.stale_prs} stale
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-500">🐛</span>
                <span className="text-gray-700">{repo.open_issues} issues</span>
              </div>
            </div>

            {/* View Details Link */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <a
                href={`https://github.com/Ai-Whisperers/${repo.repository}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View on GitHub →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRepos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
