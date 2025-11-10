# Backend Verification Guide

This guide will help you verify that the backend is working properly.

## Quick Health Check

### 1. Check Backend Service Status

```bash
# Check if backend is running on port 4000
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T..."
}
```

### 2. Check Repository Monitor Health

```bash
curl http://localhost:4000/api/repository-monitor/health
```

Expected response:
```json
{
  "total_repositories": 1,
  "healthy_count": 1,
  "needs_attention_count": 0,
  "critical_count": 0,
  "average_health_score": 75,
  "last_scan": "2025-11-06T...",
  "total_commits_today": 5,
  "total_open_prs": 2,
  "total_stale_prs": 1
}
```

### 3. View Latest Scans

```bash
curl http://localhost:4000/api/repository-monitor/scans/latest?limit=5
```

Expected: JSON array with recent repository scans

### 4. Check API Documentation

Open in browser:
```
http://localhost:4000/api
```

You should see Swagger/OpenAPI documentation for all endpoints.

## Database Verification

### Check PostgreSQL Connection

```bash
cd services/jobs
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.\$connect().then(() => console.log('✓ Database connected')).catch(e => console.log('✗ Connection failed:', e.message)).finally(() => p.\$disconnect());"
```

### View Repository Scan Data

```bash
cd services/jobs
npx prisma studio
```

This opens a GUI at http://localhost:5555 where you can:
- Browse all database tables
- View RepositoryScan records
- Edit data directly
- Run queries

### SQL Query to Check Data

```bash
cd services/jobs
npx prisma db execute --stdin <<EOF
SELECT
  "repositoryName",
  "healthScore",
  "openPrs",
  "stalePrs",
  "openIssues",
  "scanTimestamp"
FROM "RepositoryScan"
ORDER BY "scanTimestamp" DESC
LIMIT 10;
EOF
```

## Test All Repository Monitor Endpoints

### 1. Create a Test Scan

```bash
curl -X POST http://localhost:4000/api/repository-monitor/scan \
  -H "Content-Type: application/json" \
  -d '{
    "repository": "verify-test-repo",
    "full_name": "Ai-Whisperers/verify-test-repo",
    "url": "https://github.com/Ai-Whisperers/verify-test-repo",
    "visibility": "public",
    "default_branch": "main",
    "commits_last_6h": 3,
    "open_pull_requests": 1,
    "stale_pull_requests": 0,
    "open_issues": 2,
    "total_branches": 5,
    "health_score": 85,
    "last_updated": "'$(date -Iseconds)'",
    "last_pushed": "'$(date -Iseconds)'",
    "size_kb": 512,
    "stars": 15,
    "watchers": 8,
    "forks": 3,
    "needs_attention": false,
    "has_stale_prs": false,
    "high_issue_count": false,
    "too_many_branches": false,
    "inactive": false,
    "scan_timestamp": "'$(date -Iseconds)'"
  }'
```

Expected: `{"success": true, "scan": {...}}`

### 2. Get Repository Health

```bash
curl http://localhost:4000/api/repository-monitor/repository/verify-test-repo
```

Expected: Health details for the repository

### 3. Get Repository Trends

```bash
curl "http://localhost:4000/api/repository-monitor/trends/verify-test-repo?days=7"
```

Expected: Trend data for the last 7 days

### 4. Get Alerts

```bash
curl "http://localhost:4000/api/repository-monitor/alerts?limit=10"
```

Expected: List of repositories needing attention

### 5. Get Summary

```bash
curl http://localhost:4000/api/repository-monitor/summary
```

Expected: Complete overview including health, alerts, and recent scans

### 6. Get Scan History

```bash
curl "http://localhost:4000/api/repository-monitor/scans/history?days=30&limit=50"
```

Expected: Historical scan data

## Verification Checklist

Mark each item when verified:

- [ ] Backend service is running on port 4000
- [ ] Health endpoint returns OK status
- [ ] API documentation is accessible at /api
- [ ] PostgreSQL database is connected
- [ ] RepositoryScan table exists and has data
- [ ] Can create new scans via POST /scan
- [ ] Can retrieve health overview
- [ ] Can get latest scans
- [ ] Can view repository-specific health
- [ ] Can get trends data
- [ ] Can retrieve alerts
- [ ] All endpoints return valid JSON

## Common Issues and Solutions

### Backend Not Running

```bash
cd services/jobs
npm start
```

### Database Connection Error

Check .env file has correct DATABASE_URL:
```bash
cat services/jobs/.env
```

Should be:
```
DATABASE_URL=postgresql://orgos:orgos_secure_2024@localhost:5432/orgos_db
```

### Port 4000 Already in Use

Find and kill the process:
```bash
# Windows
netstat -ano | findstr :4000
powershell -Command "Stop-Process -Id <PID> -Force"

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

### Prisma Client Not Generated

```bash
cd services/jobs
npx prisma generate
npm run build
```

### Migration Not Applied

```bash
cd services/jobs
npx prisma migrate deploy
```

## Advanced Verification

### Load Test

```bash
# Run 100 concurrent requests
for i in {1..100}; do
  curl -s http://localhost:4000/api/repository-monitor/health &
done
wait
echo "✓ Load test complete"
```

### Monitor Logs

```bash
cd services/jobs
# If running with npm start
tail -f nohup.out

# If running with PM2
pm2 logs org-os-jobs
```

### Check All Database Tables

```bash
cd services/jobs
npx prisma studio
```

Navigate through:
- RepositoryScan
- Repository
- HealthCheck
- Report
- Policy
- PolicyResult

## Performance Benchmarks

Expected response times:
- /health - < 50ms
- /api/repository-monitor/health - < 100ms
- /api/repository-monitor/scans/latest - < 200ms
- POST /api/repository-monitor/scan - < 300ms

Test with:
```bash
time curl http://localhost:4000/api/repository-monitor/health
```

## Next Steps After Verification

Once everything is verified:

1. **Set up n8n workflow** to populate real repository data
   - See: `automation/n8n-workflows/QUICKSTART.md`

2. **Configure dashboard** to display the data
   - Frontend: `apps/dashboard`
   - API integration already configured

3. **Set up monitoring** (optional)
   - Add health checks to your monitoring system
   - Configure alerts for backend downtime

4. **Enable scheduled scans**
   - n8n workflow runs every 6 hours by default
   - Adjust in n8n schedule trigger if needed

## Support

If you encounter issues:
1. Check logs: `services/jobs/logs/`
2. Review error messages
3. Verify environment variables in `.env`
4. Check PostgreSQL is running: `pg_isready`
5. Ensure all dependencies installed: `npm install`
