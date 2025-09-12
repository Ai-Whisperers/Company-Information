#!/usr/bin/env node

/**
 * Create All User Stories
 * Generates all 48 user stories based on the defined structure
 */

const fs = require('fs');
const path = require('path');

// User Stories Definition
const stories = [
  // EPIC-001: Foundation
  {
    id: 'STORY-001',
    epic: 'EPIC-001-Foundation',
    feature: 'FEATURE-001-Legal-Structure',
    title: 'Research Business Structures',
    points: 2,
    priority: 1,
    description: 'Research and compare different business entity types'
  },
  {
    id: 'STORY-002',
    epic: 'EPIC-001-Foundation',
    feature: 'FEATURE-001-Legal-Structure',
    title: 'Register Business Entity',
    points: 3,
    priority: 1,
    description: 'File formation documents and register the business'
  },
  {
    id: 'STORY-003',
    epic: 'EPIC-001-Foundation',
    feature: 'FEATURE-001-Legal-Structure',
    title: 'Obtain EIN',
    points: 1,
    priority: 2,
    description: 'Apply for Federal EIN and State Tax ID'
  },
  {
    id: 'STORY-004',
    epic: 'EPIC-001-Foundation',
    feature: 'FEATURE-001-Legal-Structure',
    title: 'Create Operating Agreement',
    points: 2,
    priority: 3,
    description: 'Draft operating agreement and governance rules'
  },
  {
    id: 'STORY-005',
    epic: 'EPIC-001-Foundation',
    feature: 'FEATURE-002-Financial-Systems',
    title: 'Open Business Bank Accounts',
    points: 2,
    priority: 1,
    description: 'Open business checking and savings accounts'
  },
  {
    id: 'STORY-006',
    epic: 'EPIC-001-Foundation',
    feature: 'FEATURE-002-Financial-Systems',
    title: 'Setup Accounting System',
    points: 3,
    priority: 1,
    description: 'Configure Zoho Books and chart of accounts'
  },
  {
    id: 'STORY-007',
    epic: 'EPIC-001-Foundation',
    feature: 'FEATURE-002-Financial-Systems',
    title: 'Configure Payment Processing',
    points: 2,
    priority: 2,
    description: 'Setup Stripe and payment methods'
  },
  {
    id: 'STORY-008',
    epic: 'EPIC-001-Foundation',
    feature: 'FEATURE-002-Financial-Systems',
    title: 'Establish Financial Reporting',
    points: 1,
    priority: 3,
    description: 'Create financial reports and dashboards'
  },

  // EPIC-002: Web Presence
  {
    id: 'STORY-009',
    epic: 'EPIC-002-Web-Presence',
    feature: 'FEATURE-003-Website-Development',
    title: 'Configure Squarespace Site',
    points: 2,
    priority: 1,
    description: 'Setup and configure Squarespace platform'
  },
  {
    id: 'STORY-010',
    epic: 'EPIC-002-Web-Presence',
    feature: 'FEATURE-003-Website-Development',
    title: 'Create Homepage Content',
    points: 3,
    priority: 1,
    description: 'Design and write homepage content'
  },
  {
    id: 'STORY-011',
    epic: 'EPIC-002-Web-Presence',
    feature: 'FEATURE-003-Website-Development',
    title: 'Build Service Pages',
    points: 3,
    priority: 2,
    description: 'Create all service offering pages'
  },
  {
    id: 'STORY-012',
    epic: 'EPIC-002-Web-Presence',
    feature: 'FEATURE-003-Website-Development',
    title: 'Setup Contact Forms',
    points: 1,
    priority: 2,
    description: 'Create and test contact forms'
  },
  {
    id: 'STORY-013',
    epic: 'EPIC-002-Web-Presence',
    feature: 'FEATURE-003-Website-Development',
    title: 'Implement SEO',
    points: 1,
    priority: 3,
    description: 'Optimize site for search engines'
  },
  {
    id: 'STORY-014',
    epic: 'EPIC-002-Web-Presence',
    feature: 'FEATURE-004-Brand-Identity',
    title: 'Design Logo',
    points: 3,
    priority: 1,
    description: 'Create company logo and variations'
  },
  {
    id: 'STORY-015',
    epic: 'EPIC-002-Web-Presence',
    feature: 'FEATURE-004-Brand-Identity',
    title: 'Create Brand Guidelines',
    points: 2,
    priority: 1,
    description: 'Document brand standards and guidelines'
  },
  {
    id: 'STORY-016',
    epic: 'EPIC-002-Web-Presence',
    feature: 'FEATURE-004-Brand-Identity',
    title: 'Design Business Cards',
    points: 2,
    priority: 2,
    description: 'Create business card designs'
  },
  {
    id: 'STORY-017',
    epic: 'EPIC-002-Web-Presence',
    feature: 'FEATURE-004-Brand-Identity',
    title: 'Create Email Templates',
    points: 2,
    priority: 2,
    description: 'Design email signature and templates'
  },
  {
    id: 'STORY-018',
    epic: 'EPIC-002-Web-Presence',
    feature: 'FEATURE-004-Brand-Identity',
    title: 'Setup Social Media Profiles',
    points: 1,
    priority: 3,
    description: 'Create and brand social media accounts'
  },

  // EPIC-003: Operations
  {
    id: 'STORY-019',
    epic: 'EPIC-003-Operations',
    feature: 'FEATURE-005-Platform-Integration',
    title: 'Setup Azure DevOps',
    points: 2,
    priority: 1,
    description: 'Configure Azure DevOps for project management'
  },
  {
    id: 'STORY-020',
    epic: 'EPIC-003-Operations',
    feature: 'FEATURE-005-Platform-Integration',
    title: 'Configure Discord Server',
    points: 2,
    priority: 1,
    description: 'Setup Discord for team communication'
  },
  {
    id: 'STORY-021',
    epic: 'EPIC-003-Operations',
    feature: 'FEATURE-005-Platform-Integration',
    title: 'Setup Supabase Database',
    points: 3,
    priority: 2,
    description: 'Configure Supabase for data management'
  },
  {
    id: 'STORY-022',
    epic: 'EPIC-003-Operations',
    feature: 'FEATURE-005-Platform-Integration',
    title: 'Configure Zoho CRM',
    points: 2,
    priority: 2,
    description: 'Setup Zoho CRM for customer management'
  },
  {
    id: 'STORY-023',
    epic: 'EPIC-003-Operations',
    feature: 'FEATURE-005-Platform-Integration',
    title: 'Setup Confluence Wiki',
    points: 1,
    priority: 3,
    description: 'Configure Confluence for documentation'
  },
  {
    id: 'STORY-024',
    epic: 'EPIC-003-Operations',
    feature: 'FEATURE-006-Workflow-Automation',
    title: 'Setup n8n Cloud',
    points: 2,
    priority: 1,
    description: 'Configure n8n for workflow automation'
  },
  {
    id: 'STORY-025',
    epic: 'EPIC-003-Operations',
    feature: 'FEATURE-006-Workflow-Automation',
    title: 'Create Lead Automation',
    points: 3,
    priority: 1,
    description: 'Automate lead capture and nurturing'
  },
  {
    id: 'STORY-026',
    epic: 'EPIC-003-Operations',
    feature: 'FEATURE-006-Workflow-Automation',
    title: 'Automate Invoice Generation',
    points: 3,
    priority: 2,
    description: 'Setup automatic invoice creation'
  },
  {
    id: 'STORY-027',
    epic: 'EPIC-003-Operations',
    feature: 'FEATURE-006-Workflow-Automation',
    title: 'Setup Email Automation',
    points: 1,
    priority: 2,
    description: 'Configure automated email workflows'
  },
  {
    id: 'STORY-028',
    epic: 'EPIC-003-Operations',
    feature: 'FEATURE-006-Workflow-Automation',
    title: 'Create Reporting Dashboards',
    points: 1,
    priority: 3,
    description: 'Build automated reporting dashboards'
  },

  // EPIC-004: Development
  {
    id: 'STORY-029',
    epic: 'EPIC-004-Development',
    feature: 'FEATURE-007-Repository-Management',
    title: 'Structure GitHub Repositories',
    points: 2,
    priority: 1,
    description: 'Organize and structure code repositories'
  },
  {
    id: 'STORY-030',
    epic: 'EPIC-004-Development',
    feature: 'FEATURE-007-Repository-Management',
    title: 'Setup Branch Protection',
    points: 1,
    priority: 1,
    description: 'Configure branch protection rules'
  },
  {
    id: 'STORY-031',
    epic: 'EPIC-004-Development',
    feature: 'FEATURE-007-Repository-Management',
    title: 'Configure CICD Pipelines',
    points: 3,
    priority: 2,
    description: 'Setup continuous integration and deployment'
  },
  {
    id: 'STORY-032',
    epic: 'EPIC-004-Development',
    feature: 'FEATURE-007-Repository-Management',
    title: 'Setup Code Review Process',
    points: 2,
    priority: 2,
    description: 'Establish code review workflow'
  },
  {
    id: 'STORY-033',
    epic: 'EPIC-004-Development',
    feature: 'FEATURE-007-Repository-Management',
    title: 'Implement Version Control Strategy',
    points: 2,
    priority: 3,
    description: 'Define versioning and release strategy'
  },
  {
    id: 'STORY-034',
    epic: 'EPIC-004-Development',
    feature: 'FEATURE-008-AI-Infrastructure',
    title: 'Setup Azure AI Services',
    points: 3,
    priority: 1,
    description: 'Configure Azure AI platform services'
  },
  {
    id: 'STORY-035',
    epic: 'EPIC-004-Development',
    feature: 'FEATURE-008-AI-Infrastructure',
    title: 'Configure ML Workspace',
    points: 3,
    priority: 1,
    description: 'Setup machine learning workspace'
  },
  {
    id: 'STORY-036',
    epic: 'EPIC-004-Development',
    feature: 'FEATURE-008-AI-Infrastructure',
    title: 'Setup Model Registry',
    points: 2,
    priority: 2,
    description: 'Create model versioning system'
  },
  {
    id: 'STORY-037',
    epic: 'EPIC-004-Development',
    feature: 'FEATURE-008-AI-Infrastructure',
    title: 'Implement API Gateway',
    points: 1,
    priority: 2,
    description: 'Setup API management gateway'
  },
  {
    id: 'STORY-038',
    epic: 'EPIC-004-Development',
    feature: 'FEATURE-008-AI-Infrastructure',
    title: 'Setup Monitoring & Logging',
    points: 1,
    priority: 3,
    description: 'Configure monitoring and logging systems'
  },

  // EPIC-005: Growth
  {
    id: 'STORY-039',
    epic: 'EPIC-005-Growth',
    feature: 'FEATURE-009-Sales-Marketing',
    title: 'Define Service Packages',
    points: 2,
    priority: 1,
    description: 'Create service offerings and packages'
  },
  {
    id: 'STORY-040',
    epic: 'EPIC-005-Growth',
    feature: 'FEATURE-009-Sales-Marketing',
    title: 'Create Pricing Strategy',
    points: 2,
    priority: 1,
    description: 'Develop pricing model and tiers'
  },
  {
    id: 'STORY-041',
    epic: 'EPIC-005-Growth',
    feature: 'FEATURE-009-Sales-Marketing',
    title: 'Build Sales Pipeline',
    points: 3,
    priority: 2,
    description: 'Create sales process and pipeline'
  },
  {
    id: 'STORY-042',
    epic: 'EPIC-005-Growth',
    feature: 'FEATURE-009-Sales-Marketing',
    title: 'Launch Content Marketing',
    points: 2,
    priority: 2,
    description: 'Start content marketing program'
  },
  {
    id: 'STORY-043',
    epic: 'EPIC-005-Growth',
    feature: 'FEATURE-009-Sales-Marketing',
    title: 'Setup Analytics Tracking',
    points: 1,
    priority: 3,
    description: 'Configure marketing analytics'
  },
  {
    id: 'STORY-044',
    epic: 'EPIC-005-Growth',
    feature: 'FEATURE-010-Service-Delivery',
    title: 'Create Onboarding Process',
    points: 2,
    priority: 1,
    description: 'Design client onboarding workflow'
  },
  {
    id: 'STORY-045',
    epic: 'EPIC-005-Growth',
    feature: 'FEATURE-010-Service-Delivery',
    title: 'Build Project Templates',
    points: 2,
    priority: 1,
    description: 'Create reusable project templates'
  },
  {
    id: 'STORY-046',
    epic: 'EPIC-005-Growth',
    feature: 'FEATURE-010-Service-Delivery',
    title: 'Setup Customer Portal',
    points: 3,
    priority: 2,
    description: 'Build customer self-service portal'
  },
  {
    id: 'STORY-047',
    epic: 'EPIC-005-Growth',
    feature: 'FEATURE-010-Service-Delivery',
    title: 'Create SLA Framework',
    points: 2,
    priority: 2,
    description: 'Define service level agreements'
  },
  {
    id: 'STORY-048',
    epic: 'EPIC-005-Growth',
    feature: 'FEATURE-010-Service-Delivery',
    title: 'Implement Feedback System',
    points: 1,
    priority: 3,
    description: 'Setup customer feedback collection'
  }
];

/**
 * Create story markdown file
 */
function createStoryFile(story) {
  const template = `# ${story.id}: ${story.title}

**Parent Feature**: ${story.feature}  
**Epic**: ${story.epic.replace('Epic-', 'EPIC-')}  
**Status**: ⬜ Not Started  
**Priority**: ${story.priority}  
**Story Points**: ${story.points}  
**Sprint**: TBD  
**Assigned To**: Unassigned  

---

## 📖 User Story

**As a** [user role]  
**I want to** ${story.title.toLowerCase()}  
**So that** [benefit/value]  

## 📋 Description

${story.description}

## ✅ Acceptance Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## 📝 Tasks

- [ ] **TASK-001**: [Task description] (Est: Xh)
- [ ] **TASK-002**: [Task description] (Est: Xh)
- [ ] **TASK-003**: [Task description] (Est: Xh)

---

## 🔄 History

| Date | Update | By |
|------|--------|-----|
| 2025-01-13 | Story created | System |

---

## 🏷️ Tags

\`user-story\` \`${story.epic.toLowerCase()}\` \`priority-${story.priority}\`
`;

  return template;
}

/**
 * Main function to create all stories
 */
function createAllStories() {
  const baseDir = path.join(__dirname, '..');
  
  stories.forEach(story => {
    // Create Stories directory if it doesn't exist
    const storiesDir = path.join(baseDir, 'Business-Setup', story.epic, 'Stories');
    if (!fs.existsSync(storiesDir)) {
      fs.mkdirSync(storiesDir, { recursive: true });
    }
    
    // Create story file
    const fileName = `${story.id}-${story.title.replace(/\s+/g, '-')}.md`;
    const filePath = path.join(storiesDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      const content = createStoryFile(story);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Created: ${fileName}`);
    } else {
      console.log(`⏭️  Skipped: ${fileName} (already exists)`);
    }
  });
  
  console.log(`\n✅ All ${stories.length} user stories created!`);
}

// Run if called directly
if (require.main === module) {
  createAllStories();
}

module.exports = { createAllStories, stories };