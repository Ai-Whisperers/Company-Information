# n8n Repository Monitor - Quick Start Guide

Get your n8n workflow monitoring all 25 AI Whisperers repositories in under 10 minutes.

## Prerequisites Checklist

- [ ] n8n installed (Docker recommended)
- [ ] GitHub Personal Access Token with `repo` and `read:org` permissions
- [ ] PostgreSQL database running (optional but recommended)
- [ ] Company-Information project set up

## Step 1: Install n8n (5 minutes)

### Option A: Docker (Recommended)

```bash
# Pull and run n8n
docker run -d --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n

# Access n8n at http://localhost:5678
```

### Option B: npm

```bash
npm install -g n8n
n8n start
```

## Step 2: Import Workflow (2 minutes)

1. Open http://localhost:5678
2. Create account (first time only)
3. Click **Workflows** > **Import from File**
4. Select `ai-whisperers-repo-monitor.json`
5. Click **Import**

## Step 3: Configure GitHub Credentials (2 minutes)

1. In the workflow, click on any GitHub node
2. Click **Credentials** dropdown
3. Click **+ Create New Credential**
4. Select **Header Auth**
5. Configure:
   - **Name:** `GitHub Token`
   - **Header Name:** `Authorization`
   - **Header Value:** `Bearer YOUR_GITHUB_TOKEN`
6. Click **Save**

### Get GitHub Token:
```bash
# GitHub.com > Settings > Developer Settings > Personal Access Tokens > Generate New Token
# Required scopes: repo, read:org
```

## Step 4: Setup Database (Optional, 3 minutes)

### If using existing Company-Information database:

```bash
# Navigate to jobs service
cd services/jobs

# Run Prisma migration
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### Configure PostgreSQL credential in n8n:

1. Click on "Save to PostgreSQL" node
2. Click **Credentials** dropdown
3. Click **+ Create New Credential**
4. Select **Postgres**
5. Configure:
   - **Host:** `localhost`
   - **Database:** `orgos_db`
   - **User:** `your_user`
   - **Password:** `your_password`
   - **Port:** `5432`
6. Click **Save**

## Step 5: Test Run (1 minute)

1. Click **Execute Workflow** button (top right)
2. Wait for execution to complete (~30-60 seconds)
3. Check each node shows green checkmark
4. View output data in each node

Expected results:
- Fetches all 25 repositories
- Calculates health scores
- Stores results in database (if enabled)

## Step 6: Activate Workflow (1 minute)

1. Toggle **Active** switch (top right)
2. Workflow now runs every 6 hours automatically

## Troubleshooting

### GitHub API Rate Limit
**Error:** `API rate limit exceeded`
**Fix:** Ensure you're using authenticated token (5000 requests/hour vs 60 unauthenticated)

### No Repositories Found
**Error:** Empty array returned
**Fix:**
- Check GitHub token has `read:org` scope
- Verify organization name: `Ai-Whisperers`
- Ensure you have access to the organization

### Database Connection Failed
**Error:** `Connection refused`
**Fix:**
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env
- Run migrations: `npx prisma migrate dev`

### Node Execution Errors
**Error:** Various node errors
**Fix:**
- Check credentials are configured
- Verify all required fields are filled
- Review error message in node output

## Quick Configuration Tips

### Change Monitoring Frequency

In "Schedule Trigger" node, change:
```javascript
// Current: Every 6 hours
"hoursInterval": 6

// Options:
"hoursInterval": 1   // Hourly
"hoursInterval": 12  // Twice daily
"hoursInterval": 24  // Daily
```

### Enable Slack Notifications

1. Get Slack webhook URL: https://api.slack.com/messaging/webhooks
2. Add to .env: `SLACK_WEBHOOK_URL=your_webhook`
3. In workflow, enable "Send Slack Notification" node
4. Test execution

### Adjust Health Score Thresholds

In "Calculate Repository Metrics" node:
```javascript
// Adjust these values:
if (commits.length === 0) healthScore -= 20;      // No activity penalty
if (stalePRs.length > 0) healthScore -= 10;       // Stale PR penalty
if (issues.length > 10) healthScore -= 15;        // High issues penalty
if (branches.length > 20) healthScore -= 10;      // Too many branches penalty
```

## Verification Checklist

After setup, verify:
- [ ] Workflow shows as "Active"
- [ ] Test execution completes successfully
- [ ] All 25 repositories are scanned
- [ ] Health scores calculated correctly
- [ ] Database entries created (if enabled)
- [ ] Notifications sent (if enabled)

## Next Steps

1. **View Results:**
   - Check database: `SELECT * FROM repository_scans ORDER BY scan_timestamp DESC LIMIT 10;`
   - View in n8n: Click "Executions" tab

2. **Customize Alerts:**
   - Edit alert thresholds in code nodes
   - Add custom notification channels
   - Configure email reports

3. **Integrate with Dashboard:**
   - Build Next.js components to display scan data
   - Create health score charts
   - Show trending data

4. **Advanced Configuration:**
   - Add more metrics
   - Create custom reports
   - Set up alerting rules

## Resources

- **Full Documentation:** See README.md
- **n8n Docs:** https://docs.n8n.io/
- **GitHub API:** https://docs.github.com/rest
- **Support:** Create issue in Company-Information repo

## Quick Reference

### n8n Commands
```bash
# Start n8n
n8n start

# Start with custom port
n8n start --port 5679

# Export workflow
n8n export:workflow --id=WORKFLOW_ID --output=backup.json

# Import workflow
n8n import:workflow --input=workflow.json
```

### Database Queries
```sql
-- View latest scan results
SELECT repository_name, health_score, needs_attention, scan_timestamp
FROM repository_scans
ORDER BY scan_timestamp DESC
LIMIT 25;

-- Find repos needing attention
SELECT repository_name, health_score, stale_prs, open_issues
FROM repository_scans
WHERE needs_attention = 1
ORDER BY health_score ASC;

-- Health score trends
SELECT repository_name,
       AVG(health_score) as avg_health,
       COUNT(*) as scans
FROM repository_scans
WHERE scan_timestamp >= NOW() - INTERVAL '7 days'
GROUP BY repository_name
ORDER BY avg_health ASC;
```

## Support

Need help?
1. Check README.md for detailed documentation
2. Review n8n execution logs
3. Check GitHub Issues
4. Contact AI Whisperers team

---

**Setup Time:** ~10 minutes
**Maintenance:** Minimal (automated)
**Cost:** Free (self-hosted)
