'use client';

import { useState, useEffect } from 'react';
import { HealthOverview } from '../components/HealthOverview';
import { RepositoryList } from '../components/RepositoryList';
import { AlertsList } from '../components/AlertsList';
import { HealthTrends } from '../components/HealthTrends';

interface HealthData {
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
  recent_alerts: Array<{
    repository: string;
    health_score: number;
    issues: string[];
    url: string;
    scan_time: string;
  }>;
  latest_scans: Array<{
    repository: string;
    health_score: number;
    status: string;
    commits_last_6h: number;
    open_prs: number;
    stale_prs: number;
    open_issues: number;
    needs_attention: boolean;
    scan_time: string;
  }>;
}

export default function RepositoryHealthPage() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs/repository-monitor/summary');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setHealthData(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching health data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();

    // Auto-refresh every 5 minutes if enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchHealthData();
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleRefresh = () => {
    fetchHealthData();
  };

  if (loading && !healthData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading repository health data...</p>
        </div>
      </div>
    );
  }

  if (error && !healthData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Repository Health Monitor</h1>
              <p className="text-gray-600 mt-1">
                Real-time health monitoring for all AI Whisperers repositories
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Auto-refresh</span>
              </label>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <svg
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {healthData && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <HealthOverview overview={healthData.overview} />

            {/* Alerts Section */}
            {healthData.recent_alerts && healthData.recent_alerts.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Alerts</h2>
                <AlertsList alerts={healthData.recent_alerts} />
              </div>
            )}

            {/* Repository List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">All Repositories</h2>
              <RepositoryList repositories={healthData.latest_scans} />
            </div>

            {/* Health Trends */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Health Trends</h2>
              <HealthTrends />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
