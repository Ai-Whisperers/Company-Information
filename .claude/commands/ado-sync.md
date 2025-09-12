# Azure DevOps Sync

## Purpose
Synchronize GitHub issues/PRs with Azure DevOps work items.

## Usage
```bash
/ado:sync-iteration [--apply]
```

## Script Execution
```powershell
powershell.exe -ExecutionPolicy Bypass -File ./scripts/azure-devops-sync.ps1 -DryRun -Verbose
```

## Safety
- DryRun by default
- Requires explicit --apply flag
- Backs up existing work items