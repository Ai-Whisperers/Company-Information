# Core Services

Backend services and APIs for AI-Whisperers platform.

## Architecture

This repository contains the core backend services that power the AI-Whisperers platform.

## Tech Stack

- **Language**: Python 3.11+ / Node.js 18+
- **Framework**: FastAPI / Express.js
- **Database**: PostgreSQL, Redis
- **Message Queue**: RabbitMQ / Kafka
- **Container**: Docker
- **Orchestration**: Kubernetes

## Project Structure

```
core-services/
├── src/
│   ├── api/           # REST API endpoints
│   ├── services/      # Business logic layer
│   ├── models/        # Data models and schemas
│   ├── middleware/    # Custom middleware
│   └── utils/         # Utility functions
├── tests/
│   ├── unit/          # Unit tests
│   ├── integration/   # Integration tests
│   └── e2e/           # End-to-end tests
├── docs/              # API documentation
├── docker/            # Docker configurations
└── scripts/           # Utility scripts
```

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Python 3.11+ or Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/Ai-Whisperers/core-services.git
cd core-services
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Install dependencies:
```bash
# Python
pip install -r requirements.txt

# Node.js
npm install
```

4. Run with Docker:
```bash
docker-compose up -d
```

5. Run migrations:
```bash
# Python
alembic upgrade head

# Node.js
npm run migrate
```

6. Start development server:
```bash
# Python
uvicorn src.main:app --reload --port 8000

# Node.js
npm run dev
```

## API Documentation

API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

## Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run typecheck

# Format code
npm run format
```

## Deployment

### Docker Build

```bash
docker build -t ai-whisperers/core-services:latest .
```

### Kubernetes Deployment

```bash
kubectl apply -f k8s/
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `API_KEY` | API authentication key | - |
| `LOG_LEVEL` | Logging level | `info` |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - List users
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Health
- `GET /health` - Health check
- `GET /ready` - Readiness check

## Contributing

Please read our [Contributing Guide](https://github.com/Ai-Whisperers/documentation/blob/main/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is proprietary and confidential.