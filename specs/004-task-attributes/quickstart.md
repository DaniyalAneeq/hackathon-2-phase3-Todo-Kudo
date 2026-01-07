# Quickstart Guide: Task Attributes Implementation

**Feature**: Task Attributes (Dates, Priority, Categories)
**Branch**: `004-task-attributes`
**For**: Developers implementing this feature

## Prerequisites

- Read `spec.md` (functional requirements)
- Read `plan.md` (technical architecture)
- Read `research.md` (technical decisions)
- Backend and frontend environments set up (from Spec 003)

## Implementation Order

Follow this sequence to minimize integration issues:

1. **Database Layer** (Agent: database-dev-agent)
2. **Backend API** (Agent: backend-dev-agent)
3. **Frontend UI** (Agent: frontend-dev-agent)
4. **Testing & QA** (Agent: qa-spec-validator)

## Step 1: Database Migration

### 1.1 Create Alembic Migration

**File**: `backend/alembic/versions/XXXX_add_task_attributes.py`

```bash
cd backend
alembic revision -m "add task attributes priority due_date category"
```

### 1.2 Write Migration Script

```python
"""add task attributes priority due_date category

Revision ID: [generated]
Revises: [previous_revision]
Create Date: 2026-01-05

"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Add new columns
    op.add_column('tasks', sa.Column('priority', sa.String(length=10), server_default='medium', nullable=False))
    op.add_column('tasks', sa.Column('due_date', sa.DateTime(), nullable=True))
    op.add_column('tasks', sa.Column('category', sa.String(length=100), nullable=True))

    # Create indexes
    op.create_index('ix_tasks_priority', 'tasks', ['priority'])
    op.create_index('ix_tasks_due_date', 'tasks', ['due_date'])
    op.create_index('ix_tasks_category', 'tasks', ['category'])

def downgrade():
    # Drop indexes
    op.drop_index('ix_tasks_category', table_name='tasks')
    op.drop_index('ix_tasks_due_date', table_name='tasks')
    op.drop_index('ix_tasks_priority', table_name='tasks')

    # Drop columns
    op.drop_column('tasks', 'category')
    op.drop_column('tasks', 'due_date')
    op.drop_column('tasks', 'priority')
```

### 1.3 Run Migration

```bash
alembic upgrade head
```

### 1.4 Verify

```bash
# Connect to Neon database and verify schema
psql $DATABASE_URL -c "\d tasks"
# Should see: priority, due_date, category columns + indexes
```

**Checkpoint**: Database schema updated successfully.

---

## Step 2: Backend API

### 2.1 Update Task Model

**File**: `backend/app/models/task.py`

Add after line 6:

```python
from typing import Literal

PriorityLevel = Literal["low", "medium", "high"]
```

Update `TaskBase` class (around line 10):

```python
class TaskBase(SQLModel):
    """Base task fields shared across models"""
    title: str = Field(max_length=255, min_length=1)
    description: Optional[str] = Field(default=None, max_length=2000)
    is_completed: bool = Field(default=False)
    # NEW FIELDS
    priority: PriorityLevel = Field(default="medium")
    due_date: Optional[datetime] = Field(default=None)
    category: Optional[str] = Field(default=None, max_length=100)
```

Update `TaskCreate` (around line 27):

```python
class TaskCreate(TaskBase):
    """Schema for creating a new task"""
    priority: Optional[PriorityLevel] = None
    due_date: Optional[datetime] = None
    category: Optional[str] = None
```

Update `TaskUpdate` (around line 32):

```python
class TaskUpdate(SQLModel):
    """Schema for updating a task (all fields optional)"""
    title: Optional[str] = Field(default=None, max_length=255, min_length=1)
    description: Optional[str] = Field(default=None, max_length=2000)
    is_completed: Optional[bool] = Field(default=None)
    # NEW FIELDS
    priority: Optional[PriorityLevel] = Field(default=None)
    due_date: Optional[datetime] = Field(default=None)
    category: Optional[str] = Field(default=None, max_length=100)
```

**Note**: `TaskResponse` inherits from `TaskBase` - no changes needed.

### 2.2 Verify API Endpoints

**File**: `backend/app/api/tasks.py`

**No changes required** - FastAPI auto-handles new Pydantic fields!

Verify the following work automatically:
- POST /api/tasks accepts new fields
- GET /api/tasks returns new fields
- PUT /api/tasks/{id} accepts new fields

### 2.3 Test Backend

```bash
# Start backend
cd backend
fastapi dev main.py

# Test with curl
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "priority": "high", "due_date": "2026-01-15T23:59:59Z", "category": "Work"}'

# Should return task with new fields
```

**Checkpoint**: Backend API accepting and returning new attributes.

---

## Step 3: Frontend UI

### 3.1 Install Shadcn Components

```bash
cd frontend
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add select
npx shadcn@latest add badge
```

### 3.2 Update Task Type

**File**: `frontend/types/task.ts`

```typescript
export type PriorityLevel = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  // NEW FIELDS
  priority: PriorityLevel;
  due_date: string | null;  // ISO 8601 string
  category: string | null;
}

export interface TaskCreateInput {
  title: string;
  description?: string | null;
  // NEW FIELDS (all optional)
  priority?: PriorityLevel;
  due_date?: string | null;
  category?: string | null;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string | null;
  is_completed?: boolean;
  // NEW FIELDS (all optional)
  priority?: PriorityLevel;
  due_date?: string | null;
  category?: string | null;
}
```

### 3.3 Create Date Formatting Utility

**File**: `frontend/lib/utils.ts` (add to existing file)

```typescript
import { format, isToday, isTomorrow } from 'date-fns';

export function formatDueDate(isoString: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d');  // "Jan 15"
}

export function getPriorityVariant(priority: PriorityLevel): 'destructive' | 'default' | 'secondary' {
  if (priority === 'high') return 'destructive';   // Red
  if (priority === 'medium') return 'default';     // Yellow/default
  return 'secondary';  // Blue/gray for low
}
```

### 3.4 Update CreateTaskForm

**File**: `frontend/components/CreateTaskForm.tsx`

Add state for new fields:

```typescript
const [priority, setPriority] = useState<PriorityLevel>('medium');
const [dueDate, setDueDate] = useState<Date | undefined>();
const [category, setCategory] = useState('');
```

Add form fields (after description input):

```tsx
{/* Priority Select */}
<Select value={priority} onValueChange={(v) => setPriority(v as PriorityLevel)}>
  <SelectTrigger>
    <SelectValue placeholder="Select priority" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="low">Low</SelectItem>
    <SelectItem value="medium">Medium</SelectItem>
    <SelectItem value="high">High</SelectItem>
  </SelectContent>
</Select>

{/* Due Date Picker */}
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      {dueDate ? format(dueDate, 'MMM d, yyyy') : 'Pick a due date'}
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar
      mode="single"
      selected={dueDate}
      onSelect={setDueDate}
    />
  </PopoverContent>
</Popover>

{/* Category Input */}
<Input
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  placeholder="Category (optional, e.g. Work)"
  maxLength={100}
/>
```

Update mutation call:

```typescript
createTask.mutate({
  title,
  description: description || null,
  priority,
  due_date: dueDate ? dueDate.toISOString() : null,
  category: category || null,
});
```

### 3.5 Update TaskCard

**File**: `frontend/components/TaskCard.tsx`

Import badge and date utilities:

```typescript
import { Badge } from '@/components/ui/badge';
import { formatDueDate, getPriorityVariant } from '@/lib/utils';
```

Add to card content (after description, around line 180):

```tsx
<div className="flex gap-2 items-center mt-2">
  {/* Priority Badge */}
  <Badge variant={getPriorityVariant(task.priority)}>
    {task.priority}
  </Badge>

  {/* Due Date */}
  {task.due_date && (
    <span className="text-xs text-muted-foreground">
      📅 {formatDueDate(task.due_date)}
    </span>
  )}

  {/* Category */}
  {task.category && (
    <span className="text-xs px-2 py-1 bg-secondary rounded">
      {task.category}
    </span>
  )}
</div>
```

### 3.6 Update Edit Mode (in TaskCard)

Add state for new fields:

```typescript
const [editedPriority, setEditedPriority] = useState(task.priority);
const [editedDueDate, setEditedDueDate] = useState<Date | undefined>(
  task.due_date ? new Date(task.due_date) : undefined
);
const [editedCategory, setEditedCategory] = useState(task.category || '');
```

Add form fields in edit mode (after description input):

```tsx
{/* Same components as CreateTaskForm */}
```

Update mutation:

```typescript
updateTask.mutate({
  id: task.id,
  data: {
    title: editedTitle,
    description: editedDescription || null,
    priority: editedPriority,
    due_date: editedDueDate ? editedDueDate.toISOString() : null,
    category: editedCategory || null,
  },
});
```

### 3.7 Test Frontend

```bash
cd frontend
npm run dev

# Open http://localhost:3000
# Login → Dashboard
# Test:
# 1. Create task with priority, due date, category
# 2. View task card shows badges and formatted date
# 3. Edit task to change attributes
# 4. Verify persistence after page reload
```

**Checkpoint**: Frontend UI complete with all new attributes.

---

## Step 4: Testing & QA

### 4.1 Regression Testing

**Critical**: Verify existing functionality unchanged (FR-011, FR-012, SC-004, SC-006):

- [ ] Login/logout still works
- [ ] Existing tasks (created before migration) load without errors
- [ ] Existing tasks show default values: `priority="medium"`, `due_date=null`, `category=null`
- [ ] Create task with title only (no new fields) still works
- [ ] Update task without touching new fields still works
- [ ] JWT authentication unchanged

### 4.2 New Feature Testing

**Test Scenarios** (from spec.md User Stories):

- [ ] **P1: Set Priority**
  - Create task with "High" priority → red badge displays
  - Edit task to change "High" → "Low" → blue/gray badge displays
  - Create task without selecting priority → defaults to "Medium" yellow badge

- [ ] **P2: Set Due Date**
  - Create task with due date "Jan 15, 2026" → displays "Jan 15"
  - Create task with due date tomorrow → displays "Tomorrow"
  - Edit task to clear due date → no date shown
  - Reopen edit form → due date persists in picker

- [ ] **P3: Categorize Tasks**
  - Create task with category "Work" → tag displays
  - Create task without category → no tag displays
  - Edit task to add category "Personal" → tag displays

- [ ] **P1: View Enhanced Cards**
  - Task with all attributes → red badge + "Jan 15" + "Work" tag visible
  - Task with only priority → only badge visible (no empty elements)
  - Multiple tasks with different priorities → distinguishable by color

### 4.3 Edge Cases

- [ ] Past due date → displays normally
- [ ] Very long category (95 chars) → truncates with ellipsis, stores full text
- [ ] Task created before migration → loads with defaults
- [ ] Partial attribute set (only priority) → only priority displays
- [ ] Same category name different case ("work" vs "Work") → treated as different

### 4.4 Performance

- [ ] Task creation with all attributes completes in <2s (SC-007)
- [ ] Attribute display after save in <5s (SC-001, SC-002)
- [ ] Full workflow (create → view → edit → verify) in <60s (SC-008)

**Checkpoint**: All tests passing, acceptance criteria met.

---

## Troubleshooting

### Database Migration Fails

**Symptom**: Alembic error "column already exists"

**Solution**:
```bash
# Check current migration state
alembic current

# If column exists, rollback and rerun
alembic downgrade -1
alembic upgrade head
```

### Backend Validation Errors

**Symptom**: 422 error "unexpected value; permitted: 'low', 'medium', 'high'"

**Solution**: Verify `PriorityLevel` type is `Literal["low", "medium", "high"]` (not `Enum`)

### Frontend Type Errors

**Symptom**: TypeScript error "Property 'priority' does not exist on type 'Task'"

**Solution**: Restart TypeScript server (`Cmd+Shift+P` → "Restart TS Server")

### Date Timezone Issues

**Symptom**: Due date shows wrong day

**Solution**: Ensure backend stores UTC, frontend converts to local:
```typescript
// Frontend: Always parse as Date object
const date = new Date(task.due_date);
```

---

## Verification Commands

### Database
```bash
psql $DATABASE_URL -c "SELECT id, title, priority, due_date, category FROM tasks LIMIT 5;"
```

### Backend
```bash
curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Frontend
```bash
# Check build
npm run build

# Check types
npm run type-check  # (if configured)
```

---

## Next Steps

After implementation complete:

1. Run `/sp.tasks` to generate detailed task breakdown
2. Implement tasks in order (DB → Backend → Frontend)
3. Run QA validation after each layer
4. Create PR with reference to this spec
5. Request code review before merge

---

## Reference Links

- Spec: [spec.md](spec.md)
- Plan: [plan.md](plan.md)
- Research: [research.md](research.md)
- Data Model: [data-model.md](data-model.md)
- API Contract: [contracts/task-api.md](contracts/task-api.md)
- Shadcn UI: https://ui.shadcn.com/docs
- date-fns: https://date-fns.org/docs
