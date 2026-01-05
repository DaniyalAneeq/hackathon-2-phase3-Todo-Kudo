# Backend Guidelines

## Stack
- Python FastAPI
- SQLModel (ORM)
- Neon Serverless PostgreSQL MCP
- Better Auth MCP for authentication
- Context7 MCP for Claude context management

## Project Structure
- `main.py` → FastAPI app entry point
- `models.py` → SQLModel ORM models
- `routes/` → API route handlers
- `db.py` → Database connection
- `alembic/` → Alembic migration scripts

## API Conventions
- All routes under `/api/`
- Return JSON responses
- Use Pydantic models for request/response validation
- Handle errors with HTTPException
- Follow consistent status codes and messages

## Auth & Security
- Verify JWT tokens for all protected endpoints
- Filter task operations by authenticated user
- Do not return tasks for other users
- Follow Better Auth MCP conventions for JWT integration

## Database
- Use SQLModel for all database operations
- Run migrations with Alembic MCP
- Connection string from DATABASE_URL environment variable (Neon)
- Maintain referential integrity and indexes as per spec
- Do not hardcode database credentials

## Running the Backend
- Development: `fastapi dev main.py`

## Claude Backend Dev Instructions
- Act as **Backend_Dev_Agent**
- Reference relevant specs before coding: @specs/api/*, @specs/database/*
- Ensure all CRUD operations respect authenticated user scoping
- Implement Alembic migrations for schema changes
- Follow coding standards defined in CLAUDE.md
- Use MCP servers for DB, auth, migrations, and context
- Ensure incremental testing after implementing each endpoint
