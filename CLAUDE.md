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

The organization maintains these separate code repositories:
- **[core-services](https://github.com/Ai-Whisperers/core-services)**: Python/Node.js backend services with FastAPI/Express, PostgreSQL, Redis
- **[web-platform](https://github.com/Ai-Whisperers/web-platform)**: React 18/Next.js 14 frontend with TypeScript, Redux Toolkit, TailwindCSS
- **[ml-models](https://github.com/Ai-Whisperers/ml-models)**: PyTorch/TensorFlow ML models with MLflow tracking and FastAPI serving
- **[documentation](https://github.com/Ai-Whisperers/documentation)**: Technical documentation and guides
- **[infrastructure](https://github.com/Ai-Whisperers/infrastructure)**: Docker, Kubernetes, Terraform deployment configurations

**Note**: Each repository is maintained independently. Clone only the repositories you need for your current work.

## Development Commands

**Important**: These commands should be run in their respective repository directories after cloning them separately.

### Web Platform (in `web-platform` repository)
```bash
# Development
npm run dev              # Start Next.js dev server on http://localhost:3000
npm run build           # Production build
npm start               # Start production server

# Testing  
npm test                # Jest unit tests
npm run test:watch      # Jest in watch mode
npm run test:coverage   # Jest with coverage
npm run e2e             # Cypress E2E tests
npm run e2e:headless    # Cypress headless

# Code Quality
npm run lint            # ESLint
npm run lint:fix        # ESLint with fixes
npm run format          # Prettier formatting
npm run typecheck       # TypeScript type checking

# Tools
npm run analyze         # Bundle size analysis
npm run storybook       # Storybook dev server
```

### Core Services (in `core-services` repository)
```bash
# Development
uvicorn src.main:app --reload --port 8000  # Python FastAPI
npm run dev                                # Node.js Express

# Database
alembic upgrade head    # Python migrations
npm run migrate         # Node.js migrations

# Testing
npm test               # All tests
npm run test:unit      # Unit tests only
npm run test:integration  # Integration tests
npm run test:coverage  # With coverage

# Code Quality
npm run lint           # Linting
npm run typecheck      # Type checking
npm run format         # Code formatting

# Docker
docker-compose up -d   # Start services
```

### ML Models (in `ml-models` repository)
```bash
# Environment
python -m venv venv && source venv/bin/activate  # Create virtual env
pip install -r requirements.txt                  # Install dependencies

# Training
python src/training/train.py --config configs/model_config.yaml
python src/training/train.py --resume checkpoints/model_epoch_10.pt

# Evaluation  
python src/evaluation/evaluate.py --model models/best_model.pt --dataset test

# Serving
uvicorn src.inference.api:app --host 0.0.0.0 --port 8080

# MLflow
mlflow ui --host 0.0.0.0 --port 5000

# Testing
pytest tests/          # All tests
pytest --cov=src tests/  # With coverage
```

## Architecture Patterns

### Web Platform Architecture
- **Framework**: Next.js 14 with App Router
- **State Management**: Redux Toolkit with React Query for server state
- **Styling**: Tailwind CSS with component-based architecture
- **Testing**: Jest + React Testing Library for units, Cypress for E2E
- **API Layer**: Axios-based service layer with centralized error handling

### Core Services Architecture  
- **API Design**: RESTful APIs with OpenAPI/Swagger documentation at `/docs`
- **Authentication**: JWT-based with refresh tokens
- **Database**: PostgreSQL with Alembic/migrations, Redis for caching
- **Structure**: Layered architecture (API → Services → Models)
- **Health Checks**: `/health` and `/ready` endpoints for monitoring

### ML Models Architecture
- **Training**: Configuration-driven training with experiment tracking
- **Model Registry**: Versioned models with metadata and metrics
- **Serving**: FastAPI-based inference servers with Docker deployment
- **Data Pipeline**: Structured data processing with validation steps
- **Monitoring**: Performance benchmarks and latency tracking

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

### Web Platform
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)
- `NEXT_PUBLIC_APP_URL`: App URL (default: http://localhost:3000)

### Core Services  
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: JWT signing secret
- `API_KEY`: API authentication key

### ML Models
- `MLFLOW_TRACKING_URI`: MLflow server URL
- `MODEL_REGISTRY_URI`: Model registry location
- `CUDA_VISIBLE_DEVICES`: GPU device selection

## Testing Strategy

### Web Platform
- Unit tests: React components with Testing Library
- Integration tests: API integration and routing
- E2E tests: User workflows with Cypress

### Core Services
- Unit tests: Business logic and utilities
- Integration tests: Database and API endpoints
- E2E tests: Complete request/response flows

### ML Models
- Unit tests: Data processing and model functions
- Integration tests: Training and inference pipelines
- Performance tests: Latency and memory benchmarks

## Deployment Considerations

- All services use Docker with multi-stage builds
- Kubernetes deployments with resource limits and health checks
- ML models require GPU resources for training/inference
- Frontend deploys to CDN with API proxy configuration