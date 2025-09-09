# AI-Whisperers Management Tools Troubleshooting Guide

This document provides troubleshooting procedures for the organizational management tools in this repository.

## Common Issues and Solutions

### GitHub CLI Issues

#### Problem: "gh: command not found" or authentication errors

**Symptoms:**
- PowerShell scripts fail with GitHub CLI errors
- Messages about authentication or command not found

**Solutions:**
1. **Install GitHub CLI:**
   ```bash
   # Download from https://cli.github.com/
   # Or via winget on Windows:
   winget install --id GitHub.cli
   ```

2. **Authenticate with GitHub:**
   ```bash
   gh auth login
   # Follow the prompts to authenticate via web browser
   ```

3. **Verify authentication:**
   ```bash
   gh auth status
   gh repo list Ai-Whisperers
   ```

#### Problem: Rate limiting or API access issues

**Symptoms:**
- Scripts run slowly or timeout
- "API rate limit exceeded" errors

**Solutions:**
1. **Check rate limit status:**
   ```bash
   gh api rate_limit
   ```

2. **Use personal access token:**
   ```bash
   gh auth login --with-token < token.txt
   ```

### PowerShell Execution Issues

#### Problem: "Execution policy" errors

**Symptoms:**
- Scripts cannot be executed
- "execution of scripts is disabled on this system" message

**Solutions:**
1. **Temporary fix (current session only):**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
   ```

2. **Permanent fix (requires admin):**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

#### Problem: Unicode/encoding issues in PowerShell output

**Symptoms:**
- Special characters display incorrectly
- Console output shows question marks or boxes

**Solutions:**
1. **Set console encoding:**
   ```powershell
   [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
   chcp 65001
   ```

2. **Use Windows Terminal or PowerShell 7+ for better Unicode support**

### Azure DevOps Integration Issues

#### Problem: Azure CLI not installed or configured

**Symptoms:**
- azure-devops-sync.ps1 fails with "az: command not found"
- DevOps extension missing errors

**Solutions:**
1. **Install Azure CLI:**
   ```bash
   # Download from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
   ```

2. **Install DevOps extension:**
   ```bash
   az extension add --name azure-devops
   ```

3. **Authenticate:**
   ```bash
   az login
   az devops configure --defaults organization=https://dev.azure.com/your-org
   ```

#### Problem: Organization or project access denied

**Symptoms:**
- "Project not found" or "Access denied" errors
- Empty project lists

**Solutions:**
1. **Verify organization and project names in script configuration**
2. **Check permissions in Azure DevOps**
3. **Update script parameters:**
   ```powershell
   .\azure-devops-sync.ps1 status -Organization "your-org" -Project "your-project"
   ```

### Repository Access Issues

#### Problem: "Repository not found" errors

**Symptoms:**
- Scripts cannot access specific repositories
- Permission denied errors

**Solutions:**
1. **Verify repository names and organization:**
   ```bash
   gh repo list Ai-Whisperers
   ```

2. **Check repository permissions:**
   ```bash
   gh repo view Ai-Whisperers/repository-name
   ```

3. **Update organization name in script configs if changed**

#### Problem: Private repository access issues

**Symptoms:**
- Some repositories not visible in lists
- Partial data returned

**Solutions:**
1. **Verify token permissions include private repository access**
2. **Re-authenticate with broader scopes:**
   ```bash
   gh auth refresh -h github.com -s repo
   ```

### File Sync Issues

#### Problem: Template files not found

**Symptoms:**
- file-sync-manager.ps1 reports missing files
- Source validation fails

**Solutions:**
1. **Verify template directory exists:**
   ```powershell
   Test-Path "C:\Users\kyrian\Documents\Company-Information\documentation-templates"
   ```

2. **Check file paths in script configuration**
3. **Create missing template files or update config**

#### Problem: Sync conflicts or failures

**Symptoms:**
- Files not updating across repositories
- Merge conflict errors

**Solutions:**
1. **Run in dry-run mode first:**
   ```powershell
   .\file-sync-manager.ps1 status -DryRun
   ```

2. **Check target repository permissions**
3. **Manually resolve conflicts before re-running**

## Diagnostic Commands

### System Health Check
```powershell
# Run comprehensive system check
.\management-summary.ps1

# Check individual components
gh auth status
az --version
$PSVersionTable.PSVersion
```

### Detailed Diagnostics
```powershell
# Test Azure DevOps connectivity
.\azure-devops-sync.ps1 test

# Validate file sync configuration
.\file-sync-manager.ps1 validate

# Check repository health
.\repo-monitor-dashboard.ps1 health
```

## Log File Locations

Management scripts create log files in these directories:
- `./sync-logs/` - File synchronization logs
- `./azure-sync-logs/` - Azure DevOps sync logs  
- `./monitoring-reports/` - Repository monitoring reports

Check these directories for detailed error messages and timing information.

## Getting Help

If issues persist after following these procedures:

1. **Check log files** for detailed error messages
2. **Run scripts with -Verbose flag** (where supported) for additional output
3. **Verify all prerequisites** are properly installed and configured
4. **Test individual components** before running full automation
5. **Check GitHub and Azure service status** pages for outages

## Common Configuration Updates

### Changing Organization Name
Update the `Organization` variable in each script:
```powershell
$Config = @{
    Organization = "New-Organization-Name"
    # ... other config
}
```

### Adding New Repositories
Most scripts automatically discover repositories. For exclusions, update:
```powershell
$Config = @{
    ExcludeRepos = @("repo-to-exclude", "another-repo")
    # ... other config  
}
```

### Updating File Paths
For file sync operations, update paths:
```powershell
$Config = @{
    SourcePath = "C:\New\Path\To\Templates"
    # ... other config
}
```