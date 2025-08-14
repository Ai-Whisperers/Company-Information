#!/usr/bin/env node

/**
 * MCP Server Setup Script
 * Configures and validates MCP servers for AI-Whisperers
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Configuration templates
const configTemplates = {
  github: {
    name: 'GitHub',
    envVars: {
      GITHUB_TOKEN: {
        description: 'GitHub Personal Access Token',
        help: 'Create at: https://github.com/settings/tokens',
        required: true,
        pattern: /^ghp_[a-zA-Z0-9]{36}$/,
        example: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      }
    }
  },
  postgres: {
    name: 'PostgreSQL/Supabase',
    envVars: {
      POSTGRES_CONNECTION_STRING: {
        description: 'PostgreSQL connection string',
        help: 'Format: postgresql://user:password@host:port/database',
        required: true,
        pattern: /^postgresql:\/\/.+/,
        example: 'postgresql://user:pass@localhost:5432/db'
      }
    }
  },
  notion: {
    name: 'Notion',
    envVars: {
      NOTION_API_KEY: {
        description: 'Notion Integration Secret',
        help: 'Create at: https://www.notion.so/my-integrations',
        required: true,
        pattern: /^secret_[a-zA-Z0-9]{43}$/,
        example: 'secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      }
    }
  },
  azure: {
    name: 'Azure DevOps',
    envVars: {
      AZURE_DEVOPS_PAT: {
        description: 'Azure DevOps Personal Access Token',
        help: 'Create at: https://dev.azure.com/aiwhisperer/_usersSettings/tokens',
        required: true,
        pattern: /^[a-zA-Z0-9]{52}$/,
        example: '52-character alphanumeric token'
      }
    }
  }
};

// Prompt for input
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Validate token format
function validateToken(value, pattern) {
  if (!pattern) return true;
  return pattern.test(value);
}

// Setup individual service
async function setupService(service, config) {
  console.log(`\n${colors.cyan}Setting up ${service.name}${colors.reset}`);
  console.log(`${colors.blue}${'─'.repeat(40)}${colors.reset}`);
  
  const envUpdates = {};
  
  for (const [key, settings] of Object.entries(service.envVars)) {
    console.log(`\n${colors.yellow}${settings.description}${colors.reset}`);
    console.log(`${colors.blue}${settings.help}${colors.reset}`);
    
    if (settings.example) {
      console.log(`Example: ${colors.cyan}${settings.example}${colors.reset}`);
    }
    
    const currentValue = config[key];
    if (currentValue && !currentValue.includes('your_')) {
      console.log(`Current: ${colors.green}[Already configured]${colors.reset}`);
      const update = await question('Update? (y/N): ');
      if (update.toLowerCase() !== 'y') {
        envUpdates[key] = currentValue;
        continue;
      }
    }
    
    let value;
    let valid = false;
    
    while (!valid) {
      value = await question(`Enter ${key}: `);
      
      if (!value && settings.required) {
        console.log(`${colors.red}This field is required${colors.reset}`);
        continue;
      }
      
      if (value && !validateToken(value, settings.pattern)) {
        console.log(`${colors.red}Invalid format. Please check and try again.${colors.reset}`);
        continue;
      }
      
      valid = true;
    }
    
    envUpdates[key] = value || currentValue || '';
  }
  
  return envUpdates;
}

// Main setup function
async function setup() {
  console.log(`${colors.magenta}${'═'.repeat(50)}${colors.reset}`);
  console.log(`${colors.magenta}AI-Whisperers MCP Server Setup${colors.reset}`);
  console.log(`${colors.magenta}${'═'.repeat(50)}${colors.reset}`);
  
  // Load existing config
  const envPath = path.join(__dirname, '..', '.env.mcp');
  let currentConfig = {};
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          currentConfig[key.trim()] = value.trim();
        }
      }
    });
    console.log(`\n${colors.green}Found existing configuration${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}No existing configuration found${colors.reset}`);
  }
  
  // Select services to configure
  console.log('\nWhich services would you like to configure?');
  console.log('1. GitHub');
  console.log('2. PostgreSQL/Supabase');
  console.log('3. Notion');
  console.log('4. Azure DevOps');
  console.log('5. All services');
  console.log('0. Exit');
  
  const choice = await question('\nEnter your choice (0-5): ');
  
  let servicesToSetup = [];
  switch (choice) {
    case '1':
      servicesToSetup = ['github'];
      break;
    case '2':
      servicesToSetup = ['postgres'];
      break;
    case '3':
      servicesToSetup = ['notion'];
      break;
    case '4':
      servicesToSetup = ['azure'];
      break;
    case '5':
      servicesToSetup = Object.keys(configTemplates);
      break;
    case '0':
      console.log('Setup cancelled');
      rl.close();
      return;
    default:
      console.log(`${colors.red}Invalid choice${colors.reset}`);
      rl.close();
      return;
  }
  
  // Setup selected services
  const updates = { ...currentConfig };
  
  for (const serviceKey of servicesToSetup) {
    const service = configTemplates[serviceKey];
    const serviceUpdates = await setupService(service, currentConfig);
    Object.assign(updates, serviceUpdates);
  }
  
  // Add static configurations
  updates.FILESYSTEM_ROOT = updates.FILESYSTEM_ROOT || 'C:\\Users\\kyrian\\Documents\\AI-Whisperers';
  updates.FILESYSTEM_ALLOW_WRITE = updates.FILESYSTEM_ALLOW_WRITE || 'true';
  updates.AZURE_DEVOPS_ORG = 'aiwhisperer';
  updates.AZURE_DEVOPS_PROJECT = 'Business Setup';
  updates.AZURE_DEVOPS_BASE_URL = 'https://dev.azure.com/aiwhisperer';
  
  // Generate new .env.mcp file
  let envContent = `# MCP Server Environment Variables
# Generated by setup script
# Last updated: ${new Date().toISOString()}

`;
  
  // Group configurations
  const groups = {
    'GitHub Configuration': ['GITHUB_TOKEN'],
    'PostgreSQL/Supabase Configuration': ['POSTGRES_CONNECTION_STRING'],
    'Notion Configuration': ['NOTION_API_KEY'],
    'Azure DevOps Configuration': ['AZURE_DEVOPS_PAT', 'AZURE_DEVOPS_ORG', 'AZURE_DEVOPS_PROJECT', 'AZURE_DEVOPS_BASE_URL'],
    'Filesystem Configuration': ['FILESYSTEM_ROOT', 'FILESYSTEM_ALLOW_WRITE'],
    'Future Services': ['DISCORD_BOT_TOKEN', 'DISCORD_WEBHOOK_URL', 'ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN', 'N8N_API_KEY', 'N8N_WEBHOOK_URL']
  };
  
  for (const [group, keys] of Object.entries(groups)) {
    envContent += `# ${group}\n`;
    for (const key of keys) {
      const value = updates[key] || `your_${key.toLowerCase()}_here`;
      envContent += `${key}=${value}\n`;
    }
    envContent += '\n';
  }
  
  // Save configuration
  fs.writeFileSync(envPath, envContent);
  console.log(`\n${colors.green}Configuration saved to .env.mcp${colors.reset}`);
  
  // Update mcp-config.json
  const mcpConfig = {
    mcpServers: {
      'github': {
        command: 'node',
        args: [path.join(__dirname, 'node_modules/@modelcontextprotocol/server-github/dist/index.js')],
        env: {
          GITHUB_TOKEN: updates.GITHUB_TOKEN || 'your-github-pat-here'
        }
      },
      'postgres': {
        command: 'node',
        args: [path.join(__dirname, 'node_modules/@modelcontextprotocol/server-postgres/dist/index.js')],
        env: {
          POSTGRES_CONNECTION_STRING: updates.POSTGRES_CONNECTION_STRING || 'postgresql://user:pass@host:5432/db'
        }
      },
      'filesystem': {
        command: 'node',
        args: [path.join(__dirname, 'node_modules/@modelcontextprotocol/server-filesystem/dist/index.js')],
        env: {
          FILESYSTEM_ROOT: updates.FILESYSTEM_ROOT,
          FILESYSTEM_ALLOW_WRITE: updates.FILESYSTEM_ALLOW_WRITE
        }
      },
      'notion': {
        command: 'node',
        args: [path.join(__dirname, 'node_modules/@notionhq/notion-mcp-server/dist/index.js')],
        env: {
          NOTION_API_KEY: updates.NOTION_API_KEY || 'your-notion-integration-token'
        }
      },
      'azure-devops': {
        command: 'npx',
        args: ['-y', '@azure-devops/mcp'],
        env: {
          AZURE_DEVOPS_PAT: updates.AZURE_DEVOPS_PAT || 'your-pat-token',
          AZURE_DEVOPS_ORG: updates.AZURE_DEVOPS_ORG,
          AZURE_DEVOPS_PROJECT: updates.AZURE_DEVOPS_PROJECT,
          AZURE_DEVOPS_BASE_URL: updates.AZURE_DEVOPS_BASE_URL
        }
      }
    }
  };
  
  const mcpConfigPath = path.join(__dirname, '..', 'mcp-config.json');
  fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
  console.log(`${colors.green}Updated mcp-config.json${colors.reset}`);
  
  // Test connections
  console.log(`\n${colors.cyan}Would you like to test the connections now?${colors.reset}`);
  const testNow = await question('Test connections? (Y/n): ');
  
  if (testNow.toLowerCase() !== 'n') {
    rl.close();
    console.log(`\n${colors.blue}Running connection tests...${colors.reset}`);
    require('./test-connections.js');
  } else {
    console.log(`\n${colors.yellow}Setup complete!${colors.reset}`);
    console.log('Run "npm run test-mcp" to test connections later.');
    rl.close();
  }
}

// Run setup
setup().catch(error => {
  console.error(`${colors.red}Setup failed: ${error.message}${colors.reset}`);
  rl.close();
  process.exit(1);
});