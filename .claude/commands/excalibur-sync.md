# Excalibur Sync Command

## Purpose
Synchronize todos across all AI-Whisperers repositories using live GitHub data.

## Usage
```bash
claude pull excalibur
```

## Script Execution
```powershell
powershell.exe -ExecutionPolicy Bypass -File ./scripts/todos/excalibur-command.ps1 -DryRun -Verbose
```

## What it does
- Fetches live data from GitHub API
- Updates data/todos/*.md files
- Syncs TODO.md to each repository
- Generates execution summary

## Requirements  
- GitHub CLI authenticated
- Write access to organization repositories

## Safety
- Always runs with -DryRun first
- Creates backups before changes
- Requires explicit approval for writes