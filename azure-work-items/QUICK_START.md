# Quick Start Guide - Azure Work Items

**Get up and running in 5 minutes!**

---

## 🚀 Step 1: Install Dependencies

```bash
cd azure-work-items/_scripts
npm install
```

---

## 🔑 Step 2: Configure Azure DevOps Token

1. Get your PAT token from Azure DevOps:
   - Go to: https://dev.azure.com/aiwhisperer/_usersSettings/tokens
   - Create token with Work Items permissions

2. Add to `.env` file:
```env
AZURE_DEVOPS_PAT=your-52-character-token-here
```

---

## 📝 Step 3: Review Work Items

Browse the folder structure:
```
azure-work-items/
└── Business-Setup/
    ├── EPIC-001-Foundation.md      # Read this first
    ├── EPIC-002-Web-Presence.md
    ├── EPIC-003-Operations.md
    ├── EPIC-004-Development.md
    └── EPIC-005-Growth.md
```

---

## 📤 Step 4: Import to Azure DevOps

### Dry Run (Preview)
```bash
cd _scripts
npm run import:dry
```

### Actual Import
```bash
npm run import
```

---

## ✏️ Step 5: Edit Work Items

### Edit Locally
1. Open any `.md` file in your editor
2. Make changes
3. Save file

### Sync to Azure
```bash
npm run sync
```

---

## 📊 Working with Sprints

### Current Sprint (Sprint 1)
Focus: Foundation (Legal + Financial)

**Files to edit**:
- `Epic-001-Foundation/Features/FEATURE-001-Legal-Structure.md`
- `Epic-001-Foundation/Features/FEATURE-002-Financial-Systems.md`

### Update Status
Change status in markdown:
```markdown
**Status**: 🟡 In Progress  
```

Status options:
- ⬜ Not Started
- 🟡 In Progress  
- ✅ Complete
- 🔴 Blocked

---

## 🎯 Common Tasks

### Create New User Story
```bash
# Copy template
cp _templates/story-template.md Business-Setup/Epic-001-Foundation/Stories/STORY-049-New.md

# Edit it
notepad Business-Setup/Epic-001-Foundation/Stories/STORY-049-New.md

# Import to Azure
npm run import
```

### Update Epic Progress
1. Edit epic file
2. Update progress percentage
3. Sync to Azure

### Generate Status Report
```bash
npm run report
```

---

## 📁 File Organization

### Naming Convention
- **Epics**: `EPIC-XXX-Name.md`
- **Features**: `FEATURE-XXX-Name.md`
- **Stories**: `STORY-XXX-Name.md`
- **Tasks**: `TASK-XXX-Name.md`

### ID Sequence
- EPIC: 001-005 (5 epics)
- FEATURE: 001-010 (10 features, 2 per epic)
- STORY: 001-048 (48 stories)
- TASK: As needed

---

## 🔄 Workflow

### Daily Workflow
1. **Morning**: Pull latest from Git
2. **Work**: Edit markdown files locally
3. **Commit**: Save changes to Git
4. **Sync**: Push to Azure DevOps
5. **Review**: Check Azure boards

### Sprint Planning
1. Review epics and features
2. Select stories for sprint
3. Update sprint field in stories
4. Import to Azure DevOps
5. Start sprint in Azure

---

## 💡 Tips

### VS Code Extensions
- **Markdown All in One**: Better markdown editing
- **Azure Repos**: Git integration
- **Todo Tree**: Track TODOs in files

### Keyboard Shortcuts
- `Ctrl+K V`: Preview markdown (VS Code)
- `Ctrl+Shift+V`: Open preview to side
- `Alt+Shift+F`: Format document

### Bulk Operations
```bash
# Import all stories for an epic
node import-to-azure.js --epic EPIC-001

# Export current sprint
node export-from-azure.js --sprint 1
```

---

## ❓ Troubleshooting

### Import Fails
- Check PAT token in .env
- Verify project name: "Business Setup"
- Check organization: "aiwhisperer"

### Work Item Not Created
- Check markdown format
- Verify ID sequence
- Look for error in console

### Can't Connect to Azure
- Token may be expired
- Check network/firewall
- Verify Azure DevOps is accessible

---

## 📞 Need Help?

1. Check `README.md` for detailed docs
2. Review `WORK_ITEMS_STRUCTURE.md` for hierarchy
3. Look at templates in `_templates/`
4. Check Azure DevOps permissions

---

**Ready to go!** Start by reviewing EPIC-001 and importing your first work items! 🎉