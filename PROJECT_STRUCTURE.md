# AI-Whisperers Project Structure

## GitHub Organization: [Ai-Whisperers](https://github.com/Ai-Whisperers)

## Repository Organization

### Core Repositories

#### 1. **core-services**
Main backend services and APIs
```
core-services/
├── src/
│   ├── api/           # REST API endpoints
│   ├── services/      # Business logic
│   ├── models/        # Data models
│   └── utils/         # Utility functions
├── tests/             # Test suites
├── docs/              # API documentation
└── docker/            # Docker configurations
```

#### 2. **web-platform**
Frontend applications and user interfaces
```
web-platform/
├── src/
│   ├── components/    # Reusable components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom hooks
│   ├── services/      # API service layer
│   └── styles/        # Global styles
├── public/            # Static assets
└── tests/             # Frontend tests
```

#### 3. **ml-models**
Machine learning models and training pipelines
```
ml-models/
├── models/            # Trained models
├── notebooks/         # Jupyter notebooks
├── src/
│   ├── data/          # Data processing
│   ├── training/      # Training scripts
│   └── evaluation/    # Model evaluation
├── datasets/          # Dataset references
└── experiments/       # Experiment tracking
```

#### 4. **infrastructure**
Infrastructure as code and deployment configurations
```
infrastructure/
├── terraform/         # Terraform configs
├── kubernetes/        # K8s manifests
├── ansible/           # Ansible playbooks
├── monitoring/        # Monitoring configs
└── scripts/           # Deployment scripts
```

#### 5. **documentation**
Technical documentation and guides
```
documentation/
├── getting-started/   # Onboarding guides
├── api-reference/     # API documentation
├── architecture/      # System architecture
├── tutorials/         # How-to guides
└── contributing/      # Contribution guidelines
```

## Development Standards

### File Naming Conventions
- **Python**: `snake_case.py`
- **JavaScript/TypeScript**: `camelCase.js` / `PascalCase.tsx` for components
- **Documentation**: `UPPERCASE.md` for important docs, `kebab-case.md` for others
- **Config files**: `.lowercase` (e.g., `.gitignore`)

### Directory Structure Standards
- Keep directory depth to maximum 4 levels
- Group related functionality together
- Separate concerns (business logic, UI, data)
- Include README.md in each major directory

## Progress Tracking Structure

### GitHub Projects Setup
1. **Organization-level Project Board**
   - Overview of all active projects
   - Quarterly goals and milestones
   - Cross-repository initiatives

2. **Repository-specific Boards**
   - Feature development tracking
   - Bug tracking and fixes
   - Release planning

### Issue Labels System
```yaml
Type:
  - bug
  - feature
  - enhancement
  - documentation
  - question

Priority:
  - critical
  - high
  - medium
  - low

Status:
  - ready
  - in-progress
  - blocked
  - review
  - done

Size:
  - XS (< 2 hours)
  - S (2-4 hours)
  - M (1-2 days)
  - L (3-5 days)
  - XL (> 1 week)
```

### Milestone Structure
- **Sprint Milestones**: 2-week sprints
- **Release Milestones**: Version-based releases
- **Epic Milestones**: Large feature sets

## Workflow Automation

### GitHub Actions Workflows
- **CI/CD Pipeline**: On push to main/develop
- **Code Quality**: Linting and formatting checks
- **Security Scanning**: Dependency vulnerability checks
- **Automated Testing**: Unit and integration tests
- **Documentation Build**: Auto-generate docs

### Branch Protection Rules
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Include administrators in restrictions

## Team Organization

### GitHub Teams
- **@Ai-Whisperers/core-team** - Organization admins
- **@Ai-Whisperers/backend-team** - Backend developers
- **@Ai-Whisperers/frontend-team** - Frontend developers
- **@Ai-Whisperers/ml-team** - ML engineers
- **@Ai-Whisperers/devops** - DevOps engineers
- **@Ai-Whisperers/documentation-team** - Technical writers

### Access Levels
- **Admin**: Core team members
- **Write**: Active contributors
- **Read**: External collaborators

## Monitoring Progress

### Weekly Updates
- Review open pull requests
- Update project boards
- Check milestone progress
- Address blocked items

### Monthly Reports
- Repository activity metrics
- Contribution statistics
- Issue resolution rate
- Release velocity

### Quarterly Reviews
- Goal achievement assessment
- Team performance review
- Process improvements
- Roadmap adjustments