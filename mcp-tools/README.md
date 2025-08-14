# MCP Tools for Azure DevOps

This directory contains Model Context Protocol (MCP) tools for Azure DevOps automation.

## Available Tools

### azure-devops-automation.js
Main automation server providing tools for:
- Syncing work items
- Updating sprint progress
- Generating status reports
- Bulk updating areas
- Scheduling automation
- Checking project health

### daily-automation.js
Daily automation script that runs:
- Work item state synchronization
- Old item cleanup (Done → Closed after 30 days)
- Daily metrics generation
- Sprint health monitoring

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Azure DevOps:
- Update `azure-devops/azure-devops-config.json` with your PAT token

3. Run automation:
```bash
node daily-automation.js
```

## MCP Server

To use as MCP server in VS Code:
```bash
node azure-devops-automation.js
```