import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class RepositoryScanDto {
  @IsString()
  repository: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  visibility?: string;

  @IsOptional()
  @IsString()
  default_branch?: string;

  // Activity metrics
  @IsNumber()
  commits_last_6h: number;

  @IsNumber()
  open_pull_requests: number;

  @IsNumber()
  stale_pull_requests: number;

  @IsNumber()
  open_issues: number;

  @IsNumber()
  total_branches: number;

  // Health metrics
  @IsNumber()
  health_score: number;

  @IsOptional()
  @IsString()
  last_updated?: string;

  @IsOptional()
  @IsString()
  last_pushed?: string;

  // Size metrics
  @IsOptional()
  @IsNumber()
  size_kb?: number;

  @IsOptional()
  @IsNumber()
  stars?: number;

  @IsOptional()
  @IsNumber()
  watchers?: number;

  @IsOptional()
  @IsNumber()
  forks?: number;

  // Alert flags
  @IsBoolean()
  needs_attention: boolean;

  @IsOptional()
  @IsBoolean()
  has_stale_prs?: boolean;

  @IsOptional()
  @IsBoolean()
  high_issue_count?: boolean;

  @IsOptional()
  @IsBoolean()
  too_many_branches?: boolean;

  @IsOptional()
  @IsBoolean()
  inactive?: boolean;

  // Timestamp
  @IsString()
  scan_timestamp: string;
}

export class BulkScanDto {
  scans: RepositoryScanDto[];
  summary: {
    total_repos: number;
    healthy_repos: number;
    repos_needing_attention: number;
    total_commits_6h: number;
    total_open_prs: number;
    total_stale_prs: number;
    total_open_issues: number;
    average_health_score: number;
    scan_timestamp: string;
  };
}

export class HealthOverviewDto {
  total_repositories: number;
  healthy_count: number;
  needs_attention_count: number;
  critical_count: number;
  average_health_score: number;
  last_scan: string;
  total_commits_today: number;
  total_open_prs: number;
  total_stale_prs: number;
}

export class RepositoryTrendDto {
  repository: string;
  data_points: Array<{
    date: string;
    health_score: number;
    commits: number;
    open_prs: number;
    open_issues: number;
  }>;
}
