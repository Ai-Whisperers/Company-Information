# n8n Repository Monitor - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI Whisperers Organization                   │
│                        (25 Repositories)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ GitHub API
                             │ (Authenticated)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                        n8n Workflow                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Schedule Trigger (Every 6 Hours)                 │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                      │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │         Fetch All Organization Repositories              │  │
│  │           (GET /orgs/Ai-Whisperers/repos)                │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                      │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │         Split Into Individual Repositories                │  │
│  │              (25 parallel branches)                       │  │
│  └─────┬──────────┬──────────┬──────────┬────────────────────┘  │
│        │          │          │          │                        │
│    ┌───▼───┐  ┌──▼───┐  ┌──▼───┐  ┌──▼────┐                   │
│    │Commits│  │ PRs  │  │Issues│  │Branches│                   │
│    └───┬───┘  └──┬───┘  └──┬───┘  └──┬────┘                   │
│        └─────────┼─────────┼─────────┘                          │
│                  │         │                                     │
│  ┌───────────────▼─────────▼─────────────────────────────────┐  │
│  │              Merge & Calculate Metrics                    │  │
│  │  • Health Score (0-100)                                   │  │
│  │  • Activity Metrics                                       │  │
│  │  • Alert Flags                                            │  │
│  └────────────────────────┬──────────────────────────────────┘  │
│                           │                                      │
│         ┌─────────────────┴─────────────────┐                   │
│         │                                   │                   │
│  ┌──────▼──────────┐              ┌────────▼─────────┐         │
│  │ Filter Alerts   │              │ Generate Summary │         │
│  │ (Health < 70)   │              │     Report       │         │
│  └──────┬──────────┘              └────────┬─────────┘         │
│         │                                   │                   │
└─────────┼───────────────────────────────────┼───────────────────┘
          │                                   │
          │                                   │
    ┌─────┴─────┬──────────┬──────────┐     │
    │           │          │          │     │
┌───▼────┐ ┌───▼────┐ ┌───▼───┐ ┌───▼────┐ │
│Postgres│ │ Notion │ │Webhook│ │ GitHub │ │
│  DB    │ │  (opt) │ │  Jobs │ │Action  │ │
└────────┘ └────────┘ └───────┘ └────────┘ │
                                            │
                     ┌──────────────────────┘
                     │
           ┌─────────┴──────────┬──────────────┐
           │                    │              │
      ┌────▼────┐         ┌────▼────┐   ┌────▼────┐
      │  Slack  │         │  Email  │   │ Custom  │
      │  (opt)  │         │  (opt)  │   │Webhook  │
      └─────────┘         └─────────┘   └─────────┘
```

## Data Flow

### Phase 1: Data Collection (30-60 seconds)

```
1. Trigger (Scheduled)
   ↓
2. GitHub API Call: Fetch All Repos
   ├─ Endpoint: GET /orgs/Ai-Whisperers/repos?per_page=100
   ├─ Returns: Array of 25+ repositories
   └─ Rate limit: 5000/hour (authenticated)
   ↓
3. Split Into Batches
   └─ Process 1 repository at a time (configurable)
   ↓
4. Parallel Data Fetching (for each repo):
   ├─ GET /repos/{owner}/{repo}/commits?since=6h
   ├─ GET /repos/{owner}/{repo}/pulls?state=open
   ├─ GET /repos/{owner}/{repo}/issues?state=open
   └─ GET /repos/{owner}/{repo}/branches
   ↓
5. Merge Repository Data
   └─ Combines all API responses for single repo
```

### Phase 2: Processing & Analysis (1-2 seconds per repo)

```
For each repository:

Input Data:
├─ commits: Array[Commit]
├─ pullRequests: Array[PR]
├─ issues: Array[Issue]
└─ branches: Array[Branch]

Processing:
├─ Calculate Activity Metrics
│  ├─ commits_last_6h = commits.length
│  ├─ open_prs = pullRequests.length
│  ├─ stale_prs = PRs older than 7 days
│  ├─ open_issues = issues.length
│  └─ total_branches = branches.length
│
├─ Calculate Health Score (0-100)
│  ├─ Start: 100
│  ├─ No commits: -20
│  ├─ Each stale PR: -10
│  ├─ >10 issues: -15
│  ├─ >20 branches: -10
│  └─ Minimum: 0
│
└─ Set Alert Flags
   ├─ needs_attention = health_score < 70
   ├─ has_stale_prs = stale_prs > 0
   ├─ high_issue_count = open_issues > 10
   ├─ too_many_branches = total_branches > 20
   └─ inactive = commits_last_6h == 0

Output Data:
{
  repository: "repo-name",
  health_score: 75,
  commits_last_6h: 5,
  open_prs: 3,
  stale_prs: 1,
  open_issues: 8,
  total_branches: 15,
  needs_attention: false,
  scan_timestamp: "2025-11-05T12:00:00Z"
}
```

### Phase 3: Filtering & Routing (instant)

```
All Repository Data (25 items)
├─ Filter: needs_attention == true
│  └─ Alerts Branch
│     ├─ Save to Database
│     ├─ Send to Notion
│     ├─ Notify Jobs Service
│     └─ Trigger GitHub Action
│
└─ Generate Summary Report
   ├─ total_repos: 25
   ├─ healthy_repos: 20
   ├─ repos_needing_attention: 5
   ├─ average_health_score: 82
   └─ detailed_alerts: Array[Alert]
```

### Phase 4: Notification & Storage (1-5 seconds)

```
Parallel Execution:

Database Storage (PostgreSQL)
├─ INSERT INTO repository_scans
├─ 25 rows (one per repository)
└─ Indexed for fast queries

Summary Report Generation
├─ Markdown format
├─ Statistics aggregation
├─ Alert prioritization
└─ Timestamp metadata

Notifications (Optional)
├─ Slack
│  ├─ Block Kit formatted message
│  ├─ Top 5 alerts
│  └─ Summary statistics
│
├─ Email
│  ├─ HTML formatted
│  ├─ Full report
│  └─ Attachment (optional)
│
└─ Webhook
   ├─ POST to Jobs Service
   ├─ JSON payload
   └─ Async processing
```

## Health Score Calculation

### Algorithm

```javascript
function calculateHealthScore(repo) {
  let score = 100; // Perfect score

  // Activity penalty
  if (repo.commits_last_6h === 0) {
    score -= 20; // No recent activity
  }

  // Stale PR penalty
  if (repo.stale_prs > 0) {
    score -= (repo.stale_prs * 10); // 10 points per stale PR
  }

  // Issue penalty
  if (repo.open_issues > 10) {
    score -= 15; // High issue backlog
  }

  // Branch penalty
  if (repo.total_branches > 20) {
    score -= 10; // Too many branches
  }

  // Ensure minimum of 0
  return Math.max(0, score);
}
```

### Score Ranges

```
90-100: Excellent Health (Green)
├─ Active development
├─ Few or no stale PRs
├─ Managed issue count
└─ Clean branch structure

70-89: Good Health (Yellow)
├─ Regular activity
├─ Some stale PRs
├─ Moderate issues
└─ Acceptable branches

50-69: Needs Attention (Orange)
├─ Limited activity
├─ Multiple stale PRs
├─ High issue count
└─ Many branches

0-49: Critical (Red)
├─ No activity
├─ Many stale PRs
├─ Excessive issues
└─ Branch proliferation
```

## Database Schema

### repository_scans Table

```sql
CREATE TABLE repository_scans (
  -- Identity
  id                  SERIAL PRIMARY KEY,
  repository_name     VARCHAR(255) NOT NULL,
  full_name           VARCHAR(255),
  repository_url      TEXT,
  visibility          VARCHAR(50),
  default_branch      VARCHAR(100),

  -- Activity Metrics
  commits_last_6h     INTEGER DEFAULT 0,
  open_prs            INTEGER DEFAULT 0,
  stale_prs           INTEGER DEFAULT 0,
  open_issues         INTEGER DEFAULT 0,
  total_branches      INTEGER DEFAULT 0,

  -- Health Metrics
  health_score        INTEGER NOT NULL,
  last_updated        TIMESTAMP,
  last_pushed         TIMESTAMP,

  -- Size Metrics
  size_kb             INTEGER,
  stars               INTEGER DEFAULT 0,
  watchers            INTEGER DEFAULT 0,
  forks               INTEGER DEFAULT 0,

  -- Alert Flags
  needs_attention     BOOLEAN DEFAULT FALSE,
  has_stale_prs       BOOLEAN DEFAULT FALSE,
  high_issue_count    BOOLEAN DEFAULT FALSE,
  too_many_branches   BOOLEAN DEFAULT FALSE,
  inactive            BOOLEAN DEFAULT FALSE,

  -- Timestamps
  scan_timestamp      TIMESTAMP NOT NULL,
  created_at          TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_repo_name ON repository_scans(repository_name);
CREATE INDEX idx_scan_time ON repository_scans(scan_timestamp DESC);
CREATE INDEX idx_needs_attention ON repository_scans(needs_attention);
CREATE INDEX idx_health_score ON repository_scans(health_score);
```

## Integration Points

### 1. Jobs Service Webhook

```javascript
// POST http://localhost:4000/api/notifications/webhook
{
  "event_type": "repository_alert",
  "repository": "repo-name",
  "health_score": 65,
  "alerts": {
    "has_stale_prs": true,
    "high_issue_count": false,
    "too_many_branches": false,
    "inactive": false
  },
  "url": "https://github.com/Ai-Whisperers/repo-name"
}
```

### 2. Slack Notification

```javascript
// POST to Slack Webhook
{
  "text": "AI Whisperers Repository Health Report",
  "blocks": [
    {
      "type": "header",
      "text": "🔍 Repository Health Report"
    },
    {
      "type": "section",
      "fields": [
        {"type": "mrkdwn", "text": "*Total Repos:*\n25"},
        {"type": "mrkdwn", "text": "*Average Health:*\n82/100"},
        {"type": "mrkdwn", "text": "*Healthy:*\n✅ 20"},
        {"type": "mrkdwn", "text": "*Needs Attention:*\n⚠️ 5"}
      ]
    }
  ]
}
```

### 3. GitHub Action Trigger

```javascript
// POST /repos/Ai-Whisperers/Company-Information/dispatches
{
  "event_type": "repository_health_scan_complete",
  "client_payload": {
    "total_repos": 25,
    "healthy_repos": 20,
    "repos_needing_attention": 5,
    "average_health_score": 82,
    "scan_timestamp": "2025-11-05T12:00:00Z"
  }
}
```

## Performance Characteristics

### Execution Time

```
Phase 1: Data Collection
├─ Fetch all repos: ~2s
└─ Fetch details (25 repos × 4 calls): ~30-45s
Total: ~35-50s

Phase 2: Processing
├─ Calculate metrics: ~1-2s
└─ Generate reports: ~1s
Total: ~2-3s

Phase 3: Storage & Notifications
├─ Database inserts: ~1-2s
└─ Notifications: ~1-3s
Total: ~2-5s

Overall: 40-60 seconds per execution
```

### Resource Usage

```
n8n Workflow:
├─ Memory: ~50-100 MB
├─ CPU: <5% (during execution)
└─ Network: ~1-2 MB per run

Database:
├─ Storage: ~10 KB per scan
├─ Daily growth: ~400 KB (4 scans/day × 25 repos)
└─ Monthly growth: ~12 MB
```

### API Rate Limits

```
GitHub API (Authenticated):
├─ Limit: 5,000 requests/hour
├─ Per execution: ~100 requests
├─ Max executions/hour: ~50
└─ Current: 4 executions/day (well within limits)
```

## Error Handling

### Retry Logic

```
API Request Failures:
├─ Automatic retry: 3 attempts
├─ Backoff: Exponential (1s, 2s, 4s)
└─ Fallback: Skip repo, log error

Rate Limit Handling:
├─ Detection: 429 status code
├─ Pause: Until reset time
└─ Resume: Automatic

Database Errors:
├─ Transaction rollback
├─ Log error details
└─ Continue with other repos
```

## Security Considerations

```
Credentials:
├─ Stored encrypted in n8n
├─ Never logged or exposed
└─ Rotatable without workflow changes

API Access:
├─ Minimum required scopes
├─ Organization-level only
└─ Read-only operations

Data Storage:
├─ No sensitive data stored
├─ Public repository info only
└─ Secure database connection
```

## Scaling Considerations

### Horizontal Scaling

```
Current: Single n8n instance
├─ Supports: 25-50 repositories
└─ Execution: Sequential

Future: Multiple n8n instances
├─ Supports: 100+ repositories
├─ Execution: Parallel
└─ Load balancing: Required
```

### Vertical Scaling

```
Increase batch size:
├─ Current: 1 repo at a time
├─ Recommended: 5-10 repos
└─ Maximum: 25 repos (parallel)

Reduce scan frequency:
├─ Current: Every 6 hours
├─ Alternative: Every 12 hours
└─ On-demand: Webhook triggered
```

---

**Last Updated:** 2025-11-05
**Version:** 1.0.0
