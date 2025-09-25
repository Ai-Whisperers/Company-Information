import React from 'react';
import { Download, FileText, RefreshCw, ExternalLink, Calendar, Star, GitBranch } from 'lucide-react';

interface ReportCardProps {
  repository: {
    name: string;
    description?: string | null;
    url?: string;
    healthScore?: number;
    starCount?: number;
    forkCount?: number;
    lastActivity?: string | Date | null;
  };
  onGenerate: (repoName: string) => void;
  onDownload: (repoName: string, format: string) => void;
  status?: 'idle' | 'generating' | 'ready' | 'error';
  format?: 'markdown' | 'html' | 'json';
}

export default function ReportCard({
  repository,
  onGenerate,
  onDownload,
  status = 'idle',
  format = 'markdown',
}: ReportCardProps) {
  const getHealthColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const formatDate = (date?: string | Date | null) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {repository.name}
          </h3>
          {repository.url && (
            <a
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-600 transition ml-2"
              title="View on GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          {repository.description || 'No description available'}
        </p>
      </div>

      {/* Metrics */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {repository.starCount !== undefined && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Star className="w-4 h-4 mr-1" />
              {repository.starCount}
            </div>
          )}
          {repository.forkCount !== undefined && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <GitBranch className="w-4 h-4 mr-1" />
              {repository.forkCount}
            </div>
          )}
        </div>
        {repository.healthScore !== undefined && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(repository.healthScore)}`}>
            Health: {repository.healthScore}/100
          </span>
        )}
      </div>

      {/* Last Activity */}
      {repository.lastActivity && (
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Calendar className="w-4 h-4 mr-1" />
          Last activity: {formatDate(repository.lastActivity)}
        </div>
      )}

      {/* Status Indicator */}
      {status !== 'idle' && (
        <div className="mb-3 p-2 rounded-md bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-2">
            {status === 'generating' && (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-primary-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Generating report...
                </span>
              </>
            )}
            {status === 'ready' && (
              <>
                <FileText className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  Report ready
                </span>
              </>
            )}
            {status === 'error' && (
              <>
                <span className="text-sm text-red-600 dark:text-red-400">
                  Failed to generate report
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onGenerate(repository.name)}
          disabled={status === 'generating'}
          className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {status === 'generating' ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          <span>{status === 'generating' ? 'Generating...' : 'Generate'}</span>
        </button>
        <button
          onClick={() => onDownload(repository.name, format)}
          className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition flex items-center justify-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
}