# Azure DevOps Integration Setup

## Required GitHub Secrets

You need to configure these secrets in your GitHub repository:

1. Go to: https://github.com/Ai-Whisperers/Company-Information/settings/secrets/actions
2. Add the following secret:

### AZURE_DEVOPS_PAT
Create a Personal Access Token in Azure DevOps:
1. Go to https://dev.azure.com/aiwhisperers/_usersSettings/tokens
2. Click "New Token"
3. Configure:
   - Name: `GitHub-Sync`
   - Organization: `aiwhisperers`
   - Expiration: 90 days (or custom)
   - Scopes:
     - ✅ Code: Read & Write
     - ✅ Work Items: Read, Write & Manage
     - ✅ Wiki: Read & Write
     - ✅ Build: Read & Execute
4. Copy the token and add it as `AZURE_DEVOPS_PAT` in GitHub Secrets

## What Gets Synced

The GitHub Action (`azure-devops-sync.yml`) will:
- ✅ Mirror all code to Azure Repos
- ✅ Sync documentation to Azure Wiki
- ✅ Link commits to work items (use `AB#123` in commit messages)
- ✅ Push all branches and tags

## Testing the Integration

1. Make a test commit:
   ```bash
   git commit -m "test: Azure DevOps sync AB#1"
   git push
   ```

2. Check Azure DevOps:
   - Repository: https://dev.azure.com/aiwhisperers/AI-Whisperers/_git/Company-Information
   - Wiki: https://dev.azure.com/aiwhisperers/AI-Whisperers/_wiki
   - Work Item #1 should show the linked commit

## Manual Trigger

You can manually trigger the sync:
1. Go to Actions tab
2. Select "Sync to Azure DevOps"
3. Click "Run workflow"