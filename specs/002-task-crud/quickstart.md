# Quick Start: Task CRUD Implementation

**Feature**: Basic Task CRUD Operations
**Phase**: 1 - Design & Contracts
**Date**: 2026-01-01

## Prerequisites

Before implementing this feature, ensure you have:

- ✅ Neon Serverless PostgreSQL database provisioned
- ✅ Backend FastAPI project initialized in `/backend`
- ✅ Frontend Next.js 16+ project initialized in `/frontend`
- ✅ Python 3.11+ and Node.js 18+ installed
- ✅ Environment variables configured (see below)

## Environment Setup

### Backend Environment (`backend/.env`)

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Demo User (temporary for this phase)
DEMO_USER_ID=demo-user-123

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true
```

### Frontend Environment (`frontend/.env.local`)

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Demo User (temporary for this phase)
NEXT_PUBLIC_DEMO_USER_ID=demo-user-123
```

## Installation Steps

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn sqlmodel psycopg2-binary alembic python-dotenv

# Initialize Alembic (if not already done)
alembic init alembic

# Create database migration
alembic revision --autogenerate -m "Create tasks table"

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
npm install @tanstack/react-query zod react-hook-form @hookform/resolvers
npm install date-fns  # For date formatting

# Install Shadcn UI components
npx shadcn@latest add card
npx shadcn@latest add checkbox
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add toast
npx shadcn@latest add skeleton

# Start development server
npm run dev
```

### 3. Verify Installation

1. Backend health check:
   ```bash
   curl http://localhost:8000/api/health
   ```

2. Frontend access:
   - Open browser to `http://localhost:3000`
   - Should see Next.js welcome page

## Implementation Checklist

Follow these steps in order to implement the Task CRUD feature:

### Phase 1: Database Layer

- [ ] Create `backend/app/models/task.py` with Task, TaskCreate, TaskUpdate, TaskResponse models
- [ ] Generate Alembic migration for tasks table
- [ ] Run migration with `alembic upgrade head`
- [ ] Verify table creation in Neon dashboard

### Phase 2: Backend API

- [ ] Create `backend/app/api/routes/tasks.py` router
- [ ] Implement `GET /api/tasks` endpoint (list all tasks)
- [ ] Implement `POST /api/tasks` endpoint (create task)
- [ ] Implement `GET /api/tasks/{id}` endpoint (get single task)
- [ ] Implement `PATCH /api/tasks/{id}` endpoint (update task)
- [ ] Implement `DELETE /api/tasks/{id}` endpoint (delete task)
- [ ] Register router in `backend/app/main.py`
- [ ] Test endpoints with curl or Postman

### Phase 3: Frontend Types & Schemas

- [ ] Create `frontend/src/types/task.ts` with TypeScript interfaces
- [ ] Create `frontend/src/schemas/task.ts` with Zod validation schemas
- [ ] Create `frontend/src/lib/constants.ts` with `DEMO_USER_ID` constant

### Phase 4: Frontend API Client

- [ ] Create `frontend/src/lib/api-client.ts` with fetch wrapper
- [ ] Implement `fetchTasks()` function
- [ ] Implement `createTask()` function
- [ ] Implement `updateTask()` function
- [ ] Implement `deleteTask()` function
- [ ] Add error handling and type safety

### Phase 5: React Query Hooks

- [ ] Create `frontend/src/hooks/useTasks.ts` with `useQuery` for listing
- [ ] Create `frontend/src/hooks/useCreateTask.ts` with `useMutation` for creation
- [ ] Create `frontend/src/hooks/useUpdateTask.ts` with `useMutation` for updates
- [ ] Create `frontend/src/hooks/useDeleteTask.ts` with `useMutation` for deletion
- [ ] Configure cache invalidation after mutations

### Phase 6: UI Components

- [ ] Create `frontend/src/components/CreateTaskForm.tsx` (form with input)
- [ ] Create `frontend/src/components/TaskCard.tsx` (individual task display)
- [ ] Create `frontend/src/components/TaskList.tsx` (list container)
- [ ] Create `frontend/src/components/EmptyState.tsx` (no tasks message)
- [ ] Add loading skeletons for async states

### Phase 7: Main Page Integration

- [ ] Update `frontend/src/app/page.tsx` to use task components
- [ ] Configure React Query provider in `frontend/src/app/layout.tsx`
- [ ] Add toast provider for notifications
- [ ] Test full workflow (create → view → complete → delete)

### Phase 8: Error Handling & UX

- [ ] Add form validation with Zod + React Hook Form
- [ ] Add error toasts for API failures
- [ ] Add loading states during mutations
- [ ] Add optimistic updates for completion toggle
- [ ] Test edge cases (empty title, network failures, etc.)

## Testing Commands

### Backend Tests

```bash
cd backend

# Test task creation
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task", "description": "Test description"}'

# Test task listing
curl http://localhost:8000/api/tasks

# Test task update
curl -X PATCH http://localhost:8000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"is_completed": true}'

# Test task deletion
curl -X DELETE http://localhost:8000/api/tasks/1
```

### Frontend Tests

1. Manual testing in browser:
   - Navigate to `http://localhost:3000`
   - Create a task with title "Test Task"
   - Verify task appears in list
   - Toggle completion checkbox
   - Verify strikethrough styling
   - Delete the task
   - Verify task is removed

2. Automated tests (if implemented):
   ```bash
   cd frontend
   npm test
   ```

## Verification Checklist

After implementation, verify these success criteria:

- [ ] **SC-001**: Task list loads within 2 seconds
- [ ] **SC-002**: New task appears within 1 second of submission
- [ ] **SC-003**: Completion toggle shows visual change under 200ms
- [ ] **SC-004**: All operations persist after page refresh
- [ ] **SC-005**: Loading states appear for operations > 500ms
- [ ] **SC-006**: Full workflow (create → complete → delete) works without errors
- [ ] **SC-007**: UI remains responsive with 100 tasks
- [ ] **SC-008**: Error messages are clear and actionable
- [ ] **SC-009**: Visual feedback appears within 300ms

## Common Issues & Solutions

### Issue: Database connection fails

**Solution**: Verify `DATABASE_URL` in `backend/.env` is correct. Check Neon dashboard for connection string.

### Issue: CORS errors in frontend

**Solution**: Add CORS middleware to FastAPI:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Tasks not filtering by user_id

**Solution**: Ensure all database queries include `WHERE user_id = DEMO_USER_ID`. Check `backend/app/api/routes/tasks.py` implementation.

### Issue: Form validation not working

**Solution**: Verify Zod schema is imported and used in `react-hook-form`:
```typescript
const form = useForm<TaskCreateInput>({
  resolver: zodResolver(taskCreateSchema),
});
```

### Issue: React Query not refetching after mutation

**Solution**: Ensure mutation's `onSuccess` callback invalidates the query cache:
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['tasks'] });
}
```

## Next Steps

After completing this quickstart:

1. Review `specs/002-task-crud/tasks.md` for detailed task breakdown
2. Implement each task incrementally (smallest viable change)
3. Run tests after each task completion
4. Document any deviations from the plan in ADRs
5. Prepare for next phase (authentication integration)

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Shadcn UI Components](https://ui.shadcn.com/)
- [Zod Documentation](https://zod.dev/)
- [Neon Serverless PostgreSQL](https://neon.tech/docs)
