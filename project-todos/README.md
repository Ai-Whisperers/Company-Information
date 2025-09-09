# Project Todo Management System

This directory contains repository-specific todo files for managing tasks across the AI-Whisperers organization.

## Directory Structure

- `web-platform-todos.md` - Frontend/React tasks for the web-platform repository
- `core-services-todos.md` - Backend API/database tasks for the core-services repository  
- `ml-models-todos.md` - Machine learning and AI model tasks for the ml-models repository
- `documentation-todos.md` - Documentation tasks for the documentation repository
- `infrastructure-todos.md` - DevOps/deployment tasks for the infrastructure repository
- `company-information-todos.md` - Cross-repository management tasks for this repository

## Todo File Format

Each todo file uses standard Markdown with checkboxes:

```markdown
# Repository Name Todos

## High Priority
- [ ] Task description with details
- [x] Completed task example

## Medium Priority
- [ ] Another task
  - Additional context or subtasks
  - Implementation notes

## Low Priority
- [ ] Future enhancement ideas
```

## Automation

The todo management system includes:

1. **PowerShell Scripts** (`../scripts/manage-todos.ps1`):
   - Automatically distribute todos to target repositories
   - Sync status updates back from repositories
   - Generate cross-repository todo reports

2. **GitHub Actions** (`.github/workflows/todo-sync.yml`):
   - Automated todo synchronization on file changes
   - Scheduled status updates from all repositories
   - Issue creation in target repositories for new todos

## Usage

### Adding New Todos

1. Edit the appropriate repository todo file
2. Add tasks using standard Markdown checkbox format
3. Commit changes - automation will handle distribution

### Viewing Todo Status

- Check individual files for repository-specific todos
- Run `../scripts/manage-todos.ps1 -Report` for organization-wide status
- View GitHub Actions runs for sync status

### Managing Cross-Repository Todos

Some todos may affect multiple repositories. Add these to:
- `company-information-todos.md` for coordination tasks
- Individual repository files for specific implementation tasks

## Integration

This system integrates with:
- Existing GitHub Actions workflows
- PowerShell monitoring scripts
- Azure DevOps work items (via sync)
- Repository issue tracking