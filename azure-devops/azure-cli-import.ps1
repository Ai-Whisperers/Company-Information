# Azure CLI Backlog Import Script
# This script will help you import the backlog items to Azure DevOps

# Use dynamic Azure CLI path detection
$azPath = (Get-Command az -ErrorAction SilentlyContinue).Source
if (-not $azPath) {
    # Fallback paths for common installations
    $fallbackPaths = @(
        "${env:ProgramFiles}\Microsoft SDKs\Azure\CLI2\wbin\az.cmd",
        "${env:ProgramFiles(x86)}\Microsoft SDKs\Azure\CLI2\wbin\az.cmd",
        "az"  # System PATH
    )
    
    foreach ($path in $fallbackPaths) {
        if (Test-Path $path -ErrorAction SilentlyContinue) {
            $azPath = $path
            break
        }
    }
    
    if (-not $azPath) {
        Write-Error "Azure CLI not found. Please install Azure CLI from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    }
}
$org = "https://dev.azure.com/aiwhisperer"
$project = "Business Setup"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " AZURE DEVOPS BACKLOG IMPORT" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if already logged in
Write-Host "Checking Azure DevOps authentication..." -ForegroundColor Yellow
$authCheck = & $azPath devops project list --organization $org 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "You need to authenticate with Azure DevOps." -ForegroundColor Yellow
    Write-Host "Please follow these steps:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Go to: https://dev.azure.com/aiwhisperer/_usersSettings/tokens" -ForegroundColor White
    Write-Host "2. Click 'New Token'" -ForegroundColor White
    Write-Host "3. Name: 'AI-Whisperers CLI Import'" -ForegroundColor White
    Write-Host "4. Expiration: Select 90 days or custom" -ForegroundColor White
    Write-Host "5. Scopes: Select 'Full access' for simplicity" -ForegroundColor White
    Write-Host "6. Click 'Create' and copy the token" -ForegroundColor White
    Write-Host ""
    
    $pat = Read-Host "Paste your new PAT token here"
    
    Write-Host ""
    Write-Host "Authenticating..." -ForegroundColor Yellow
    $pat | & $azPath devops login --organization $org
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Authentication failed. Please check your PAT token." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Authentication successful!" -ForegroundColor Green
Write-Host ""

# Set defaults
Write-Host "Setting default organization and project..." -ForegroundColor Yellow
& $azPath devops configure --defaults organization=$org project="$project"

# Create work items
Write-Host ""
Write-Host "Creating backlog items..." -ForegroundColor Cyan
Write-Host ""

$items = @{
    epics = @(
        @{
            title = "Digital Foundation Setup"
            description = "Establish core digital infrastructure for AI-Whisperers"
            priority = 1
        },
        @{
            title = "Business Automation Platform"
            description = "Implement AI-powered business automation systems"
            priority = 1
        },
        @{
            title = "Client Acquisition System"
            description = "Build systematic approach to acquiring and managing clients"
            priority = 2
        },
        @{
            title = "Legal and Financial Infrastructure"
            description = "Establish business entity and financial systems"
            priority = 2
        },
        @{
            title = "Professional Assets and Branding"
            description = "Create professional brand identity and assets"
            priority = 3
        }
    )
    features = @(
        @{
            epic = "Digital Foundation Setup"
            title = "Domain and Email Infrastructure"
            description = "Set up professional domain and email system"
        },
        @{
            epic = "Digital Foundation Setup"
            title = "Website Deployment"
            description = "Deploy and configure company website"
        },
        @{
            epic = "Business Automation Platform"
            title = "Scheduling and Calendar Automation"
            description = "Automated scheduling system for client meetings"
        },
        @{
            epic = "Business Automation Platform"
            title = "Workflow Automation"
            description = "Build automated business workflows"
        },
        @{
            epic = "Client Acquisition System"
            title = "CRM Implementation"
            description = "Customer relationship management system"
        }
    )
}

$createdItems = @()

# Create Epics
foreach ($epic in $items.epics) {
    Write-Host "Creating Epic: $($epic.title)" -ForegroundColor Magenta
    
    $result = & $azPath boards work-item create `
        --type "Epic" `
        --title $epic.title `
        --description $epic.description `
        --fields "Microsoft.VSTS.Common.Priority=$($epic.priority)" `
        --output json 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        $workItem = $result | ConvertFrom-Json
        Write-Host "  ✅ Created with ID: $($workItem.id)" -ForegroundColor Green
        $createdItems += @{ Type = "Epic"; Title = $epic.title; Id = $workItem.id }
    } else {
        Write-Host "  ❌ Failed to create" -ForegroundColor Red
    }
}

# Create sample Features
Write-Host ""
foreach ($feature in $items.features[0..2]) {  # Create first 3 features as examples
    Write-Host "Creating Feature: $($feature.title)" -ForegroundColor Cyan
    
    $result = & $azPath boards work-item create `
        --type "Feature" `
        --title $feature.title `
        --description $feature.description `
        --output json 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        $workItem = $result | ConvertFrom-Json
        Write-Host "  ✅ Created with ID: $($workItem.id)" -ForegroundColor Green
        $createdItems += @{ Type = "Feature"; Title = $feature.title; Id = $workItem.id }
    } else {
        Write-Host "  ❌ Failed to create" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host " IMPORT SUMMARY" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Created $($createdItems.Count) items:" -ForegroundColor Cyan
Write-Host "  Epics: $(($createdItems | Where-Object { $_.Type -eq 'Epic' }).Count)"
Write-Host "  Features: $(($createdItems | Where-Object { $_.Type -eq 'Feature' }).Count)"
Write-Host ""
Write-Host "📋 View your board: https://dev.azure.com/aiwhisperer/Business%20Setup/_boards/board" -ForegroundColor Yellow
Write-Host "📋 View backlog: https://dev.azure.com/aiwhisperer/Business%20Setup/_backlogs/backlog" -ForegroundColor Yellow
Write-Host ""
Write-Host "For the complete import (48 items), use the CSV import:" -ForegroundColor Cyan
Write-Host "  1. Go to the backlog URL above"
Write-Host "  2. Click 'Import Work Items'"
Write-Host "  3. Upload: azure-devops\backlog-import.csv"
Write-Host ""