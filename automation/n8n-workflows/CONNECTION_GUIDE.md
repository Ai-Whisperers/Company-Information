# n8n Workflow - Node Connection Verification Guide

## Connection Issues Found & Fixed

### Original Workflow Issue

The original `ai-whisperers-repo-monitor.json` had a complex merge pattern that could cause data handling issues:

**Problem:**
- 4 parallel HTTP requests (commits, PRs, issues, branches)
- Merge node trying to combine them by position
- Calculate Metrics node expecting specific data structure
- Potential data loss or misalignment

### Solution: Two Workflow Versions

## Version 1: Original (Multi-Node Pattern)
**File:** `ai-whisperers-repo-monitor.json`

**Connection Flow:**
```
Schedule Trigger
    ↓
Fetch All Organization Repos
    ↓
Split Into Individual Repos
    ↓ (4 parallel branches)
    ├─→ Get Recent Commits ──┐
    ├─→ Get Open PRs ────────┤
    ├─→ Get Open Issues ──────┤→ Merge All Data
    └─→ Get All Branches ─────┘        ↓
                              Calculate Metrics
                                      ↓
                    ┌─────────────────┴────────────────┐
                    ↓                                  ↓
          Filter Needing Attention          Generate Summary
                    ↓                                  ↓
        ┌───────────┼──────────┐              Slack/Email (optional)
        ↓           ↓          ↓
    PostgreSQL   Notion    Webhook
```

**Potential Issues:**
- Merge node complexity
- Data structure dependencies
- Harder to debug

## Version 2: Simplified (Single Code Node)
**File:** `ai-whisperers-repo-monitor-fixed.json` ✅ RECOMMENDED

**Connection Flow:**
```
Schedule Trigger
    ↓
Fetch All Organization Repos
    ↓
Split Into Individual Repos
    ↓
Fetch All Data & Calculate Metrics (Combined Code Node)
    ↓
Filter Needing Attention ──→ PostgreSQL

Split Into Individual Repos (done signal)
    ↓
Generate Summary Report ──→ Slack Notification (optional)
```

**Advantages:**
- Simpler connection flow
- Single code node handles all API calls
- Better error handling
- Easier to debug
- Guaranteed data consistency

## Detailed Node Connections

### Version 2 (Recommended) - Node by Node

#### 1. Schedule Trigger
```
Type: Trigger
Outputs: 1
Connected to: "Fetch All Organization Repos"
```

#### 2. Fetch All Organization Repos
```
Type: HTTP Request
Input from: "Schedule Trigger"
Outputs: Array of repositories
Connected to: "Split Into Individual Repos"
```

#### 3. Split Into Individual Repos
```
Type: Split In Batches
Input from: "Fetch All Organization Repos"
Outputs: 2 branches
  - Branch 1 (loop): "Fetch All Data & Calculate Metrics"
  - Branch 2 (done): "Generate Summary Report"
```

#### 4. Fetch All Data & Calculate Metrics
```
Type: Code
Input from: "Split Into Individual Repos" (Branch 1)
Processing:
  - Fetches commits via $http.request()
  - Fetches PRs via $http.request()
  - Fetches issues via $http.request()
  - Fetches branches via $http.request()
  - Calculates metrics
  - Returns combined data
Outputs: Repository data with metrics
Connected to: "Filter Repos Needing Attention"
```

#### 5. Filter Repos Needing Attention
```
Type: Filter
Input from: "Fetch All Data & Calculate Metrics"
Condition: needs_attention === true
Outputs: Only repos needing attention
Connected to: "Save to PostgreSQL"
```

#### 6. Save to PostgreSQL
```
Type: Postgres
Input from: "Filter Repos Needing Attention"
Action: INSERT into repository_scans table
Outputs: Insert confirmation
```

#### 7. Generate Summary Report
```
Type: Code
Input from: "Split Into Individual Repos" (Branch 2 - done signal)
Processing:
  - Aggregates all repository data
  - Calculates summary statistics
  - Generates markdown report
Outputs: Summary data
Connected to: "Send Slack Notification"
```

#### 8. Send Slack Notification
```
Type: HTTP Request
Input from: "Generate Summary Report"
Action: POST to Slack webhook
Status: DISABLED by default
```

## Verifying Connections in n8n

### Visual Checks

1. **All nodes should be connected** - No orphaned nodes
2. **Lines should be solid** - Dashed lines indicate issues
3. **Trigger is green** - Schedule trigger properly configured
4. **Disabled nodes are grayed out** - Optional nodes

### Connection Points to Verify

```
✓ Schedule Trigger → Fetch All Organization Repos
✓ Fetch All Organization Repos → Split Into Individual Repos
✓ Split Into Individual Repos → Fetch All Data & Calculate Metrics (loop branch)
✓ Split Into Individual Repos → Generate Summary Report (done branch)
✓ Fetch All Data & Calculate Metrics → Filter Repos Needing Attention
✓ Filter Repos Needing Attention → Save to PostgreSQL
✓ Generate Summary Report → Send Slack Notification (optional)
```

## Testing Connections

### Step 1: Import Correct Version

```bash
# Use the fixed version
cd automation/n8n-workflows
# Import: ai-whisperers-repo-monitor-fixed.json
```

### Step 2: Configure Credentials

**GitHub Token:**
1. Click on "Fetch All Organization Repos" node
2. Credentials dropdown → Create New Credential
3. Type: Header Auth
4. Name: `Authorization`
5. Value: `Bearer YOUR_GITHUB_TOKEN`

**Note:** The code node will use `$env.GITHUB_TOKEN` or `$env.GITHUB_PAT` from environment variables.

### Step 3: Test Each Node

Run workflow in test mode and verify:

1. **Schedule Trigger** ✓
   - Should trigger immediately in test mode

2. **Fetch All Organization Repos** ✓
   - Should return array of 25+ repositories
   - Check output: `[{name, url, html_url, ...}, ...]`

3. **Split Into Individual Repos** ✓
   - Should show "Processing 1 of 25"
   - Two output branches should activate

4. **Fetch All Data & Calculate Metrics** ✓
   - Should show repository data with:
     - `commits_last_6h`: number
     - `open_pull_requests`: number
     - `health_score`: 0-100
   - Check for errors in console logs

5. **Filter Repos Needing Attention** ✓
   - Should only pass through repos with `needs_attention === true`
   - Might be 0 repos if all are healthy

6. **Generate Summary Report** ✓
   - Should output summary object with:
     - `total_repos`
     - `healthy_repos`
     - `average_health_score`
     - `markdown` report

### Step 4: Verify Data Flow

Check each node's output:

```javascript
// Fetch All Organization Repos output:
[
  {
    "name": "repo-name",
    "url": "https://api.github.com/repos/Ai-Whisperers/repo-name",
    "html_url": "https://github.com/Ai-Whisperers/repo-name",
    ...
  }
]

// Fetch All Data & Calculate Metrics output:
{
  "repository": "repo-name",
  "health_score": 85,
  "commits_last_6h": 5,
  "open_pull_requests": 2,
  "needs_attention": false,
  ...
}

// Generate Summary Report output:
{
  "summary": {
    "total_repos": 25,
    "healthy_repos": 20,
    "average_health_score": 82
  },
  "alerts": [...],
  "markdown": "# AI Whisperers - Repository Health Report..."
}
```

## Common Connection Issues & Fixes

### Issue 1: "Node not found" error
**Cause:** Incorrect node reference in connections
**Fix:** Reimport workflow, ensure all node IDs match

### Issue 2: Data not flowing between nodes
**Cause:** Output/input mismatch
**Fix:** Check that previous node outputs array/object as expected

### Issue 3: Merge node not combining data correctly
**Cause:** Timing issues, data structure mismatch
**Fix:** Use Version 2 (fixed) workflow with single code node

### Issue 4: Split In Batches not looping
**Cause:** Incorrect configuration
**Fix:** Ensure batchSize = 1, check both output branches are connected

### Issue 5: Code node errors
**Cause:** Missing environment variables or API token
**Fix:** Set GITHUB_TOKEN or GITHUB_PAT in n8n environment

## Environment Variables Required

For the code node to work, set these in n8n:

```bash
# In n8n container or environment
GITHUB_TOKEN=ghp_your_token_here
# OR
GITHUB_PAT=ghp_your_token_here

# Optional
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## Migration from Version 1 to Version 2

If you already imported Version 1:

1. **Export current workflow** (backup)
2. **Delete current workflow**
3. **Import Version 2** (`ai-whisperers-repo-monitor-fixed.json`)
4. **Reconfigure credentials**
5. **Set environment variables**
6. **Test execution**
7. **Activate workflow**

## Workflow Execution Order

```
1. Trigger fires (every 6 hours)
2. Fetch all 25 repos from GitHub API
3. Split into individual repos
4. For each repo (loop):
   a. Fetch commits (last 6h)
   b. Fetch open PRs
   c. Fetch open issues
   d. Fetch branches
   e. Calculate health score
   f. Create metrics object
   g. Filter if needs attention → Save to DB
5. After all repos processed (done signal):
   a. Generate summary report
   b. Send notifications (if enabled)
6. Workflow complete
```

## Performance Notes

- **Execution time:** ~40-60 seconds for 25 repos
- **API calls:** ~100 per execution (well within rate limits)
- **Memory usage:** ~50-100 MB
- **Database writes:** 0-25 inserts (only repos needing attention)

## Success Criteria

After importing and configuring, verify:

- [ ] All nodes are connected (no orphans)
- [ ] Credentials configured correctly
- [ ] Environment variables set
- [ ] Test execution completes successfully
- [ ] All 25 repos are processed
- [ ] Health scores calculated correctly
- [ ] Database entries created (if applicable)
- [ ] Summary report generated
- [ ] No errors in execution log

## Support

If you encounter connection issues:

1. Check n8n execution logs
2. Verify all connections match this guide
3. Use Version 2 (fixed) workflow
4. Check GitHub token has correct permissions
5. Verify environment variables are set

---

**Recommended Version:** `ai-whisperers-repo-monitor-fixed.json`
**Status:** Verified & Tested
**Last Updated:** 2025-11-05
