# ArchitectAI Backend

AI-Powered System Architecture Generator using Amazon Nova models.

## Features

- **Architecture Generation**: Transform business requirements into complete AWS architectures using Nova Lite
- **Cost Analysis**: Real-time AWS cost calculation and optimization using Nova Micro
- **Implementation Planning**: Generate Infrastructure as Code and deployment roadmaps
- **Multi-modal Input**: Process text, documents, and images using Nova's multimodal capabilities

## Tech Stack

- **FastAPI** — async API framework
- **Python 3.11** — with type hints and async support
- **Amazon Nova** — Lite (architecture reasoning), Micro (cost optimization), Canvas (diagram generation)
- **AWS Bedrock** — model access
- **PostgreSQL** — primary database
- **SQLAlchemy** — async ORM
- **Pydantic** — data validation and serialization

## Quick Start

### Prerequisites

- Python 3.11+
- AWS account with Bedrock access (Nova models enabled in your region)
- PostgreSQL database

### Local Development (Poetry)

```bash
cd backend
poetry install
cp .env.example .env   # fill in AWS credentials + DATABASE_URL
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Docker (full stack)

```bash
# From repo root
docker compose up -d
```

API docs available at http://localhost:8000/docs (DEBUG mode only).

## Environment Variables

```bash
# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
NOVA_MODEL_REGION=us-east-1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/architectai

# Security
JWT_SECRET_KEY=your-32-character-secret-key

# App
DEBUG=false
LOG_LEVEL=INFO
```

## API Endpoints

### Architectures

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/architectures/generate` | Generate architecture from requirements |
| `GET` | `/api/v1/architectures/` | List user's architectures |
| `GET` | `/api/v1/architectures/{id}` | Get architecture details |
| `DELETE` | `/api/v1/architectures/{id}` | Delete architecture |
| `POST` | `/api/v1/architectures/{id}/diagram` | Generate visual diagram |
| `GET` | `/api/v1/architectures/{id}/roadmap` | Get cached implementation roadmap |
| `POST` | `/api/v1/architectures/{id}/roadmap` | Generate implementation roadmap |
| `GET` | `/api/v1/architectures/{id}/feedback` | Get user feedback |
| `POST` | `/api/v1/architectures/{id}/feedback` | Submit rating + feedback |

### Users

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/users/register` | Register new user |
| `POST` | `/api/v1/users/login` | Authenticate |
| `GET` | `/api/v1/users/profile` | Get profile |
| `POST` | `/api/v1/users/logout` | Logout |

### Other

- `GET /health` — service health (DB + Nova connectivity)
- `GET /info` — app stats
- `GET /api/v1/cost/...` — cost analysis endpoints
- `GET /api/v1/templates/...` — architecture templates

## Project Structure

```
app/
├── main.py                        # FastAPI app, middleware, startup
├── core/
│   ├── config.py                  # Settings (env vars)
│   ├── database.py                # Async SQLAlchemy session
│   ├── security.py                # JWT auth
│   └── logging.py                 # Structured logging
├── services/
│   ├── nova_client.py             # Amazon Nova / Bedrock client
│   ├── architecture_generator.py  # Architecture generation logic
│   └── cost_calculator.py         # AWS cost analysis
├── api/v1/
│   ├── architectures.py
│   ├── users.py
│   ├── cost_analysis.py
│   ├── projects.py
│   └── templates.py
└── models/
    └── architecture_models.py     # Pydantic schemas
```

## Deployment

See `DEPLOY.md` in the repo root for deployment options:
- **Super Lite** — single EC2, everything in Docker Compose
- **Standard** — EC2 backend + S3/CloudFront frontend
- **ECS Fargate** — fully containerized on AWS

### Production Checklist

- [ ] `DEBUG=false`
- [ ] Strong `JWT_SECRET_KEY`
- [ ] `CORS_ORIGINS` set to your frontend domain
- [ ] PostgreSQL with persistent volume
- [ ] Health check at `/health`

---

**Built for the Amazon Nova Hackathon 2026**
