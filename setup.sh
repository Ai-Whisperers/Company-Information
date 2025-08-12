#!/bin/bash

# AI-Whisperers Organization Setup Script
# This script initializes all repositories and creates the GitHub organization structure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
GITHUB_ORG="Ai-Whisperers"
REPOS=("core-services" "web-platform" "ml-models" "infrastructure" "documentation")

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Header
echo "================================================"
echo "   AI-Whisperers Organization Setup Script"
echo "================================================"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install git first."
    exit 1
fi
print_status "Git is installed"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    print_warning "GitHub CLI is not installed. Some features will be limited."
    print_warning "Install with: brew install gh (macOS) or visit https://cli.github.com"
    GITHUB_CLI=false
else
    print_status "GitHub CLI is installed"
    GITHUB_CLI=true
fi

# Check if logged into GitHub
if [ "$GITHUB_CLI" = true ]; then
    if ! gh auth status &> /dev/null; then
        print_warning "Not logged into GitHub. Running: gh auth login"
        gh auth login
    else
        print_status "Authenticated with GitHub"
    fi
fi

echo ""
echo "Setting up repositories..."
echo ""

# Create repositories directory
if [ ! -d "repositories" ]; then
    mkdir -p repositories
    print_status "Created repositories directory"
fi

# Function to create and push repository
create_repository() {
    local repo_name=$1
    local repo_path="repositories/$repo_name"
    
    echo "Setting up $repo_name..."
    
    # Check if directory exists
    if [ -d "$repo_path" ]; then
        print_status "$repo_name directory already exists"
    else
        print_error "$repo_name directory not found"
        return 1
    fi
    
    # Initialize git if not already initialized
    if [ ! -d "$repo_path/.git" ]; then
        cd "$repo_path"
        git init
        git add .
        git commit -m "Initial commit: $repo_name setup"
        cd ../..
        print_status "$repo_name git repository initialized"
    else
        print_status "$repo_name already has git initialized"
    fi
    
    # Create GitHub repository if GitHub CLI is available
    if [ "$GITHUB_CLI" = true ]; then
        if gh repo view "$GITHUB_ORG/$repo_name" &> /dev/null; then
            print_status "$repo_name already exists on GitHub"
        else
            print_warning "Creating $repo_name on GitHub..."
            gh repo create "$GITHUB_ORG/$repo_name" --public --source="$repo_path" --push
            print_status "$repo_name created and pushed to GitHub"
        fi
    else
        print_warning "Please manually create $repo_name on GitHub at:"
        echo "         https://github.com/organizations/$GITHUB_ORG/repositories/new"
        echo "         Then run:"
        echo "         cd $repo_path"
        echo "         git remote add origin https://github.com/$GITHUB_ORG/$repo_name.git"
        echo "         git push -u origin main"
        echo ""
    fi
}

# Process each repository
for repo in "${REPOS[@]}"; do
    create_repository "$repo"
    echo ""
done

# Initialize main organization repository
echo "Setting up main organization repository..."

if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "Initial organization structure setup"
    print_status "Main repository initialized"
else
    print_status "Main repository already initialized"
fi

if [ "$GITHUB_CLI" = true ]; then
    if gh repo view "$GITHUB_ORG/.github" &> /dev/null; then
        print_status "Organization .github repository already exists"
    else
        print_warning "Creating organization .github repository..."
        gh repo create "$GITHUB_ORG/.github" --public --source="." --push
        print_status "Organization repository created and pushed"
    fi
fi

echo ""
echo "================================================"
echo "            Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Visit https://github.com/$GITHUB_ORG to view your organization"
echo "2. Configure team members and permissions"
echo "3. Set up GitHub Projects for task tracking"
echo "4. Configure branch protection rules"
echo "5. Enable GitHub Actions for CI/CD"
echo ""

# Create setup summary
cat > SETUP_SUMMARY.md << EOF
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

\`\`\`
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
\`\`\`

## Quick Commands

### Clone all repositories
\`\`\`bash
cd repositories
for repo in core-services web-platform ml-models infrastructure documentation; do
    git clone https://github.com/$GITHUB_ORG/\$repo.git
done
\`\`\`

### Update all repositories
\`\`\`bash
cd repositories
for dir in */; do
    echo "Updating \$dir..."
    cd "\$dir"
    git pull
    cd ..
done
\`\`\`

## Development Workflow

1. Create feature branch
2. Make changes
3. Push to GitHub
4. Create pull request
5. Get review
6. Merge to main

## Created: $(date)
EOF

print_status "Setup summary saved to SETUP_SUMMARY.md"

echo ""
echo "Thank you for using AI-Whisperers setup script!"