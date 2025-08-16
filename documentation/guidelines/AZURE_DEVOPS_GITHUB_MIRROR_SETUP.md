# Azure DevOps GitHub Repository Mirroring Setup Guide

**Organization**: AI-Whisperers  
**Purpose**: Mirror GitHub repositories to Azure DevOps with automatic synchronization  
**Last Updated**: 2025-01-16

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Azure DevOps Initial Setup](#azure-devops-initial-setup)
3. [GitHub Service Connection](#github-service-connection)
4. [Repository Mirroring Methods](#repository-mirroring-methods)
5. [Work Items & Boards Integration](#work-items--boards-integration)
6. [Automation Scripts](#automation-scripts)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 🎯 Overview

This guide establishes a **dual-repository strategy** where:
- **GitHub** remains the primary source of truth for code
- **Azure DevOps** provides project management, boards, and CI/CD
- **Automatic synchronization** keeps both platforms in sync
- **Work items** link directly to GitHub commits and PRs

### Architecture
```
GitHub (Primary)          Azure DevOps (Mirror + PM)
     │                              │
     ├── Code ──────sync───────→ Azure Repos
     ├── Issues ────sync───────→ Work Items
     ├── PRs ───────link───────→ Boards
     └── Actions ───trigger────→ Pipelines
```

---

## 🚀 Azure DevOps Initial Setup

### Step 1: Create Azure DevOps Organization

1. Navigate to [https://dev.azure.com](https://dev.azure.com)
2. Click **"Start free"** or **"Sign in"**
3. Create new organization:
   ```
   Organization name: aiwhisperers
   Region: United States
   ```
4. Create project:
   ```
   Project name: AI-Whisperers
   Visibility: Private
   Version control: Git
   Work item process: Agile
   ```

### Step 2: Configure Project Settings

```bash
# Install Azure CLI and DevOps extension
winget install Microsoft.AzureCLI
az extension add --name azure-devops

# Login
az login
az devops configure --defaults organization=https://dev.azure.com/aiwhisperers project=AI-Whisperers
```

---

## 🔗 GitHub Service Connection

### Step 1: Create GitHub Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with scopes:
   ```
   ✅ repo (Full control)
   ✅ workflow (Update GitHub Actions)
   ✅ write:packages
   ✅ admin:repo_hook (Webhooks)
   ✅ read:org
   ```
3. Save token securely

### Step 2: Configure Service Connection in Azure DevOps

1. Go to Project Settings → Service connections → New service connection
2. Select **GitHub**
3. Choose **Personal Access Token**
4. Configure:
   ```yaml
   Connection name: GitHub-AIWhisperers
   Server URL: https://github.com
   Personal Access Token: [Your GitHub PAT]
   ```

### Step 3: Install GitHub App for Azure Boards

1. Go to [GitHub Marketplace](https://github.com/marketplace/azure-boards)
2. Install **Azure Boards** app
3. Select your organization: `aiwhispererwvdp`
4. Grant permissions to all repositories

---

## 📦 Repository Mirroring Methods

## Method 1: Azure Pipelines (Recommended)

### Create Sync Pipeline (`azure-pipelines-sync.yml`)

```yaml
# Save this file in your GitHub repo root
name: GitHub-to-Azure-Sync

trigger:
  branches:
    include:
    - main
    - develop
    - 'feature/*'
    - 'release/*'

pr: none

pool:
  vmImage: 'ubuntu-latest'

variables:
  - group: azure-sync-credentials

jobs:
- job: SyncToAzureRepos
  displayName: 'Sync GitHub to Azure Repos'
  steps:
  - checkout: self
    persistCredentials: true
    fetchDepth: 0
    
  - script: |
      # Configure git
      git config --global user.email "sync@ai-whisperers.org"
      git config --global user.name "Azure DevOps Sync"
      
      # Add Azure Repos as remote
      git remote add azure https://$(AZURE_PAT)@dev.azure.com/aiwhisperers/AI-Whisperers/_git/$(Build.Repository.Name)
      
      # Push all branches and tags
      git push azure --all --force
      git push azure --tags --force
    displayName: 'Push to Azure Repos'
    
  - script: |
      # Sync work items mentioned in commits
      echo "Syncing work items from commit messages..."
      git log --pretty=format:"%H %s" -10 | while read commit message; do
        if [[ $message =~ \#([0-9]+) ]]; then
          workitem="${BASH_REMATCH[1]}"
          echo "Linking commit $commit to work item $workitem"
          # Use Azure CLI to link
          az boards work-item relation add \
            --id $workitem \
            --relation-type "ArtifactLink" \
            --target-id $commit \
            --org https://dev.azure.com/aiwhisperers
        fi
      done
    displayName: 'Link Commits to Work Items'
```

### Setup for Each Repository

Run this PowerShell script to set up mirroring for all repositories:

```powershell
# setup-mirror-pipelines.ps1

$repositories = @(
    "Company-Information",
    "Company-website", 
    "WPG-Amenities",
    "Investment-platform",
    "Comment-Analizer",
    "Call-Recorder"
)

$organization = "aiwhisperers"
$project = "AI-Whisperers"
$githubOrg = "aiwhispererwvdp"

foreach ($repo in $repositories) {
    Write-Host "Setting up mirror for $repo..." -ForegroundColor Green
    
    # Create Azure Repo
    az repos create --name $repo --project $project --org https://dev.azure.com/$organization
    
    # Create pipeline for syncing
    az pipelines create `
        --name "$repo-Sync" `
        --repository https://github.com/$githubOrg/$repo `
        --branch main `
        --yml-path azure-pipelines-sync.yml `
        --service-connection GitHub-AIWhisperers `
        --org https://dev.azure.com/$organization `
        --project $project
        
    Write-Host "✓ $repo configured" -ForegroundColor Green
}
```

## Method 2: GitHub Actions (Alternative)

Create `.github/workflows/azure-sync.yml` in each GitHub repository:

```yaml
name: Sync to Azure DevOps

on:
  push:
    branches: [main, develop]
  pull_request:
    types: [opened, synchronize, closed]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
      with:
        fetch-depth: 0
        
    - name: Sync to Azure Repos
      env:
        AZURE_DEVOPS_PAT: ${{ secrets.AZURE_DEVOPS_PAT }}
      run: |
        git remote add azure https://${AZURE_DEVOPS_PAT}@dev.azure.com/aiwhisperers/AI-Whisperers/_git/${GITHUB_REPOSITORY#*/}
        git push azure --all --force
        git push azure --tags --force
        
    - name: Update Azure Boards
      uses: danhellem/github-actions-azure-boards@v1
      with:
        azure-devops-organization: aiwhisperers
        azure-devops-project: AI-Whisperers
        azure-devops-pat: ${{ secrets.AZURE_DEVOPS_PAT }}
        github-token: ${{ secrets.GITHUB_TOKEN }}
        sync-issues: true
        sync-pull-requests: true
```

## Method 3: Git Hooks (Local Development)

Create `hooks/post-commit` in your local `.git` directory:

```bash
#!/bin/bash
# Automatically push to Azure Repos after commit

AZURE_REMOTE="azure"

# Check if azure remote exists
if git remote | grep -q "^${AZURE_REMOTE}$"; then
    echo "Syncing to Azure DevOps..."
    git push $AZURE_REMOTE $(git rev-parse --abbrev-ref HEAD)
else
    echo "Azure remote not configured. Run: git remote add azure <azure-repo-url>"
fi
```

---

## 📋 Work Items & Boards Integration

### Step 1: Import Existing Work Items

```powershell
# import-work-items.ps1

$csvPath = "C:\Users\Gestalt\Desktop\repos\Company-Information\azure-work-items"

# Import Epics
Get-ChildItem -Path $csvPath -Filter "EPIC-*.md" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $title = ($content -match '# (.+)') ? $Matches[1] : "Epic"
    
    az boards work-item create `
        --title $title `
        --type Epic `
        --area "AI-Whisperers" `
        --iteration "AI-Whisperers" `
        --fields "Description=$content" `
        --org https://dev.azure.com/aiwhisperers `
        --project AI-Whisperers
}

Write-Host "✓ Work items imported" -ForegroundColor Green
```

### Step 2: Configure AB# Syntax for Commit Linking

Enable automatic linking in Azure DevOps:
1. Project Settings → Boards → GitHub connections
2. Add connection using GitHub PAT
3. Select repositories to track

Now use in commits:
```bash
git commit -m "Implement user authentication AB#123"
# This links to Azure Boards work item #123
```

### Step 3: Setup Board Columns and Swimlanes

```powershell
# configure-boards.ps1

# Configure Kanban board columns
az boards column create --name "Backlog" --project AI-Whisperers
az boards column create --name "In Progress" --project AI-Whisperers  
az boards column create --name "Review" --project AI-Whisperers
az boards column create --name "Testing" --project AI-Whisperers
az boards column create --name "Done" --project AI-Whisperers

# Set WIP limits
az boards column update --name "In Progress" --wip-limit 5
az boards column update --name "Review" --wip-limit 3

# Configure swimlanes by Area Path
az boards row create --name "Business-Setup" 
az boards row create --name "Company-Website"
az boards row create --name "WPG-Amenities"
az boards row create --name "AI-Investment"
az boards row create --name "Comment-Analyzer"
```

### Step 4: Create Queries for GitHub-Linked Items

```sql
-- Query: Active GitHub PRs
SELECT [System.Id], [System.Title], [System.State]
FROM WorkItems
WHERE [System.TeamProject] = 'AI-Whisperers'
  AND [System.ExternalLinkCount] > 0
  AND [System.State] IN ('Active', 'In Progress')
ORDER BY [System.ChangedDate] DESC

-- Query: Items Without GitHub Links  
SELECT [System.Id], [System.Title], [System.State]
FROM WorkItems
WHERE [System.TeamProject] = 'AI-Whisperers'
  AND [System.WorkItemType] = 'User Story'
  AND [System.ExternalLinkCount] = 0
  AND [System.State] <> 'Done'
```

---

## 🤖 Automation Scripts

### Complete Setup Script

Save as `setup-azure-github-mirror.ps1`:

```powershell
# Complete Azure DevOps GitHub Mirror Setup Script

param(
    [string]$GithubOrg = "aiwhispererwvdp",
    [string]$AzureOrg = "aiwhisperers",
    [string]$AzureProject = "AI-Whisperers",
    [string]$GithubPAT = $env:GITHUB_PAT,
    [string]$AzurePAT = $env:AZURE_DEVOPS_PAT
)

Write-Host "🚀 Starting Azure DevOps GitHub Mirror Setup" -ForegroundColor Cyan

# Step 1: Authenticate
Write-Host "📝 Authenticating..." -ForegroundColor Yellow
az login
az devops configure --defaults organization=https://dev.azure.com/$AzureOrg project=$AzureProject

# Step 2: Create variable group for credentials
Write-Host "🔐 Creating secure variable group..." -ForegroundColor Yellow
az pipelines variable-group create `
    --name "azure-sync-credentials" `
    --variables "AZURE_PAT=$AzurePAT" "GITHUB_PAT=$GithubPAT" `
    --authorize true

# Step 3: Get GitHub repositories
Write-Host "📦 Fetching GitHub repositories..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "token $GithubPAT"
    "Accept" = "application/vnd.github.v3+json"
}

$repos = Invoke-RestMethod `
    -Uri "https://api.github.com/orgs/$GithubOrg/repos" `
    -Headers $headers

# Step 4: Create Azure Repos and pipelines
foreach ($repo in $repos) {
    $repoName = $repo.name
    Write-Host "⚙️ Processing $repoName..." -ForegroundColor Green
    
    # Create Azure Repo
    try {
        az repos create --name $repoName 2>$null
        Write-Host "  ✓ Created Azure Repo: $repoName" -ForegroundColor Gray
    } catch {
        Write-Host "  ℹ️ Repo exists: $repoName" -ForegroundColor Gray
    }
    
    # Create sync pipeline
    $pipelineYaml = @"
trigger:
  branches:
    include: ['main', 'develop', 'feature/*']

pool:
  vmImage: 'ubuntu-latest'

steps:
- checkout: self
  fetchDepth: 0
  persistCredentials: true

- script: |
    git remote add azure https://\$(AZURE_PAT)@dev.azure.com/$AzureOrg/$AzureProject/_git/$repoName
    git push azure --all --force
    git push azure --tags --force
  displayName: 'Mirror to Azure Repos'
"@
    
    # Save pipeline YAML temporarily
    $tempFile = New-TemporaryFile
    Set-Content -Path $tempFile.FullName -Value $pipelineYaml
    
    # Create pipeline
    try {
        az pipelines create `
            --name "$repoName-Mirror" `
            --repository "https://github.com/$GithubOrg/$repoName" `
            --branch main `
            --yml-path $tempFile.FullName `
            --service-connection "GitHub-AIWhisperers" `
            --skip-first-run
            
        Write-Host "  ✓ Created pipeline: $repoName-Mirror" -ForegroundColor Gray
    } catch {
        Write-Host "  ⚠️ Pipeline creation failed for $repoName" -ForegroundColor Yellow
    }
    
    Remove-Item $tempFile.FullName
}

# Step 5: Import work items
Write-Host "📋 Importing work items..." -ForegroundColor Yellow
$workItemsPath = "C:\Users\Gestalt\Desktop\repos\Company-Information\azure-work-items"

if (Test-Path $workItemsPath) {
    & "$workItemsPath\_scripts\import-to-azure.js"
    Write-Host "  ✓ Work items imported" -ForegroundColor Gray
}

# Step 6: Configure boards
Write-Host "📊 Configuring boards..." -ForegroundColor Yellow

# Create areas for each project
$areas = @(
    "Business-Setup",
    "Company-Website", 
    "WPG-Amenities",
    "AI-Investment",
    "Comment-Analyzer",
    "Internal-Projects"
)

foreach ($area in $areas) {
    az boards area project create --name $area --path "\AI-Whisperers\$area"
    Write-Host "  ✓ Created area: $area" -ForegroundColor Gray
}

# Create iterations (sprints)
$startDate = Get-Date
for ($i = 1; $i -le 6; $i++) {
    $sprintStart = $startDate.AddDays(($i - 1) * 14)
    $sprintEnd = $sprintStart.AddDays(13)
    
    az boards iteration project create `
        --name "Sprint $i" `
        --path "\AI-Whisperers\Sprint $i" `
        --start-date $sprintStart.ToString("yyyy-MM-dd") `
        --finish-date $sprintEnd.ToString("yyyy-MM-dd")
        
    Write-Host "  ✓ Created Sprint $i" -ForegroundColor Gray
}

Write-Host "✅ Azure DevOps GitHub Mirror Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Visit https://dev.azure.com/$AzureOrg/$AzureProject" -ForegroundColor White
Write-Host "2. Review imported work items in Boards" -ForegroundColor White
Write-Host "3. Run pipelines to sync repositories" -ForegroundColor White
Write-Host "4. Configure branch policies in Azure Repos" -ForegroundColor White
```

### Continuous Sync Monitor

Save as `monitor-sync.ps1`:

```powershell
# Monitor and ensure GitHub-Azure sync is working

param(
    [int]$CheckIntervalMinutes = 5,
    [switch]$Continuous
)

function Test-RepoSync {
    param([string]$RepoName)
    
    $githubCommit = git ls-remote https://github.com/aiwhispererwvdp/$RepoName HEAD | Select-Object -First 1
    $azureCommit = git ls-remote https://dev.azure.com/aiwhisperers/AI-Whisperers/_git/$RepoName HEAD | Select-Object -First 1
    
    if ($githubCommit -eq $azureCommit) {
        Write-Host "✓ $RepoName is in sync" -ForegroundColor Green
        return $true
    } else {
        Write-Host "⚠️ $RepoName is OUT OF SYNC" -ForegroundColor Yellow
        Write-Host "  GitHub: $($githubCommit.Substring(0,8))" -ForegroundColor Gray
        Write-Host "  Azure:  $($azureCommit.Substring(0,8))" -ForegroundColor Gray
        
        # Trigger sync pipeline
        az pipelines run --name "$RepoName-Mirror" --org https://dev.azure.com/aiwhisperers --project AI-Whisperers
        return $false
    }
}

do {
    Clear-Host
    Write-Host "🔄 GitHub-Azure Sync Status Check" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host ""
    
    $repos = @(
        "Company-Information",
        "Company-website",
        "WPG-Amenities",
        "Investment-platform",
        "Comment-Analizer"
    )
    
    $outOfSync = 0
    foreach ($repo in $repos) {
        if (-not (Test-RepoSync -RepoName $repo)) {
            $outOfSync++
        }
    }
    
    Write-Host ""
    if ($outOfSync -eq 0) {
        Write-Host "✅ All repositories are synchronized!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ $outOfSync repositories need sync" -ForegroundColor Yellow
        Write-Host "   Sync pipelines have been triggered" -ForegroundColor Gray
    }
    
    if ($Continuous) {
        Write-Host ""
        Write-Host "Next check in $CheckIntervalMinutes minutes... (Press Ctrl+C to stop)" -ForegroundColor Gray
        Start-Sleep -Seconds ($CheckIntervalMinutes * 60)
    }
} while ($Continuous)
```

---

## 📊 Monitoring & Maintenance

### Dashboard Configuration

Create a dashboard to monitor sync status:

1. Go to Azure DevOps → Overview → Dashboards
2. Create new dashboard: "GitHub Sync Monitor"
3. Add widgets:
   - **Pipeline Status**: Shows sync pipeline health
   - **Pull Request**: GitHub PRs linked to work items
   - **Query Results**: Items without GitHub links
   - **Build History**: Recent sync operations

### Webhook Configuration

Setup webhooks for real-time sync:

```bash
# Create webhook in GitHub
curl -X POST https://api.github.com/repos/aiwhispererwvdp/Company-Information/hooks \
  -H "Authorization: token $GITHUB_PAT" \
  -H "Accept: application/vnd.github.v3+json" \
  -d '{
    "name": "web",
    "active": true,
    "events": ["push", "pull_request", "issues"],
    "config": {
      "url": "https://dev.azure.com/aiwhisperers/_apis/public/hooks/externalEvents",
      "content_type": "json",
      "secret": "your-webhook-secret"
    }
  }'
```

### Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| Sync pipeline fails | Check PAT expiration, regenerate if needed |
| Work items not linking | Ensure AB# syntax in commits, verify GitHub app |
| Duplicate repos | Use `--force` flag in git push |
| Permission denied | Verify service connection permissions |
| Out of sync branches | Run full sync: `git push azure --all --force` |

---

## 🎯 Best Practices

1. **Branch Protection**: Mirror GitHub branch protection rules in Azure Repos
2. **Commit Messages**: Always use AB#xxx for work item linking
3. **Pipeline Triggers**: Use path filters to avoid unnecessary syncs
4. **Security**: Store PATs in Azure Key Vault
5. **Monitoring**: Set up alerts for failed sync pipelines

---

## 🚀 Quick Start Commands

```bash
# One-line setup (requires PATs as env variables)
curl -O https://raw.githubusercontent.com/aiwhispererwvdp/Company-Information/main/setup-azure-github-mirror.ps1 && powershell .\setup-azure-github-mirror.ps1

# Manual verification
az repos list --project AI-Whisperers
az pipelines list --project AI-Whisperers

# Force sync all repos
az pipelines run --name "*-Mirror" --project AI-Whisperers

# Check sync status
powershell .\monitor-sync.ps1 -Continuous
```

---

**This setup ensures your GitHub repositories are automatically mirrored to Azure DevOps with work items properly tracked on boards!**