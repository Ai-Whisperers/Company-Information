# Workflow Changes - Email Fix

## File Updated
`automation/n8n-workflows/ai-whisperers-repo-monitor.json`

## Version
- **Old Version**: v1 (2025-11-05)
- **New Version**: v2 (2025-11-10)

## Changes Made

### 1. Added New Node: "Convert Markdown to HTML"
- **Node ID**: `convert-to-html`
- **Type**: Code node
- **Purpose**: Converts markdown report to formatted HTML with CSS styling
- **Position**: [1790, 950]
- **Key Features**:
  - Markdown to HTML conversion (headers, bold, lists, links)
  - Professional CSS styling
  - Responsive design with max-width 800px
  - Color-coded sections (blue headers, red alerts, green healthy status)

### 2. Updated Node: "Send Email Report"
- **Node ID**: `send-email-report`
- **Old Name**: "Send Email Report (Optional)"
- **New Name**: "Send Email Report"
- **Status Changed**: `disabled: true` → **ENABLED** (no disabled flag)
- **Position**: Changed from [1790, 1000] to [2010, 950]
- **Configuration Changes**:
  ```json
  // OLD
  "fromEmail": "noreply@ai-whisperers.com",
  "toEmail": "team@ai-whisperers.com",
  "subject": "AI Whisperers - Repository Health Report",
  "message": "={{ $json.markdown }}"

  // NEW
  "fromEmail": "={{ $env.EMAIL_FROM || 'noreply@ai-whisperers.com' }}",
  "toEmail": "={{ $env.EMAIL_TO || 'team@ai-whisperers.com' }}",
  "subject": "AI Whisperers - Repository Health Report - {{ $json.summary.scan_timestamp }}",
  "message": "={{ $json.html }}"
  ```
- **Added**: SMTP credentials configuration

### 3. Updated Workflow Connections
- **Old Flow**:
  ```
  Generate Summary Report → Send Email Report (Optional) [DISABLED]
  ```

- **New Flow**:
  ```
  Generate Summary Report → Convert Markdown to HTML → Send Email Report [ENABLED]
  ```

### 4. Updated Metadata
- `versionId`: "1" → "2"
- `updatedAt`: "2025-11-05T00:00:00.000Z" → "2025-11-10T14:30:00.000Z"

## Breaking Changes
None - the workflow is backward compatible.

## Required Configuration
After importing the updated workflow, configure:

1. **Environment Variables** (optional, has defaults):
   - `EMAIL_FROM`: Sender email address
   - `EMAIL_TO`: Recipient email address

2. **SMTP Credentials** (required):
   - Credential name: "SMTP Account"
   - Type: SMTP
   - Configure: Host, Port, Username, Password, TLS/SSL

## Migration Steps

1. **Backup Current Workflow**:
   - Export existing workflow from n8n
   - Save as backup

2. **Import Updated Workflow**:
   - Delete or deactivate old workflow
   - Import `ai-whisperers-repo-monitor.json` (v2)
   - Re-configure all credentials

3. **Test**:
   - Run manual execution
   - Check email received with proper HTML formatting

## Nodes Summary

### Nodes Added: 1
- "Convert Markdown to HTML" (code node)

### Nodes Modified: 1
- "Send Email Report" (emailSend node)

### Nodes Unchanged: 13
- Schedule Trigger - Every 6 Hours
- Fetch All Organization Repos
- Split Into Individual Repos
- Get Recent Commits (Last 6h)
- Get Open Pull Requests
- Get Open Issues
- Get All Branches
- Merge All Repository Data
- Calculate Repository Metrics
- Filter Repos Needing Attention
- Save to Notion (Optional)
- Save to PostgreSQL
- Notify Jobs Service
- Generate Summary Report
- Send Slack Notification
- Trigger GitHub Action (Optional)

### Total Nodes: 16 (was 15)

## File Size Impact
- **Old**: ~23.8 KB
- **New**: ~26.5 KB
- **Increase**: ~2.7 KB (HTML conversion code)

## Testing Checklist

- [ ] Workflow imports without errors
- [ ] All credentials are configured
- [ ] Manual execution completes successfully
- [ ] Email is received
- [ ] Email content is HTML formatted (not raw markdown)
- [ ] Links in email are clickable
- [ ] Email styling looks professional
- [ ] Schedule trigger works (wait 6 hours or adjust for testing)

## Rollback Procedure

If issues occur:

1. Delete the v2 workflow
2. Re-import the backup of v1
3. OR disable the email nodes:
   - Deactivate "Convert Markdown to HTML"
   - Deactivate "Send Email Report"

## Known Issues
None currently identified.

## Future Enhancements
- Add conditional email sending (only when alerts exist)
- Support multiple email recipients
- Add email templates for different alert levels
- Include charts/graphs in email body
- Add unsubscribe link

## Questions or Issues?
See `EMAIL_FIX_GUIDE.md` for detailed troubleshooting and configuration help.
