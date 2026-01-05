# Code Refactoring Specialist

Improves code quality, readability, and maintainability through systematic refactoring while preserving functionality and ensuring test coverage.

## Purpose

This skill analyzes code for smells, duplication, and inefficiencies, then applies industry-standard refactoring patterns to improve structure, performance, and maintainability. It ensures all refactorings are safe, tested, and aligned with project conventions defined in CLAUDE.md.

## Core Capabilities

- **Code Smell Detection**: Identify duplication, long functions, god classes, tight coupling
- **Refactoring Patterns**: Extract method/component, remove duplication, simplify logic
- **Performance Optimization**: Database query optimization, bundle size reduction, caching
- **Code Quality**: Consistent naming, proper abstractions, SOLID principles
- **Type Safety**: Improve TypeScript/Python type hints
- **Test Coverage**: Ensure refactorings don't break functionality
- **Documentation**: Document significant structural changes
- **Standards Compliance**: Follow CLAUDE.md and project conventions

## When to Use This Skill

Use this skill when:
- Code has duplication or copy-paste patterns
- Functions/components are too long or complex
- Performance is suboptimal (slow queries, large bundles)
- Code is difficult to understand or maintain
- Preparing code for production release
- After feature implementation to clean up
- Technical debt has accumulated
- Code review identifies issues
- Merging multiple features with inconsistencies

Do NOT use this skill for:
- Adding new features (use dev agents)
- Fixing bugs (unless root cause is poor structure)
- Changing business logic
- Major architectural redesigns (requires planning)
- Refactoring without tests in place

## Execution Workflow

### Step 1: Code Analysis

**Identify Refactoring Candidates**:
1. **Code Smells**: Long methods, duplicated code, god classes
2. **Performance Issues**: N+1 queries, large bundle sizes, inefficient algorithms
3. **Maintainability**: Poor naming, tight coupling, low cohesion
4. **Inconsistencies**: Mixed patterns, inconsistent formatting
5. **Technical Debt**: TODOs, commented code, unused imports

**Analysis Tools**:
- **Grep**: Find duplicated code patterns
- **Read**: Analyze file structure and complexity
- **Bash**: Run linters (pylint, eslint, prettier)

### Step 2: Plan Refactoring

**Prioritize**:
1. **High Impact, Low Risk**: Remove duplication, rename variables
2. **High Impact, Medium Risk**: Extract methods, simplify logic
3. **Medium Impact, High Risk**: Restructure modules (with tests)

**Create Checklist**:
- [ ] Identify files to refactor
- [ ] Ensure tests exist
- [ ] Plan refactoring steps
- [ ] Run tests before refactoring (baseline)

### Step 3: Apply Refactoring Patterns

**Common Patterns**:
1. **Extract Method/Component**: Break down long functions
2. **Remove Duplication**: DRY principle
3. **Rename**: Improve clarity
4. **Simplify Conditionals**: Reduce nesting, use early returns
5. **Extract Variables**: Improve readability
6. **Optimize Performance**: Cache, memoize, query optimization

### Step 4: Validate Refactoring

**Test-Driven Refactoring**:
1. Run tests before refactoring (green)
2. Apply refactoring
3. Run tests after refactoring (should still be green)
4. If tests fail, revert and adjust approach

**Manual Validation**:
- Code review (self or peer)
- Check for regressions
- Verify performance improvements

### Step 5: Document Changes

**Document**:
- What was refactored and why
- Performance improvements (if applicable)
- Breaking changes (if any)
- Migration guide (if needed)

## Refactoring Patterns

### Pattern 1: Extract Method (Backend)

**Before** (Code Smell: Long Method):
```python
# Backend/app/routes/todos.py

@router.post("/")
async def create_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
):
    # Validation
    if not todo_data.title or len(todo_data.title) > 255:
        raise HTTPException(400, "Invalid title")
    if todo_data.description and len(todo_data.description) > 1000:
        raise HTTPException(400, "Invalid description")
    if todo_data.due_date and todo_data.due_date < datetime.utcnow():
        raise HTTPException(400, "Due date must be in future")

    # Create todo
    todo = Todo(
        title=todo_data.title,
        description=todo_data.description,
        due_date=todo_data.due_date,
        user_id=current_user.id
    )

    # Check for duplicates
    existing = await session.execute(
        select(Todo).where(
            Todo.user_id == current_user.id,
            Todo.title == todo_data.title
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Todo with this title already exists")

    # Save
    session.add(todo)
    await session.commit()
    await session.refresh(todo)

    # Send notification
    if todo.due_date:
        # Complex notification logic...
        pass

    return todo
```

**After** (Refactored):
```python
# Backend/app/routes/todos.py

@router.post("/")
async def create_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
):
    """Create a new todo for the authenticated user"""
    # Validation is handled by Pydantic schema
    await _check_duplicate_title(session, current_user.id, todo_data.title)

    todo = Todo(**todo_data.model_dump(), user_id=current_user.id)

    session.add(todo)
    await session.commit()
    await session.refresh(todo)

    if todo.due_date:
        await _schedule_due_date_notification(todo)

    return todo


async def _check_duplicate_title(
    session: AsyncSession,
    user_id: int,
    title: str
) -> None:
    """Check if user already has a todo with this title"""
    existing = await session.execute(
        select(Todo).where(
            Todo.user_id == user_id,
            Todo.title == title
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Todo with this title already exists"
        )


async def _schedule_due_date_notification(todo: Todo) -> None:
    """Schedule notification for todo due date"""
    # Extracted notification logic
    pass


# Backend/app/schemas/todo.py

class TodoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    due_date: Optional[datetime] = None

    @field_validator('due_date')
    @classmethod
    def validate_due_date(cls, v):
        """Ensure due date is in the future"""
        if v and v < datetime.utcnow():
            raise ValueError('Due date must be in the future')
        return v
```

### Pattern 2: Remove Duplication (Frontend)

**Before** (Code Smell: Duplicated Code):
```tsx
// Frontend/app/dashboard/todos/page.tsx

export default function TodosPage() {
  const [todos, setTodos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const token = localStorage.getItem('auth_token')
        const response = await fetch('http://localhost:8000/api/todos', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setTodos(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTodos()
  }, [])

  // ...
}

// Frontend/app/dashboard/profile/page.tsx

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const token = localStorage.getItem('auth_token')
        const response = await fetch('http://localhost:8000/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setUser(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [])

  // ...
}
```

**After** (Refactored with Custom Hook):
```tsx
// Frontend/hooks/useApi.ts

import { useState, useEffect } from 'react'

interface UseApiResult<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useApi<T>(endpoint: string): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const jsonData = await response.json()
      setData(jsonData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [endpoint])

  return { data, isLoading, error, refetch: fetchData }
}


// Frontend/app/dashboard/todos/page.tsx

export default function TodosPage() {
  const { data: todos, isLoading, error, refetch } = useApi<Todo[]>('/api/todos')

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      {todos?.map(todo => <TodoCard key={todo.id} todo={todo} />)}
    </div>
  )
}


// Frontend/app/dashboard/profile/page.tsx

export default function ProfilePage() {
  const { data: user, isLoading, error } = useApi<User>('/api/users/me')

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return <UserProfile user={user} />
}
```

### Pattern 3: Simplify Conditionals

**Before** (Code Smell: Nested Conditionals):
```python
# Backend/app/services/todo_service.py

async def update_todo_status(
    todo_id: int,
    new_status: str,
    user_id: int,
    session: AsyncSession
):
    todo = await get_todo_by_id(todo_id, session)

    if todo:
        if todo.user_id == user_id:
            if new_status in ["pending", "in_progress", "completed"]:
                if todo.status != new_status:
                    if new_status == "completed" and todo.status != "completed":
                        todo.completed_at = datetime.utcnow()
                    todo.status = new_status
                    await session.commit()
                    return todo
                else:
                    raise ValueError("Status is already set to this value")
            else:
                raise ValueError("Invalid status")
        else:
            raise PermissionError("Not authorized")
    else:
        raise NotFoundError("Todo not found")
```

**After** (Refactored with Early Returns):
```python
# Backend/app/services/todo_service.py

async def update_todo_status(
    todo_id: int,
    new_status: str,
    user_id: int,
    session: AsyncSession
) -> Todo:
    """Update todo status with validation"""
    # Early returns for error cases
    todo = await get_todo_by_id(todo_id, session)
    if not todo:
        raise NotFoundError("Todo not found")

    if todo.user_id != user_id:
        raise PermissionError("Not authorized")

    if new_status not in ["pending", "in_progress", "completed"]:
        raise ValueError(f"Invalid status: {new_status}")

    if todo.status == new_status:
        raise ValueError("Status is already set to this value")

    # Happy path
    todo.status = new_status

    if new_status == "completed":
        todo.completed_at = datetime.utcnow()

    await session.commit()
    return todo
```

### Pattern 4: Extract Constants

**Before** (Code Smell: Magic Numbers/Strings):
```typescript
// Frontend/components/TodoForm.tsx

export default function TodoForm() {
  const validateTitle = (title: string) => {
    if (title.length > 255) {
      return "Title too long"
    }
    return null
  }

  const validateDescription = (desc: string) => {
    if (desc.length > 1000) {
      return "Description too long"
    }
    return null
  }

  // ...
}

// Frontend/components/TodoCard.tsx

export default function TodoCard({ todo }) {
  const isTitleLong = todo.title.length > 255
  const isDescLong = todo.description?.length > 1000
  // ...
}
```

**After** (Refactored with Constants):
```typescript
// Frontend/lib/constants.ts

export const TODO_CONSTRAINTS = {
  TITLE_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 1000,
  TITLE_MIN_LENGTH: 1,
} as const

export const TODO_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const

export type TodoStatus = typeof TODO_STATUS[keyof typeof TODO_STATUS]


// Frontend/lib/validation.ts

import { TODO_CONSTRAINTS } from './constants'

export const validateTitle = (title: string): string | null => {
  if (title.length < TODO_CONSTRAINTS.TITLE_MIN_LENGTH) {
    return "Title is required"
  }
  if (title.length > TODO_CONSTRAINTS.TITLE_MAX_LENGTH) {
    return `Title must be less than ${TODO_CONSTRAINTS.TITLE_MAX_LENGTH} characters`
  }
  return null
}

export const validateDescription = (desc: string): string | null => {
  if (desc.length > TODO_CONSTRAINTS.DESCRIPTION_MAX_LENGTH) {
    return `Description must be less than ${TODO_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters`
  }
  return null
}


// Frontend/components/TodoForm.tsx

import { validateTitle, validateDescription } from '@/lib/validation'

export default function TodoForm() {
  const handleTitleChange = (title: string) => {
    const error = validateTitle(title)
    setTitleError(error)
  }
  // ...
}
```

### Pattern 5: Database Query Optimization

**Before** (Code Smell: N+1 Query Problem):
```python
# Backend/app/routes/todos.py

@router.get("/with-tags")
async def get_todos_with_tags(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
):
    # Get todos
    result = await session.execute(
        select(Todo).where(Todo.user_id == current_user.id)
    )
    todos = result.scalars().all()

    # N+1 problem: One query per todo to get tags
    todos_with_tags = []
    for todo in todos:
        tags_result = await session.execute(
            select(Tag)
            .join(TodoTag)
            .where(TodoTag.todo_id == todo.id)
        )
        tags = tags_result.scalars().all()
        todos_with_tags.append({
            **todo.model_dump(),
            "tags": [tag.model_dump() for tag in tags]
        })

    return todos_with_tags
```

**After** (Refactored with Eager Loading):
```python
# Backend/app/routes/todos.py

from sqlmodel import selectinload

@router.get("/with-tags")
async def get_todos_with_tags(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
):
    """Get todos with tags using eager loading (1 query instead of N+1)"""
    result = await session.execute(
        select(Todo)
        .where(Todo.user_id == current_user.id)
        .options(selectinload(Todo.tags))  # Eager load tags in one query
    )
    todos = result.scalars().all()

    return [
        {
            **todo.model_dump(),
            "tags": [tag.model_dump() for tag in todo.tags]
        }
        for todo in todos
    ]
```

### Pattern 6: Extract Component (Frontend)

**Before** (Code Smell: Large Component):
```tsx
// Frontend/app/dashboard/todos/page.tsx

export default function TodosPage() {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="created_at">Date Created</option>
          <option value="due_date">Due Date</option>
          <option value="title">Title</option>
        </select>

        <button
          onClick={() => setFilter('all')}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          Clear Filters
        </button>
      </div>

      {/* Todo List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Long list rendering logic... */}
      </div>
    </div>
  )
}
```

**After** (Refactored with Extracted Components):
```tsx
// Frontend/components/TodoFilters.tsx

interface TodoFiltersProps {
  filter: string
  sortBy: string
  onFilterChange: (filter: string) => void
  onSortChange: (sortBy: string) => void
  onClear: () => void
}

export default function TodoFilters({
  filter,
  sortBy,
  onFilterChange,
  onSortChange,
  onClear
}: TodoFiltersProps) {
  return (
    <div className="mb-6 flex gap-4">
      <select
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="border rounded px-3 py-2"
        aria-label="Filter todos by status"
      >
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="border rounded px-3 py-2"
        aria-label="Sort todos by"
      >
        <option value="created_at">Date Created</option>
        <option value="due_date">Due Date</option>
        <option value="title">Title</option>
      </select>

      <button
        onClick={onClear}
        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
      >
        Clear Filters
      </button>
    </div>
  )
}


// Frontend/app/dashboard/todos/page.tsx

import TodoFilters from '@/components/TodoFilters'
import TodoGrid from '@/components/TodoGrid'

export default function TodosPage() {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')

  const handleClearFilters = () => {
    setFilter('all')
    setSortBy('created_at')
  }

  return (
    <div>
      <TodoFilters
        filter={filter}
        sortBy={sortBy}
        onFilterChange={setFilter}
        onSortChange={setSortBy}
        onClear={handleClearFilters}
      />

      <TodoGrid filter={filter} sortBy={sortBy} />
    </div>
  )
}
```

### Pattern 7: Type Safety Improvements

**Before** (Code Smell: Weak Typing):
```typescript
// Frontend/lib/api.ts

export async function createTodo(data: any) {
  const response = await fetch('/api/todos', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  return response.json()
}

export async function getTodos(params?: any) {
  const query = params ? `?${new URLSearchParams(params)}` : ''
  const response = await fetch(`/api/todos${query}`)
  return response.json()
}
```

**After** (Refactored with Strong Types):
```typescript
// Frontend/types/todo.ts

export interface Todo {
  id: number
  user_id: number
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateTodoData {
  title: string
  description?: string
  due_date?: string
}

export interface UpdateTodoData {
  title?: string
  description?: string
  status?: Todo['status']
  due_date?: string
}

export interface ListTodosParams {
  status?: Todo['status']
  skip?: number
  limit?: number
  sort_by?: 'created_at' | 'due_date' | 'title'
}


// Frontend/lib/api.ts

import type { Todo, CreateTodoData, UpdateTodoData, ListTodosParams } from '@/types/todo'

export async function createTodo(data: CreateTodoData): Promise<Todo> {
  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return response.json()
}

export async function getTodos(params?: ListTodosParams): Promise<Todo[]> {
  const query = params
    ? `?${new URLSearchParams(params as any)}`
    : ''

  const response = await fetch(`/api/todos${query}`)

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return response.json()
}
```

## Code Smell Detection

### Backend Code Smells

**Long Method**:
```python
# ❌ Bad: Method over 20 lines
def complex_method():
    # 50+ lines of code
    pass

# ✅ Good: Extract to smaller methods
def complex_method():
    prepare_data()
    validate_input()
    process_data()
    send_notification()
```

**Duplicated Code**:
```python
# ❌ Bad: Same logic repeated
if user.is_admin:
    query = select(Todo)
else:
    query = select(Todo).where(Todo.user_id == user.id)

# Somewhere else:
if user.is_admin:
    query = select(Task)
else:
    query = select(Task).where(Task.user_id == user.id)

# ✅ Good: Extract to utility
def scope_by_user(query, model, user):
    if user.is_admin:
        return query
    return query.where(model.user_id == user.id)
```

**Magic Numbers/Strings**:
```python
# ❌ Bad
if len(title) > 255:
    raise ValueError()

# ✅ Good
TITLE_MAX_LENGTH = 255
if len(title) > TITLE_MAX_LENGTH:
    raise ValueError(f"Title exceeds {TITLE_MAX_LENGTH} characters")
```

### Frontend Code Smells

**Prop Drilling**:
```tsx
// ❌ Bad: Passing props through many layers
<App user={user}>
  <Layout user={user}>
    <Page user={user}>
      <Component user={user} />

// ✅ Good: Use Context
const UserContext = createContext()

<UserProvider value={user}>
  <App>
    <Layout>
      <Page>
        <Component />  // Uses useUser() hook
```

**God Component**:
```tsx
// ❌ Bad: Component does everything
function TodoPage() {
  // 500+ lines
  // Handles: fetching, state, UI, forms, validation, etc.
}

// ✅ Good: Extract responsibilities
function TodoPage() {
  return (
    <>
      <TodoFilters />
      <TodoList />
      <TodoForm />
    </>
  )
}
```

**Unused Code**:
```tsx
// ❌ Bad
import { unused1, unused2, used } from 'lib'

// ✅ Good
import { used } from 'lib'
```

## Performance Optimization

### Database Query Optimization

**Use Indexes**:
```python
# Backend/app/models/todo.py

class Todo(SQLModel, table=True):
    title: str = Field(index=True)  # Frequently queried
    user_id: int = Field(foreign_key="users.id", index=True)  # FK always indexed
    status: str = Field(index=True)  # Filter by status often

    __table_args__ = (
        Index('idx_user_status', 'user_id', 'status'),  # Composite for common queries
    )
```

**Select Only Needed Columns**:
```python
# ❌ Bad: Select all columns
todos = await session.execute(select(Todo))

# ✅ Good: Select specific columns
todos = await session.execute(
    select(Todo.id, Todo.title, Todo.status)
)
```

**Batch Operations**:
```python
# ❌ Bad: One query per item
for todo_id in todo_ids:
    todo = await session.get(Todo, todo_id)
    await session.delete(todo)
    await session.commit()

# ✅ Good: Bulk operation
await session.execute(
    delete(Todo).where(Todo.id.in_(todo_ids))
)
await session.commit()
```

### Frontend Performance

**Code Splitting**:
```tsx
// ❌ Bad: Import heavy component
import HeavyComponent from './HeavyComponent'

// ✅ Good: Lazy load
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />
})
```

**Memoization**:
```tsx
// ❌ Bad: Recalculate on every render
function TodoList({ todos }) {
  const completedCount = todos.filter(t => t.status === 'completed').length
  // Recalculated even if todos hasn't changed
}

// ✅ Good: Memoize expensive calculation
function TodoList({ todos }) {
  const completedCount = useMemo(
    () => todos.filter(t => t.status === 'completed').length,
    [todos]
  )
}
```

**Debounce Search**:
```tsx
// ❌ Bad: API call on every keystroke
function SearchBar() {
  const handleChange = (e) => {
    searchApi(e.target.value)  // Too many API calls
  }
}

// ✅ Good: Debounce
function SearchBar() {
  const debouncedSearch = useMemo(
    () => debounce((query) => searchApi(query), 500),
    []
  )

  const handleChange = (e) => {
    debouncedSearch(e.target.value)
  }
}
```

## Tool Usage

### Required Tools

**Read**: Analyze code for refactoring
- `Read(Backend/app/routes/todos.py)` - Check for long methods
- `Read(Frontend/components/TodoCard.tsx)` - Analyze component complexity

**Grep**: Find duplicated patterns
- `Grep("async def create_")` - Find similar create methods
- `Grep("useState\\(")` - Find state management patterns

**Edit**: Apply refactorings
- `Edit(Backend/app/routes/todos.py)` - Refactor endpoint
- `Edit(Frontend/components/TodoForm.tsx)` - Extract component

**Bash**: Run tests and linters
- `Bash("cd Backend && pytest tests/")` - Verify refactoring didn't break tests
- `Bash("cd Frontend && npm run lint")` - Check code quality

## Best Practices

### Refactoring Safety

**1. Tests First**:
```bash
# Before refactoring
pytest tests/ -v  # All green

# After refactoring
pytest tests/ -v  # Should still be green
```

**2. Small Steps**:
- Refactor one thing at a time
- Commit after each successful refactoring
- If tests fail, revert and try smaller change

**3. Code Review**:
- Review your own changes
- Check for unintended side effects
- Verify business logic unchanged

### Naming Conventions

**Good Names**:
```python
# ✅ Clear, descriptive
def calculate_overdue_todos(user_id: int) -> List[Todo]:
    pass

# ✅ Boolean names start with is/has/can
is_authenticated: bool
has_permission: bool
can_edit: bool

# ✅ Collections are plural
todos: List[Todo]
users: List[User]
```

**Bad Names**:
```python
# ❌ Unclear
def process(data):
    pass

# ❌ Abbreviations
def calc_od_tds(uid):
    pass

# ❌ Single letters (except loop counters)
def update(t, u):
    pass
```

### SOLID Principles

**Single Responsibility**:
```python
# ❌ Bad: Class does too much
class TodoManager:
    def create_todo(self): pass
    def send_email(self): pass
    def log_activity(self): pass

# ✅ Good: Separate concerns
class TodoService:
    def create_todo(self): pass

class EmailService:
    def send_email(self): pass

class ActivityLogger:
    def log(self): pass
```

## Acceptance Criteria

Every refactoring must:
- [ ] Preserve existing functionality (tests pass)
- [ ] Improve code quality (reduce complexity, duplication)
- [ ] Follow project conventions (CLAUDE.md)
- [ ] Maintain or improve performance
- [ ] Not introduce security vulnerabilities
- [ ] Include updated documentation (if significant)
- [ ] Pass linter checks (pylint, eslint)
- [ ] Have clear commit messages

## Validation Checklist

Before committing refactoring:

### Functionality
- [ ] All tests pass
- [ ] No regressions
- [ ] Business logic unchanged
- [ ] API contracts maintained

### Code Quality
- [ ] Reduced duplication
- [ ] Improved naming
- [ ] Simplified logic
- [ ] Better type safety
- [ ] Removed unused code

### Performance
- [ ] No performance degradation
- [ ] Improved query efficiency (if applicable)
- [ ] Reduced bundle size (if applicable)

### Standards
- [ ] Follows CLAUDE.md guidelines
- [ ] Consistent with project patterns
- [ ] Passes linter
- [ ] Properly formatted

### Documentation
- [ ] Comments updated
- [ ] README updated (if needed)
- [ ] API docs updated (if changed)

## Integration with CLAUDE.md

Always follow project-specific guidelines:

**Read CLAUDE.md**:
```
1. Read(@CLAUDE.md) - Check coding standards
2. Apply refactorings that align with guidelines
3. Ensure consistency with project patterns
```

**Common CLAUDE.md Guidelines**:
- Code formatting (Prettier, Black)
- Naming conventions
- File organization
- Import ordering
- Comment style
- Error handling patterns

## Changelog

### v1.0.0 (2025-01-15)
- Initial release
- Code smell detection
- 7 refactoring patterns
- Performance optimization strategies
- Type safety improvements
- Frontend and backend examples
- Test-driven refactoring workflow
- SOLID principles integration
