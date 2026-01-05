# Quickstart Guide - Project Foundation

**Feature**: 001-project-overview
**Date**: 2025-12-31
**Audience**: Developers setting up the project for the first time

## Purpose

This guide walks you through setting up the Todo application development environment from scratch. By the end, you'll have a working Next.js frontend and FastAPI backend communicating through a health check endpoint, with Better Auth configured and Neon PostgreSQL connected.

---

## Prerequisites

### Required Software

- **Node.js**: v20.x or higher ([Download](https://nodejs.org/))
- **Python**: v3.11 or higher ([Download](https://www.python.org/downloads/))
- **Git**: Latest stable version
- **A code editor**: VS Code recommended

### Required Accounts

- **Neon**: PostgreSQL database ([Sign up](https://neon.tech/))
- **GitHub**: For version control (optional but recommended)

### Environment

- **Operating System**: Linux, macOS, or Windows with WSL2
- **Terminal**: Bash, Zsh, or PowerShell

---

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd phase-2-todo-project

# Verify you're on the correct branch
git checkout 001-project-overview
```

---

## Step 2: Set Up Neon Database

### 2.1 Create a Neon Project

1. Go to [Neon Console](https://console.neon.tech/)
2. Click **"Create Project"**
3. Project name: `todo-app-dev`
4. Region: Choose closest to your location
5. Click **"Create"**

### 2.2 Get Connection String

1. In the Neon dashboard, click **"Connection Details"**
2. Copy the **Pooled Connection String**
3. Format: `postgresql://user:password@host/dbname?sslmode=require`

### 2.3 Configure Backend Environment

Create `backend/.env`:

```bash
cd backend
touch .env
```

Add the following to `backend/.env`:

```env
# Database Configuration
DATABASE_URL=postgresql+asyncpg://[YOUR_NEON_CONNECTION_STRING]

# Database Pool Settings
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_RECYCLE=3600

# Better Auth Secret (generate a random 32-character string)
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-replace-this-in-production

# CORS Settings
CORS_ORIGINS=http://localhost:3000

# Environment
ENVIRONMENT=development
```

**Generate a secure secret**:
```bash
# On Linux/macOS
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## Step 3: Set Up Backend (FastAPI)

### 3.1 Install Python Dependencies

```bash
# Navigate to backend directory (if not already there)
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3.2 Initialize Database with Alembic

```bash
# Initialize Alembic (only needed once, may already be done)
alembic init alembic

# Run migrations to create tables
alembic upgrade head
```

### 3.3 Start the Backend Server

```bash
# Run FastAPI development server
fastapi dev app/main.py

# Server should start on http://localhost:8000
# You should see: "Application startup complete."
```

**Verify Backend**:
Open http://localhost:8000/docs to see the interactive API documentation (Swagger UI).

---

## Step 4: Set Up Frontend (Next.js)

### 4.1 Configure Frontend Environment

Open a **new terminal** (keep backend running), navigate to frontend:

```bash
cd frontend
touch .env.local
```

Add the following to `frontend/.env.local`:

```env
# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-replace-this-in-production
BETTER_AUTH_URL=http://localhost:3000

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Database (Better Auth uses frontend database)
DATABASE_URL=postgresql://[YOUR_NEON_CONNECTION_STRING]

# Environment
NODE_ENV=development
```

**Important**: Use the **same** `BETTER_AUTH_SECRET` as the backend.

### 4.2 Install Frontend Dependencies

```bash
# Install Node.js dependencies
npm install

# Or with yarn
yarn install

# Or with pnpm
pnpm install
```

### 4.3 Start the Frontend Server

```bash
# Run Next.js development server
npm run dev

# Server should start on http://localhost:3000
# You should see: "Ready in [time]"
```

**Verify Frontend**:
Open http://localhost:3000 in your browser. You should see the home page.

---

## Step 5: Verify Full Stack Integration

### 5.1 Test Health Endpoint

**Option 1: Browser**
- Open http://localhost:8000/api/health
- You should see:
  ```json
  {
    "status": "healthy",
    "message": "Todo API is running",
    "timestamp": "2025-12-31T12:00:00Z"
  }
  ```

**Option 2: Command Line**
```bash
curl http://localhost:8000/api/health
```

### 5.2 Test Frontend-Backend Communication

1. Navigate to http://localhost:3000 in your browser
2. Open browser DevTools (F12) → Console
3. Frontend should display the health status from the backend
4. Check for CORS errors (there should be none)

---

## Step 6: Verify Authentication Setup

### 6.1 Check Better Auth Configuration

1. Open http://localhost:3000/api/auth (Better Auth introspection endpoint)
2. You should see Better Auth metadata (providers, endpoints, etc.)

### 6.2 Test User Registration (Optional)

1. Navigate to http://localhost:3000/signup (if implemented)
2. Register a test user
3. Check Neon database for new user record:
   ```sql
   SELECT * FROM users ORDER BY created_at DESC LIMIT 1;
   ```

---

## Troubleshooting

### Backend Issues

**Issue**: `ModuleNotFoundError: No module named 'fastapi'`
- **Solution**: Ensure virtual environment is activated and dependencies installed:
  ```bash
  source venv/bin/activate  # or venv\Scripts\activate on Windows
  pip install -r requirements.txt
  ```

**Issue**: `alembic.util.exc.CommandError: Can't locate revision identified by`
- **Solution**: Reset Alembic and re-run migrations:
  ```bash
  alembic downgrade base
  alembic upgrade head
  ```

**Issue**: `sqlalchemy.exc.OperationalError: could not connect to server`
- **Solution**: Verify `DATABASE_URL` in `backend/.env` is correct and Neon database is running

### Frontend Issues

**Issue**: `Error: Cannot find module 'next'`
- **Solution**: Install dependencies:
  ```bash
  npm install
  ```

**Issue**: `CORS policy: No 'Access-Control-Allow-Origin' header`
- **Solution**: Verify `CORS_ORIGINS` in `backend/.env` includes `http://localhost:3000`

**Issue**: `Better Auth: Invalid secret`
- **Solution**: Ensure `BETTER_AUTH_SECRET` is the same in both `backend/.env` and `frontend/.env.local`, and is at least 32 characters

### Database Issues

**Issue**: `Table 'users' doesn't exist`
- **Solution**: Run Alembic migrations:
  ```bash
  cd backend
  alembic upgrade head
  ```

**Issue**: `Connection refused to Neon`
- **Solution**: Check Neon project status in dashboard, verify connection string includes `?sslmode=require`

---

## Development Workflow

### Starting Development

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
fastapi dev app/main.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Stopping Development

- Press `Ctrl+C` in both terminals
- Deactivate Python virtual environment: `deactivate`

### Making Changes

1. **Backend changes**: FastAPI auto-reloads on file changes
2. **Frontend changes**: Next.js auto-reloads on file changes (Hot Module Replacement)
3. **Database schema changes**:
   ```bash
   cd backend
   alembic revision --autogenerate -m "Description of change"
   alembic upgrade head
   ```

---

## Useful Commands

### Backend

```bash
# Run development server
fastapi dev app/main.py

# Generate database migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1

# View migration history
alembic history

# Run tests (future)
pytest
```

### Frontend

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Lint code
npm run lint

# Run tests (future)
npm test
```

---

## Next Steps

Once you have the development environment running:

1. **Review the codebase structure**: Familiarize yourself with the monorepo layout
2. **Read the feature specs**: Review `specs/001-project-overview/spec.md` and `plan.md`
3. **Explore the API**: Use http://localhost:8000/docs (Swagger UI) to test endpoints
4. **Start implementing features**: Follow the `/sp.tasks` output for task breakdown

---

## Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Better Auth Documentation**: https://www.better-auth.com/docs
- **Neon Documentation**: https://neon.tech/docs
- **SQLModel Documentation**: https://sqlmodel.tiangolo.com/
- **Alembic Documentation**: https://alembic.sqlalchemy.org/

---

## Support

If you encounter issues not covered in this guide:

1. Check the `specs/001-project-overview/` directory for detailed documentation
2. Review error logs in terminal output
3. Check browser DevTools console for frontend errors
4. Consult the project's GitHub Issues page (if available)

**Phase 1 (Quickstart) Complete** ✅
