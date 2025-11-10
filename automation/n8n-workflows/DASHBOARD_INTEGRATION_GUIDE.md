# Repository Health Dashboard - Complete Integration Guide

## Overview

This guide covers the complete setup of the Repository Health Monitoring system with visual dashboard integration.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    n8n Workflow (Every 6h)                   │
│  - Fetches data from all 25 GitHub repositories            │
│  - Calculates health scores and metrics                     │
│  - Sends data to Jobs Service API                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP POST
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              NestJS Jobs Service (Port 4000)                 │
│  REST API Endpoints:                                         │
│  - POST /api/repository-monitor/scan                        │
│  - POST /api/repository-monitor/bulk-scan                   │
│  - GET  /api/repository-monitor/summary                     │
│  - GET  /api/repository-monitor/repository/:name            │
│  - GET  /api/repository-monitor/alerts                      │
│  - GET  /api/repository-monitor/trends/:name                │
└──────────────────────┬──────────────────────────────────────┘
                       │ Prisma ORM
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL / SQLite Database                │
│  Table: repository_scans                                     │
│  - Stores all health metrics                                │
│  - Historical data for trends                               │
│  - Indexed for fast queries                                 │
└─────────────────────────────────────────────────────────────┘
                       ▲
                       │ Fetch Data
                       │
┌─────────────────────────────────────────────────────────────┐
│           Next.js Dashboard (Port 3000)                      │
│  Route: /repository-health                                   │
│  Components:                                                 │
│  - HealthOverview (stats cards)                             │
│  - RepositoryList (filterable grid)                         │
│  - AlertsList (active alerts)                               │
│  - HealthTrends (historical charts)                         │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start (10 Minutes)

### Step 1: Update Database Schema (2 minutes)

```bash
cd services/jobs
npx prisma migrate dev
npx prisma generate
```

### Step 2: Start Services (1 minute)

```bash
# Terminal 1 - Jobs Service
cd services/jobs
npm run start:dev

# Terminal 2 - Dashboard
cd apps/dashboard
npm run dev

# Terminal 3 - n8n (Docker)
docker run -d --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n
```

### Step 3: Import n8n Workflow (2 minutes)

1. Open http://localhost:5678
2. Create account (first time)
3. Import `ai-whisperers-repo-monitor-dashboard.json`
4. Configure GitHub credentials

### Step 4: Test the System (5 minutes)

1. Execute n8n workflow manually
2. Check Jobs Service received data: `http://localhost:4000/api/repository-monitor/summary`
3. View dashboard: `http://localhost:3000/repository-health`

## Complete Installation Guide

### Prerequisites

- Node.js 18+ and npm
- Docker (for n8n and PostgreSQL)
- GitHub Personal Access Token
- Git

### 1. Backend Setup (Jobs Service)

#### A. Install Dependencies

```bash
cd services/jobs
npm install
```

#### B. Configure Environment

Update `.env` file:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/orgos_db"
# or for development:
DATABASE_URL="file:./dev.db"

# GitHub
GITHUB_TOKEN=ghp_your_token_here
GITHUB_ORG=Ai-Whisperers

# Server
PORT=4000
NODE_ENV=development
```

#### C. Run Database Migrations

```bash
# Create and apply migration
npx prisma migrate dev --name add_repository_scans

# Generate Prisma Client
npx prisma generate

# (Optional) View database
npx prisma studio
```

#### D. Start Jobs Service

```bash
npm run start:dev
```

Verify it's running:
```bash
curl http://localhost:4000/api/health
```

### 2. Frontend Setup (Dashboard)

#### A. Install Dependencies

```bash
cd apps/dashboard
npm install
```

#### B. Start Dashboard

```bash
npm run dev
```

Access at: http://localhost:3000

### 3. n8n Workflow Setup

#### A. Start n8n

**Option 1: Docker (Recommended)**
```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e GITHUB_TOKEN=ghp_your_token_here \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n
```

**Option 2: npm**
```bash
npm install -g n8n
export GITHUB_TOKEN=ghp_your_token_here
n8n start
```

#### B. Import Workflow

1. Navigate to http://localhost:5678
2. Click **Workflows** > **Import from File**
3. Select: `automation/n8n-workflows/ai-whisperers-repo-monitor-dashboard.json`
4. Click **Import**

#### C. Configure Credentials

**GitHub Token:**
1. Click on "Fetch All Organization Repos" node
2. Credentials → Create New Credential
3. Type: **Header Auth**
4. Configuration:
   - Name: `Authorization`
   - Value: `Bearer ghp_your_token_here`
5. Save

**Set Environment Variable (Alternative):**
```bash
# In Docker
docker exec -it n8n sh
export GITHUB_TOKEN=ghp_your_token_here

# Or add to .env file in n8n data directory
```

#### D. Test Workflow

1. Click **Execute Workflow** button
2. Watch nodes execute
3. Check each node shows green checkmark
4. Verify output data

Expected results:
- Fetches all 25 repositories
- Calculates metrics for each
- Sends data to Jobs Service
- Returns success responses

#### E. Activate Workflow

1. Toggle **Active** switch (top right)
2. Workflow now runs every 6 hours automatically

### 4. Verify Integration

#### A. Check API Endpoints

```bash
# Get health summary
curl http://localhost:4000/api/repository-monitor/summary

# Get latest scans
curl http://localhost:4000/api/repository-monitor/scans/latest?limit=5

# Get alerts
curl http://localhost:4000/api/repository-monitor/alerts

# Get repository trends
curl http://localhost:4000/api/repository-monitor/trends/Company-Information?days=7
```

#### B. Check Database

```bash
cd services/jobs
npx prisma studio
```

Browse `repository_scans` table - should see entries.

#### C. Check Dashboard

1. Open http://localhost:3000
2. Click **"View Dashboard →"** button on banner
3. Or navigate to http://localhost:3000/repository-health
4. Should see:
   - Overview cards with stats
   - Repository list (25 repos)
   - Alerts (if any)
   - Trend charts

## Dashboard Features

### 1. Health Overview

**Overview Cards:**
- Total Repositories
- Healthy Count
- Needs Attention Count
- Critical Count
- Average Health Score

**Activity Stats:**
- Commits (last 6h)
- Open PRs
- Stale PRs

### 2. Repository List

**Features:**
- Search by repository name
- Filter by status (All, Healthy, Attention, Critical)
- Sort by health, name, or activity
- Visual health score bars
- Quick metrics display
- Direct GitHub links

**Display:**
- Grid layout (3 columns on desktop)
- Color-coded health indicators
- Real-time filtering

### 3. Alerts List

**Shows:**
- Repositories needing attention
- Specific issues (stale PRs, high issues, etc.)
- Severity levels (Critical, Warning, Info)
- Time since last scan
- Direct GitHub links

### 4. Health Trends

**Features:**
- Select any repository
- Choose time period (7, 14, or 30 days)
- Visual health score trend
- Activity metrics over time
- Summary statistics

## API Endpoints Reference

### POST /api/repository-monitor/scan
Send single repository scan data.

**Request Body:**
```json
{
  "repository": "Company-Information",
  "health_score": 85,
  "commits_last_6h": 5,
  "open_pull_requests": 2,
  "stale_pull_requests": 0,
  "open_issues": 8,
  "total_branches": 10,
  "needs_attention": false,
  "scan_timestamp": "2025-11-05T12:00:00Z"
}
```

### POST /api/repository-monitor/bulk-scan
Send all repository scans at once.

**Request Body:**
```json
{
  "scans": [...],
  "summary": {
    "total_repos": 25,
    "healthy_repos": 20,
    "average_health_score": 82
  }
}
```

### GET /api/repository-monitor/summary
Get complete dashboard summary.

**Response:**
```json
{
  "overview": {
    "total_repositories": 25,
    "healthy_count": 20,
    "average_health_score": 82
  },
  "recent_alerts": [...],
  "latest_scans": [...]
}
```

### GET /api/repository-monitor/repository/:name
Get health data for specific repository.

### GET /api/repository-monitor/alerts?limit=10
Get recent alerts.

### GET /api/repository-monitor/trends/:name?days=7
Get health trend data for repository.

## Configuration Options

### n8n Workflow

**Schedule Frequency:**
Edit "Schedule Trigger" node:
```javascript
"hoursInterval": 6  // Change to 1, 12, 24, etc.
```

**Health Score Thresholds:**
Edit "Fetch All Data & Calculate Metrics" node:
```javascript
let healthScore = 100;
if (commits.length === 0) healthScore -= 20;       // Adjust penalties
if (stalePRs.length > 0) healthScore -= (stalePRs.length * 10);
if (issues.length > 10) healthScore -= 15;
if (branches.length > 20) healthScore -= 10;
```

### Dashboard

**Auto-Refresh Interval:**
Edit `apps/dashboard/app/repository-health/page.tsx`:
```typescript
const interval = setInterval(() => {
  fetchHealthData();
}, 5 * 60 * 1000);  // Change 5 to desired minutes
```

**Status Thresholds:**
Edit components to change color thresholds:
```typescript
const getHealthColor = (score: number) => {
  if (score >= 90) return 'green';    // Excellent
  if (score >= 70) return 'yellow';   // Good
  if (score >= 50) return 'orange';   // Needs Attention
  return 'red';                        // Critical
};
```

## Troubleshooting

### Issue: Dashboard shows "Loading..." forever

**Solution:**
1. Check Jobs Service is running: `curl http://localhost:4000/api/health`
2. Check API endpoint: `curl http://localhost:4000/api/repository-monitor/summary`
3. Check browser console for errors (F12)
4. Verify CORS is enabled in Jobs Service

### Issue: n8n workflow fails

**Solution:**
1. Check GitHub token is valid and has correct scopes
2. Verify environment variable: `GITHUB_TOKEN` or `GITHUB_PAT`
3. Check n8n execution log for specific errors
4. Verify Jobs Service is accessible from n8n container

### Issue: No data in database

**Solution:**
1. Run migration: `npx prisma migrate dev`
2. Check Jobs Service logs for errors
3. Manually test API:
   ```bash
   curl -X POST http://localhost:4000/api/repository-monitor/scan \
     -H "Content-Type: application/json" \
     -d '{"repository":"test","health_score":85,...}'
   ```

### Issue: Trends chart shows no data

**Solution:**
1. Wait for multiple scan cycles (6 hours apart)
2. Check database has historical data:
   ```sql
   SELECT COUNT(*) FROM repository_scans;
   ```
3. Verify selected time period has data

## Performance Optimization

### Database Indexes

Already created by migration:
```sql
CREATE INDEX idx_repo_name ON repository_scans(repository_name);
CREATE INDEX idx_scan_time ON repository_scans(scan_timestamp DESC);
CREATE INDEX idx_needs_attention ON repository_scans(needs_attention);
CREATE INDEX idx_health_score ON repository_scans(health_score);
```

### API Response Caching

Add caching in Jobs Service (optional):
```typescript
// In repository-monitor.service.ts
@Cacheable({ ttl: 60 }) // Cache for 60 seconds
async getHealthOverview() {
  // ...
}
```

### Frontend Optimization

- Auto-refresh only when tab is active
- Debounce search input
- Lazy load trend charts
- Paginate repository list for >50 repos

## Production Deployment

### 1. Environment Variables

```bash
# Production .env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/orgos_db
GITHUB_TOKEN=ghp_production_token
ALLOWED_ORIGINS=https://dashboard.ai-whisperers.com
```

### 2. Build Services

```bash
# Jobs Service
cd services/jobs
npm run build
npm run start:prod

# Dashboard
cd apps/dashboard
npm run build
npm start
```

### 3. Docker Compose (Recommended)

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: orgos_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  jobs-service:
    build: ./services/jobs
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/orgos_db
      GITHUB_TOKEN: ${GITHUB_TOKEN}
    depends_on:
      - postgres

  dashboard:
    build: ./apps/dashboard
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://jobs-service:4000

  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      GITHUB_TOKEN: ${GITHUB_TOKEN}
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  postgres_data:
  n8n_data:
```

Deploy:
```bash
docker-compose up -d
```

## Monitoring & Alerts

### Health Checks

```bash
# Jobs Service
curl http://localhost:4000/api/health

# Dashboard
curl http://localhost:3000/api/health

# n8n
curl http://localhost:5678/healthz
```

### Logging

Monitor logs:
```bash
# Jobs Service
tail -f services/jobs/logs/app.log

# Dashboard
tail -f apps/dashboard/.next/server/pages-manifest.json

# n8n (Docker)
docker logs -f n8n
```

### Metrics to Track

- Workflow execution success rate
- API response times
- Database query performance
- Dashboard load times
- Alert notification delivery

## Support & Maintenance

### Regular Tasks

**Daily:**
- Check dashboard for alerts
- Review health scores
- Monitor stale PRs

**Weekly:**
- Review health trends
- Analyze patterns
- Tune thresholds if needed

**Monthly:**
- Database cleanup (archive old scans)
- Review and optimize queries
- Update GitHub token if needed

### Backup Strategy

```bash
# Backup database
pg_dump orgos_db > backup_$(date +%Y%m%d).sql

# Backup n8n workflows
docker exec n8n n8n export:workflow --all --output=/data/backup.json
```

## Next Steps

1. **Enable Slack Notifications:**
   - Get webhook URL
   - Enable node in n8n workflow
   - Test notifications

2. **Add More Metrics:**
   - Security scanning results
   - Code quality scores
   - Dependency updates

3. **Advanced Analytics:**
   - Team productivity dashboard
   - Predictive health modeling
   - Custom alerting rules

4. **Mobile Access:**
   - Responsive design (already included)
   - PWA support
   - Push notifications

---

**Version:** 1.0.0
**Last Updated:** 2025-11-05
**Status:** Production Ready
