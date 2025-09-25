// API Client for Org OS Dashboard

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface LastCommit {
  sha: string;
  message: string;
  author: string;
  authorEmail?: string;
  date: string;
  url: string;
}

export interface Repository {
  name: string;
  description: string | null;
  url: string;
  healthScore: number;
  healthStatus: string;
  lastActivity: Date | null;
  starCount?: number;
  forkCount?: number;
  openIssues?: number;
  openPRs?: number;
  lastCommit?: LastCommit | null;
}

export interface Report {
  id: string;
  type: string;
  week: number;
  year: number;
  content: string;
  htmlContent?: string;
  summary?: any;
  generatedAt: Date;
}

export interface GenerateReportResponse {
  success: boolean;
  repository: string;
  reportId: string;
  format: string;
  generatedAt: string;
}

export interface TodoItem {
  id: string;
  text: string;
  type: 'TODO' | 'FIXME' | 'HACK' | 'NOTE' | 'BUG' | 'CRITICAL' | 'WARNING';
  priority: 'low' | 'medium' | 'high' | 'critical';
  file: string;
  line: number;
  author?: string;
  createdAt: Date;
  context?: string;
  assignee?: string;
}

export interface RepositoryTodos {
  repository: string;
  totalTodos: number;
  criticalCount: number;
  todos: TodoItem[];
  lastScanned: Date;
  healthImpact: number;
}

export interface TodoSummary {
  repository: string;
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  healthImpact: number;
  topTodos: TodoItem[];
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Repository endpoints
  async listRepositories(): Promise<Repository[]> {
    return this.fetch<Repository[]>('/api/reports/repositories');
  }

  async getRepository(name: string): Promise<Repository> {
    return this.fetch<Repository>(`/api/repositories/${name}`);
  }

  // Report endpoints
  async generateReport(
    repoName: string,
    format: 'markdown' | 'html' | 'json' = 'markdown'
  ): Promise<GenerateReportResponse> {
    return this.fetch<GenerateReportResponse>(`/api/reports/generate/${repoName}`, {
      method: 'POST',
      body: JSON.stringify({ format }),
    });
  }

  async downloadReport(
    repoName: string,
    format: 'markdown' | 'html' | 'json' = 'markdown'
  ): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/api/reports/download/${repoName}?format=${format}`);

    if (!response.ok) {
      throw new Error(`Failed to download report: ${response.statusText}`);
    }

    return response.blob();
  }

  async getReportHistory(repoName: string): Promise<Report[]> {
    return this.fetch<Report[]>(`/api/reports/history/${repoName}`);
  }

  async getLatestReports(): Promise<any[]> {
    return this.fetch<any[]>('/api/reports/latest');
  }

  async generateOrgPulse(): Promise<any> {
    return this.fetch<any>('/api/reports/org-pulse', {
      method: 'POST',
    });
  }

  async generateAllReports(): Promise<any> {
    return this.fetch<any>('/api/reports/generate-all', {
      method: 'POST',
    });
  }

  // Health endpoints
  async getHealth(): Promise<any> {
    return this.fetch<any>('/health');
  }

  // TODO endpoints
  async getRepositoryTodos(repoName: string): Promise<RepositoryTodos> {
    return this.fetch<RepositoryTodos>(`/api/reports/todos/${repoName}`);
  }

  async getRepositoryTodoSummary(repoName: string): Promise<TodoSummary> {
    return this.fetch<TodoSummary>(`/api/reports/todos/${repoName}/summary`);
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export download helper
export async function downloadReportFile(
  repoName: string,
  format: 'markdown' | 'html' | 'json' = 'markdown'
) {
  try {
    const blob = await apiClient.downloadReport(repoName, format);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const extension = format === 'json' ? 'json' : format === 'html' ? 'html' : 'md';
    const filename = `${repoName}-report-${new Date().toISOString().split('T')[0]}.${extension}`;

    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true, filename };
  } catch (error) {
    console.error('Failed to download report:', error);
    return { success: false, error };
  }
}