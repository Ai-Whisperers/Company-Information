#!/usr/bin/env node

/**
 * Load Environment Variables into MCP Configuration
 * This script reads from .env and updates mcp-config.json
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// MCP configuration template with environment variable mappings
const mcpConfig = {
  mcpServers: {
    'azure-devops': {
      command: 'npx',
      args: ['-y', '@azure-devops/mcp'],
      env: {
        AZURE_DEVOPS_PAT: process.env.AZURE_DEVOPS_PAT || 'REPLACE_WITH_YOUR_PAT_TOKEN',
        AZURE_DEVOPS_ORG: process.env.AZURE_DEVOPS_ORG || 'aiwhisperer',
        AZURE_DEVOPS_PROJECT: process.env.AZURE_DEVOPS_PROJECT || 'Business Setup',
        AZURE_DEVOPS_BASE_URL: process.env.AZURE_DEVOPS_BASE_URL || 'https://dev.azure.com/aiwhisperer'
      }
    },
    'github': {
      command: 'node',
      args: [path.join('mcp-servers', 'node_modules', '@modelcontextprotocol', 'server-github', 'dist', 'index.js')],
      env: {
        GITHUB_TOKEN: process.env.GITHUB_TOKEN || 'REPLACE_WITH_YOUR_GITHUB_TOKEN'
      }
    },
    'postgres': {
      command: 'node',
      args: [path.join('mcp-servers', 'node_modules', '@modelcontextprotocol', 'server-postgres', 'dist', 'index.js')],
      env: {
        POSTGRES_CONNECTION_STRING: process.env.POSTGRES_CONNECTION_STRING || 'REPLACE_WITH_YOUR_CONNECTION_STRING'
      }
    },
    'filesystem': {
      command: 'node',
      args: [path.join('mcp-servers', 'node_modules', '@modelcontextprotocol', 'server-filesystem', 'dist', 'index.js')],
      env: {
        FILESYSTEM_ROOT: process.env.FILESYSTEM_ROOT || 'C:\\Users\\kyrian\\Documents\\AI-Whisperers',
        FILESYSTEM_ALLOW_WRITE: process.env.FILESYSTEM_ALLOW_WRITE || 'true'
      }
    }
  }
};

// Check which services are configured
function checkConfiguration() {
  console.log(`\n${colors.cyan}Checking MCP Configuration Status:${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
  
  let configured = 0;
  let notConfigured = 0;
  
  for (const [service, config] of Object.entries(mcpConfig.mcpServers)) {
    console.log(`\n${colors.yellow}${service.toUpperCase()}:${colors.reset}`);
    
    for (const [key, value] of Object.entries(config.env)) {
      if (value && !value.includes('REPLACE_WITH')) {
        console.log(`  ${colors.green}✓${colors.reset} ${key}: Configured`);
        configured++;
      } else {
        console.log(`  ${colors.red}✗${colors.reset} ${key}: Not configured`);
        notConfigured++;
      }
    }
  }
  
  console.log(`\n${colors.blue}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.green}Configured: ${configured}${colors.reset}`);
  console.log(`${colors.red}Not Configured: ${notConfigured}${colors.reset}`);
  
  return { configured, notConfigured };
}

// Save configuration
function saveConfiguration() {
  const configPath = path.join(__dirname, '..', 'mcp-config.json');
  
  try {
    fs.writeFileSync(configPath, JSON.stringify(mcpConfig, null, 2));
    console.log(`\n${colors.green}✓ Configuration saved to mcp-config.json${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Failed to save configuration: ${error.message}${colors.reset}`);
    return false;
  }
}

// Main execution
function main() {
  console.log(`${colors.cyan}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.cyan}MCP Configuration Loader${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(50)}${colors.reset}`);
  
  // Check if .env file exists
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error(`${colors.red}✗ .env file not found!${colors.reset}`);
    console.log(`${colors.yellow}Please create .env file with your configuration.${colors.reset}`);
    process.exit(1);
  }
  
  // Check configuration status
  const { configured, notConfigured } = checkConfiguration();
  
  // Save configuration
  if (saveConfiguration()) {
    console.log(`\n${colors.cyan}Next Steps:${colors.reset}`);
    
    if (notConfigured > 0) {
      console.log(`1. Fill in missing values in .env file`);
      console.log(`2. Run this script again: ${colors.yellow}npm run load-env${colors.reset}`);
      console.log(`3. Test connections: ${colors.yellow}npm run test-mcp${colors.reset}`);
    } else {
      console.log(`1. All services are configured!`);
      console.log(`2. Test connections: ${colors.yellow}npm run test-mcp${colors.reset}`);
      console.log(`3. Start using MCP servers with Claude`);
    }
  }
}

// Run the script
main();