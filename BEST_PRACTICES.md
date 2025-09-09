# AI-Whisperers Management Tools - Best Practices and Examples

This document provides best practices, usage examples, and workflow recommendations for the organizational management tools.

## Best Practices

### Daily Workflow Recommendations

#### Morning Routine (5 minutes)
```powershell
# 1. Get organizational overview
.\management-summary.ps1

# 2. Check repository health
.\repo-monitor-dashboard.ps1 health

# 3. Review todos across all repositories  
.\todo-manager.ps1 status
```

#### Weekly Review (15 minutes)
```powershell
# 1. Generate comprehensive monitoring report
.\repo-monitor-dashboard.ps1 summary

# 2. Review activity trends
.\repo-monitor-dashboard.ps1 activity

# 3. Validate documentation templates
.\file-sync-manager.ps1 validate

# 4. Test Azure DevOps integration health
.\azure-devops-sync.ps1 test
```

### Repository Management Best Practices

#### Todo Management
- **Keep todos actionable**: Use specific, measurable tasks
- **Regular updates**: Review and update todo status weekly
- **Consistent format**: Follow established markdown todo format
- **Priority levels**: Use consistent priority categorization (High/Medium/Low)

**Good Todo Example:**
```markdown
## High Priority
- [ ] Implement user authentication system
  - Add JWT token validation middleware
  - Create login/logout endpoints  
  - Add password hashing with bcrypt
  - Write unit tests for auth functions
```

**Poor Todo Example:**
```markdown
- [ ] Fix auth stuff
- [ ] Make it work better
```

#### Repository Health Monitoring

**Healthy Repository Indicators:**
- Regular commit activity (3+ commits/week recommended)
- Manageable open issues (< 10 open issues)
- Active pull request review (< 5 stale PRs)
- Recent releases or milestones

**Health Monitoring Schedule:**
```powershell
# Daily - quick health check
.\repo-monitor-dashboard.ps1 health

# Weekly - detailed analysis
.\repo-monitor-dashboard.ps1 dashboard -Detailed

# Monthly - generate reports for stakeholders  
.\repo-monitor-dashboard.ps1 summary
```

## Usage Examples

### Example 1: New Team Member Onboarding

```powershell
# Step 1: Show organizational overview
.\management-summary.ps1

# Step 2: Demonstrate repository monitoring
.\repo-monitor-dashboard.ps1 dashboard -Repository "web-platform"

# Step 3: Show current project priorities
.\todo-manager.ps1 status

# Step 4: Validate their development environment
.\azure-devops-sync.ps1 test
```

### Example 2: Pre-Release Health Check

```powershell
# Check all repositories are healthy
.\repo-monitor-dashboard.ps1 health | Tee-Object -FilePath "pre-release-health.txt"

# Ensure all critical todos are complete
.\todo-manager.ps1 status | Where-Object { $_ -match "High Priority" }

# Validate documentation is up to date
.\file-sync-manager.ps1 validate

# Generate summary report
.\repo-monitor-dashboard.ps1 summary
```

### Example 3: Weekly Team Standup Prep

```powershell
# Generate activity summary
.\repo-monitor-dashboard.ps1 activity -Days 7

# Check for repositories needing attention
.\repo-monitor-dashboard.ps1 health

# Review todo completion status
.\todo-manager.ps1 status | Select-String -Pattern "\[x\]|\[ \]" | Group-Object
```

### Example 4: Quarterly Planning Session

```powershell
# Long-term activity analysis
.\repo-monitor-dashboard.ps1 activity -Days 90

# Comprehensive health assessment
.\repo-monitor-dashboard.ps1 dashboard -Detailed | Out-File "quarterly-health.txt"

# Todo completion trends
.\todo-manager.ps1 status | Out-File "todo-status-q$(Get-Date -Format 'q').txt"
```

## Advanced Usage Patterns

### Automated Reporting

Create scheduled tasks for regular reporting:

```powershell
# Create daily health check script
@"
# Daily Health Check - $(Get-Date -Format 'yyyy-MM-dd')
Write-Host "=== Daily AI-Whisperers Health Check ===" -ForegroundColor Cyan

.\repo-monitor-dashboard.ps1 health
.\todo-manager.ps1 status | Select-String "High Priority" -A 5

Write-Host "`nReport generated: $(Get-Date)" -ForegroundColor Gray
"@ | Out-File "daily-check.ps1"

# Run and save results
.\daily-check.ps1 | Tee-Object -FilePath "logs\daily-$(Get-Date -Format 'yyyy-MM-dd').log"
```

### Custom Repository Filtering

```powershell
# Focus on specific repositories
$criticalRepos = @("core-services", "web-platform", "ml-models")

foreach ($repo in $criticalRepos) {
    Write-Host "`n=== $repo ===" -ForegroundColor Yellow
    .\repo-monitor-dashboard.ps1 dashboard -Repository $repo -Detailed
}
```

### Integration with CI/CD Pipelines

```yaml
# Example GitHub Action step
- name: Repository Health Check
  shell: pwsh
  run: |
    cd scripts
    .\repo-monitor-dashboard.ps1 health
    if ($LASTEXITCODE -ne 0) { 
      Write-Error "Repository health check failed"
      exit 1 
    }
```

## Configuration Best Practices

### Environment Setup
```powershell
# Set up consistent execution environment
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Create alias for quick access
Set-Alias -Name "health" -Value "C:\Path\To\repo-monitor-dashboard.ps1"
Set-Alias -Name "todos" -Value "C:\Path\To\todo-manager.ps1"
```

### Customizing Health Thresholds

Edit the configuration in `repo-monitor-dashboard.ps1`:

```powershell
$Config = @{
    Organization = "Ai-Whisperers"
    OutputPath = "./monitoring-reports"
    HealthThresholds = @{
        CommitsPerWeek = 3      # Minimum commits per week
        IssuesOpen = 10         # Maximum open issues before warning
        PRsOpen = 5            # Maximum open PRs before warning
        LastActivityDays = 14   # Days since last activity before warning
    }
}
```

### Template Synchronization Strategy

```powershell
# Best practice: Validate before syncing
.\file-sync-manager.ps1 validate
if ($LASTEXITCODE -eq 0) {
    .\file-sync-manager.ps1 status
    # Add actual sync implementation when ready
}
```

## Troubleshooting Patterns

### Progressive Diagnosis
```powershell
# Step 1: Basic connectivity
gh auth status
az account show

# Step 2: Individual tool tests
.\azure-devops-sync.ps1 test
.\file-sync-manager.ps1 validate

# Step 3: Comprehensive check
.\management-summary.ps1

# Step 4: Detailed repository analysis
.\repo-monitor-dashboard.ps1 dashboard -Detailed
```

### Error Recovery Patterns

```powershell
# Graceful error handling example
try {
    .\repo-monitor-dashboard.ps1 health
}
catch {
    Write-Warning "Health check failed: $($_.Exception.Message)"
    Write-Host "Attempting basic diagnostics..." -ForegroundColor Yellow
    
    gh auth status
    if ($LASTEXITCODE -ne 0) {
        Write-Host "GitHub authentication required: gh auth login" -ForegroundColor Red
    }
}
```

## Performance Optimization

### Efficient Repository Scanning
- Use specific repository filters when possible
- Leverage GitHub API pagination for large organizations
- Cache repository lists for frequently run scripts
- Use parallel processing for independent operations

### Batch Operations Example
```powershell
# Process multiple repositories efficiently
$repositories = gh repo list Ai-Whisperers --json name | ConvertFrom-Json

$repositories | ForEach-Object -Parallel {
    $repo = $_.name
    Write-Host "Processing $repo..." -ForegroundColor Gray
    # Repository-specific operations here
} -ThrottleLimit 5
```

## Team Collaboration Guidelines

### Shared Reporting Standards
- Generate reports with consistent timestamps
- Use standardized output formats (CSV for data, markdown for summaries)
- Archive reports in consistent directory structure
- Share health thresholds and configuration across team

### Communication Best Practices
- Include repository health in team standups
- Escalate critical health issues immediately
- Review todo completion trends in retrospectives
- Use monitoring data for sprint planning

This framework provides a solid foundation for maintaining organizational health and coordination across all AI-Whisperers repositories.