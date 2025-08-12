# 🚀 AI-Whisperers Deployment Guide

This guide will help you deploy all three AI-Whisperers websites and set up the complete infrastructure.

## 📋 Prerequisites Checklist

### Required Accounts
- [x] GitHub organization: `Ai-Whisperers` ✅
- [ ] Vercel account (linked to GitHub)
- [ ] Domain registrar (GoDaddy, Namecheap, Cloudflare)  
- [ ] Google Workspace (business email)
- [ ] Google Analytics account

### Domain Setup
- [ ] Purchase domains:
  - `ai-whisperers.com` (main company)
  - `investai.app` or `investai.com` (investment platform)
  - `commentlyzer.com` (comment analyzer)

## 🏢 1. Company Website Deployment

### Status: ✅ READY FOR DEPLOYMENT

**Repository**: Already set up in `repositories/company-website/`

### Deployment Steps:

#### Option A: Vercel (Recommended)
```bash
# 1. Create Vercel account at vercel.com
# 2. Connect your GitHub organization
# 3. Import the company-website repository
# 4. Configure project:
#    - Build Command: npm run build
#    - Output Directory: dist
#    - Root Directory: repositories/company-website
# 5. Add custom domain: ai-whisperers.com
```

#### Option B: Netlify
```bash
# 1. Create Netlify account
# 2. Connect GitHub repository
# 3. Deploy settings:
#    - Build Command: npm run build
#    - Publish Directory: dist
#    - Base Directory: repositories/company-website
# 4. Add custom domain
```

### Environment Variables to Set:
```
VITE_API_URL=https://api.ai-whisperers.com
VITE_CONTACT_EMAIL=business@ai-whisperers.com
VITE_GA_ID=G-XXXXXXXXXX
VITE_COMPANY_NAME=AI-Whisperers
VITE_DOMAIN=ai-whisperers.com
```

## 📊 2. Investment AI Platform

### Status: 🔄 NEEDS CREATION

**Next Steps:**
1. Create repository: `Ai-Whisperers/investment-ai`
2. Set up Next.js 14 + TypeScript project
3. Integrate AI APIs (OpenAI, Anthropic)
4. Add authentication system
5. Configure database (PostgreSQL)

### Recommended Tech Stack:
```
Frontend: Next.js 14 + TypeScript + TailwindCSS
Backend: Next.js API routes + Prisma ORM
Database: PostgreSQL (Neon/PlanetScale)
Auth: NextAuth.js or Clerk
AI APIs: OpenAI GPT-4, Anthropic Claude
Hosting: Vercel
```

## 🔍 3. Comment Analyzer Platform

### Status: 🔄 NEEDS CREATION

**Next Steps:**
1. Create repository: `Ai-Whisperers/comment-analyzer`
2. Set up React/Next.js frontend
3. Create Python FastAPI backend
4. Integrate NLP models (Hugging Face)
5. Add real-time processing

### Recommended Tech Stack:
```
Frontend: Next.js 14 + TypeScript + TailwindCSS
Backend: Python FastAPI + Redis + PostgreSQL
ML: Hugging Face Transformers + PyTorch
Hosting: Vercel (frontend) + Railway (backend)
```

## 🔧 Infrastructure Setup

### 1. GitHub Organization Configuration

#### Create Repositories:
```bash
# Method 1: Using GitHub CLI (if authenticated)
gh repo create Ai-Whisperers/company-website --public
gh repo create Ai-Whisperers/investment-ai --public  
gh repo create Ai-Whisperers/comment-analyzer --public

# Method 2: Manual creation on GitHub.com
# Go to: https://github.com/orgs/Ai-Whisperers/repositories
# Click "New repository" for each project
```

#### Transfer Company Website:
```bash
# Step 1: Push current company-website to new repo
cd repositories/company-website
git init
git remote add origin https://github.com/Ai-Whisperers/company-website.git
git add .
git commit -m "Initial company website setup"
git push -u origin main
```

### 2. GitHub Projects Setup

Visit: https://github.com/orgs/Ai-Whisperers/projects

1. **Create new project**: "AI-Whisperers Organization"
2. **Follow the guide**: `PROJECT_SETUP.md`
3. **Link repositories**: Add all 3 website repositories
4. **Configure automation**: Issues → Backlog, PRs → In Progress

### 3. Domain Configuration

#### DNS Records to Add:
```
# For ai-whisperers.com
Type: A      | Host: @   | Value: [Vercel IP]
Type: CNAME  | Host: www | Value: ai-whisperers.com
Type: MX     | Host: @   | Value: [Google Workspace MX records]
Type: TXT    | Host: @   | Value: [Domain verification]

# Repeat for other domains
```

## 📧 Business Setup

### 1. Google Workspace
```bash
# Set up business email:
business@ai-whisperers.com
support@ai-whisperers.com  
admin@ai-whisperers.com
```

### 2. Analytics Setup
```bash
# Google Analytics 4
# Property: AI-Whisperers
# Streams: 
#   - ai-whisperers.com (company)
#   - investai.app (investment)
#   - commentlyzer.com (analyzer)
```

## 🎯 Deployment Priorities

### Phase 1: Foundation (Week 1)
- [x] ✅ GitHub Projects and issue management
- [x] ✅ Company website ready for deployment
- [ ] 🔄 Deploy company website to production
- [ ] 🔄 Set up custom domains
- [ ] 🔄 Configure business email

### Phase 2: Core Platforms (Week 2-3)  
- [ ] 🔄 Create investment-ai repository and MVP
- [ ] 🔄 Create comment-analyzer repository and MVP
- [ ] 🔄 Deploy both platforms to staging
- [ ] 🔄 Set up authentication systems

### Phase 3: Production (Week 4)
- [ ] 🔄 Production deployment for all platforms
- [ ] 🔄 Performance optimization
- [ ] 🔄 Monitoring and analytics
- [ ] 🔄 User testing and feedback

## 💰 Estimated Costs

### Monthly Operating Costs:
```
Domains: $10/month (3 domains × $3.33/month)
Hosting: $60/month (Vercel Pro + Railway)
Google Workspace: $18/month (3 users × $6/month)
Database: $25/month (Neon/PlanetScale)
APIs: $50/month (OpenAI + others, usage-based)
Analytics: $0 (Google Analytics free tier)

Total: ~$163/month (~$1,950/year)
```

## 🚦 Next Immediate Actions

### For You to Do Now:

1. **Create GitHub repositories**:
   ```bash
   # Go to: https://github.com/orgs/Ai-Whisperers/repositories
   # Click "New repository" → "company-website"
   # Then push the code we prepared
   ```

2. **Set up Vercel account**:
   ```bash
   # Visit: https://vercel.com
   # Sign up with GitHub
   # Import Ai-Whisperers/company-website
   ```

3. **Purchase domains**:
   ```bash
   # Recommended: Cloudflare (best DNS management)
   # Buy: ai-whisperers.com, investai.com, commentlyzer.com
   ```

4. **Set up GitHub Projects**:
   ```bash
   # Follow: PROJECT_SETUP.md guide
   # Create kanban board for task management
   ```

### What Claude Code Can Help With:

- ✅ Repository setup and configuration
- ✅ CI/CD pipeline creation
- ✅ Code generation for both platforms
- ✅ Documentation and deployment scripts
- ✅ Testing and quality assurance setup

---

## 📞 Support

If you need help with any step:
1. Create an issue using the GitHub templates we set up
2. Use the kanban board to track progress
3. Reference this guide for step-by-step instructions

**Ready to launch AI-Whisperers! 🚀**