# Dual Platform Setup: GitHub + Azure DevOps

This repository is configured to work equally well with both GitHub and Azure DevOps, providing the best of both platforms.

## 🔄 How It Works

```
GitHub (Code & Actions)  ←→  Azure DevOps (Boards & Pipelines)
         ↓                            ↓
    GitHub Actions              Azure Pipelines
         ↓                            ↓
    Runs on Push               Reads from GitHub
         ↓                            ↓
    Syncs to Azure             Processes & Reports
```

## 📋 Setup Instructions

### Step 1: GitHub Setup
1. Add secret `AZURE_DEVOPS_PAT` in GitHub repository settings
2. GitHub Actions will automatically sync to Azure DevOps

### Step 2: Azure DevOps Setup
1. Create a new pipeline in Azure DevOps
2. Choose "GitHub" as source
3. Select this repository
4. Choose "Existing Azure Pipelines YAML file"
5. Select `/azure-pipelines.yml`
6. Create variable group "GitHub-Sync" with:
   - `GITHUB_PAT`: Your GitHub Personal Access Token

## 🚀 Features by Platform

### GitHub Provides:
- Primary code repository
- Pull requests and code reviews
- GitHub Actions for CI/CD
- Dependabot for dependency updates
- Issue tracking (optional)

### Azure DevOps Provides:
- Work item tracking and boards
- Sprint planning and backlogs
- Azure Pipelines for additional CI/CD
- Test plans and reporting
- Wiki documentation

## 🔧 Configuration Files

| File | Purpose | Platform |
|------|---------|----------|
| `.github/workflows/azure-devops-sync.yml` | Syncs GitHub → Azure | GitHub Actions |
| `azure-pipelines.yml` | Syncs GitHub ← Azure | Azure Pipelines |
| `.github/dependabot.yml` | Dependency updates | GitHub |
| `CLAUDE.md` | AI assistant config | Both |

## 🏷️ Work Item Linking

Use `AB#123` in commit messages to link to Azure Boards work items:
```bash
git commit -m "feat: Add new feature AB#123"
```

Both platforms will recognize and link this commit to work item #123.

## 🔍 Monitoring

### GitHub:
- Check Actions tab for sync status
- Review pull requests and issues

### Azure DevOps:
- Monitor Pipelines for build status
- Track work items in Boards
- View wiki for documentation

## ⚠️ Avoiding Circular Triggers

The configuration includes safeguards:
- GitHub Actions ignores `azure-pipelines.yml` changes
- Azure Pipelines ignores `.github/*` changes
- Both use different git user identities for commits

## 📊 Best Practices

1. **Primary Development**: Use GitHub for code changes
2. **Project Management**: Use Azure Boards for work tracking
3. **Documentation**: Automatically synced to both platforms
4. **CI/CD**: Can use either or both platforms
5. **Commits**: Always include work item references when applicable

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Sync not working | Check PAT tokens haven't expired |
| Circular triggers | Verify path exclusions are configured |
| Work items not linking | Use correct `AB#` syntax |
| Pipeline fails | Check variable groups are configured |

## 🔐 Security Notes

- Store all tokens as secrets/variables, never in code
- Use minimal required permissions for PATs
- Rotate tokens regularly (every 90 days)
- Monitor access logs in both platforms