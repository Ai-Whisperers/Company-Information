# Azure DevOps Backlog and Kanban Setup Guide

## Quick Access Links
- **Board**: https://dev.azure.com/aiwhisperer/Business%20Setup/_boards/board
- **Backlog**: https://dev.azure.com/aiwhisperer/Business%20Setup/_backlogs/backlog
- **Work Items**: https://dev.azure.com/aiwhisperer/Business%20Setup/_workitems

## Backlog Structure Created

Your comprehensive backlog structure has been prepared based on your AI-Whisperers business roadmap. Here's what needs to be added to Azure DevOps:

### 📊 Summary
- **5 Epics** (major business initiatives)
- **10 Features** (key deliverables)
- **48 User Stories** (actionable tasks)
- **Total Story Points**: 142

## 🎯 Epic 1: Digital Foundation Setup
*Priority: 1 | Establish core digital infrastructure*

### Feature 1.1: Domain and Email Infrastructure
- **User Story**: Purchase ai-whisperers.com domain (1 point)
- **User Story**: Set up Google Workspace (2 points)
- **User Story**: Configure DNS records (2 points)

### Feature 1.2: Website Deployment
- **User Story**: Create Vercel account (1 point)
- **User Story**: Deploy Next.js website to Vercel (3 points)
- **User Story**: Configure custom domain (2 points)
- **User Story**: Test website functionality (3 points)

## 🤖 Epic 2: Business Automation Platform
*Priority: 1 | AI-powered business automation systems*

### Feature 2.1: Scheduling and Calendar Automation
- **User Story**: Set up Cal.com account (2 points)
- **User Story**: Configure booking types (3 points)
- **User Story**: Integrate with Google Calendar (2 points)

### Feature 2.2: Workflow Automation
- **User Story**: Create Make.com account (1 point)
- **User Story**: Build contact form automation (5 points)
- **User Story**: Create lead qualification workflow (8 points)
- **User Story**: Set up client onboarding automation (5 points)

## 💼 Epic 3: Client Acquisition System
*Priority: 2 | Systematic client management*

### Feature 3.1: CRM Implementation
- **User Story**: Set up HubSpot CRM (3 points)
- **User Story**: Import existing contacts (2 points)
- **User Story**: Configure sales pipeline (3 points)
- **User Story**: Create email templates (5 points)

### Feature 3.2: Service Packaging
- **User Story**: Create Tier 1 package - Web Development (5 points)
- **User Story**: Create Tier 2 package - AI Integration (5 points)
- **User Story**: Create Tier 3 package - AI Transformation (5 points)
- **User Story**: Build pricing calculator (8 points)

## 🏢 Epic 4: Legal and Financial Infrastructure
*Priority: 2 | Business entity and financial systems*

### Feature 4.1: Business Entity Formation
- **User Story**: Register LLC (3 points)
- **User Story**: Obtain EIN (2 points)
- **User Story**: Create operating agreement (5 points)
- **User Story**: Register for state taxes (3 points)

### Feature 4.2: Financial Systems
- **User Story**: Open business bank account (2 points)
- **User Story**: Set up FreshBooks accounting (3 points)
- **User Story**: Create invoice templates (3 points)
- **User Story**: Configure Stripe payments (5 points)

## 🎨 Epic 5: Professional Assets and Branding
*Priority: 3 | Brand identity and marketing*

### Feature 5.1: Brand Identity
- **User Story**: Design logo (5 points)
- **User Story**: Create brand guidelines (3 points)
- **User Story**: Design business cards (2 points)
- **User Story**: Update social media profiles (2 points)

### Feature 5.2: Marketing Materials
- **User Story**: Create proposal templates (8 points)
- **User Story**: Build case study template (5 points)
- **User Story**: Design presentation deck (5 points)

---

## 📋 Kanban Board Configuration

### Step 1: Access Board Settings
1. Navigate to: https://dev.azure.com/aiwhisperer/Business%20Setup/_boards/board
2. Click the gear icon (⚙️) in the top right for "Board settings"

### Step 2: Configure Columns
Set up these columns with WIP (Work In Progress) limits:

| Column | WIP Limit | Description |
|--------|-----------|-------------|
| **New** | 10 | Newly created items |
| **Active** | 5 | Currently being worked on |
| **Testing** | 3 | Under review/testing |
| **Resolved** | - | Completed, pending closure |
| **Closed** | - | Fully completed |

### Step 3: Configure Swim Lanes
Create horizontal swim lanes for priority management:

1. **Expedite** - For urgent/blocking items
2. **Standard** - Default lane for regular work

### Step 4: Card Display Settings
Configure cards to show:
- ✓ Assigned To
- ✓ Story Points
- ✓ Priority
- ✓ Tags
- ✓ ID

### Step 5: Enable Advanced Features
- ✓ **Split columns** - Show Doing/Done sub-columns
- ✓ **Card reordering** - Drag and drop prioritization
- ✓ **Card aging** - Highlight stale items (>3 days)
- ✓ **Annotations** - Show GitHub links

### Step 6: Configure Styles
1. **Tag Colors**:
   - `high-priority` → Red
   - `automation` → Blue
   - `infrastructure` → Green
   - `client-facing` → Purple

2. **Card Aging**:
   - 0-2 days: Normal
   - 3-5 days: Light yellow
   - 5+ days: Orange/Red

---

## 🚀 Manual Creation Steps

Since the API automation encountered authentication issues, here's how to manually create the backlog:

### Quick Add Method (Recommended)
1. Go to: https://dev.azure.com/aiwhisperer/Business%20Setup/_backlogs/backlog
2. Click "New Work Item" → "Epic"
3. Use the bulk add feature (Excel-like grid) for faster entry

### Using Excel Import
1. Download the template from Azure DevOps
2. Use the provided structure above to fill in:
   - Work Item Type
   - Title
   - Description
   - Story Points
   - Priority
3. Import back to Azure DevOps

### Keyboard Shortcuts for Speed
- `Ctrl + Shift + N` - New work item
- `Ctrl + Enter` - Save and create another
- `Tab` - Navigate between fields

---

## 📈 Sprint Planning Recommendations

### Sprint 1 (Week 1-2): Foundation
- Domain and Email Infrastructure (5 points)
- Website Deployment (9 points)
- **Total: 14 points**

### Sprint 2 (Week 3-4): Automation
- Scheduling Setup (7 points)
- Basic Workflow Automation (6 points)
- **Total: 13 points**

### Sprint 3 (Week 5-6): Client Systems
- CRM Implementation (13 points)
- Service Package Definition (8 points)
- **Total: 21 points**

---

## 🔧 Troubleshooting

### If PAT Token Issues Persist:
1. Generate new PAT at: https://dev.azure.com/aiwhisperer/_usersSettings/tokens
2. Required permissions:
   - Work Items (Read, Write, Manage)
   - Project and Team (Read)
   - Analytics (Read)

### Alternative Creation Methods:
1. **Azure DevOps CLI** (if installed):
   ```bash
   az boards work-item create --type Epic --title "Digital Foundation Setup"
   ```

2. **REST API via Postman**:
   - Import the Azure DevOps Postman collection
   - Use Basic Auth with PAT token

3. **Azure DevOps Extension for VS Code**:
   - Install from marketplace
   - Connect with PAT token
   - Create items from IDE

---

## ✅ Verification Checklist

After setup, verify:
- [ ] All 5 Epics are created
- [ ] All 10 Features are linked to Epics
- [ ] All 48 User Stories have story points
- [ ] Kanban board shows proper columns
- [ ] WIP limits are enforced
- [ ] Cards display required fields
- [ ] Swim lanes are configured

---

## 📞 Support Resources

- **Azure DevOps Documentation**: https://docs.microsoft.com/azure/devops
- **Community Forum**: https://developercommunity.visualstudio.com/spaces/21/index.html
- **Video Tutorial**: [Kanban Board Setup](https://www.youtube.com/watch?v=example)

---

**Generated**: 2025-08-13
**Project**: AI-Whisperers Business Setup
**Total Estimated Effort**: 142 Story Points (~6-8 weeks)