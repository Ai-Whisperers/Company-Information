#!/usr/bin/env node

/**
 * MCP Server Connection Tester
 * Tests connectivity for all installed MCP servers
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables from main .env file
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test configuration for each server
const servers = [
  {
    name: 'GitHub',
    command: 'node',
    args: [path.join(__dirname, 'node_modules/@modelcontextprotocol/server-github/dist/index.js')],
    env: { GITHUB_TOKEN: process.env.GITHUB_TOKEN },
    required: ['GITHUB_TOKEN'],
    testEndpoint: 'https://api.github.com/user'
  },
  {
    name: 'PostgreSQL',
    command: 'node',
    args: [path.join(__dirname, 'node_modules/@modelcontextprotocol/server-postgres/dist/index.js')],
    env: { POSTGRES_CONNECTION_STRING: process.env.POSTGRES_CONNECTION_STRING },
    required: ['POSTGRES_CONNECTION_STRING'],
    skipTest: true // Connection string format varies
  },
  {
    name: 'Filesystem',
    command: 'node',
    args: [path.join(__dirname, 'node_modules/@modelcontextprotocol/server-filesystem/dist/index.js')],
    env: {
      FILESYSTEM_ROOT: process.env.FILESYSTEM_ROOT || __dirname,
      FILESYSTEM_ALLOW_WRITE: process.env.FILESYSTEM_ALLOW_WRITE || 'false'
    },
    required: [],
    localTest: true
  }
];

// Test individual server
async function testServer(server) {
  console.log(`\n${colors.cyan}Testing ${server.name} MCP Server...${colors.reset}`);
  
  // Check required environment variables
  for (const envVar of server.required) {
    if (!server.env[envVar] || server.env[envVar].includes('your_')) {
      console.log(`${colors.red}✗ Missing or invalid ${envVar}${colors.reset}`);
      console.log(`  Please update .env.mcp with valid ${envVar}`);
      return false;
    }
  }
  
  // Local filesystem test
  if (server.localTest) {
    const testPath = server.env.FILESYSTEM_ROOT;
    if (fs.existsSync(testPath)) {
      console.log(`${colors.green}✓ Filesystem path exists: ${testPath}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ Filesystem path not found: ${testPath}${colors.reset}`);
      return false;
    }
  }
  
  // Skip connection test if specified
  if (server.skipTest) {
    console.log(`${colors.yellow}⚠ Connection test skipped (manual verification needed)${colors.reset}`);
    return null;
  }
  
  // Test API endpoint if available
  if (server.testEndpoint) {
    try {
      const https = require('https');
      const token = server.env[server.required[0]];
      
      return new Promise((resolve) => {
        const options = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'MCP-Test'
          }
        };
        
        https.get(server.testEndpoint, options, (res) => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log(`${colors.green}✓ Successfully connected to ${server.name} API${colors.reset}`);
            resolve(true);
          } else if (res.statusCode === 401) {
            console.log(`${colors.red}✗ Authentication failed - check your token${colors.reset}`);
            resolve(false);
          } else {
            console.log(`${colors.yellow}⚠ Unexpected status: ${res.statusCode}${colors.reset}`);
            resolve(null);
          }
        }).on('error', (err) => {
          console.log(`${colors.red}✗ Connection error: ${err.message}${colors.reset}`);
          resolve(false);
        });
      });
    } catch (error) {
      console.log(`${colors.red}✗ Test failed: ${error.message}${colors.reset}`);
      return false;
    }
  }
  
  return null;
}

// Main test runner
async function runTests() {
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.blue}MCP Server Connection Test Suite${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
  
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  };
  
  for (const server of servers) {
    const result = await testServer(server);
    if (result === true) {
      results.passed++;
    } else if (result === false) {
      results.failed++;
    } else {
      results.skipped++;
    }
  }
  
  // Summary
  console.log(`\n${colors.blue}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.blue}Test Summary${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}Skipped: ${results.skipped}${colors.reset}`);
  
  if (results.failed > 0) {
    console.log(`\n${colors.yellow}Next Steps:${colors.reset}`);
    console.log('1. Update .env with valid credentials');
    console.log('2. Ensure all required services are accessible');
    console.log('3. Run this test again: npm run test-mcp');
  } else if (results.passed === servers.length - results.skipped) {
    console.log(`\n${colors.green}All configured servers are ready!${colors.reset}`);
    console.log('You can now use these MCP servers with Claude.');
  }
}

// Check if dotenv is installed
try {
  require('dotenv');
} catch (error) {
  console.log(`${colors.yellow}Installing dotenv for environment variables...${colors.reset}`);
  const { execSync } = require('child_process');
  execSync('npm install dotenv', { cwd: __dirname, stdio: 'inherit' });
}

// Run tests
runTests().catch(console.error);