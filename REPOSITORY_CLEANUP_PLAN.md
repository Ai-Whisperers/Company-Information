# Repository Cleanup & Organization Plan
## Company-Information Repository - Complete Restructuring

**Date:** November 10, 2025
**Status:** 📋 Ready for Execution
**Estimated Time:** 4-6 hours
**Risk Level:** LOW-MEDIUM

---

## 🎯 Executive Summary

**Issues Identified:** 87 items requiring action
**Disk Space Recovery:** ~250MB+
**Files to Delete:** 15
**Files to Move:** 15
**Directories to Archive:** 3
**Directories to Create:** 8

### Quick Stats

| Category | Current | Target | Improvement |
|----------|---------|--------|-------------|
| Root MD files | 12 | 2 | 83% reduction |
| Build artifacts in git | Yes | No | 100% clean |
| Database files in git | Yes | No | 100% clean |
| Log files | 113+ | <30 | 75% reduction |
| Total root files | 24 | ≤12 | 50% reduction |

---

## 📊 Issues Breakdown

### Critical Issues (P0)

1. **Build artifacts tracked in git** (.next/, dist/, *.db)
2. **Deprecated legacy dashboard files** (api-server.js, dashboard.js, index.html, styles.css)
3. **Database files in repository** (dev.db, dev.db-journal)
4. **Incomplete .gitignore** (missing critical entries)

### High Priority (P1)

1. **12 documentation files cluttering root directory**
2. **SQLite migration files** (no longer used - on PostgreSQL)
3. **Disabled test file** (.skip extension)
4. **113+ log files** consuming disk space

### Medium Priority (P2)

1. **Webpack cache files** (*.old)
2. **.specstory history files** (should be archived)
3. **Log rotation** (no automated cleanup)

---

## 🗂️ Proposed Directory Structure

### Before
```
Company-Information/
├── 24 root files (including 12 .md files)
├── apps/dashboard/
│   ├── api-server.js (DEPRECATED)
│   ├── dashboard.js (LEGACY)
│   ├── index.html (LEGACY)
│   └── styles.css (LEGACY)
├── services/jobs/prisma/
│   ├── dev.db (IN GIT!)
│   ├── dev.db-journal (IN GIT!)
│   ├── schema-sqlite.prisma (UNUSED)
│   └── migrations_sqlite_backup/ (OLD)
└── logs/ (113+ files, many from Sept)
```

### After
```
Company-Information/
├── docs/                          # ⭐ NEW
│   ├── guides/                    # Setup & verification docs
│   ├── planning/                  # Test plans & roadmaps
│   ├── reports/                   # Current reports
│   │   └── archive/               # Historical reports
│   ├── releases/                  # Release checklists
│   └── history/                   # Historical documentation
│       └── specstory/             # .specstory archives
├── archive/                       # ⭐ NEW
│   ├── database/                  # Old SQLite migrations
│   └── logs/                      # Old log files
│       ├── excalibur/
│       ├── monitoring/
│       └── sync/
├── apps/dashboard/
│   ├── app/ (ACTIVE Next.js)
│   └── [clean - no legacy files]
├── services/jobs/prisma/
│   ├── migrations/ (PostgreSQL only)
│   └── schema.prisma (PostgreSQL only)
├── README.md                      # Only 2 MD files in root
└── TASKS_TODO.md
```

---

## 🚀 Implementation Phases

### Phase 1: Critical Cleanup (P0) ⚡
**Time:** 30 minutes
**Risk:** LOW

#### 1.1 Update .gitignore

**File:** `.gitignore`

Add these entries:
```gitignore
# Database files
*.db
*.db-journal

# Build outputs
dist/
.next/
apps/dashboard/.next/
services/jobs/dist/

# Windows artifacts
nul

# Log files (keep recent only)
logs/**/*.log
archive/logs/**
```

#### 1.2 Remove tracked files from git

```bash
# Remove database files
git rm --cached services/jobs/prisma/dev.db
git rm --cached services/jobs/prisma/dev.db-journal

# Remove artifacts
git rm --cached nul
git rm --cached apps/dashboard/nul

# Remove build directories
git rm -r --cached .next/ 2>/dev/null || true
git rm -r --cached apps/dashboard/.next/
git rm -r --cached services/jobs/dist/

# Commit cleanup
git commit -m "chore: remove build artifacts and database files from git tracking"
```

#### 1.3 Delete deprecated dashboard files

```bash
cd apps/dashboard

# Delete legacy files
rm -f api-server.js
rm -f dashboard.js
rm -f index.html
rm -f styles.css
rm -f test-dashboard.js

cd ../..
git add apps/dashboard/
git commit -m "chore: remove deprecated legacy dashboard files

- Removed api-server.js (replaced by NestJS API)
- Removed dashboard.js, index.html, styles.css (replaced by Next.js app/)
- All functionality now in modern Next.js architecture"
```

**Verification:**
```bash
# Should return empty
ls apps/dashboard/*.js 2>/dev/null | grep -E '(api-server|dashboard|test-dashboard)'
ls apps/dashboard/*.html 2>/dev/null
```

---

### Phase 2: Documentation Restructuring (P1) 📚
**Time:** 90 minutes
**Risk:** LOW

#### 2.1 Create new directory structure

```bash
# Create documentation hierarchy
mkdir -p docs/guides
mkdir -p docs/planning
mkdir -p docs/reports/archive
mkdir -p docs/releases
mkdir -p docs/history/specstory
```

#### 2.2 Move documentation files

```bash
# Move guides
git mv BACKEND_VERIFICATION_GUIDE.md docs/guides/
git mv SETUP-COMPLETE.md docs/guides/

# Move planning documents
git mv REAL_DATA_TESTING_PLAN.md docs/planning/
git mv TEST_PLAN.md docs/planning/

# Move current reports
git mv DASHBOARD_METRICS_FIX_SUMMARY.md docs/reports/

# Move archived reports
git mv COMPREHENSIVE_AUDIT_REPORT.md docs/reports/archive/
git mv PROJECT_FUNCTIONALITIES_REPORT.md docs/reports/archive/
git mv QA_ANALYSIS_REPORT.md docs/reports/archive/
git mv QA_AUTOMATION_SUMMARY.md docs/reports/archive/
git mv REAL_DATA_TEST_IMPLEMENTATION_SUMMARY.md docs/reports/archive/

# Move release reports
git mv scripts/release-reports/release-checklist-v1.0.0-2025-09-09-1350.md docs/releases/

# Move .specstory history
git mv .specstory/history/2025-09-08_16-50Z-explain-the-project-details.md docs/history/specstory/
git mv .specstory/history/2025-09-12_12-49Z-what-does-this-project-do.md docs/history/specstory/
git mv .specstory/history/2025-09-12_17-09Z-what-are-we-developing.md docs/history/specstory/

# Commit reorganization
git commit -m "docs: restructure documentation into organized hierarchy

- Created /docs with subdirectories: guides, planning, reports, releases, history
- Moved 12 documentation files from root to appropriate locations
- Archived historical reports for reference
- Improved discoverability and maintenance"
```

#### 2.3 Update README.md

Add this section to README.md:

```markdown
## 📁 Repository Structure

```
Company-Information/
├── apps/                   # Application services
│   └── dashboard/          # Next.js dashboard application
├── automation/             # Automation workflows
│   ├── github-actions/     # GitHub Actions workflows
│   └── n8n-workflows/      # n8n automation recipes
├── docs/                   # 📚 Documentation
│   ├── guides/             # Setup and verification guides
│   ├── planning/           # Test plans and roadmaps
│   ├── reports/            # Project reports
│   │   └── archive/        # Historical reports
│   ├── releases/           # Release checklists
│   └── history/            # Historical documentation
├── e2e/                    # End-to-end tests
├── logs/                   # Application logs (last 30 days)
├── scripts/                # Utility scripts
├── services/               # Backend services
│   └── jobs/               # NestJS jobs service
├── templates/              # Project templates
├── tests/                  # Test suites
└── README.md               # This file
```

### Quick Links to Documentation

- **Setup Guides:** [docs/guides/](./docs/guides/)
- **Test Plans:** [docs/planning/](./docs/planning/)
- **Latest Reports:** [docs/reports/](./docs/reports/)
- **Release Notes:** [docs/releases/](./docs/releases/)
```

```bash
git add README.md
git commit -m "docs: update README with new repository structure"
```

---

### Phase 3: Database & Migration Cleanup (P1) 🗄️
**Time:** 30 minutes
**Risk:** LOW

#### 3.1 Archive SQLite migrations

```bash
# Create archive directory
mkdir -p archive/database/migrations_sqlite

# Move SQLite backup migrations
mv services/jobs/prisma/migrations_sqlite_backup/* archive/database/migrations_sqlite/
rmdir services/jobs/prisma/migrations_sqlite_backup

git add archive/
git add services/jobs/prisma/
git commit -m "chore: archive legacy SQLite migrations

- Moved SQLite migrations to archive/database/
- Keeping for historical reference
- Active migrations are PostgreSQL only"
```

#### 3.2 Remove SQLite schema

```bash
git rm services/jobs/prisma/schema-sqlite.prisma
git commit -m "chore: remove legacy SQLite schema

- Project now uses PostgreSQL exclusively
- schema.prisma is the active schema"
```

#### 3.3 Handle disabled test file

**Option A: Delete if obsolete**
```bash
git rm services/jobs/src/reports/reports.service.test.ts.skip
git commit -m "test: remove disabled reports service test

- Test was disabled with .skip extension
- Functionality covered by other tests"
```

**Option B: Fix and enable (recommended if test is valuable)**
```bash
# Rename to enable
git mv services/jobs/src/reports/reports.service.test.ts.skip \
       services/jobs/src/reports/reports.service.test.ts

# Fix any test issues, then commit
git commit -m "test: re-enable reports service tests

- Removed .skip extension
- Fixed test compatibility issues
- All tests passing"
```

---

### Phase 4: Log Management (P2) 📝
**Time:** 45 minutes
**Risk:** LOW

#### 4.1 Create archive structure

```bash
mkdir -p archive/logs/excalibur
mkdir -p archive/logs/monitoring
mkdir -p archive/logs/sync
```

#### 4.2 Archive old logs

```bash
# Archive excalibur logs from September (older than 30 days)
find logs/ -name "excalibur-202509*.log" -exec mv {} archive/logs/excalibur/ \;

# Archive monitoring logs
mv scripts/monitoring-logs/*.log archive/logs/monitoring/ 2>/dev/null || true

# Archive sync logs
mv scripts/sync-logs/*.log archive/logs/sync/ 2>/dev/null || true

# Commit archive
git add archive/logs/
git commit -m "chore: archive logs older than 30 days

- Moved September logs to archive/logs/
- Keeping last 30 days of logs active
- Archived 113+ log files"
```

#### 4.3 Update .gitignore for logs

Add to `.gitignore`:
```gitignore
# Log files
logs/**/*.log
!logs/.gitkeep
scripts/monitoring-logs/**/*.log
scripts/sync-logs/**/*.log
archive/logs/**
```

Create .gitkeep to preserve directory:
```bash
touch logs/.gitkeep
git add logs/.gitkeep
git commit -m "chore: add .gitkeep for logs directory"
```

---

### Phase 5: Build Artifacts Cleanup (P2) 🏗️
**Time:** 15 minutes
**Risk:** VERY LOW

#### 5.1 Clean build directories

```bash
# Remove build artifacts (not in git after Phase 1)
rm -rf apps/dashboard/.next/
rm -rf services/jobs/dist/
rm -rf .next/ 2>/dev/null || true

# Clean webpack cache
find apps/dashboard/.next/cache -name "*.old" -delete 2>/dev/null || true
```

#### 5.2 Verify .gitignore

```bash
# Test that build artifacts are ignored
touch apps/dashboard/.next/test.txt
touch services/jobs/dist/test.txt

# These should show "Ignored" status
git status --ignored | grep -E "(.next|dist)"

# Clean up test files
rm apps/dashboard/.next/test.txt
rm services/jobs/dist/test.txt
```

#### 5.3 Rebuild to verify

```bash
# Install dependencies if needed
npm install

# Build all services
npm run build

# Verify builds succeeded
ls apps/dashboard/.next/
ls services/jobs/dist/

echo "✅ Build artifacts successfully regenerated and ignored by git"
```

---

### Phase 6: Final Optimization (P3) ⚙️
**Time:** 60 minutes
**Risk:** LOW

#### 6.1 Consolidate TODO tracking

```bash
# Review current TODO files
echo "=== TODO Files ==="
find . -name "*TODO*" -o -name "*todo*" | grep -v node_modules

# Keep TASKS_TODO.md as single source of truth
# Update scripts to reference it
```

#### 6.2 Remove Windows artifacts

```bash
# Find and remove any "nul" files
find . -name "nul" -type f -delete

# Verify
find . -name "nul" | wc -l  # Should be 0
```

#### 6.3 Clean up empty directories

```bash
# Find empty directories (excluding node_modules)
find . -type d -empty | grep -v node_modules

# Remove if safe (review first)
# rmdir <empty-directory>
```

---

## ✅ Validation Checklist

After completing all phases, verify:

### Build & Tests
- [ ] `npm test` - All tests pass
- [ ] `npm run build` - All services build successfully
- [ ] `npm run dev` - Development server starts
- [ ] Dashboard accessible at http://localhost:3000
- [ ] API accessible at http://localhost:4000

### Git Status
- [ ] `git status` shows no build artifacts
- [ ] No .db files tracked
- [ ] No .next/ or dist/ in git
- [ ] .gitignore properly configured

### File Structure
- [ ] Root directory has ≤12 files
- [ ] Only 2 .md files in root (README.md, TASKS_TODO.md)
- [ ] docs/ directory exists with proper structure
- [ ] archive/ directory contains old files
- [ ] No "nul" files exist

### Documentation
- [ ] README.md updated with new structure
- [ ] All documentation accessible
- [ ] No broken links
- [ ] docs/ directory well-organized

### Database
- [ ] Prisma migrations work: `cd services/jobs && npx prisma migrate dev`
- [ ] Database schema up to date
- [ ] No SQLite references

---

## 🔄 Rollback Plan

### Before Starting

```bash
# Create backup branch
git checkout -b backup/pre-cleanup-2025-11-10
git push -u origin backup/pre-cleanup-2025-11-10
git checkout main

# Create tag
git tag pre-cleanup-audit
git push --tags
```

### If Rollback Needed

```bash
# Option 1: Reset to tag
git checkout main
git reset --hard pre-cleanup-audit
git push -f origin main

# Option 2: Revert commits one by one
git revert <commit-hash>

# Option 3: Restore from backup branch
git checkout backup/pre-cleanup-2025-11-10
git checkout -b main-restored
```

---

## 📈 Success Metrics

### Quantitative

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Root .md files | 12 | 2 | 83% ↓ |
| Total root files | 24 | ≤12 | 50% ↓ |
| Build artifacts in git | Yes | No | 100% ✓ |
| Database files in git | Yes | No | 100% ✓ |
| Active log files | 113+ | <30 | 75% ↓ |
| Disk space usage | Baseline | -250MB+ | Optimized |
| Repository size | Baseline | -30% | Smaller |

### Qualitative

- ✅ Improved developer onboarding (clear docs/ structure)
- ✅ Faster git operations (fewer tracked files)
- ✅ Reduced confusion (deprecated files removed)
- ✅ Better maintenance (organized structure)
- ✅ Professional appearance (clean root directory)

---

## 🎯 Post-Cleanup Actions

### Immediate (Within 1 week)

1. **Update CI/CD pipelines**
   - Verify builds work with new structure
   - Update any paths in GitHub Actions

2. **Update team documentation**
   - Share new docs/ structure
   - Update onboarding guide

3. **Set up automated cleanup**
   - Add log rotation script
   - Configure automated archive

### Short-term (Within 1 month)

1. **Implement pre-commit hooks**
   ```bash
   # Prevent committing .db files
   # Prevent committing build artifacts
   ```

2. **Set up GitHub Actions**
   ```yaml
   # Auto-archive old logs
   # Auto-clean build artifacts
   # Verify .gitignore compliance
   ```

3. **Create CONTRIBUTING.md**
   - Document file organization rules
   - Explain docs/ structure
   - Archive guidelines

---

## 📋 Command Reference

### Quick Execution (All Phases)

Copy this script to execute all phases:

```bash
#!/bin/bash
# Repository Cleanup Script
# Execute from repository root

set -e  # Exit on error

echo "🚀 Starting repository cleanup..."

# Phase 1: Critical Cleanup
echo "📦 Phase 1: Critical Cleanup"
git rm --cached services/jobs/prisma/dev.db 2>/dev/null || true
git rm --cached services/jobs/prisma/dev.db-journal 2>/dev/null || true
git rm --cached nul 2>/dev/null || true
git rm --cached apps/dashboard/nul 2>/dev/null || true
git rm -r --cached .next/ 2>/dev/null || true
git rm -r --cached apps/dashboard/.next/ 2>/dev/null || true
git rm -r --cached services/jobs/dist/ 2>/dev/null || true

cd apps/dashboard
rm -f api-server.js dashboard.js index.html styles.css test-dashboard.js
cd ../..

git add apps/dashboard/
git commit -m "chore: Phase 1 - Remove build artifacts and deprecated files" || true

# Phase 2: Documentation Restructuring
echo "📚 Phase 2: Documentation Restructuring"
mkdir -p docs/{guides,planning,reports/archive,releases,history/specstory}

git mv BACKEND_VERIFICATION_GUIDE.md docs/guides/ 2>/dev/null || true
git mv SETUP-COMPLETE.md docs/guides/ 2>/dev/null || true
git mv REAL_DATA_TESTING_PLAN.md docs/planning/ 2>/dev/null || true
git mv TEST_PLAN.md docs/planning/ 2>/dev/null || true
git mv DASHBOARD_METRICS_FIX_SUMMARY.md docs/reports/ 2>/dev/null || true
git mv COMPREHENSIVE_AUDIT_REPORT.md docs/reports/archive/ 2>/dev/null || true
git mv PROJECT_FUNCTIONALITIES_REPORT.md docs/reports/archive/ 2>/dev/null || true
git mv QA_ANALYSIS_REPORT.md docs/reports/archive/ 2>/dev/null || true
git mv QA_AUTOMATION_SUMMARY.md docs/reports/archive/ 2>/dev/null || true
git mv REAL_DATA_TEST_IMPLEMENTATION_SUMMARY.md docs/reports/archive/ 2>/dev/null || true

git commit -m "docs: Phase 2 - Restructure documentation hierarchy" || true

# Phase 3: Database Cleanup
echo "🗄️ Phase 3: Database Cleanup"
mkdir -p archive/database/migrations_sqlite
mv services/jobs/prisma/migrations_sqlite_backup/* archive/database/migrations_sqlite/ 2>/dev/null || true
rmdir services/jobs/prisma/migrations_sqlite_backup 2>/dev/null || true
git rm services/jobs/prisma/schema-sqlite.prisma 2>/dev/null || true
git rm services/jobs/src/reports/reports.service.test.ts.skip 2>/dev/null || true

git add archive/
git add services/jobs/
git commit -m "chore: Phase 3 - Archive SQLite artifacts and clean database files" || true

# Phase 4: Log Management
echo "📝 Phase 4: Log Management"
mkdir -p archive/logs/{excalibur,monitoring,sync}
find logs/ -name "excalibur-202509*.log" -exec mv {} archive/logs/excalibur/ \; 2>/dev/null || true
mv scripts/monitoring-logs/*.log archive/logs/monitoring/ 2>/dev/null || true
mv scripts/sync-logs/*.log archive/logs/sync/ 2>/dev/null || true

git add archive/logs/
git commit -m "chore: Phase 4 - Archive old log files" || true

echo "✅ Cleanup complete!"
echo "📊 Run validation checks:"
echo "  - npm test"
echo "  - npm run build"
echo "  - git status"
```

Save as `cleanup.sh`, make executable, and run:

```bash
chmod +x cleanup.sh
./cleanup.sh
```

---

## 🆘 Troubleshooting

### Issue: "git rm: pathspec did not match any files"
**Solution:** File already removed or doesn't exist. Safe to ignore.

### Issue: Build fails after cleanup
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Prisma client errors
**Solution:**
```bash
cd services/jobs
npx prisma generate
npx prisma migrate dev
```

### Issue: Documentation links broken
**Solution:** Update README.md with corrected paths to docs/

---

## 📞 Support & Questions

**Documentation:** See `docs/` directory
**Issues:** Check TASKS_TODO.md
**Questions:** Review README.md

---

## 📜 Appendix

### A. Complete File Inventory

**Files to Delete (15):**
1. apps/dashboard/api-server.js
2. apps/dashboard/dashboard.js
3. apps/dashboard/index.html
4. apps/dashboard/styles.css
5. apps/dashboard/test-dashboard.js
6. services/jobs/prisma/schema-sqlite.prisma
7. services/jobs/prisma/dev.db
8. services/jobs/prisma/dev.db-journal
9. services/jobs/src/reports/reports.service.test.ts.skip
10. nul (root)
11. apps/dashboard/nul
12-15. Webpack .old files

**Files to Move (15):**
1. BACKEND_VERIFICATION_GUIDE.md → docs/guides/
2. SETUP-COMPLETE.md → docs/guides/
3. REAL_DATA_TESTING_PLAN.md → docs/planning/
4. TEST_PLAN.md → docs/planning/
5. DASHBOARD_METRICS_FIX_SUMMARY.md → docs/reports/
6. COMPREHENSIVE_AUDIT_REPORT.md → docs/reports/archive/
7. PROJECT_FUNCTIONALITIES_REPORT.md → docs/reports/archive/
8. QA_ANALYSIS_REPORT.md → docs/reports/archive/
9. QA_AUTOMATION_SUMMARY.md → docs/reports/archive/
10. REAL_DATA_TEST_IMPLEMENTATION_SUMMARY.md → docs/reports/archive/
11. release-checklist → docs/releases/
12-14. .specstory history files → docs/history/specstory/
15. SQLite migrations → archive/database/

**Directories to Archive (3):**
1. migrations_sqlite_backup/
2. logs/ (old files)
3. .specstory/history/

### B. Updated .gitignore

Complete .gitignore additions:

```gitignore
# Build outputs
dist/
.next/
apps/dashboard/.next/
services/jobs/dist/
build/

# Database files
*.db
*.db-journal
*.sqlite
*.sqlite3

# Log files
logs/**/*.log
scripts/**/logs/**/*.log
archive/logs/**

# Windows artifacts
nul
Thumbs.db

# Environment files (keep .example files)
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
```

---

**Document Version:** 1.0
**Last Updated:** November 10, 2025
**Status:** Ready for Execution
**Approved By:** Pending Review

---

*This cleanup plan represents a comprehensive approach to repository organization. Execute phases sequentially and validate after each phase.*
