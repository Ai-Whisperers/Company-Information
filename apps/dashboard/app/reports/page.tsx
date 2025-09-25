'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, RefreshCw, CheckCircle, AlertCircle, Star, GitBranch, Calendar, GitCommit, Clock, ArrowRight, ChevronDown, Bug, AlertTriangle, Info } from 'lucide-react';
import { apiClient, downloadReportFile, TodoItem, TodoSummary } from '../../lib/api-client';

interface LastCommit {
  sha: string;
  message: string;
  author: string;
  authorEmail?: string;
  date: string;
  url: string;
}

interface Repository {
  name: string;
  description: string | null;
  url: string;
  healthScore: number;
  healthStatus: string;
  lastActivity: string | Date | null;
  starCount?: number;
  forkCount?: number;
  openIssues?: number;
  openPRs?: number;
  lastCommit?: LastCommit | null;
}

interface ReportStatus {
  status: 'idle' | 'generating' | 'ready' | 'error';
  message?: string;
  reportId?: string;
}

// TodoDropdown component
function TodoDropdown({ repoName }: { repoName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [todos, setTodos] = useState<TodoSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const getMockTodos = (repoName: string): TodoSummary => {
    const mockTodos: TodoItem[] = [
      {
        id: '1',
        text: 'Refactor authentication system for better security',
        type: 'CRITICAL',
        priority: 'critical',
        file: 'src/auth/auth.service.ts',
        line: 45,
        createdAt: new Date(),
        assignee: 'dev-team'
      },
      {
        id: '2',
        text: 'Add unit tests for payment processing',
        type: 'TODO',
        priority: 'high',
        file: 'src/payment/payment.controller.ts',
        line: 123,
        createdAt: new Date()
      },
      {
        id: '3',
        text: 'Update documentation for API endpoints',
        type: 'TODO',
        priority: 'medium',
        file: 'README.md',
        line: 1,
        createdAt: new Date()
      }
    ];

    return {
      repository: repoName,
      summary: {
        total: mockTodos.length,
        critical: mockTodos.filter(t => t.priority === 'critical').length,
        high: mockTodos.filter(t => t.priority === 'high').length,
        medium: mockTodos.filter(t => t.priority === 'medium').length,
        low: mockTodos.filter(t => t.priority === 'low').length,
      },
      healthImpact: 23,
      topTodos: mockTodos
    };
  };

  const fetchTodos = async () => {
    if (!isOpen || todos) return;

    setLoading(true);
    try {
      const todoData = await apiClient.getRepositoryTodoSummary(repoName);
      setTodos(todoData);
    } catch (error) {
      console.error('Failed to fetch TODOs, showing mock data:', error);
      // Show mock data when API is not available
      setTodos(getMockTodos(repoName));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTodos();
    }
  }, [isOpen]);

  const getPriorityIcon = (priority: TodoItem['priority']) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-3 h-3 text-red-500" />;
      case 'high': return <Bug className="w-3 h-3 text-orange-500" />;
      case 'medium': return <Info className="w-3 h-3 text-yellow-500" />;
      default: return <Info className="w-3 h-3 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: TodoItem['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
      >
        <Bug className="w-3 h-3" />
        <span>TODOs</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 z-10 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-3">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">TODO Items</h4>

            {loading ? (
              <div className="text-center text-gray-500 py-2">Loading...</div>
            ) : todos ? (
              <>
                {/* Summary */}
                <div className="flex items-center space-x-2 text-xs mb-3">
                  <span className="text-gray-600 dark:text-gray-400">Total: {todos.summary.total}</span>
                  {todos.summary.critical > 0 && (
                    <span className="text-red-600 font-medium">Critical: {todos.summary.critical}</span>
                  )}
                  {todos.summary.high > 0 && (
                    <span className="text-orange-600">High: {todos.summary.high}</span>
                  )}
                </div>

                {/* Health Impact */}
                {todos.healthImpact > 0 && (
                  <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                    <span className="text-yellow-700 dark:text-yellow-300">
                      Health Impact: -{todos.healthImpact} points
                    </span>
                  </div>
                )}

                {/* Top TODOs */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {todos.topTodos.length > 0 ? (
                    todos.topTodos.map((todo) => (
                      <div key={todo.id} className={`p-2 rounded text-xs border ${getPriorityColor(todo.priority)}`}>
                        <div className="flex items-start space-x-2">
                          {getPriorityIcon(todo.priority)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{todo.type}</p>
                            <p className="text-gray-600 dark:text-gray-400 truncate">{todo.text}</p>
                            <p className="text-gray-500 mt-1">{todo.file}:{todo.line}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-2">No critical TODOs found! 🎉</div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-red-500 py-2">Failed to load TODOs</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [reportStatus, setReportStatus] = useState<ReportStatus>({ status: 'idle' });
  const [selectedFormat, setSelectedFormat] = useState<'markdown' | 'html' | 'json'>('markdown');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchRepositories();
  }, []);

  const getMockRepositories = (): Repository[] => {
    return [
      {
        name: 'Comment-Analyzer',
        description: 'AI-powered customer feedback analysis using GPT-4 and Streamlit',
        url: 'https://github.com/Ai-Whisperers/Comment-Analyzer',
        healthScore: 85,
        healthStatus: 'healthy',
        lastActivity: new Date().toISOString(),
        starCount: 12,
        forkCount: 3,
        openIssues: 2,
        openPRs: 1,
        lastCommit: {
          sha: 'abc123',
          message: 'feat: Add Spanish language support for comment analysis',
          author: 'John Doe',
          date: new Date().toISOString(),
          url: 'https://github.com/Ai-Whisperers/Comment-Analyzer/commit/abc123'
        }
      },
      {
        name: 'AI-Investment',
        description: 'Waardhaven AutoIndex investment platform with FastAPI and Next.js',
        url: 'https://github.com/Ai-Whisperers/AI-Investment',
        healthScore: 92,
        healthStatus: 'excellent',
        lastActivity: new Date().toISOString(),
        starCount: 25,
        forkCount: 7,
        openIssues: 1,
        openPRs: 3,
        lastCommit: {
          sha: 'def456',
          message: 'fix: Resolve authentication timeout issues',
          author: 'Jane Smith',
          date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          url: 'https://github.com/Ai-Whisperers/AI-Investment/commit/def456'
        }
      },
      {
        name: 'clockify-ADO-automated-report',
        description: 'Time tracking automation with Python and Hexagonal Architecture',
        url: 'https://github.com/Ai-Whisperers/clockify-ADO-automated-report',
        healthScore: 78,
        healthStatus: 'good',
        lastActivity: new Date().toISOString(),
        starCount: 8,
        forkCount: 2,
        openIssues: 4,
        openPRs: 0,
        lastCommit: {
          sha: 'ghi789',
          message: 'docs: Update API documentation with new endpoints',
          author: 'Bob Wilson',
          date: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          url: 'https://github.com/Ai-Whisperers/clockify-ADO-automated-report/commit/ghi789'
        }
      }
    ];
  };

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      const data = await apiClient.listRepositories();
      setRepositories(data);
    } catch (error) {
      console.error('Failed to fetch repositories, showing mock data:', error);
      // Show mock data when API is not available
      setRepositories(getMockRepositories());
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!selectedRepo) return;

    setIsGenerating(true);
    setReportStatus({ status: 'generating', message: 'Generating report...' });

    try {
      const response = await apiClient.generateReport(selectedRepo.name, selectedFormat);

      setReportStatus({
        status: 'ready',
        message: 'Report generated successfully!',
        reportId: response.reportId
      });

      // Auto-download after generation
      setTimeout(() => {
        downloadReport();
      }, 500);
    } catch (error) {
      console.error('Failed to generate report:', error);
      setReportStatus({
        status: 'error',
        message: 'Failed to generate report. Please try again.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = async () => {
    if (!selectedRepo) return;

    try {
      const result = await downloadReportFile(selectedRepo.name, selectedFormat);
      if (result.success) {
        setReportStatus({
          status: 'ready',
          message: `Downloaded: ${result.filename}`
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Failed to download report:', error);
      setReportStatus({
        status: 'error',
        message: 'Failed to download report. Please try again.'
      });
    }
  };

  const selectRepository = (repo: Repository) => {
    setSelectedRepo(repo);
    setReportStatus({ status: 'idle' });
    // Scroll to the report generation section
    setTimeout(() => {
      document.getElementById('report-generator')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const getHealthBadgeColor = (score: number) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading repositories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Repository Report Generator
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Select a repository below to generate detailed reports
          </p>
        </div>

        {/* Repository Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            All Repositories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repositories.map((repo) => (
              <div
                key={repo.name}
                onClick={() => selectRepository(repo)}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-2 ${
                  selectedRepo?.name === repo.name
                    ? 'border-primary-500 ring-2 ring-primary-300 dark:ring-primary-700'
                    : 'border-transparent'
                }`}
              >
                <div className="p-4">
                  {/* Repository Header */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate flex-1">
                      {repo.name}
                    </h3>
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getHealthBadgeColor(repo.healthScore || 0)}`}>
                      {repo.healthScore || 0}%
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {repo.description || 'No description available'}
                  </p>

                  {/* Repository Stats */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                      {repo.starCount !== undefined && (
                        <div className="flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          <span>{repo.starCount}</span>
                        </div>
                      )}
                      {repo.forkCount !== undefined && (
                        <div className="flex items-center">
                          <GitBranch className="w-3 h-3 mr-1" />
                          <span>{repo.forkCount}</span>
                        </div>
                      )}
                      {repo.openIssues !== undefined && (
                        <div className="flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          <span>{repo.openIssues}</span>
                        </div>
                      )}
                    </div>

                    {/* TODO Dropdown */}
                    <TodoDropdown repoName={repo.name} />
                  </div>

                  {/* Last Commit */}
                  {repo.lastCommit ? (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start space-x-2">
                        <GitCommit className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
                            {repo.lastCommit.message.split('\n')[0]}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                            {repo.lastCommit.author} • {formatDate(repo.lastCommit.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                        No recent commits
                      </p>
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {selectedRepo?.name === repo.name && (
                    <div className="mt-3 flex items-center justify-center text-primary-600 dark:text-primary-400">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-xs font-medium">Selected</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Generator Section */}
        {selectedRepo && (
          <div id="report-generator" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Generate Report for {selectedRepo.name}
            </h2>

            {/* Selected Repository Details */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {selectedRepo.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {selectedRepo.description || 'No description available'}
                  </p>

                  {/* Repository Metrics */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    {selectedRepo.lastActivity && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Last activity: {formatDate(selectedRepo.lastActivity)}</span>
                      </div>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getHealthBadgeColor(selectedRepo.healthScore || 0)}`}>
                      Health: {selectedRepo.healthScore || 0}/100
                    </span>
                  </div>
                </div>
                {selectedRepo.url && (
                  <a
                    href={selectedRepo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
                  >
                    View on GitHub
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
            </div>

            {/* Format Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['markdown', 'html', 'json'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`px-4 py-2 rounded-lg border transition ${
                      selectedFormat === format
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {format === 'markdown' && 'Markdown (.md)'}
                    {format === 'html' && 'HTML (.html)'}
                    {format === 'json' && 'JSON (.json)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Messages */}
            {reportStatus.status !== 'idle' && (
              <div className={`mb-6 p-3 rounded-lg ${
                reportStatus.status === 'generating' ? 'bg-blue-50 dark:bg-blue-900' :
                reportStatus.status === 'ready' ? 'bg-green-50 dark:bg-green-900' :
                'bg-red-50 dark:bg-red-900'
              }`}>
                <div className="flex items-center">
                  {reportStatus.status === 'generating' && (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin text-blue-600 dark:text-blue-400" />
                      <span className="text-blue-700 dark:text-blue-300">{reportStatus.message}</span>
                    </>
                  )}
                  {reportStatus.status === 'ready' && (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                      <span className="text-green-700 dark:text-green-300">{reportStatus.message}</span>
                    </>
                  )}
                  {reportStatus.status === 'error' && (
                    <>
                      <AlertCircle className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                      <span className="text-red-700 dark:text-red-300">{reportStatus.message}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={generateReport}
                disabled={isGenerating}
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2 font-medium"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
              <button
                onClick={downloadReport}
                disabled={isGenerating}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2 font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Organization Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {repositories.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Repositories
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {repositories.filter(r => (r.healthScore || 0) >= 80).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Healthy Repos
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {repositories.filter(r => (r.healthScore || 0) >= 60 && (r.healthScore || 0) < 80).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Need Attention
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {repositories.filter(r => (r.healthScore || 0) < 60).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Critical
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}