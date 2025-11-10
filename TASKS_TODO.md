# Company-Information Org OS - Tasks & Stories

**Last Updated:** 2025-11-05
**Status:** Pre-Production Setup
**Target:** Production Ready

---

## 🎯 Epic: Production Readiness

### Story 1: Database Setup & Migration
**Priority:** P0 - Critical
**Estimate:** 30 minutes
**Dependencies:** None

**Tasks:**
- [ ] Install PostgreSQL locally or use Docker
  ```bash
  docker run -d --name postgres-orgos \
    -e POSTGRES_USER=orgos \
    -e POSTGRES_PASSWORD=secure_password \
    -e POSTGRES_DB=orgos_db \
    -p 5432:5432 \
    postgres:15
  ```
- [ ] Update `.env` with correct DATABASE_URL
- [ ] Navigate to `services/jobs` directory
- [ ] Run `npx prisma migrate dev` to apply all migrations
- [ ] Run `npx prisma generate` to generate Prisma Client
- [ ] Verify with `npx prisma studio` - should see all tables

**Acceptance Criteria:**
- ✅ Database is running and accessible
- ✅ All 10 models visible in Prisma Studio
- ✅ `repository_scans` table exists with correct schema
- ✅ Indexes are created

---

### Story 2: GitHub Token Configuration
**Priority:** P0 - Critical
**Estimate:** 15 minutes
**Dependencies:** None

**Tasks:**
- [ ] Go to GitHub.com → Settings → Developer Settings
- [ ] Create Personal Access Token (Classic)
- [ ] Set token name: `AI-Whisperers Org OS`
- [ ] Set expiration: 90 days (or No expiration for production)
- [ ] Select scopes:
  - [x] `repo` (Full control)
  - [x] `read:org` (Read organization data)
  - [x] `workflow` (Update GitHub Action workflows)
- [ ] Copy token (format: `ghp_xxxxxxxxxxxxxxxxxxxx`)
- [ ] Add to `.env` file:
  ```bash
  GITHUB_TOKEN=ghp_your_token_here
  GITHUB_PAT=ghp_your_token_here  # Fallback
  GITHUB_ORG=Ai-Whisperers
  ```
- [ ] Test token:
  ```bash
  curl -H "Authorization: Bearer ghp_your_token" \
    https://api.github.com/orgs/Ai-Whisperers/repos
  ```

**Acceptance Criteria:**
- ✅ Token has correct scopes
- ✅ Token works with GitHub API
- ✅ Environment variable is set
- ✅ Can fetch organization repositories

---

### Story 3: Azure DevOps Integration Setup
**Priority:** P1 - High
**Estimate:** 20 minutes
**Dependencies:** None

**Tasks:**
- [ ] Go to Azure DevOps → User Settings → Personal Access Tokens
- [ ] Create new PAT with scopes:
  - [x] Work Items (Read, Write)
  - [x] Project and Team (Read)
- [ ] Copy token
- [ ] Add to `.env`:
  ```bash
  AZURE_DEVOPS_PAT=your_ado_pat_here
  AZURE_DEVOPS_ORG=aiwhisperer
  AZURE_DEVOPS_PROJECT=Business Setup
  AZURE_DEVOPS_BASE_URL=https://dev.azure.com/aiwhisperer
  ```
- [ ] Test ADO sync service
- [ ] Enable feature flag: `ENABLE_ADO_SYNC=true`

**Acceptance Criteria:**
- ✅ PAT has correct permissions
- ✅ Can connect to Azure DevOps API
- ✅ Organization and project exist
- ✅ Sync service can read work items

---

### Story 4: Jobs Service Startup & Verification
**Priority:** P0 - Critical
**Estimate:** 15 minutes
**Dependencies:** Story 1, Story 2

**Tasks:**
- [ ] Navigate to `services/jobs`
- [ ] Install dependencies: `npm install`
- [ ] Verify `.env` file has all required variables
- [ ] Start service: `npm run start:dev`
- [ ] Verify service starts without errors
- [ ] Test health endpoint:
  ```bash
  curl http://localhost:4000/api/health
  ```
- [ ] Test repository monitor endpoint:
  ```bash
  curl http://localhost:4000/api/repository-monitor/summary
  ```
- [ ] Check logs for any errors
- [ ] Verify Redis connection (if using job queues)

**Acceptance Criteria:**
- ✅ Service starts on port 4000
- ✅ Health endpoint returns 200
- ✅ No errors in console logs
- ✅ Database connection successful
- ✅ All modules load correctly

---

### Story 5: Dashboard Startup & Configuration
**Priority:** P0 - Critical
**Estimate:** 10 minutes
**Dependencies:** Story 4

**Tasks:**
- [ ] Navigate to `apps/dashboard`
- [ ] Install dependencies: `npm install`
- [ ] Verify `.env.local` exists with:
  ```bash
  NEXT_PUBLIC_API_URL=http://localhost:4000
  ```
- [ ] Start dashboard: `npm run dev`
- [ ] Verify dashboard loads at http://localhost:3000
- [ ] Navigate to http://localhost:3000/repository-health
- [ ] Verify page loads (may show "Loading..." if no data yet)
- [ ] Check browser console for errors

**Acceptance Criteria:**
- ✅ Dashboard runs on port 3000
- ✅ Main page loads without errors
- ✅ Repository Health page loads
- ✅ API connection configured correctly
- ✅ No console errors

---

### Story 6: n8n Workflow Setup
**Priority:** P0 - Critical
**Estimate:** 20 minutes
**Dependencies:** Story 2, Story 4

**Tasks:**
- [ ] Start n8n:
  ```bash
  docker run -d --name n8n \
    -p 5678:5678 \
    -e GITHUB_TOKEN=ghp_your_token \
    -v n8n_data:/home/node/.n8n \
    n8nio/n8n
  ```
- [ ] Access n8n at http://localhost:5678
- [ ] Create account (first time setup)
- [ ] Import workflow from `automation/n8n-workflows/ai-whisperers-repo-monitor-dashboard.json`
- [ ] Configure GitHub credentials in workflow:
  - Click "Fetch All Organization Repos" node
  - Add Header Auth credential
  - Name: `Authorization`
  - Value: `Bearer ghp_your_token`
- [ ] Save workflow
- [ ] Execute workflow manually (test run)
- [ ] Verify all nodes execute successfully
- [ ] Check Jobs Service received data
- [ ] Activate workflow (toggle switch)

**Acceptance Criteria:**
- ✅ n8n is running and accessible
- ✅ Workflow imported successfully
- ✅ GitHub credentials configured
- ✅ Test execution completes without errors
- ✅ Data sent to Jobs Service API
- ✅ Workflow is active for automatic runs

---

### Story 7: First Data Collection & Verification
**Priority:** P0 - Critical
**Estimate:** 30 minutes
**Dependencies:** Story 6

**Tasks:**
- [ ] Execute n8n workflow manually
- [ ] Wait for completion (~1-2 minutes for 25 repos)
- [ ] Check n8n execution log for success
- [ ] Verify Jobs Service logs show incoming requests
- [ ] Check database for new records:
  ```bash
  cd services/jobs
  npx prisma studio
  # Open repository_scans table
  # Should see 25 entries
  ```
- [ ] Test API endpoints:
  ```bash
  # Summary
  curl http://localhost:4000/api/repository-monitor/summary

  # Latest scans
  curl http://localhost:4000/api/repository-monitor/scans/latest

  # Alerts
  curl http://localhost:4000/api/repository-monitor/alerts
  ```
- [ ] Refresh dashboard at http://localhost:3000/repository-health
- [ ] Verify data displays correctly

**Acceptance Criteria:**
- ✅ n8n workflow completes successfully
- ✅ 25 repository scans in database
- ✅ API returns valid data
- ✅ Dashboard displays all repositories
- ✅ Health scores calculated
- ✅ Alerts shown (if any repos need attention)

---

## 🔧 Epic: Configuration & Optimization

### Story 8: Security & Secrets Management
**Priority:** P1 - High
**Estimate:** 30 minutes
**Dependencies:** All setup stories

**Tasks:**
- [ ] Verify `.env` is in `.gitignore`
- [ ] Review `.env.example` for completeness
- [ ] Add missing variables to `.env.example`
- [ ] Document all environment variables in README
- [ ] Set up GitHub Secrets for CI/CD:
  - `GITHUB_TOKEN`
  - `AZURE_DEVOPS_PAT`
  - `JOBS_API_KEY`
  - `DATABASE_URL` (for production)
- [ ] Configure API key authentication for Jobs Service
- [ ] Enable CORS only for dashboard domain
- [ ] Review and update allowed origins

**Acceptance Criteria:**
- ✅ No secrets in version control
- ✅ `.env.example` is complete
- ✅ GitHub Secrets configured
- ✅ API authentication enabled
- ✅ CORS properly configured

---

### Story 9: Health Score Threshold Tuning
**Priority:** P2 - Medium
**Estimate:** 1 hour
**Dependencies:** Story 7

**Tasks:**
- [ ] Review current health scores across all repos
- [ ] Analyze which repositories are flagged incorrectly
- [ ] Adjust thresholds in n8n workflow code:
  ```javascript
  // Current penalties:
  if (commits.length === 0) healthScore -= 20;
  if (stalePRs.length > 0) healthScore -= (stalePRs.length * 10);
  if (issues.length > 10) healthScore -= 15;
  if (branches.length > 20) healthScore -= 10;
  ```
- [ ] Test with different values
- [ ] Document final thresholds
- [ ] Update workflow in n8n
- [ ] Run test execution
- [ ] Verify scores are more accurate

**Acceptance Criteria:**
- ✅ Health scores accurately reflect repository health
- ✅ False positives minimized
- ✅ Thresholds documented
- ✅ Team agrees with scoring logic

---

### Story 10: Notification Setup (Slack)
**Priority:** P2 - Medium
**Estimate:** 30 minutes
**Dependencies:** Story 7

**Tasks:**
- [ ] Create Slack App at https://api.slack.com/apps
- [ ] Enable Incoming Webhooks
- [ ] Add webhook to workspace
- [ ] Select channel for notifications
- [ ] Copy webhook URL
- [ ] Add to `.env`:
  ```bash
  SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
  ```
- [ ] Enable "Send Slack Notification" node in n8n workflow
- [ ] Customize Slack message format
- [ ] Test notification
- [ ] Set up alert rules (only for critical issues)

**Acceptance Criteria:**
- ✅ Slack app created and configured
- ✅ Webhook working
- ✅ Notifications sent to correct channel
- ✅ Message format is clear and actionable
- ✅ Not too noisy (filter to important alerts only)

---

### Story 11: GitHub Actions Integration
**Priority:** P2 - Medium
**Estimate:** 45 minutes
**Dependencies:** Story 4

**Tasks:**
- [ ] Review existing GitHub Actions in `.github/workflows/`
- [ ] Enable workflows:
  - `schedule.yml` - Automated scans
  - `docs-check.yml` - Documentation validation
- [ ] Update workflow files with correct secrets
- [ ] Test documentation gate on a test PR
- [ ] Verify scheduled workflows run correctly
- [ ] Set up workflow notifications
- [ ] Create GitHub Action for deployment

**Acceptance Criteria:**
- ✅ All GitHub Actions enabled
- ✅ Scheduled workflows execute
- ✅ Documentation gate blocks PRs without docs
- ✅ Notifications working
- ✅ No workflow failures

---

## 📊 Epic: Testing & Quality Assurance

### Story 12: Integration Testing
**Priority:** P1 - High
**Estimate:** 2 hours
**Dependencies:** Story 7

**Tasks:**
- [ ] Navigate to `services/jobs`
- [ ] Run existing tests: `npm test`
- [ ] Review test failures and fix
- [ ] Add tests for repository-monitor module:
  - Controller tests
  - Service tests
  - E2E tests
- [ ] Set up test database
- [ ] Mock GitHub API calls in tests
- [ ] Run test suite
- [ ] Achieve >80% code coverage

**Acceptance Criteria:**
- ✅ All existing tests pass
- ✅ New tests for repository monitoring
- ✅ >80% code coverage
- ✅ Tests run in CI/CD
- ✅ No flaky tests

---

### Story 13: End-to-End Testing
**Priority:** P2 - Medium
**Estimate:** 3 hours
**Dependencies:** Story 7, Story 12

**Tasks:**
- [ ] Navigate to `e2e/` or `tests/` directory
- [ ] Set up Playwright test environment
- [ ] Write E2E tests:
  - Dashboard loads and displays data
  - Navigation between pages
  - Search and filter functionality
  - API integration
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Fix any failures
- [ ] Add to CI/CD pipeline

**Acceptance Criteria:**
- ✅ E2E tests cover main user flows
- ✅ All tests pass
- ✅ Tests run in headless mode
- ✅ Screenshots captured on failure
- ✅ Integrated into CI/CD

---

### Story 14: Performance Testing & Optimization
**Priority:** P2 - Medium
**Estimate:** 2 hours
**Dependencies:** Story 7

**Tasks:**
- [ ] Measure current performance:
  - Dashboard load time
  - API response times
  - n8n workflow execution time
  - Database query performance
- [ ] Identify bottlenecks
- [ ] Optimize slow queries (add indexes if needed)
- [ ] Implement API response caching
- [ ] Optimize dashboard rendering
- [ ] Test with 50+ repositories
- [ ] Document performance metrics

**Acceptance Criteria:**
- ✅ Dashboard loads in <2s
- ✅ API responds in <500ms
- ✅ Workflow completes in <2 minutes
- ✅ Database queries optimized
- ✅ Performance targets met

---

## 📚 Epic: Documentation & Training

### Story 15: User Documentation
**Priority:** P1 - High
**Estimate:** 2 hours
**Dependencies:** Story 7

**Tasks:**
- [ ] Update main README.md with:
  - Updated architecture diagram
  - Complete feature list
  - Setup instructions
  - Usage examples
- [ ] Create USER_GUIDE.md:
  - How to read the dashboard
  - Understanding health scores
  - Responding to alerts
  - Interpreting trends
- [ ] Add screenshots to documentation
- [ ] Create video walkthrough (optional)
- [ ] Document common workflows
- [ ] Add FAQ section

**Acceptance Criteria:**
- ✅ README is comprehensive and up-to-date
- ✅ User guide covers all features
- ✅ Screenshots are clear
- ✅ New users can understand without help
- ✅ FAQ covers common questions

---

### Story 16: API Documentation
**Priority:** P2 - Medium
**Estimate:** 1 hour
**Dependencies:** Story 4

**Tasks:**
- [ ] Install Swagger/OpenAPI for NestJS:
  ```bash
  npm install @nestjs/swagger swagger-ui-express
  ```
- [ ] Add Swagger decorators to repository-monitor controller
- [ ] Configure Swagger in main.ts
- [ ] Test at http://localhost:4000/api
- [ ] Document all endpoints:
  - Request/response examples
  - Error codes
  - Authentication requirements
- [ ] Export OpenAPI spec

**Acceptance Criteria:**
- ✅ Swagger UI accessible
- ✅ All endpoints documented
- ✅ Examples are clear
- ✅ Can test endpoints from UI
- ✅ OpenAPI spec exported

---

### Story 17: Runbook & Troubleshooting Guide
**Priority:** P1 - High
**Estimate:** 2 hours
**Dependencies:** All stories

**Tasks:**
- [ ] Create RUNBOOK.md:
  - Service startup procedures
  - Shutdown procedures
  - Restart procedures
  - Health check procedures
- [ ] Document common issues:
  - Database connection failures
  - GitHub API rate limits
  - n8n workflow errors
  - Dashboard loading issues
- [ ] Add troubleshooting steps for each
- [ ] Document monitoring procedures
- [ ] Create incident response guide
- [ ] Add contact information

**Acceptance Criteria:**
- ✅ Runbook covers all operational procedures
- ✅ Common issues documented with solutions
- ✅ Clear step-by-step instructions
- ✅ Contact information included
- ✅ Tested by someone unfamiliar with the system

---

## 🚀 Epic: Production Deployment

### Story 18: Dependency Updates & Security Patches
**Priority:** P0 - Critical
**Estimate:** 3 hours
**Dependencies:** Story 12, Story 13

**Tasks:**
- [ ] Run security audit:
  ```bash
  npm audit
  ```
- [ ] Review 5 known vulnerabilities
- [ ] Update vulnerable packages:
  ```bash
  npm audit fix
  ```
- [ ] Update major version dependencies:
  ```bash
  npm outdated
  npm update
  ```
- [ ] Test after each major update
- [ ] Run full test suite
- [ ] Update package-lock.json
- [ ] Document breaking changes

**Acceptance Criteria:**
- ✅ Zero high/critical vulnerabilities
- ✅ All dependencies updated
- ✅ Tests pass after updates
- ✅ No breaking changes in production
- ✅ package-lock.json committed

---

### Story 19: Docker Containerization
**Priority:** P1 - High
**Estimate:** 3 hours
**Dependencies:** Story 18

**Tasks:**
- [ ] Create `Dockerfile` for Jobs Service:
  ```dockerfile
  FROM node:18-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci --only=production
  COPY . .
  RUN npx prisma generate
  CMD ["npm", "run", "start:prod"]
  ```
- [ ] Create `Dockerfile` for Dashboard
- [ ] Create `docker-compose.yml` for full stack:
  - PostgreSQL
  - Redis
  - Jobs Service
  - Dashboard
  - n8n
- [ ] Test Docker build
- [ ] Test Docker Compose deployment
- [ ] Document Docker deployment

**Acceptance Criteria:**
- ✅ Docker images build successfully
- ✅ Docker Compose brings up full stack
- ✅ Services communicate correctly
- ✅ Data persists across restarts
- ✅ Documentation updated

---

### Story 20: CI/CD Pipeline Setup
**Priority:** P1 - High
**Estimate:** 2 hours
**Dependencies:** Story 12, Story 13, Story 19

**Tasks:**
- [ ] Create `.github/workflows/ci.yml`:
  - Run tests on every PR
  - Build Docker images
  - Run linters
  - Check code coverage
- [ ] Create `.github/workflows/cd.yml`:
  - Deploy on merge to main
  - Tag releases
  - Push Docker images to registry
- [ ] Set up GitHub Container Registry
- [ ] Configure deployment secrets
- [ ] Test CI/CD pipeline
- [ ] Document deployment process

**Acceptance Criteria:**
- ✅ CI runs on every PR
- ✅ CD deploys on merge to main
- ✅ Docker images pushed to registry
- ✅ All checks pass
- ✅ Automated deployment works

---

### Story 21: Production Environment Setup
**Priority:** P0 - Critical
**Estimate:** 4 hours
**Dependencies:** Story 19, Story 20

**Tasks:**
- [ ] Choose hosting platform (AWS, Azure, GCP, or Vercel/Heroku)
- [ ] Set up production PostgreSQL database
- [ ] Set up production Redis instance
- [ ] Deploy Jobs Service
- [ ] Deploy Dashboard
- [ ] Deploy n8n (or use n8n Cloud)
- [ ] Configure environment variables
- [ ] Set up SSL/TLS certificates
- [ ] Configure domain names
- [ ] Test production deployment
- [ ] Set up monitoring and logging

**Acceptance Criteria:**
- ✅ All services running in production
- ✅ HTTPS enabled
- ✅ Domain names configured
- ✅ Environment variables secure
- ✅ Can access dashboard publicly (if desired)
- ✅ Monitoring in place

---

### Story 22: Monitoring & Alerting Setup
**Priority:** P1 - High
**Estimate:** 2 hours
**Dependencies:** Story 21

**Tasks:**
- [ ] Set up application monitoring (e.g., Datadog, New Relic, or Grafana)
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Create dashboards for:
  - Service health
  - API performance
  - Database performance
  - n8n workflow executions
- [ ] Configure alerts for:
  - Service downtime
  - High error rates
  - API failures
  - Database issues
- [ ] Test alerting

**Acceptance Criteria:**
- ✅ Monitoring tools configured
- ✅ Dashboards created
- ✅ Alerts configured and tested
- ✅ Team receives notifications
- ✅ Historical data collected

---

### Story 23: Backup & Recovery Procedures
**Priority:** P1 - High
**Estimate:** 2 hours
**Dependencies:** Story 21

**Tasks:**
- [ ] Set up automated database backups:
  ```bash
  # Daily backup cron
  0 2 * * * pg_dump orgos_db > /backups/backup_$(date +\%Y\%m\%d).sql
  ```
- [ ] Configure backup retention (30 days)
- [ ] Test database restore procedure
- [ ] Backup n8n workflows (export JSON)
- [ ] Backup environment configurations
- [ ] Document disaster recovery procedures
- [ ] Create backup restore scripts
- [ ] Test full recovery scenario

**Acceptance Criteria:**
- ✅ Automated backups running daily
- ✅ Backups stored securely
- ✅ Restore procedure documented
- ✅ Recovery tested successfully
- ✅ RTO/RPO documented

---

## 🎓 Epic: Team Onboarding

### Story 24: Team Training & Handoff
**Priority:** P1 - High
**Estimate:** 3 hours
**Dependencies:** Story 15, Story 16, Story 17

**Tasks:**
- [ ] Schedule team walkthrough session
- [ ] Prepare demo:
  - Dashboard features
  - How to read metrics
  - Responding to alerts
  - Running reports
- [ ] Walk through:
  - Architecture overview
  - How to deploy changes
  - How to add new features
  - Troubleshooting common issues
- [ ] Answer questions
- [ ] Share documentation
- [ ] Assign team members to monitor specific repos
- [ ] Create support channel (Slack/Teams)

**Acceptance Criteria:**
- ✅ Team understands system architecture
- ✅ Team can use dashboard effectively
- ✅ Team knows how to respond to alerts
- ✅ Team can troubleshoot basic issues
- ✅ Support channel created

---

### Story 25: Ongoing Maintenance Plan
**Priority:** P2 - Medium
**Estimate:** 1 hour
**Dependencies:** Story 24

**Tasks:**
- [ ] Create MAINTENANCE.md:
  - Daily checks
  - Weekly reviews
  - Monthly tasks
  - Quarterly reviews
- [ ] Set up calendar reminders:
  - Daily: Check dashboard for alerts
  - Weekly: Review health trends
  - Monthly: Update dependencies
  - Quarterly: Review and tune thresholds
- [ ] Assign responsibilities
- [ ] Document escalation procedures
- [ ] Create maintenance checklist

**Acceptance Criteria:**
- ✅ Maintenance plan documented
- ✅ Responsibilities assigned
- ✅ Calendar reminders set
- ✅ Escalation procedures clear
- ✅ Team understands ongoing requirements

---

## 📋 Summary Checklist

### Pre-Production (Must Complete)
- [ ] Story 1: Database Setup
- [ ] Story 2: GitHub Token
- [ ] Story 3: Azure DevOps Setup
- [ ] Story 4: Jobs Service Startup
- [ ] Story 5: Dashboard Startup
- [ ] Story 6: n8n Workflow Setup
- [ ] Story 7: First Data Collection
- [ ] Story 8: Security & Secrets
- [ ] Story 18: Dependency Updates

### Production Deployment (Must Complete)
- [ ] Story 19: Docker Containerization
- [ ] Story 20: CI/CD Pipeline
- [ ] Story 21: Production Environment
- [ ] Story 22: Monitoring & Alerting
- [ ] Story 23: Backup & Recovery

### Documentation (Must Complete)
- [ ] Story 15: User Documentation
- [ ] Story 17: Runbook

### Nice to Have (Can Do Later)
- [ ] Story 9: Health Score Tuning
- [ ] Story 10: Slack Notifications
- [ ] Story 11: GitHub Actions
- [ ] Story 12: Integration Testing
- [ ] Story 13: E2E Testing
- [ ] Story 14: Performance Testing
- [ ] Story 16: API Documentation
- [ ] Story 24: Team Training
- [ ] Story 25: Maintenance Plan

---

## 🎯 Quick Start Path (2-3 Hours)

**For immediate functionality, complete these stories in order:**

1. **Story 1** - Database Setup (30 min)
2. **Story 2** - GitHub Token (15 min)
3. **Story 4** - Jobs Service (15 min)
4. **Story 5** - Dashboard (10 min)
5. **Story 6** - n8n Workflow (20 min)
6. **Story 7** - First Data Collection (30 min)

**After these 6 stories, you'll have a working system monitoring all 25 repositories!**

---

## 📞 Support

- **Documentation:** See `/automation/n8n-workflows/DASHBOARD_INTEGRATION_GUIDE.md`
- **Issues:** Create GitHub issue with `[Story X]` prefix
- **Questions:** Contact development team

**Total Estimated Time:** ~35-40 hours for complete production deployment
**Minimum Viable Time:** ~2-3 hours for basic working system
