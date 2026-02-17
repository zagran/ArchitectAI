# ArchitectAI Backend

AI-Powered System Architecture Generator using Amazon Nova models.

## Features

- **Architecture Generation**: Transform business requirements into complete AWS architectures using Nova 2 Lite
- **Visual Diagrams**: Generate professional architecture diagrams using Nova Canvas
- **Cost Analysis**: Real-time AWS cost calculation and optimization using Nova Micro
- **Multi-modal Input**: Process text, documents, and images using Nova's advanced capabilities
- **Implementation Planning**: Generate Infrastructure as Code and deployment roadmaps

## Tech Stack

- **FastAPI**: High-performance async API framework
- **Python 3.11**: Latest Python with type hints and async support
- **Amazon Nova**: All 4 Nova models integrated (Lite, Canvas, Micro, Multimodal)
- **AWS Bedrock**: Model access and management
- **PostgreSQL**: Primary database for persistence
- **Redis**: Caching and session management
- **SQLAlchemy**: Async ORM with database migrations
- **Pydantic**: Data validation and serialization

## Quick Start

### Prerequisites
- Python 3.11+
- AWS Account with Bedrock access
- PostgreSQL database
- Redis (optional, for caching)

### Installation

1. **Clone and setup**:
   ```bash
   cd architectai-backend
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your AWS credentials and database URL
   ```

3. **Database Setup**:
   ```bash
   # In production, run migrations
   alembic upgrade head
   ```

4. **Run the application**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Docker Setup

```bash
# Build and run with Docker
docker build -t architectai-backend .
docker run -p 8000:8000 --env-file .env architectai-backend
```

## API Documentation

Once running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Environment Variables

Required environment variables:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
NOVA_MODEL_REGION=us-east-1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/architectai

# Security
JWT_SECRET_KEY=your-32-character-secret-key

# Optional
REDIS_URL=redis://localhost:6379
DEBUG=false
LOG_LEVEL=INFO
```

## API Endpoints

### Core Architecture Endpoints

- `POST /api/v1/architectures/generate` - Generate architecture from requirements
- `POST /api/v1/architectures/{id}/diagram` - Generate visual diagram
- `GET /api/v1/architectures/{id}` - Get architecture details
- `POST /api/v1/architectures/{id}/optimize` - Get optimization suggestions
- `POST /api/v1/architectures/analyze-diagram` - Analyze uploaded diagram

### Cost Analysis

- `POST /api/v1/cost/calculate` - Calculate detailed costs
- `GET /api/v1/cost/{architecture_id}/optimize` - Get cost optimizations
- `GET /api/v1/cost/pricing/services` - Get AWS service pricing

### Project Management

- `POST /api/v1/projects/` - Create project
- `GET /api/v1/projects/` - List projects
- `GET /api/v1/projects/{id}` - Get project details
- `PUT /api/v1/projects/{id}` - Update project

### Templates

- `GET /api/v1/templates/` - List architecture templates
- `GET /api/v1/templates/{id}` - Get template details
- `POST /api/v1/templates/{id}/instantiate` - Create architecture from template

### User Management

- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - User authentication
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile

## Architecture

### Project Structure

```
app/
├── main.py                 # FastAPI application entry point
├── core/                   # Core configuration and utilities
│   ├── config.py          # Application settings
│   ├── database.py        # Database connection and session management
│   ├── security.py        # Authentication and authorization
│   └── logging.py         # Structured logging setup
├── services/              # Business logic services
│   ├── nova_client.py     # Amazon Nova integration
│   ├── architecture_generator.py  # Architecture generation logic
│   └── cost_calculator.py # Cost analysis and AWS pricing
├── api/v1/               # API route handlers
│   ├── architectures.py  # Architecture endpoints
│   ├── projects.py       # Project management
│   ├── templates.py      # Template management
│   ├── cost_analysis.py  # Cost analysis endpoints
│   └── users.py          # User management
├── models/               # Data models and schemas
│   └── architecture_models.py  # Pydantic models
└── templates/            # Architecture patterns and templates
    └── aws_patterns.py   # AWS architecture pattern library
```

### Amazon Nova Integration

The backend integrates all 4 Nova model categories:

1. **Nova 2 Lite**: Advanced reasoning for requirements extraction and architecture design
2. **Nova Canvas**: Visual diagram generation with professional AWS standards
3. **Nova Micro**: Fast optimization suggestions and cost analysis
4. **Multimodal**: Process text, documents, and existing architecture diagrams

### Key Services

- **ArchitectureGeneratorService**: Orchestrates architecture generation using Nova models
- **CostCalculatorService**: Integrates with AWS Pricing API for real-time cost analysis
- **NovaClient**: Centralized client for all Nova model interactions
- **AWSPatternLibrary**: Curated library of architecture patterns and best practices

## Development

### Code Quality

```bash
# Format code
black app/
isort app/

# Lint code
flake8 app/
mypy app/

# Run tests
pytest tests/ -v --cov=app
```

### Adding New Features

1. **New API Endpoints**: Add routes in `app/api/v1/`
2. **Business Logic**: Add services in `app/services/`
3. **Data Models**: Update `app/models/architecture_models.py`
4. **Nova Integration**: Extend `app/services/nova_client.py`

### Database Migrations

```bash
# Generate migration
alembic revision --autogenerate -m "Description"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_architecture_generator.py -v
```

## Deployment

### Production Checklist

- [ ] Set `DEBUG=false`
- [ ] Use secure `JWT_SECRET_KEY`
- [ ] Configure proper database connection pooling
- [ ] Set up Redis for caching
- [ ] Configure structured logging
- [ ] Set up monitoring and health checks
- [ ] Configure CORS for production domains
- [ ] Set up SSL/TLS certificates

### AWS Deployment

The backend is designed to run on:
- **AWS ECS/Fargate**: Containerized deployment
- **AWS Lambda**: Serverless API (with adapter)
- **EC2**: Traditional server deployment

## Monitoring

- **Health Checks**: `/health` endpoint with service status
- **Metrics**: Prometheus metrics for monitoring
- **Logging**: Structured JSON logging with correlation IDs
- **Tracing**: Optional AWS X-Ray integration for distributed tracing

## Security

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive input sanitization and validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Configurable cross-origin resource sharing
- **Security Headers**: Standard security headers for API responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run code quality checks
5. Submit pull request

## License

MIT License - see LICENSE file for details.

---

**Built for the Amazon Nova Hackathon 2026**
