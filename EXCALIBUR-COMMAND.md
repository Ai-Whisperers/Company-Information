# 🗡️ Excalibur Command Documentation

## Magic Command: `claude pull excalibur`

The Excalibur command is a powerful automation system that fetches live data from your GitHub organization and automatically updates all todo lists across repositories.

## What It Does

When you invoke `claude pull excalibur`, the system will:

1. **Fetch Live GitHub Data**
   - Repository information and metadata
   - Open issues and their current status
   - Active pull requests
   - Recent commit activity
   - Repository health metrics

2. **Update Local Todo Lists**
   - Refresh all files in `project-todos/` directory
   - Add current issues as actionable todo items
   - Include pull request reviews in task lists
   - Update repository status and activity metrics

3. **Sync to Repositories**
   - Create or update `TODO.md` files in each repository
   - Maintain consistent todo format across all repos
   - Add automated commit messages with Claude Code signature

4. **Generate Reports**
   - Create execution summary with timestamp
   - Log all actions taken during sync
   - Provide overview of organizational health

## Prerequisites

### Required Tools
```powershell
# GitHub CLI (required)
winget install GitHub.cli

# Authenticate with GitHub
gh auth login
```

### Authentication
- GitHub CLI must be authenticated with access to AI-Whisperers organization
- Requires repository read/write permissions for todo synchronization

## Usage

### Basic Command
```bash
# Magic command - triggers full sync
claude pull excalibur
```

### Manual Execution
```powershell
# Run the PowerShell script directly
.\scripts\excalibur-command.ps1

# Test prerequisites without making changes  
.\scripts\excalibur-command.ps1 -Action test

# Dry run - see what would be done
.\scripts\excalibur-command.ps1 -DryRun -Verbose

# Show help
.\scripts\excalibur-command.ps1 -Action help
```

## Command Options

| Option | Description |
|--------|-------------|
| `-Action sync` | Full synchronization (default) |
| `-Action test` | Test prerequisites and connectivity |
| `-Action help` | Show usage information |
| `-DryRun` | Preview changes without applying them |
| `-Verbose` | Show detailed execution output |

## Output Files

### Todo Lists (Updated)
- `project-todos/ai-investment-todos.md`
- `project-todos/comment-analizer-todos.md` 
- `project-todos/wpg-amenities-todos.md`
- `project-todos/[repository-name]-todos.md`

### Reports & Logs
- `project-todos/excalibur-summary-[timestamp].md` - Execution summary
- `logs/excalibur-[timestamp].log` - Detailed execution log

### Repository Files (Synced)
- `TODO.md` in each repository root
- Maintains consistent format across all repositories

## Todo List Structure

Each generated todo list includes:

```markdown
# Repository Todo List

## Repository Status
- Last Updated: [timestamp]
- Description: [repo description]
- Open Issues: [count]
- Open PRs: [count]

## Current Issues (From GitHub)
### Issue #123: Bug in authentication
- [ ] Address issue: Bug in authentication

## Active Pull Requests  
### PR #456: Add new feature
- [ ] Review and merge: Add new feature

## Recent Activity
- [commit details]

## Repository-Specific Tasks
- [context-aware todos based on repo type]
```

## Repository-Specific Intelligence

The system includes intelligent todo generation based on repository type:

### AI-Investment
- Security audits and compliance tasks
- Trading algorithm optimization
- Performance monitoring setup

### Comment-Analizer  
- Language support expansion
- Analysis accuracy improvements
- UI/UX enhancements

### WPG-Amenities
- Core platform development
- Local business integration
- Mobile-first design implementation

### And more...
Each repository gets contextually relevant todos based on its purpose and current state.

## Error Handling

The system includes comprehensive error handling:

- **Connection Issues**: Retries GitHub API calls
- **Authentication**: Clear error messages for auth problems  
- **Repository Access**: Handles private/public repository differences
- **File Conflicts**: Creates backups before updating files
- **API Rate Limits**: Respects GitHub API rate limiting

## Logging

All actions are logged with timestamps:
```
[2024-01-15 14:30:15] [INFO] Excalibur command initiated!
[2024-01-15 14:30:16] [SUCCESS] GitHub CLI found: gh version 2.40.1
[2024-01-15 14:30:17] [SUCCESS] Found 8 repositories
[2024-01-15 14:30:18] [SUCCESS] Updated ai-investment-todos.md
```

## Integration with Claude Code

When you say `claude pull excalibur` to Claude Code:

1. Claude recognizes the magic command
2. Executes the PowerShell script automatically
3. Processes the updated todo files
4. Provides a summary of changes made
5. Ready to work on the refreshed priorities

## Best Practices

### Frequency
- Run before starting development sessions
- Execute after major repository changes
- Use weekly for maintenance updates

### Workflow Integration
```bash
# Morning routine
claude pull excalibur          # Sync latest data
# Claude now has fresh todos to work with

# Development session
# Work on prioritized tasks from updated lists

# End of session
git commit -m "Complete todo items from excalibur sync"
```

### Customization
- Modify `Get-RepositorySpecificTodos` function for custom todo templates
- Adjust `$OrganizationName` for different GitHub organizations
- Configure todo file locations in script variables

## Troubleshooting

### Common Issues

**GitHub CLI Not Found**
```powershell
# Install GitHub CLI
winget install GitHub.cli
# or download from https://cli.github.com/
```

**Authentication Failed**  
```powershell
gh auth login
# Follow prompts to authenticate
```

**Permission Denied**
```powershell
# Check repository permissions
gh repo view Ai-Whisperers/[repo-name]
```

**Rate Limit Exceeded**
```powershell
# Check rate limit status
gh api rate_limit
# Wait for reset or use authenticated requests
```

## Advanced Features

### Custom Filters
Modify the script to filter repositories by:
- Last activity date
- Issue count thresholds  
- Repository topics/tags
- Development status

### Integration Hooks
The system supports webhooks for:
- Slack/Teams notifications
- Email summaries
- Dashboard updates
- Automated project management updates

---

## 🎯 Quick Start

1. Ensure GitHub CLI is installed and authenticated
2. Say `claude pull excalibur` to Claude Code
3. Review the updated todo lists in `project-todos/`
4. Start working on the prioritized tasks

The magic of Excalibur brings your entire organization's current state into focus, ensuring you're always working on what matters most! ⚔️