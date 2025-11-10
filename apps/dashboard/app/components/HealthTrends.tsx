'use client';

import { useState, useEffect } from 'react';

interface TrendData {
  repository: string;
  data_points: Array<{
    date: string;
    health_score: number;
    commits: number;
    open_prs: number;
    open_issues: number;
  }>;
}

export function HealthTrends() {
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [repos, setRepos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(7);

  useEffect(() => {
    // Fetch list of repositories
    fetch('/api/jobs/repository-monitor/scans/latest?limit=25')
      .then(res => res.json())
      .then(data => {
        const repoNames = data.map((scan: any) => scan.repository);
        setRepos(repoNames);
        if (repoNames.length > 0 && !selectedRepo) {
          setSelectedRepo(repoNames[0]);
        }
      })
      .catch(err => console.error('Error fetching repos:', err));
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      fetchTrendData();
    }
  }, [selectedRepo, days]);

  const fetchTrendData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/jobs/repository-monitor/trends/${selectedRepo}?days=${days}`
      );
      const data = await response.json();
      setTrendData(data);
    } catch (error) {
      console.error('Error fetching trend data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (repos.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading trend data...</p>
      </div>
    );
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    if (score >= 50) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Repository
          </label>
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {repos.map((repo) => (
              <option key={repo} value={repo}>
                {repo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Period
          </label>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Trend Visualization */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trend data...</p>
        </div>
      ) : trendData && trendData.data_points.length > 0 ? (
        <div className="space-y-6">
          {/* Simple Chart Visualization */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Score Trend</h3>
            <div className="space-y-2">
              {trendData.data_points.map((point, index) => {
                const date = new Date(point.date);
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="text-xs text-gray-500 w-24">
                      {date.toLocaleDateString()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                          <div
                            className="h-6 rounded-full transition-all duration-300"
                            style={{
                              width: `${point.health_score}%`,
                              backgroundColor: getHealthColor(point.health_score),
                            }}
                          />
                          <div className="absolute inset-0 flex items-center px-3">
                            <span className="text-xs font-semibold text-white mix-blend-difference">
                              {point.health_score}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 w-32">
                          {point.commits} commits, {point.open_prs} PRs
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">Avg Health</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {Math.round(
                  trendData.data_points.reduce((sum, p) => sum + p.health_score, 0) /
                    trendData.data_points.length
                )}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">Total Commits</div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {trendData.data_points.reduce((sum, p) => sum + p.commits, 0)}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium">Avg Open PRs</div>
              <div className="text-2xl font-bold text-purple-900 mt-1">
                {Math.round(
                  trendData.data_points.reduce((sum, p) => sum + p.open_prs, 0) /
                    trendData.data_points.length
                )}
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-orange-600 font-medium">Avg Issues</div>
              <div className="text-2xl font-bold text-orange-900 mt-1">
                {Math.round(
                  trendData.data_points.reduce((sum, p) => sum + p.open_issues, 0) /
                    trendData.data_points.length
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Trend Data Available</h3>
          <p className="text-gray-500">No historical data found for this repository in the selected period</p>
        </div>
      )}
    </div>
  );
}
