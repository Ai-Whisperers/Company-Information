# Getting Started

Welcome to AI-Whisperers! This guide will help you get up and running with our platform.

## Table of Contents
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Setup](#development-setup)
- [First Steps](#first-steps)
- [Next Steps](#next-steps)

## Quick Start

Get AI-Whisperers running in under 5 minutes:

```bash
# Clone the repositories
git clone https://github.com/Ai-Whisperers/core-services.git
git clone https://github.com/Ai-Whisperers/web-platform.git

# Start with Docker Compose
cd core-services
docker-compose up -d

# Access the platform
open http://localhost:3000
```

## Prerequisites

### Required Software
- **Git** 2.34+
- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Node.js** 18+ (for local development)
- **Python** 3.11+ (for ML models)

### Recommended Tools
- **VS Code** with recommended extensions
- **Postman** or similar API testing tool
- **GitHub CLI** for easier GitHub operations

## Installation

### 1. Clone Repositories

```bash
# Create workspace directory
mkdir ai-whisperers-workspace
cd ai-whisperers-workspace

# Clone all repositories
git clone https://github.com/Ai-Whisperers/core-services.git
git clone https://github.com/Ai-Whisperers/web-platform.git
git clone https://github.com/Ai-Whisperers/ml-models.git
git clone https://github.com/Ai-Whisperers/infrastructure.git
git clone https://github.com/Ai-Whisperers/documentation.git
```

### 2. Environment Setup

```bash
# Copy environment files
cp core-services/.env.example core-services/.env
cp web-platform/.env.example web-platform/.env.local
cp ml-models/.env.example ml-models/.env

# Edit environment files with your configuration
# Use your preferred editor
```

### 3. Docker Setup

```bash
# Build and start all services
docker-compose -f docker-compose.yml up -d

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f
```

### 4. Database Setup

```bash
# Run database migrations
docker-compose exec api npm run migrate

# Seed initial data (optional)
docker-compose exec api npm run seed
```

## Development Setup

### Backend Services

```bash
cd core-services

# Install dependencies
npm install

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### Frontend Platform

```bash
cd web-platform

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

### ML Models

```bash
cd ml-models

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Jupyter notebook
jupyter notebook
```

## First Steps

### 1. Access the Platform

Navigate to http://localhost:3000 in your browser.

### 2. Create an Account

1. Click "Sign Up"
2. Enter your details
3. Verify your email
4. Log in

### 3. Explore Features

- **Dashboard** - Overview of your activities
- **Projects** - Create and manage projects
- **API Explorer** - Test API endpoints
- **Documentation** - Access help and guides

### 4. Make Your First API Call

```bash
# Get authentication token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "password": "yourpassword"}'

# Use the token for authenticated requests
curl -X GET http://localhost:8000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Configuration

### Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Web Platform | 3000 | Frontend application |
| API Server | 8000 | Backend API |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache and queue |
| PgAdmin | 5050 | Database management |

### Environment Variables

Key environment variables to configure:

```bash
# API Configuration
API_URL=http://localhost:8000
API_KEY=your-api-key

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Authentication
JWT_SECRET=your-secret-key
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Docker Issues
```bash
# Reset Docker environment
docker-compose down -v
docker system prune -a
docker-compose up -d
```

#### Database Connection Failed
```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

## Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
```bash
# Make your code changes
# Run tests
npm test

# Commit changes
git add .
git commit -m "feat: add new feature"
```

### 3. Push and Create PR
```bash
git push origin feature/your-feature-name
# Create pull request on GitHub
```

## Testing

### Running Tests

```bash
# Backend tests
cd core-services
npm test

# Frontend tests
cd web-platform
npm test

# ML model tests
cd ml-models
pytest tests/
```

### Test Coverage

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/index.html
```

## Next Steps

Now that you have AI-Whisperers running:

1. 📚 Read the [Architecture Overview](../architecture/README.md)
2. 🔧 Explore the [API Reference](../api-reference/README.md)
3. 🎓 Follow our [Tutorials](../tutorials/README.md)
4. 🤝 Learn about [Contributing](../contributing/README.md)
5. 💬 Join our [Community](https://github.com/orgs/Ai-Whisperers/discussions)

## Getting Help

- 📖 [Documentation](https://docs.ai-whisperers.com)
- 💬 [GitHub Discussions](https://github.com/orgs/Ai-Whisperers/discussions)
- 🐛 [Report Issues](https://github.com/Ai-Whisperers/core-services/issues)
- 📧 Email: support@ai-whisperers.com

## Additional Resources

- [Video Tutorials](https://youtube.com/@ai-whisperers)
- [Blog Posts](https://blog.ai-whisperers.com)
- [API Postman Collection](https://postman.com/ai-whisperers)
- [Developer Portal](https://developers.ai-whisperers.com)