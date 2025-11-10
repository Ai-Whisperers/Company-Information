# AI-Whisperers Org OS (Company-Information) MVP

A modern web-based control plane for managing the AI-Whisperers organization's repositories, providing automated health monitoring, Azure DevOps synchronization, and documentation governance.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Ai-Whisperers/Company-Information.git
cd Company-Information

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
cd services/jobs
npx prisma migrate dev
npx prisma generate

# Start development servers
npm run dev  # Runs both dashboard (port 3000) and jobs service (port 4000)
```

Visit http://localhost:3000 to access the dashboard.

## 📊 Features

### MVP Core Features

#### 1. **Org Pulse Report** ✅
- Weekly automated health reports
- Repository activity metrics
- Top contributor tracking
- Markdown and HTML output formats
- Historical report storage

#### 2. **ADO↔GitHub Linker** ✅
- Bidirectional work item linking
- Automatic PR/commit parsing for work item IDs
- Drift detection with <10 minute SLO
- Automatic repair mode for broken links

#### 3. **Documentation Gate** ✅
- CI checks for required documentation
- Template-based bootstrapping
- Label-triggered PR generation
- Configurable documentation policies

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│    Next.js Dashboard (3000)     │ ← User Interface
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│   NestJS Jobs Service (4000)    │ ← Backend API
└────────────┬────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌─────────┐     ┌──────────┐
│ Postgres│     │  Redis   │
└─────────┘     └──────────┘
```

## 📁 Project Structure

```
company-information/
├── apps/
│   └── dashboard/          # Next.js web dashboard
├── services/
│   └── jobs/              # NestJS backend service
├── automation/
│   ├── github-actions/    # CI/CD workflows
│   └── n8n-workflows/     # n8n repository monitoring
├── templates/             # Documentation templates
├── reports/              # Generated reports
├── scripts/              # Legacy PowerShell scripts
└── package.json          # Monorepo root
```

## 🔧 Configuration

### Required Environment Variables

```bash
# GitHub
GITHUB_TOKEN=            # Personal access token with repo, workflow scopes
GITHUB_ORG=Ai-Whisperers

# Azure DevOps
AZURE_DEVOPS_PAT=        # Personal access token
AZURE_DEVOPS_ORG=        # Your ADO organization
AZURE_DEVOPS_PROJECT=    # Your ADO project

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/orgos_db

# Authentication
NEXTAUTH_SECRET=         # Min 32 characters
GITHUB_CLIENT_ID=        # OAuth App ID
GITHUB_CLIENT_SECRET=    # OAuth App Secret
```

See `.env.example` for complete configuration options.

## 📝 Development

### Running Services

```bash
# Dashboard only
npm run dev:dashboard

# Jobs service only
npm run dev:jobs

# Both services
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run typecheck
```

### Database Management

```bash
cd services/jobs

# Create migration
npx prisma migrate dev --name your_migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio
```

### Adding New Features

1. **Scanner**: Add to `services/jobs/src/scanners/`
2. **API Endpoint**: Add to appropriate module in `services/jobs/src/`
3. **Dashboard Page**: Add to `apps/dashboard/app/`
4. **GitHub Action**: Add to `automation/github-actions/`

## 🚢 Deployment

### Production Deployment

```bash
# Build all services
npm run build

# Deploy dashboard to Vercel
npm run deploy:dashboard

# Deploy jobs service (Docker)
cd services/jobs
docker build -t org-os-jobs .
docker run -p 4000:4000 org-os-jobs
```

### GitHub Actions Setup

1. Add these secrets to your repository:
   - `GITHUB_TOKEN`
   - `AZURE_DEVOPS_PAT`
   - `JOBS_API_KEY`
   - `SLACK_WEBHOOK_URL` (optional)

2. Enable GitHub Actions workflows

3. The following will run automatically:
   - Weekly Org Pulse (Mondays 9 AM)
   - Daily health scans (2 AM)
   - ADO sync (every 6 hours)
   - Docs gate (on every PR)

### n8n Workflow Setup

For advanced repository monitoring with n8n:

```bash
# See detailed setup guide
cd automation/n8n-workflows
cat QUICKSTART.md
```

The n8n workflow provides:
- Automated monitoring of all 25 repositories every 6 hours
- Health score calculation (0-100) for each repository
- Alert detection for stale PRs, high issues, and inactive repos
- Multi-channel notifications (Slack, Email, Database)
- Historical tracking and trend analysis

See [n8n-workflows/README.md](automation/n8n-workflows/README.md) for full documentation.

## 📊 API Documentation

### Dashboard API
- `GET /api/health` - Health check
- `GET /api/repos` - List repositories
- `GET /api/reports/:id` - Get specific report

### Jobs Service API
- `POST /api/scanners/health/trigger` - Trigger health scan
- `POST /api/sync/ado-github/trigger` - Trigger ADO sync
- `POST /api/reporters/org-pulse/generate` - Generate report
- `GET /api/reports/org-pulse/:week` - Get weekly report

Full API documentation available at http://localhost:4000/api when running locally.

## 🔍 Monitoring

### Health Metrics
- Repository health scores (0-100)
- Stale PR detection
- Branch protection status
- Activity tracking

### Performance Targets
- Dashboard load: <1.5s (P95)
- Weekly scan: <8 minutes
- ADO sync lag: <10 minutes
- Report generation: <15 minutes

## 🐛 Troubleshooting

### Common Issues

**Database connection failed**
```bash
# Check PostgreSQL is running
pg_isready

# Verify connection string
psql $DATABASE_URL
```

**GitHub API rate limited**
```bash
# Check rate limit status
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/rate_limit
```

**ADO sync not working**
- Verify PAT has work item read/write permissions
- Check organization and project names are correct
- Ensure work items use standard ID patterns (#123, WI123)

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Related Repositories

- [Comment-Analyzer](https://github.com/Ai-Whisperers/Comment-Analyzer)
- [AI-Investment](https://github.com/Ai-Whisperers/AI-Investment)
- [clockify-ADO-automated-report](https://github.com/Ai-Whisperers/clockify-ADO-automated-report)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Ai-Whisperers/Company-Information/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Ai-Whisperers/Company-Information/discussions)
- **Email**: support@ai-whisperers.com

---

Built with ❤️ by AI-Whisperers Team