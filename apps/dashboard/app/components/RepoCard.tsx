import React from 'react';
import { GitCommit, GitPullRequest, AlertCircle, Shield, Clock } from 'lucide-react';
import HealthIndicator from './HealthIndicator';

interface RepoCardProps {
  repo: {
    name: string;
    health: 'good' | 'warning' | 'critical';
    commits: number;
    prs: number;
    issues: number;
    lastActivity: string;
    protection: boolean;
    projectStatus?: string;
    pricingInfo?: string;
  };
}

export default function RepoCard({ repo }: RepoCardProps) {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {repo.name}
          </h3>
          <div className="flex items-center mt-1 space-x-2">
            <HealthIndicator health={repo.health} />
            <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {repo.health} health
            </span>
          </div>
          {repo.projectStatus && (
            <div className="mt-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-md">
              <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                {repo.projectStatus}
              </p>
              {repo.pricingInfo && (
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  {repo.pricingInfo}
                </p>
              )}
            </div>
          )}
        </div>
        {repo.protection && (
          <Shield className="w-5 h-5 text-green-500 flex-shrink-0" title="Branch protection enabled" />
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <GitCommit className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{repo.commits}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">commits</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <GitPullRequest className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{repo.prs}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">PRs</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <AlertCircle className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{repo.issues}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">issues</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4 mr-1" />
          {repo.lastActivity}
        </div>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View Details →
        </button>
      </div>
    </div>
  );
}