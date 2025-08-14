# Azure DevOps Work Items Management

**Organization**: AI-Whisperers  
**Last Updated**: 2025-01-13  
**Purpose**: File-based management of Azure DevOps work items for easy editing and bulk import

---

## 📁 Folder Structure

```
azure-work-items/
├── Business-Setup/           # Main business setup project
│   ├── Epic-001-Foundation/
│   ├── Epic-002-Web-Presence/
│   ├── Epic-003-Operations/
│   ├── Epic-004-Development/
│   └── Epic-005-Growth/
├── AI-Development/          # AI and ML projects
├── Client-Projects/         # Client work
├── Internal-Tools/          # Internal tooling
├── _templates/              # Reusable templates
└── _scripts/                # Import/export scripts
```

---

## 🎯 Projects Overview

### 1. Business Setup (Active)
Primary project for establishing AI-Whisperers business operations
- 5 Epics
- 10 Features  
- 48 User Stories
- Status: In Progress

### 2. AI Development (Planned)
Machine learning and AI solution development
- Model development
- Training pipelines
- API services

### 3. Client Projects (Future)
Customer implementations and consulting
- Per-client epics
- Deliverable tracking
- Timeline management

### 4. Internal Tools (Future)
Internal automation and tooling
- DevOps automation
- Monitoring systems
- Productivity tools

---

## 📝 File Naming Convention

### Epic Files
```
EPIC-XXX-[Name].md
Example: EPIC-001-Foundation.md
```

### Feature Files
```
FEATURE-XXX-[Name].md
Example: FEATURE-001-Legal-Structure.md
```

### User Story Files
```
STORY-XXX-[Name].md
Example: STORY-001-Register-Business.md
```

### Task Files
```
TASK-XXX-[Name].md
Example: TASK-001-Research-Structure.md
```

---

## 🏷️ Work Item Structure

### Epic Structure
- **ID**: EPIC-XXX
- **Title**: Clear business objective
- **Description**: High-level goal
- **Acceptance Criteria**: Success metrics
- **Child Features**: List of features
- **Priority**: Critical/High/Medium/Low
- **Target Date**: Quarter/Month

### Feature Structure
- **ID**: FEATURE-XXX
- **Parent Epic**: EPIC-XXX
- **Title**: Specific capability
- **Description**: Detailed requirements
- **User Stories**: List of stories
- **Story Points**: Estimated effort
- **Sprint**: Target sprint

### User Story Structure
- **ID**: STORY-XXX
- **Parent Feature**: FEATURE-XXX
- **Title**: As a [user], I want [goal]
- **Description**: Detailed story
- **Acceptance Criteria**: Definition of done
- **Tasks**: Implementation tasks
- **Story Points**: 1, 2, 3, 5, 8, 13
- **Priority**: 1-4

---

## 🔄 Workflow

### 1. Create Work Items
```bash
# Use templates to create new items
cp _templates/epic-template.md Business-Setup/Epic-006-New-Epic.md
```

### 2. Edit Work Items
- Edit markdown files directly
- Update status, descriptions, criteria
- Add tasks and notes

### 3. Import to Azure DevOps
```bash
# Run import script
cd _scripts
node import-to-azure.js --project "Business Setup"
```

### 4. Export from Azure DevOps
```bash
# Export current state
node export-from-azure.js --project "Business Setup"
```

---

## 📊 Status Tracking

### Business Setup Project Status

| Epic | Features | Stories | Status |
|------|----------|---------|--------|
| Foundation | 2 | 8 | 🟡 In Progress |
| Web Presence | 2 | 10 | ⬜ Not Started |
| Operations | 2 | 10 | ⬜ Not Started |
| Development | 2 | 10 | ⬜ Not Started |
| Growth | 2 | 10 | ⬜ Not Started |

### Legend
- 🟢 Complete
- 🟡 In Progress
- 🔴 Blocked
- ⬜ Not Started

---

## 🚀 Quick Commands

### Create New Epic
```bash
npm run create:epic -- --name "New Epic" --project "Business Setup"
```

### Create New Feature
```bash
npm run create:feature -- --epic "EPIC-001" --name "New Feature"
```

### Create New Story
```bash
npm run create:story -- --feature "FEATURE-001" --name "New Story"
```

### Import All to Azure
```bash
npm run import:all
```

### Export from Azure
```bash
npm run export:all
```

---

## 🏗️ Templates

Templates are located in `_templates/`:
- `epic-template.md` - Epic template
- `feature-template.md` - Feature template
- `story-template.md` - User story template
- `task-template.md` - Task template

---

## 🔗 Integration

### Azure DevOps
- Organization: `aiwhisperer`
- Project: `Business Setup`
- API Version: 7.0

### GitHub
- Repository: `AI-Whisperers`
- Branch: `main`
- Sync: Automated via Actions

---

## 📈 Metrics

### Current Sprint
- Sprint: 1
- Duration: 2 weeks
- Capacity: 40 story points
- Committed: 0 points

### Velocity
- Last Sprint: N/A
- Average: N/A
- Trend: N/A

---

## 🎯 Next Steps

1. Complete Epic definitions
2. Break down Features into Stories
3. Estimate Story Points
4. Set up Sprint 1
5. Import to Azure DevOps

---

**Note**: This is the source of truth for work item planning. Azure DevOps is the execution platform.