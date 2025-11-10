# n8n Workflow Diagram

## AI Whisperers - Repository Monitor

### Visual Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    Schedule Trigger - Every 6 Hours                         │
│                               (Automated)                                   │
│                                                                             │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                   Fetch All Organization Repos                              │
│                   GET /orgs/Ai-Whisperers/repos                            │
│                   Returns: Array of 25+ repositories                        │
│                                                                             │
└──────────────┬──────────────┬──────────────┬──────────────┬────────────────┘
               │              │              │              │
               │              │              │              │
               ▼              ▼              ▼              ▼
        ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
        │  Get    │    │  Get    │    │  Get    │    │  Get    │
        │ Recent  │    │  Open   │    │  Open   │    │   All   │
        │ Commits │    │ Issues  │    │  Pull   │    │ Branches│
        │(Last 6h)│    │         │    │ Requests│    │         │
        └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
             │              │              │              │
             └──────────────┼──────────────┼──────────────┘
                            │              │
                            ▼              ▼
                    ┌────────────────────────────┐
                    │                            │
                    │  Merge All Repository Data │
                    │  (Combine 4 inputs)        │
                    │                            │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │                            │
                    │ Calculate Repository       │
                    │ Metrics                    │
                    │ • Health Score             │
                    │ • Activity Stats           │
                    │ • Alert Flags              │
                    │                            │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │                            │
                    │ Generate Summary Report    │
                    │ • Aggregate all repos      │
                    │ • Create markdown          │
                    │ • Identify alerts          │
                    │                            │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │                            │
                    │ Convert Markdown to HTML   │
                    │ • Professional styling     │
                    │ • Email-optimized CSS      │
                    │                            │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │                            │
                    │    Send Email Report       │
                    │    ✉ team@ai-whisperers... │
                    │                            │
                    └────────────────────────────┘
```

## Node Connection Details

### Trigger
- **Node:** Schedule Trigger - Every 6 Hours
- **Output:** Timer event every 6 hours
- **Connects to:** Fetch All Organization Repos

### Data Collection Layer
- **Node:** Fetch All Organization Repos
- **Input:** Trigger signal
- **Output:** Array of repository objects
- **Connects to (4 parallel branches):**
  1. Get Recent Commits (Last 6h)
  2. Get Open Issues
  3. Get Open Pull Requests
  4. Get All Branches

### API Calls (Parallel Execution)
All 4 nodes run in parallel for better performance:

1. **Get Recent Commits (Last 6h)**
   - Input: Repository array
   - API: `GET {repo_url}/commits?since={6_hours_ago}`
   - Output: Commits array
   - Connects to: Merge (input 0)

2. **Get Open Issues**
   - Input: Repository array
   - API: `GET {repo_url}/issues?state=open`
   - Output: Issues array
   - Connects to: Merge (input 1)

3. **Get Open Pull Requests**
   - Input: Repository array
   - API: `GET {repo_url}/pulls?state=open`
   - Output: Pull requests array
   - Connects to: Merge (input 2)

4. **Get All Branches**
   - Input: Repository array
   - API: `GET {repo_url}/branches`
   - Output: Branches array
   - Connects to: Merge (input 3)

### Data Processing Layer
- **Node:** Merge All Repository Data
- **Input:** 4 arrays (commits, issues, PRs, branches)
- **Mode:** mergeByPosition
- **Output:** Combined data structure
- **Connects to:** Calculate Repository Metrics

### Metrics Calculation
- **Node:** Calculate Repository Metrics
- **Input:** Merged repository data
- **Processing:**
  - Health score calculation
  - Activity metrics aggregation
  - Alert condition detection
- **Output:** Array of repository metrics
- **Connects to:** Generate Summary Report

### Report Generation
- **Node:** Generate Summary Report
- **Input:** Repository metrics array
- **Processing:**
  - Aggregate statistics
  - Create markdown report
  - Identify repositories needing attention
- **Output:** JSON with summary, markdown, and alerts
- **Connects to:** Convert Markdown to HTML

### HTML Conversion
- **Node:** Convert Markdown to HTML
- **Input:** Markdown report
- **Processing:**
  - Parse markdown
  - Apply CSS styling
  - Generate email-friendly HTML
- **Output:** HTML string
- **Connects to:** Send Email Report

### Email Delivery
- **Node:** Send Email Report
- **Input:** HTML report
- **Processing:**
  - SMTP connection
  - Email composition
  - Send to recipients
- **Output:** Delivery confirmation

## Data Flow Example

### Input (from GitHub API)
```json
{
  "repos": [
    {
      "name": "Company-Information",
      "full_name": "Ai-Whisperers/Company-Information",
      "commits": [...],
      "issues": [...],
      "prs": [...],
      "branches": [...]
    }
  ]
}
```

### Processing (Calculate Metrics)
```json
{
  "repository": "Company-Information",
  "health_score": 85,
  "commits_last_6h": 12,
  "open_pull_requests": 3,
  "stale_pull_requests": 1,
  "open_issues": 8,
  "total_branches": 15,
  "needs_attention": false,
  "scan_timestamp": "2025-11-10T15:30:00Z"
}
```

### Output (Email Report)
```markdown
# AI Whisperers - Repository Health Report

**Scan Time:** 2025-11-10T15:30:00Z

## Summary
- **Total Repositories:** 25
- **Healthy:** 20 ✅
- **Needs Attention:** 5 ⚠️
- **Average Health Score:** 82/100

## Activity (Last 6 Hours)
- **Commits:** 45
- **Open Pull Requests:** 12
- **Stale Pull Requests:** 3
- **Open Issues:** 67

## Repositories Needing Attention
### repo-name (Health: 65/100)
- 2 stale PRs
- 15 open issues
- No recent activity
[View Repository](https://github.com/Ai-Whisperers/repo-name)
```

## Performance Characteristics

### Execution Time
- **Expected:** 30-60 seconds for 25 repositories
- **Factors:**
  - GitHub API response time
  - Network latency
  - Data processing complexity

### API Calls
- **Total per execution:** ~100-125 calls
- **Breakdown:**
  - 1 organization repos call
  - 4 calls per repository × 25 repos = 100 calls
- **Rate Limits:** Well within GitHub's limits (5000/hour)

### Resource Usage
- **Memory:** ~50-100 MB
- **CPU:** Low (mainly I/O bound)
- **Network:** ~2-5 MB data transfer

## Error Handling

### Network Errors
- Automatic retry for failed API calls
- Graceful degradation if some data unavailable

### Authentication Errors
- Clear error messages in execution log
- Workflow stops if GitHub token is invalid

### Data Processing Errors
- Defensive coding in metric calculations
- Default values for missing data
- Execution continues even if individual repo fails

## Monitoring

### Success Indicators
- ✅ Email received every 6 hours
- ✅ All repositories included in report
- ✅ Health scores calculated correctly
- ✅ No execution errors in n8n log

### Failure Indicators
- ❌ No email received
- ❌ Execution errors in n8n
- ❌ Missing repositories in report
- ❌ Incorrect health scores

### Debugging Steps
1. Check n8n execution log
2. Verify GitHub token is valid
3. Test API endpoints manually
4. Review node configurations
5. Check SMTP settings

## Maintenance

### Regular Tasks
- Review health score thresholds quarterly
- Update alert criteria based on team needs
- Monitor execution success rate
- Adjust schedule if needed

### Updates Required
- GitHub token renewal (annually or as needed)
- SMTP credentials update (if changed)
- Email recipient list updates
- Schedule changes (if team preferences change)

## Version History

### v5 (Current - November 10, 2025)
- Restructured to linear flow
- Removed loop complexity
- Simplified to email-only output
- Updated node positions for clarity

### v4 (Previous)
- Loop-based processing
- Multiple output channels
- Filter-based alerting
- Database integration

