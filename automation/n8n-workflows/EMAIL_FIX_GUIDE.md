# Email Fix Guide - n8n Repository Monitor Workflow

## Problem Summary

The n8n workflow "AI Whisperers - Repository Monitor (All 25 Repos)" was sending empty emails. This document explains the root causes and solutions.

## Issues Identified

### 1. **Email Node Was Disabled**
- **Location**: `ai-whisperers-repo-monitor.json` line 472
- **Issue**: The email send node had `"disabled": true`
- **Impact**: Email node never executed, resulting in no emails being sent

### 2. **Email Node Was Missing**
- **Location**: `ai-whisperers-repo-monitor-fixed.json`
- **Issue**: The "fixed" version completely removed the email node
- **Impact**: No email functionality available at all

### 3. **Content Type Mismatch**
- **Location**: Original email node configuration
- **Issue**: Email was set to `"emailType": "html"` but content was raw markdown text
- **Impact**: Even if the node was enabled, emails would display markdown syntax instead of formatted content

### 4. **No HTML Conversion**
- **Issue**: The workflow generated markdown reports but never converted them to HTML
- **Impact**: Email clients would receive unformatted text with markdown syntax visible

## Solution Implementation

The updated `ai-whisperers-repo-monitor.json` (version 2) now includes:

### New Node: "Convert Markdown to HTML"
**Purpose**: Converts the markdown report to properly formatted HTML

**Features**:
- Converts markdown headers (#, ##, ###) to HTML headers
- Converts bold text (**text**) to `<strong>` tags
- Converts lists (- item) to HTML `<ul>` and `<li>` tags
- Converts links [text](url) to HTML `<a>` tags
- Adds professional CSS styling for better email appearance

**Styling includes**:
- Professional typography (Arial, sans-serif)
- Color-coded sections (blue headers, alerts in red, healthy status in green)
- Responsive design with max-width for readability
- Proper spacing and padding
- Styled links and hover effects

### Updated Node: "Send Email Report"
**Configuration**:
- **From**: Uses `EMAIL_FROM` environment variable (fallback: noreply@ai-whisperers.com)
- **To**: Uses `EMAIL_TO` environment variable (fallback: team@ai-whisperers.com)
- **Subject**: "AI Whisperers - Repository Health Report - {timestamp}"
- **Type**: HTML
- **Content**: Uses the converted HTML from previous node
- **Credentials**: Requires SMTP credentials configured in n8n

### Workflow Connections
The "Generate Summary Report" node now connects to both:
1. "Send Slack Notification" (existing)
2. "Convert Markdown to HTML" (new) → "Send Email Report" (new)

## Configuration Required

### 1. Environment Variables
Set these in your n8n environment or workflow settings:

```bash
EMAIL_FROM=your-sender@example.com
EMAIL_TO=your-recipient@example.com
```

### 2. SMTP Credentials
Configure SMTP credentials in n8n:
- **Credential Name**: "SMTP Account"
- **Type**: SMTP
- **Required Fields**:
  - SMTP Host
  - SMTP Port (usually 587 for TLS, 465 for SSL)
  - Username
  - Password
  - Secure Connection (TLS/SSL)

### 3. Re-import the Workflow
The workflow has been updated to version 2:
1. Open n8n and go to Workflows
2. Delete or archive the old "AI Whisperers - Repository Monitor (All 25 Repos)" workflow
3. Import the updated workflow from `automation/n8n-workflows/ai-whisperers-repo-monitor.json`
4. Re-configure credentials (GitHub Token, PostgreSQL, SMTP Account)

The email node is now enabled by default. If you want to disable it temporarily:
1. Click on the "Send Email Report" node
2. Click the three dots menu
3. Select "Deactivate"

## Testing the Fix

### Step 1: Test with Manual Execution
1. Open the workflow in n8n
2. Click "Execute Workflow" button
3. Check the execution log for each node
4. Verify the email was sent successfully

### Step 2: Verify Email Content
Check that the received email contains:
- Formatted HTML (not raw markdown)
- Proper headers and styling
- Clickable links to repositories
- Summary statistics in a readable format
- Alert sections for repositories needing attention

### Step 3: Troubleshooting
If emails are still empty:

**Check SMTP Configuration**:
```bash
# In n8n, go to:
# Settings > Credentials > SMTP Account
# Verify all fields are correct
```

**Check Environment Variables**:
```bash
# In n8n workflow settings or .env file:
EMAIL_FROM=noreply@ai-whisperers.com
EMAIL_TO=team@ai-whisperers.com
```

**Check Node Execution**:
- Verify "Generate Summary Report" produces `markdown` field
- Verify "Convert Markdown to HTML" produces `html` field
- Verify "Send Email Report" receives the `html` field

**Check Email Logs**:
- Check n8n execution logs for SMTP errors
- Check your email server logs for delivery issues
- Check spam/junk folders

## Email Content Structure

The email will contain:

### Header Section
- Main title: "AI Whisperers - Repository Health Report"
- Scan timestamp

### Summary Section
- Total repositories monitored
- Healthy repositories count (with checkmark)
- Repositories needing attention (with warning)
- Average health score

### Activity Section (Last 6 Hours)
- Total commits
- Open pull requests count
- Stale pull requests count
- Open issues count

### Alerts Section (if any)
For each repository needing attention:
- Repository name with health score
- List of specific issues:
  - Number of stale PRs
  - Number of open issues
  - Number of branches
  - Activity status
- Direct link to repository

### Footer
- Generation note: "Generated by n8n Repository Monitor"

## Alternative: Plain Text Emails

If HTML emails are not desired, modify the "Send Email Report" node:

```json
{
  "parameters": {
    "emailType": "text",
    "message": "={{ $json.markdown }}"
  }
}
```

And remove the "Convert Markdown to HTML" node from the workflow.

## Comparison: Old vs New

### Before (Broken)
```
Generate Summary Report → [Email Node Disabled/Missing] → ❌ No Email
```

### After (Fixed)
```
Generate Summary Report → Convert Markdown to HTML → Send Email Report → ✅ Formatted Email
```

## Additional Notes

### Email Frequency
The workflow runs every 6 hours by default. To change:
1. Edit the "Schedule Trigger - Every 6 Hours" node
2. Modify the interval value
3. Save the workflow

### Email Recipients
To send to multiple recipients:
- Modify the `EMAIL_TO` variable: `email1@example.com,email2@example.com`
- Or add a "Split Out" node to send individual emails

### Conditional Emails
To only send emails when there are alerts:
1. Add a "Filter" node after "Convert Markdown to HTML"
2. Condition: `{{ $json.summary.repos_needing_attention > 0 }}`
3. Connect only the "true" output to "Send Email Report"

## Support

For issues or questions:
1. Check n8n execution logs
2. Verify SMTP credentials
3. Test with a simple email workflow first
4. Check the n8n community forum
5. Review n8n documentation for the emailSend node

## Version History

- **v1** (2025-11-05): Original workflow with disabled email node - emails were not being sent
- **v2** (2025-11-10 14:30): First fix attempt with HTML email functionality
  - Added "Convert Markdown to HTML" node for proper email formatting
  - Updated "Send Email Report" node with HTML content support
  - Email node now enabled by default
  - Added environment variable support for email addresses
  - Updated connections to wire email nodes correctly
  - ⚠️ Issue: Regex-based conversion failed due to escaped newlines
- **v3** (2025-11-10 15:10): Fixed HTML conversion - CURRENT VERSION
  - Rewrote markdown to HTML converter to use line-by-line parsing
  - Properly handles escaped newlines (`\\n`) from n8n
  - Improved HTML structure with proper container styling
  - Better handling of lists, headers, and formatting
  - Emails now display correctly with full content
