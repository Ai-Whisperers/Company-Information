# AI-Whisperers Organization Setup Script for Windows
# This script initializes all repositories and creates the GitHub organization structure

$ErrorActionPreference = "Stop"

# Configuration
$GITHUB_ORG = "Ai-Whisperers"
$REPOS = @("core-services", "web-platform", "ml-models", "infrastructure", "documentation")

# Colors for output
function Write-Success {
    param($Message)
    Write-Host "[✓] " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Error-Message {
    param($Message)
    Write-Host "[✗] " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

function Write-Warning-Message {
    param($Message)
    Write-Host "[!] " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
}

# Header
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   AI-Whisperers Organization Setup Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..."

# Check if git is installed
try {
    $null = git --version
    Write-Success "Git is installed"
    $GIT_INSTALLED = $true
} catch {
    Write-Error-Message "Git is not installed. Please install git first."
    Write-Host "Download from: https://git-scm.com/download/win"
    exit 1
}

# Check if GitHub CLI is installed
try {
    $null = gh --version
    Write-Success "GitHub CLI is installed"
    $GITHUB_CLI = $true
} catch {
    Write-Warning-Message "GitHub CLI is not installed. Some features will be limited."
    Write-Host "Install with: winget install GitHub.cli or visit https://cli.github.com"
    $GITHUB_CLI = $false
}

# Check if logged into GitHub
if ($GITHUB_CLI) {
    try {
        $null = gh auth status 2>$null
        Write-Success "Authenticated with GitHub"
    } catch {
        Write-Warning-Message "Not logged into GitHub. Running: gh auth login"
        gh auth login
    }
}

Write-Host ""
Write-Host "Setting up repositories..."
Write-Host ""

# Create repositories directory
if (!(Test-Path -Path "repositories")) {
    New-Item -ItemType Directory -Path "repositories" | Out-Null
    Write-Success "Created repositories directory"
}

# Function to create and push repository
function Create-Repository {
    param(
        [string]$RepoName
    )
    
    $RepoPath = "repositories\$RepoName"
    
    Write-Host "Setting up $RepoName..."
    
    # Check if directory exists
    if (Test-Path -Path $RepoPath) {
        Write-Success "$RepoName directory already exists"
    } else {
        Write-Error-Message "$RepoName directory not found"
        return
    }
    
    # Initialize git if not already initialized
    if (!(Test-Path -Path "$RepoPath\.git")) {
        Push-Location $RepoPath
        git init
        git add .
        git commit -m "Initial commit: $RepoName setup"
        Pop-Location
        Write-Success "$RepoName git repository initialized"
    } else {
        Write-Success "$RepoName already has git initialized"
    }
    
    # Create GitHub repository if GitHub CLI is available
    if ($GITHUB_CLI) {
        try {
            $null = gh repo view "$GITHUB_ORG/$RepoName" 2>$null
            Write-Success "$RepoName already exists on GitHub"
        } catch {
            Write-Warning-Message "Creating $RepoName on GitHub..."
            gh repo create "$GITHUB_ORG/$RepoName" --public --source="$RepoPath" --push
            Write-Success "$RepoName created and pushed to GitHub"
        }
    } else {
        Write-Warning-Message "Please manually create $RepoName on GitHub at:"
        Write-Host "         https://github.com/organizations/$GITHUB_ORG/repositories/new"
        Write-Host "         Then run:"
        Write-Host "         cd $RepoPath"
        Write-Host "         git remote add origin https://github.com/$GITHUB_ORG/$RepoName.git"
        Write-Host "         git push -u origin main"
        Write-Host ""
    }
}

# Process each repository
foreach ($repo in $REPOS) {
    Create-Repository -RepoName $repo
    Write-Host ""
}

# Initialize main organization repository
Write-Host "Setting up main organization repository..."

if (!(Test-Path -Path ".git")) {
    git init
    git add .
    git commit -m "Initial organization structure setup"
    Write-Success "Main repository initialized"
} else {
    Write-Success "Main repository already initialized"
}

if ($GITHUB_CLI) {
    try {
        $null = gh repo view "$GITHUB_ORG/.github" 2>$null
        Write-Success "Organization .github repository already exists"
    } catch {
        Write-Warning-Message "Creating organization .github repository..."
        gh repo create "$GITHUB_ORG/.github" --public --source="." --push
        Write-Success "Organization repository created and pushed"
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "            Setup Complete!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Visit https://github.com/$GITHUB_ORG to view your organization"
Write-Host "2. Configure team members and permissions"
Write-Host "3. Set up GitHub Projects for task tracking"
Write-Host "4. Configure branch protection rules"
Write-Host "5. Enable GitHub Actions for CI/CD"
Write-Host ""

# Create setup summary
$SetupSummary = @"
# AI-Whisperers Setup Summary

## Repositories Created

- **core-services** - Backend services and APIs
- **web-platform** - Frontend applications
- **ml-models** - Machine learning models
- **infrastructure** - Infrastructure as code
- **documentation** - Technical documentation

## GitHub Organization

Organization URL: https://github.com/$GITHUB_ORG

## Local Structure

``````
AI-Whisperers/
├── .github/           # Organization-wide templates
├── repositories/      # All repository code
│   ├── core-services/
│   ├── web-platform/
│   ├── ml-models/
│   ├── infrastructure/
│   └── documentation/
├── README.md
├── PROJECT_STRUCTURE.md
└── PROGRESS_TRACKING.md
``````

## Quick Commands (PowerShell)

### Clone all repositories
``````powershell
cd repositories
@("core-services", "web-platform", "ml-models", "infrastructure", "documentation") | ForEach-Object {
    git clone "https://github.com/$GITHUB_ORG/`$_.git"
}
``````

### Update all repositories
``````powershell
cd repositories
Get-ChildItem -Directory | ForEach-Object {
    Write-Host "Updating `$($_.Name)..."
    Push-Location `$_.FullName
    git pull
    Pop-Location
}
``````

## Development Workflow

1. Create feature branch
2. Make changes
3. Push to GitHub
4. Create pull request
5. Get review
6. Merge to main

## Created: $(Get-Date)
"@

$SetupSummary | Out-File -FilePath "SETUP_SUMMARY.md" -Encoding UTF8

Write-Success "Setup summary saved to SETUP_SUMMARY.md"

Write-Host ""
Write-Host "Thank you for using AI-Whisperers setup script!" -ForegroundColor Green