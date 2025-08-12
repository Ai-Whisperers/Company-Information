# GitHub Projects Setup Guide

This guide will help you set up the GitHub Projects kanban board for AI-Whisperers.

## 🎯 Project Board Structure

### Main Project: "AI-Whisperers Organization"

**Views to Create:**
1. **Kanban Board** (default view)
2. **Roadmap** (timeline view)
3. **Backlog** (table view with filters)
4. **Current Sprint** (filtered kanban)

## 📋 Kanban Columns

1. **📋 Backlog** - New ideas and unrefined tasks
2. **🔍 Refinement** - Tasks being analyzed and scoped  
3. **📅 Ready** - Well-defined tasks ready for development
4. **🔄 In Progress** - Currently being worked on
5. **👀 Review** - Awaiting code review or feedback
6. **🧪 Testing** - Implementation complete, being tested
7. **✅ Done** - Completed tasks

## 🏷️ Custom Fields

Add these custom fields to your project:

1. **Priority** (Single select)
   - 🔴 Critical
   - 🟠 High  
   - 🟡 Medium
   - 🟢 Low

2. **Project** (Single select)
   - Investment AI
   - Company Website
   - Comment Analyzer
   - Core Services
   - ML Models
   - Infrastructure
   - Documentation

3. **Effort** (Single select)
   - XS (1-2 hours)
   - S (Half day)
   - M (1-2 days)
   - L (3-5 days)
   - XL (1-2 weeks)
   - XXL (2+ weeks)

4. **Sprint** (Text)
   - For sprint planning

5. **Business Value** (Single select)
   - High - Direct revenue impact
   - Medium - Growth enabler
   - Low - Nice to have

## 🔄 Automation Rules

Set up these automations:

1. **New Issues → Backlog**
   - When: Item added to project
   - Then: Set status to "📋 Backlog"

2. **PR Created → In Progress** 
   - When: Pull request linked
   - Then: Set status to "🔄 In Progress"

3. **Issue Closed → Done**
   - When: Issue closed
   - Then: Set status to "✅ Done"

4. **Priority Auto-Assignment**
   - When: Label "priority: critical" added
   - Then: Set Priority to "🔴 Critical"

## 📊 Views Configuration

### 1. Kanban Board (Default)
- **Layout**: Board
- **Group by**: Status
- **Filter**: None (show all open items)

### 2. Roadmap
- **Layout**: Roadmap
- **Group by**: Project
- **Sort by**: Priority (Critical first)

### 3. Backlog
- **Layout**: Table
- **Filter**: Status = "📋 Backlog" OR "🔍 Refinement"
- **Sort by**: Priority, then Business Value

### 4. Current Sprint
- **Layout**: Board
- **Group by**: Status
- **Filter**: Sprint = "Current" AND Status != "✅ Done"

## 🚀 Quick Setup Steps

1. **Go to your organization**: https://github.com/orgs/Ai-Whisperers/projects

2. **Create new project**:
   - Name: "AI-Whisperers Organization"
   - Description: "Main project management board for all AI-Whisperers initiatives"
   - Template: "Team planning"

3. **Configure columns** as listed above

4. **Add custom fields** as specified

5. **Set up automation rules**

6. **Create additional views**

7. **Link repositories**:
   - AI-Whisperers (main)
   - Future: investment-ai, company-website, comment-analyzer

## 📝 Usage Guidelines

### Creating Issues
- Use the issue templates for consistency
- Add appropriate labels for auto-sorting
- Assign to project (will auto-go to Backlog)

### Working with the Board
- Move items through columns as work progresses
- Use effort estimates for sprint planning
- Tag items with business value for prioritization

### Sprint Planning
- Filter by "Ready" status for sprint planning
- Use effort estimates to size sprints
- Move selected items to "Current Sprint" view

## 📈 Tracking Progress

### Key Metrics to Monitor
- **Cycle Time**: How long items spend in "In Progress"
- **Throughput**: Items completed per sprint
- **Burndown**: Remaining effort in current sprint
- **Backlog Health**: Ratio of refined vs unrefined items

### Weekly Reviews
- Review items in "Review" and "Testing" columns
- Assess backlog priorities
- Plan next sprint based on capacity

## 🔧 Maintenance Tasks

### Weekly
- Review and update priorities
- Clean up completed items
- Refine backlog items

### Monthly  
- Analyze metrics and trends
- Update project roadmap
- Review and adjust processes

---

**Next Steps:**
1. Set up the GitHub Project using this guide
2. Import existing issues and ideas
3. Start using the board for new work
4. Iterate and improve the process