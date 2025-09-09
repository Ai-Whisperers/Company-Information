# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Organization Overview

AI-Whisperers is a multi-repository organization focused on developing innovative AI solutions and integrations. The organization follows a structured approach with separate repositories for different concerns.

## Repository Structure

This is the **Company-Information** repository which serves as the central hub for:
- Organization-wide documentation and strategy
- GitHub Actions for cross-repository management
- Azure DevOps integration and work items
- Business setup and planning documents

The organization maintains these actual code repositories:
- **[Comment-Analizer](https://github.com/Ai-Whisperers/Comment-Analizer)**: AI-powered customer feedback analysis (Python, GPT-4, Streamlit)
- **[AI-Investment](https://github.com/Ai-Whisperers/AI-Investment)**: Waardhaven AutoIndex investment platform (FastAPI, Next.js, 145+ endpoints)
- **[clockify-ADO-automated-report](https://github.com/Ai-Whisperers/clockify-ADO-automated-report)**: Time tracking automation (Python, Hexagonal Architecture)
- **[AI-Whisperers-website-and-courses](https://github.com/Ai-Whisperers/AI-Whisperers-website-and-courses)**: Strategic educational platform (Planning)
- **[WPG-Amenities](https://github.com/Ai-Whisperers/WPG-Amenities)**: Winnipeg local services (Assessment required)
- **[AI-Whisperers-Website](https://github.com/Ai-Whisperers/AI-Whisperers-Website)**: Legacy website (Migration planned)
- **[AI-Whisperers](https://github.com/Ai-Whisperers/AI-Whisperers)**: Organizational standards (Development required)
- **[Call-Recorder](https://github.com/Ai-Whisperers/Call-Recorder)**: Inactive repository (Archive recommended)

**Note**: Each repository is maintained independently. Clone only the repositories you need for your current work.

## Development Commands

**Important**: These commands should be run in their respective repository directories after cloning them separately.

### Comment-Analizer (in `Comment-Analizer` repository)
```bash
# Development
streamlit run main.py                    # Start Streamlit app
python -m pytest                        # Run tests
python -m black .                       # Code formatting
python -m flake8                        # Linting

# Docker
docker build -t comment-analizer .      # Build container
docker run -p 8501:8501 comment-analizer # Run container
```

### AI-Investment (in `AI-Investment` repository)
```bash
# Backend Development
uvicorn src.main:app --reload --port 8000  # FastAPI server
alembic upgrade head                       # Database migrations

# Frontend Development
npm run dev              # Next.js dev server on http://localhost:3000
npm run build           # Production build
npm start               # Start production server

# Testing
npm test                # Frontend tests
python -m pytest       # Backend tests
npm run test:coverage   # Test coverage

# Code Quality
npm run lint            # ESLint
npm run typecheck       # TypeScript checking
python -m black .       # Python formatting
python -m flake8        # Python linting

# Docker
docker-compose up -d    # Start all services
```

### clockify-ADO-automated-report (in `clockify-ADO-automated-report` repository)
```bash
# Development
python -m venv venv && source venv/bin/activate  # Create virtual env
pip install -r requirements.txt                  # Install dependencies
python main.py                                   # Run application

# Testing
python -m pytest                        # Run tests
python -m pytest --cov=src             # With coverage

# Code Quality
python -m black .                       # Code formatting
python -m flake8                        # Linting

# Docker
docker build -t clockify-ado .          # Build container
docker run clockify-ado                 # Run container
```

## Architecture Patterns

### Comment-Analizer Architecture
- **Framework**: Streamlit for web UI with Python backend
- **AI Integration**: OpenAI GPT-4 API for analysis
- **Architecture**: Clean Architecture with SOLID principles
- **Data Processing**: Multi-language support (Spanish, Guaraní, English)
- **Output**: Professional Excel report generation
- **Deployment**: Streamlit Cloud with secure configuration

### AI-Investment Architecture
- **Backend**: FastAPI with Python for investment analysis
- **Frontend**: Next.js 14 with TypeScript and modern React patterns
- **Database**: PostgreSQL for data persistence, Redis for caching
- **AI Engine**: Multi-signal analysis with 145+ API endpoints
- **Data Sources**: TwelveData and MarketAux integration
- **Architecture**: Microservices with Docker containerization

### clockify-ADO-automated-report Architecture
- **Framework**: Python with Hexagonal Architecture pattern
- **Integration**: Clockify API and Azure DevOps REST API
- **Data Processing**: Pattern matching and time tracking automation
- **CLI Interface**: Command-line tool with configuration management
- **Deployment**: Docker containerization for consistent execution
- **Logging**: Structured logging with error tracking

## Git Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature development
- `hotfix/*`: Emergency production fixes
- `release/*`: Release preparation

### Commit Conventions
Use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes  
- `docs:` - Documentation changes
- `style:` - Code formatting
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Build/tooling changes

## Key Environment Variables

### Comment-Analizer
- `OPENAI_API_KEY`: OpenAI API key for GPT-4 access
- `STREAMLIT_SERVER_PORT`: Server port (default: 8501)
- `ANALYSIS_TIMEOUT`: Analysis timeout in seconds

### AI-Investment
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: JWT signing secret
- `TWELVEDATA_API_KEY`: TwelveData API key for market data
- `MARKETAUX_API_KEY`: MarketAux API key for news data
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)

### clockify-ADO-automated-report
- `CLOCKIFY_API_KEY`: Clockify API key for time tracking
- `AZURE_DEVOPS_PAT`: Azure DevOps Personal Access Token
- `AZURE_DEVOPS_ORG`: Azure DevOps organization URL
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR)

## Testing Strategy

### Comment-Analizer
- Unit tests: Analysis logic and data processing functions
- Integration tests: OpenAI API integration and response handling
- UI tests: Streamlit component functionality
- Performance tests: Analysis speed and memory usage

### AI-Investment
- Backend tests: Investment analysis algorithms and API endpoints
- Frontend tests: React components and user interactions
- Integration tests: Database operations and external API calls
- Performance tests: Trading signal generation speed
- Security tests: Authentication and data protection

### clockify-ADO-automated-report
- Unit tests: Pattern matching and data transformation logic
- Integration tests: Clockify and Azure DevOps API integration
- CLI tests: Command-line interface and configuration handling
- Performance tests: Large dataset processing efficiency

## Organizational Management Tools

This repository includes PowerShell-based management tools for cross-repository coordination:

### Management Scripts

Located in the `scripts/` directory:

```powershell
# Management Overview
.\management-summary.ps1             # Overview of all management tools and system status

# Todo Management
.\todo-manager.ps1 status           # View todos across all repositories  
.\todo-manager.ps1 sync             # Synchronize todo changes across repos

# Repository Monitoring  
.\repo-monitor-dashboard.ps1        # Repository health and activity dashboard
.\repo-monitor-dashboard.ps1 health # Focus on repositories needing attention
.\repo-monitor-dashboard.ps1 activity # Activity summary across organization

# File Synchronization
.\file-sync-manager.ps1 status      # Check file synchronization status
.\file-sync-manager.ps1 validate    # Validate template files before sync

# Azure DevOps Integration
.\azure-devops-sync.ps1 status      # Check Azure DevOps integration status
.\azure-devops-sync.ps1 test        # Test prerequisites and connectivity
```

### Prerequisites for Management Tools

- **GitHub CLI**: Required for repository access and API operations
  ```bash
  # Install: https://cli.github.com/
  gh auth login  # Authenticate with GitHub
  ```
  
- **Azure CLI** (for DevOps integration): Required for Azure DevOps sync features
  ```bash
  # Install: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
  az login  # Authenticate with Azure
  az extension add --name azure-devops  # Install DevOps extension
  ```

- **PowerShell**: Scripts tested with PowerShell 5.1+ on Windows

### Management Features

- **Cross-Repository Todo Tracking**: Automatically discovers and tracks todo items across all organization repositories
- **Repository Health Monitoring**: Tracks commit activity, open issues, and pull requests with health scoring
- **Documentation Template Sync**: Maintains consistent documentation standards across repositories
- **Azure DevOps Integration**: Framework for synchronizing GitHub issues and PRs with Azure work items
- **Centralized Dashboard**: Single interface for monitoring organizational health and progress

### Configuration

Management tools are configured for the AI-Whisperers organization. Key configuration files:
- Repository lists are dynamically fetched from GitHub API
- Template files located in `documentation-templates/` directory
- Todo files located in `project-todos/` directory  
- Azure DevOps settings configurable in scripts (organization/project names)

## Deployment Considerations

- All services use Docker with multi-stage builds
- Kubernetes deployments with resource limits and health checks
- ML models require GPU resources for training/inference
- Frontend deploys to CDN with API proxy configuration