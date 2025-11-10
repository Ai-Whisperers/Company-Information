# n8n Workflow Update Summary

## Updated: November 10, 2025

## Overview
The n8n workflow has been restructured to match a cleaner, more streamlined architecture as shown in the provided diagram. The workflow now follows a simpler linear pattern without the complexity of loops and split batches.

## Previous Structure
```
Schedule → Fetch Repos → Split Batches (Loop) → 
  ↓ (4 parallel API calls per repo)
  ├─ Commits
  ├─ Issues  
  ├─ PRs
  └─ Branches
  ↓
  Merge → Calculate Metrics → Loop back
  ↓
  Filter → Save to DB/Notify
  ↓
  Generate Summary → Send Notifications
```

## New Structure
```
Schedule Trigger
    ↓
Fetch All Organization Repos
    ↓ (4 parallel branches)
    ├─→ Get Recent Commits (Last 6h)
    ├─→ Get Open Issues
    ├─→ Get Open Pull Requests
    └─→ Get All Branches
    ↓
Merge All Repository Data
    ↓
Calculate Repository Metrics
    ↓
Generate Summary Report
    ↓
Convert Markdown to HTML
    ↓
Send Email Report
```

## Key Changes

### 1. **Removed Loop Structure**
- **Before:** Split Into Individual Repos node with batch processing
- **After:** Direct parallel API calls for all repos at once
- **Benefit:** Simpler flow, better performance, easier debugging

### 2. **Simplified Data Flow**
- **Before:** 4 inputs merge → calculate → filter → multiple outputs (DB, Notion, Slack, etc.)
- **After:** 4 inputs merge → calculate → summary → HTML → email
- **Benefit:** Single output path, clearer purpose

### 3. **Removed Conditional Filtering**
- **Before:** Filter node to identify repos needing attention
- **After:** All repos processed together in summary report
- **Benefit:** Complete overview in every report

### 4. **Streamlined Outputs**
- **Before:** Multiple outputs (PostgreSQL, Notion, Slack, Webhook, GitHub Actions, Email)
- **After:** Single email output with HTML report
- **Benefit:** Focused delivery, less configuration complexity

### 5. **Updated Node Positions**
The node positions have been adjusted to create a cleaner left-to-right flow:
- Schedule Trigger: (140, 340)
- Fetch All Organization Repos: (380, 140)
- Get Recent Commits: (380, 220)
- Get Open Issues: (380, 310)
- Get Open Pull Requests: (380, 400)
- Get All Branches: (380, 490)
- Merge All Repository Data: (680, 280)
- Calculate Repository Metrics: (810, 280)
- Generate Summary Report: (950, 280)
- Convert Markdown to HTML: (1090, 280)
- Send Email Report: (1230, 280)

## Node Details

### Active Nodes (11 total)

1. **Schedule Trigger - Every 6 Hours**
   - Type: `scheduleTrigger`
   - Runs every 6 hours
   - Initiates the workflow

2. **Fetch All Organization Repos**
   - Type: `httpRequest`
   - Endpoint: `https://api.github.com/orgs/Ai-Whisperers/repos`
   - Returns all repositories in the organization
   - Requires: GitHub Token credential

3. **Get Recent Commits (Last 6h)**
   - Type: `httpRequest`
   - Fetches commits from the last 6 hours
   - Uses dynamic repo URL from previous node
   - Requires: GitHub Token credential

4. **Get Open Issues**
   - Type: `httpRequest`
   - Fetches all open issues
   - Filters out pull requests in processing
   - Requires: GitHub Token credential

5. **Get Open Pull Requests**
   - Type: `httpRequest`
   - Fetches all open pull requests
   - Requires: GitHub Token credential

6. **Get All Branches**
   - Type: `httpRequest`
   - Fetches all branches for each repository
   - Requires: GitHub Token credential

7. **Merge All Repository Data**
   - Type: `merge`
   - Combines the 4 parallel API responses
   - Mode: `mergeByPosition`

8. **Calculate Repository Metrics**
   - Type: `code` (JavaScript)
   - Processes merged data
   - Calculates health scores
   - Identifies alert conditions
   - Returns structured metrics for each repo

9. **Generate Summary Report**
   - Type: `code` (JavaScript)
   - Aggregates all repository metrics
   - Creates markdown formatted report
   - Includes summary statistics and alerts

10. **Convert Markdown to HTML**
    - Type: `code` (JavaScript)
    - Transforms markdown to styled HTML
    - Adds CSS for professional appearance
    - Optimized for email clients

11. **Send Email Report**
    - Type: `emailSend`
    - Sends HTML email with complete report
    - Requires: SMTP credentials
    - Uses environment variables for from/to addresses

### Removed Nodes
- Split Into Individual Repos (no longer needed)
- Filter Repos Needing Attention (all repos included in summary)
- Save to PostgreSQL (removed)
- Save to Notion (removed)
- Notify Jobs Service (removed)
- Send Slack Notification (removed)
- Trigger GitHub Action (removed)

## Configuration Requirements

### Credentials Needed
1. **GitHub Token** (Header Auth)
   - Header Name: `Authorization`
   - Header Value: `Bearer YOUR_GITHUB_TOKEN`

2. **SMTP Account**
   - For sending email reports
   - Configure in n8n credentials

### Environment Variables
```bash
# Optional - defaults provided
EMAIL_FROM=noreply@ai-whisperers.com
EMAIL_TO=team@ai-whisperers.com
```

## Benefits of New Structure

### 1. **Simplicity**
- Fewer nodes (11 vs 16)
- Linear flow instead of loops
- Single output channel

### 2. **Performance**
- Parallel processing of all repos
- No loop overhead
- Faster execution time

### 3. **Maintainability**
- Easier to understand
- Simpler debugging
- Clear data flow

### 4. **Focused Delivery**
- Single comprehensive email report
- All information in one place
- No fragmented notifications

## Migration Notes

### If you have the old workflow installed:

1. **Export the old workflow** (for backup)
2. **Delete the old workflow** from n8n
3. **Import the updated workflow**
4. **Configure credentials:**
   - GitHub Token (if not already set)
   - SMTP Account (if not already set)
5. **Set environment variables** (if needed)
6. **Test the workflow** with manual execution
7. **Activate the workflow**

### Data Changes
- No database writes (PostgreSQL node removed)
- No Notion updates (Notion node removed)
- No Slack notifications (Slack node removed)
- No webhook calls (Jobs Service node removed)

If you need these integrations, they can be added back by:
1. Adding nodes after the "Generate Summary Report" node
2. Connecting them in parallel or series as needed
3. Configuring the appropriate credentials

## Testing the Workflow

### Manual Test
1. Open the workflow in n8n
2. Click "Execute Workflow" button
3. Watch the execution flow through each node
4. Verify the email is received with complete report

### Expected Results
- All 25 repositories processed
- Health scores calculated for each
- Summary statistics generated
- HTML email sent successfully

### Troubleshooting
- **No repos returned:** Check GitHub Token permissions
- **Missing data:** Verify all 4 API calls complete successfully
- **Merge errors:** Check that all inputs reach the Merge node
- **Email not sent:** Verify SMTP credentials and environment variables

## Report Contents

The generated email report includes:

### Summary Section
- Total repositories
- Healthy repositories count
- Repositories needing attention count
- Average health score

### Activity Section (Last 6 Hours)
- Total commits
- Open pull requests
- Stale pull requests
- Open issues

### Repository Details
For each repository needing attention:
- Repository name
- Health score
- Specific issues (stale PRs, high issue count, etc.)
- Direct link to repository

## Health Score Algorithm

Starting from 100 points:
- **-20 points:** No commits in last 6 hours
- **-10 to -30 points:** Stale PRs (older than 7 days)
- **-15 points:** More than 10 open issues
- **-10 points:** More than 20 branches

**Alert Threshold:** < 70 points = needs attention

## Version Information
- **Version:** 5
- **Updated:** 2025-11-10T15:25:00.000Z
- **Execution Order:** v1
- **Trigger Count:** 1

## Future Enhancements

Potential additions (not included in current version):
1. Database logging for historical tracking
2. Slack/Teams notifications for critical alerts
3. Trend analysis (comparing with previous scans)
4. Custom alert thresholds
5. Repository-specific configurations
6. Webhook integration for external systems

## Support

For issues or questions:
1. Check n8n execution logs
2. Review node configurations
3. Verify credentials and environment variables
4. Consult n8n documentation: https://docs.n8n.io

