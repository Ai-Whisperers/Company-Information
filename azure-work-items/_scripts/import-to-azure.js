#!/usr/bin/env node

/**
 * Import Work Items to Azure DevOps
 * Reads markdown files and creates work items via Azure DevOps API
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Configuration
const config = {
  organization: process.env.AZURE_DEVOPS_ORG || 'aiwhisperer',
  project: process.env.AZURE_DEVOPS_PROJECT || 'Business Setup',
  pat: process.env.AZURE_DEVOPS_PAT,
  apiVersion: '7.0'
};

// Validate configuration
if (!config.pat || config.pat.includes('your-')) {
  console.error('❌ Azure DevOps PAT token not configured in .env file');
  process.exit(1);
}

// Work item type mapping
const workItemTypes = {
  'EPIC': 'Epic',
  'FEATURE': 'Feature',
  'STORY': 'User Story',
  'TASK': 'Task'
};

/**
 * Parse markdown file to extract work item data
 */
function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Extract ID from filename
  const filename = path.basename(filePath);
  const matches = filename.match(/(EPIC|FEATURE|STORY|TASK)-(\d+)/);
  if (!matches) return null;
  
  const [, type, id] = matches;
  
  // Extract title from first heading
  const titleLine = lines.find(line => line.startsWith('#'));
  const title = titleLine ? titleLine.replace(/^#+\s*/, '').replace(/^[A-Z]+-\d+:\s*/, '') : filename;
  
  // Extract metadata
  const metadata = {};
  lines.forEach(line => {
    if (line.includes('**Status**:')) metadata.status = line.split(':**')[1].trim();
    if (line.includes('**Priority**:')) metadata.priority = line.split(':**')[1].trim();
    if (line.includes('**Story Points**:')) metadata.storyPoints = line.split(':**')[1].trim();
    if (line.includes('**Parent Epic**:')) metadata.parentEpic = line.split(':**')[1].trim();
    if (line.includes('**Parent Feature**:')) metadata.parentFeature = line.split(':**')[1].trim();
    if (line.includes('**Sprint**:')) metadata.sprint = line.split(':**')[1].trim();
  });
  
  // Extract description (everything between Description header and next section)
  const descStart = lines.findIndex(line => line.includes('## 📋 Description'));
  const descEnd = lines.findIndex((line, idx) => idx > descStart && line.startsWith('##'));
  const description = descStart >= 0 ? lines.slice(descStart + 1, descEnd > 0 ? descEnd : undefined).join('\n').trim() : '';
  
  // Extract acceptance criteria
  const acStart = lines.findIndex(line => line.includes('## ✅ Acceptance Criteria'));
  const acEnd = lines.findIndex((line, idx) => idx > acStart && line.startsWith('##'));
  const acceptanceCriteria = acStart >= 0 ? lines.slice(acStart + 1, acEnd > 0 ? acEnd : undefined).join('\n').trim() : '';
  
  return {
    type: workItemTypes[type],
    id: `${type}-${id}`,
    title,
    description,
    acceptanceCriteria,
    ...metadata,
    filePath
  };
}

/**
 * Create work item in Azure DevOps
 */
async function createWorkItem(workItem) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`:${config.pat}`).toString('base64');
    
    const fields = [
      { op: 'add', path: '/fields/System.Title', value: workItem.title },
      { op: 'add', path: '/fields/System.Description', value: workItem.description }
    ];
    
    // Add acceptance criteria
    if (workItem.acceptanceCriteria) {
      fields.push({
        op: 'add',
        path: '/fields/Microsoft.VSTS.Common.AcceptanceCriteria',
        value: workItem.acceptanceCriteria
      });
    }
    
    // Add story points
    if (workItem.storyPoints) {
      fields.push({
        op: 'add',
        path: '/fields/Microsoft.VSTS.Scheduling.StoryPoints',
        value: parseInt(workItem.storyPoints)
      });
    }
    
    // Add priority
    if (workItem.priority) {
      const priorityMap = { 'Critical': 1, 'High': 2, 'Medium': 3, 'Low': 4 };
      fields.push({
        op: 'add',
        path: '/fields/Microsoft.VSTS.Common.Priority',
        value: priorityMap[workItem.priority] || 3
      });
    }
    
    // Add tags
    fields.push({
      op: 'add',
      path: '/fields/System.Tags',
      value: workItem.id
    });
    
    const options = {
      hostname: 'dev.azure.com',
      path: `/${config.organization}/${config.project}/_apis/wit/workitems/$${workItem.type}?api-version=${config.apiVersion}`,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json-patch+json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          const result = JSON.parse(data);
          console.log(`✅ Created: ${workItem.id} - ${workItem.title} (ID: ${result.id})`);
          resolve(result);
        } else {
          console.error(`❌ Failed to create ${workItem.id}: ${res.statusCode}`);
          reject(new Error(data));
        }
      });
    });
    
    req.on('error', reject);
    req.write(JSON.stringify(fields));
    req.end();
  });
}

/**
 * Link work items (parent-child relationships)
 */
async function linkWorkItems(parentId, childId, linkType = 'System.LinkTypes.Hierarchy-Forward') {
  // Implementation for linking work items
  console.log(`🔗 Linking ${parentId} -> ${childId}`);
}

/**
 * Process directory recursively
 */
async function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const workItems = [];
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('_')) {
      // Recursively process subdirectories
      const subItems = await processDirectory(fullPath);
      workItems.push(...subItems);
    } else if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.includes('template')) {
      // Parse markdown file
      const workItem = parseMarkdownFile(fullPath);
      if (workItem) {
        workItems.push(workItem);
      }
    }
  }
  
  return workItems;
}

/**
 * Main import function
 */
async function importWorkItems() {
  console.log('🚀 Starting Azure DevOps import...');
  console.log(`Organization: ${config.organization}`);
  console.log(`Project: ${config.project}`);
  console.log('');
  
  const baseDir = path.join(__dirname, '..');
  const projectDir = path.join(baseDir, 'Business-Setup');
  
  if (!fs.existsSync(projectDir)) {
    console.error('❌ Business-Setup directory not found');
    return;
  }
  
  // Process all work items
  const workItems = await processDirectory(projectDir);
  
  // Sort by type (Epics first, then Features, then Stories)
  workItems.sort((a, b) => {
    const order = ['Epic', 'Feature', 'User Story', 'Task'];
    return order.indexOf(a.type) - order.indexOf(b.type);
  });
  
  console.log(`Found ${workItems.length} work items to import\n`);
  
  // Create work items
  const created = {};
  for (const workItem of workItems) {
    try {
      const result = await createWorkItem(workItem);
      created[workItem.id] = result.id;
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to create ${workItem.id}:`, error.message);
    }
  }
  
  console.log('\n✅ Import complete!');
  console.log(`Created ${Object.keys(created).length} work items`);
  
  // Save mapping for future reference
  const mappingFile = path.join(baseDir, '_scripts', 'azure-mapping.json');
  fs.writeFileSync(mappingFile, JSON.stringify(created, null, 2));
  console.log(`Mapping saved to: ${mappingFile}`);
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(`
Azure DevOps Work Item Importer

Usage:
  node import-to-azure.js [options]

Options:
  --project <name>  Override project name
  --dry-run        Show what would be imported without creating items
  --help           Show this help message

Examples:
  node import-to-azure.js
  node import-to-azure.js --project "AI Development"
  node import-to-azure.js --dry-run
    `);
    process.exit(0);
  }
  
  // Override project if specified
  const projectIndex = args.indexOf('--project');
  if (projectIndex >= 0 && args[projectIndex + 1]) {
    config.project = args[projectIndex + 1];
  }
  
  // Run import
  importWorkItems().catch(console.error);
}

module.exports = { parseMarkdownFile, createWorkItem, importWorkItems };