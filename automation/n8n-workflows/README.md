# n8n Workflow - AI Whisperers Repository Monitor

This n8n workflow monitors all 25 repositories in the AI Whisperers organization and provides comprehensive health tracking, alerting, and reporting capabilities.

## Features

### 1. Automated Repository Monitoring
- Monitors all 25 repositories in the AI Whisperers organization
- Runs every 6 hours automatically
- Fetches real-time data from GitHub API

### 2. Comprehensive Metrics Tracking
- **Activity Metrics:**
  - Recent commits (last 6 hours)
  - Open pull requests
  - Stale pull requests (older than 7 days)
  - Open issues
  - Total branches

- **Health Scoring:**
  - 100-point health score calculation
  - Automatic flagging of repos needing attention
  - Customizable thresholds

- **Size & Engagement:**
  - Repository size
  - Stars, watchers, forks
  - Last updated/pushed timestamps

### 3. Multi-Channel Notifications
- PostgreSQL database logging
- Slack notifications (optional)
- Email reports (optional)
- Notion integration (optional)
- Jobs Service webhook integration
- GitHub Actions triggers (optional)

### 4. Alert Conditions
Repositories are flagged for attention based on:
- No commits in last 6 hours
- Stale PRs (older than 7 days)
- High issue count (>10 open issues)
- Too many branches (>20 branches)
- Low health score (<70)

## Setup Instructions

### Prerequisites
1. n8n installed and running
2. GitHub Personal Access Token with `repo` and `read:org` scopes
3. PostgreSQL database (optional but recommended)
4. Slack webhook URL (optional)
5. Email SMTP credentials (optional)

### Installation Steps

#### 1. Import the Workflow
1. Open n8n interface
2. Go to **Workflows** > **Import from File**
3. Select `ai-whisperers-repo-monitor.json`
4. Click **Import**

#### 2. Configure Credentials

**GitHub Token:**
1. Go to **Credentials** > **Add Credential**
2. Select **Header Auth**
3. Name: `GitHub Token`
4. Add header:
   - Name: `Authorization`
   - Value: `Bearer YOUR_GITHUB_TOKEN`

**PostgreSQL (Optional):**
1. Go to **Credentials** > **Add Credential**
2. Select **Postgres**
3. Name: `PostgreSQL`
4. Configure connection:
   - Host: `localhost`
   - Database: `orgos_db`
   - User: `your_user`
   - Password: `your_password`
   - Port: `5432`

#### 3. Create Database Table (If Using PostgreSQL)

Run this SQL in your PostgreSQL database:

```sql
CREATE TABLE IF NOT EXISTS repository_scans (
  id SERIAL PRIMARY KEY,
  repository_name VARCHAR(255) NOT NULL,
  health_score INTEGER NOT NULL,
  commits_last_6h INTEGER DEFAULT 0,
  open_prs INTEGER DEFAULT 0,
  stale_prs INTEGER DEFAULT 0,
  open_issues INTEGER DEFAULT 0,
  total_branches INTEGER DEFAULT 0,
  needs_attention BOOLEAN DEFAULT false,
  scan_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_repo_scans_name ON repository_scans(repository_name);
CREATE INDEX idx_repo_scans_timestamp ON repository_scans(scan_timestamp);
CREATE INDEX idx_repo_scans_needs_attention ON repository_scans(needs_attention);
```

#### 4. Configure Optional Integrations

**Slack Notifications:**
1. Enable the "Send Slack Notification" node
2. Add environment variable: `SLACK_WEBHOOK_URL`
3. Or hardcode the webhook URL in the node

**Email Reports:**
1. Enable the "Send Email Report" node
2. Configure email credentials in n8n
3. Update recipient email address

**Notion Integration:**
1. Enable the "Save to Notion" node
2. Add Notion credentials
3. Create a database in Notion
4. Update `databaseId` in the node

**Jobs Service Integration:**
1. Update the webhook URL in "Notify Jobs Service" node
2. Ensure your Jobs Service is running on port 4000
3. Add the webhook endpoint to your NestJS service

#### 5. Enable Optional Nodes

Several nodes are disabled by default. To enable:
1. Click on the disabled node
2. Click the toggle to enable it
3. Configure any required settings

Disabled nodes:
- Save to Notion (Optional)
- Send Slack Notification
- Send Email Report (Optional)
- Trigger GitHub Action (Optional)

#### 6. Test the Workflow

1. Click **Execute Workflow** button
2. Verify all nodes execute successfully
3. Check the output data
4. Verify database entries (if enabled)
5. Check Slack/email notifications (if enabled)

#### 7. Activate the Workflow

1. Toggle the **Active** switch at the top
2. The workflow will now run every 6 hours automatically

## Workflow Architecture

```
┌─────────────────────────────────────────┐
│  Schedule Trigger (Every 6 Hours)       │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Fetch All Organization Repos           │
│  (GitHub API)                            │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Split Into Individual Repos            │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        ▼          ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
   │Commits │ │  PRs   │ │Issues  │ │Branches│
   └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
       └──────────┼──────────┼──────────┘
                  ▼
        ┌─────────────────┐
        │  Merge Data     │
        └────────┬────────┘
                 ▼
        ┌─────────────────┐
        │Calculate Metrics│
        └────────┬────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│Filter Alerts │  │Generate Report│
└──────┬───────┘  └───────┬──────┘
       │                  │
       ▼                  ▼
  ┌────────┐         ┌────────┐
  │Database│         │ Slack  │
  │ Notion │         │ Email  │
  │Webhook │         └────────┘
  └────────┘
```

## Customization

### Adjust Monitoring Frequency
Edit the "Schedule Trigger" node:
- Current: Every 6 hours
- Options: Hourly, daily, custom intervals

### Modify Health Score Calculation
Edit the "Calculate Repository Metrics" node JavaScript:

```javascript
// Current logic:
let healthScore = 100;
if (commits.length === 0) healthScore -= 20;
if (stalePRs.length > 0) healthScore -= (stalePRs.length * 10);
if (issues.length > 10) healthScore -= 15;
if (branches.length > 20) healthScore -= 10;

// Customize as needed
```

### Change Alert Thresholds
Edit the "Filter Repos Needing Attention" node:
- Current threshold: Health score < 70
- Adjust based on your needs

### Add More Integrations
The workflow is designed to be extensible. Add nodes for:
- Discord notifications
- Microsoft Teams
- Jira integration
- Custom webhooks
- Data visualization tools

## Monitoring & Maintenance

### View Execution History
1. Go to **Executions** tab
2. View successful/failed runs
3. Debug any errors

### Check Logs
1. Click on any execution
2. View node-by-node output
3. Inspect JSON data

### Performance Optimization
- The workflow processes repos in batches
- Parallel API calls for efficiency
- Adjust batch size if needed

## Integration with Company-Information Project

This workflow integrates seamlessly with the existing Company-Information project:

1. **Database Integration:**
   - Uses the same PostgreSQL database
   - Stores scan results for historical tracking

2. **Jobs Service Integration:**
   - Sends webhooks to the NestJS Jobs Service
   - Triggers existing report generation

3. **Dashboard Integration:**
   - Data can be displayed in Next.js dashboard
   - Real-time health monitoring

## Troubleshooting

### GitHub API Rate Limiting
- n8n respects rate limits automatically
- Authenticated requests: 5,000/hour
- If limited, workflow will retry

### Database Connection Errors
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Ensure table exists

### Workflow Not Triggering
- Check workflow is activated
- Verify schedule trigger settings
- Check n8n service is running

### Missing Data
- Verify GitHub token has correct permissions
- Check organization name is correct
- Ensure repos are accessible

## Best Practices

1. **Test Before Activating:**
   - Run manual execution first
   - Verify all integrations work
   - Check data quality

2. **Monitor Executions:**
   - Review execution history regularly
   - Set up error notifications
   - Monitor API usage

3. **Adjust Thresholds:**
   - Start conservative
   - Tune based on your needs
   - Document changes

4. **Backup Configuration:**
   - Export workflow regularly
   - Version control the JSON
   - Document customizations

## Support & Resources

- **n8n Documentation:** https://docs.n8n.io/
- **GitHub API Docs:** https://docs.github.com/rest
- **Project Issues:** https://github.com/Ai-Whisperers/Company-Information/issues

## Future Enhancements

Planned features:
- [ ] Security scanning integration
- [ ] Dependency update tracking
- [ ] Code quality metrics
- [ ] Team productivity analytics
- [ ] Predictive health modeling
- [ ] Auto-remediation workflows

---

**Last Updated:** 2025-11-05
**Version:** 1.0.0
**Maintainer:** AI Whisperers Team
