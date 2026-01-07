# API Contract: Task List with Filtering and Sorting

**Feature**: 005-list-discovery
**Date**: 2026-01-05
**Endpoint**: `GET /api/tasks`

## Overview

This contract extends the existing `GET /api/tasks` endpoint to support optional query parameters for searching, sorting, and filtering tasks.

## Request

### HTTP Method
`GET`

### URL
`/api/tasks`

### Query Parameters

| Parameter | Type | Required | Default | Validation | Description |
|-----------|------|----------|---------|------------|-------------|
| `search` | string | No | - | Max length 255 | Filters tasks by title OR description (case-insensitive substring match) |
| `sort_by` | string | No | `created_at` | Enum: `created_at`, `due_date`, `priority` | Field to sort by |
| `order` | string | No | `desc` | Enum: `asc`, `desc` | Sort direction |
| `priority` | string | No | - | Enum: `low`, `medium`, `high` | Filters tasks by exact priority match |
| `category` | string | No | - | Max length 100 | Filters tasks by exact category match |

### Headers

| Header | Required | Example | Description |
|--------|----------|---------|-------------|
| `Authorization` | Yes | `Bearer <jwt_token>` | JWT token from Better Auth |

### Example Requests

**1. Get all tasks (default sort: newest first)**
```http
GET /api/tasks
Authorization: Bearer eyJhbGc...
```

**2. Search for tasks containing "project"**
```http
GET /api/tasks?search=project
Authorization: Bearer eyJhbGc...
```

**3. Filter by high priority**
```http
GET /api/tasks?priority=high
Authorization: Bearer eyJhbGc...
```

**4. Sort by due date (ascending)**
```http
GET /api/tasks?sort_by=due_date&order=asc
Authorization: Bearer eyJhbGc...
```

**5. Combine search + filter + sort**
```http
GET /api/tasks?search=project&priority=high&sort_by=due_date&order=asc
Authorization: Bearer eyJhbGc...
```

**6. Filter by category**
```http
GET /api/tasks?category=Work
Authorization: Bearer eyJhbGc...
```

## Response

### Success Response (200 OK)

**Response Body**:
```json
{
  "tasks": [
    {
      "id": 123,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Complete project proposal",
      "description": "Draft the Q1 project proposal for review",
      "is_completed": false,
      "priority": "high",
      "due_date": "2026-01-15T23:59:59Z",
      "category": "Work",
      "created_at": "2026-01-05T10:00:00Z",
      "updated_at": "2026-01-05T10:00:00Z"
    },
    {
      "id": 124,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Buy milk",
      "description": null,
      "is_completed": false,
      "priority": "low",
      "due_date": null,
      "category": "Personal",
      "created_at": "2026-01-04T15:30:00Z",
      "updated_at": "2026-01-04T15:30:00Z"
    }
  ],
  "total": 2
}
```

**Response Schema**:
```typescript
interface TaskListResponse {
  tasks: Task[];
  total: number;
}

interface Task {
  id: number;
  user_id: string;  // UUID format
  title: string;
  description: string | null;
  is_completed: boolean;
  priority: "low" | "medium" | "high";
  due_date: string | null;  // ISO 8601 datetime
  category: string | null;
  created_at: string;  // ISO 8601 datetime
  updated_at: string;  // ISO 8601 datetime
}
```

### Empty Result (200 OK)

When no tasks match the filters:

```json
{
  "tasks": [],
  "total": 0
}
```

### Error Responses

#### 401 Unauthorized
**Condition**: Missing or invalid JWT token

**Response**:
```json
{
  "detail": "Unauthorized"
}
```

#### 422 Unprocessable Entity
**Condition**: Invalid query parameter values

**Response**:
```json
{
  "detail": [
    {
      "loc": ["query", "sort_by"],
      "msg": "unexpected value; permitted: 'created_at', 'due_date', 'priority'",
      "type": "value_error.const"
    }
  ]
}
```

## Backend Implementation Requirements

### 1. Query Parameter Parsing

Use FastAPI dependency for validation:

```python
from typing import Literal, Optional
from fastapi import Query

async def list_tasks(
    search: Optional[str] = Query(None, max_length=255),
    sort_by: Literal["created_at", "due_date", "priority"] = Query("created_at"),
    order: Literal["asc", "desc"] = Query("desc"),
    priority: Optional[Literal["low", "medium", "high"]] = Query(None),
    category: Optional[str] = Query(None, max_length=100),
    session: Session = Depends(get_session),
    user_id_str: str = Depends(get_current_user)
):
    ...
```

### 2. Query Building Logic

**Base Query** (always apply user isolation):
```python
user_id = UUID(user_id_str)
statement = select(Task).where(Task.user_id == user_id)
```

**Search Filter** (if `search` provided):
```python
if search:
    search_pattern = f"%{search}%"
    statement = statement.where(
        (Task.title.ilike(search_pattern)) |
        (Task.description.ilike(search_pattern))
    )
```

**Priority Filter** (if `priority` provided):
```python
if priority:
    statement = statement.where(Task.priority == priority)
```

**Category Filter** (if `category` provided):
```python
if category:
    statement = statement.where(Task.category == category)
```

**Sorting** (always apply):
```python
from sqlalchemy import case

if sort_by == "priority":
    # Map text priorities to numeric for sorting
    priority_order = case(
        (Task.priority == "high", 3),
        (Task.priority == "medium", 2),
        (Task.priority == "low", 1),
        else_=0
    )
    order_expr = priority_order.desc() if order == "desc" else priority_order.asc()
elif sort_by == "due_date":
    # Null dates always last (regardless of asc/desc per spec edge case)
    order_expr = Task.due_date.asc().nullslast() if order == "asc" else Task.due_date.desc().nullslast()
else:  # created_at
    order_expr = Task.created_at.desc() if order == "desc" else Task.created_at.asc()

statement = statement.order_by(order_expr)
```

**Execute Query**:
```python
tasks = session.exec(statement).all()
return {"tasks": tasks, "total": len(tasks)}
```

## Frontend Integration

### API Client Function

**Location**: `frontend/lib/api.ts`

**Implementation**:
```typescript
import { TaskFilters } from '@/types/filters';

export async function getTasks(filters: TaskFilters) {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.sortBy) params.set('sort_by', filters.sortBy);
  if (filters.order) params.set('order', filters.order);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.category) params.set('category', filters.category);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/tasks?${params.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return response.json();
}
```

### React Query Hook

**Location**: `frontend/hooks/useTaskList.ts`

**Implementation**:
```typescript
import { useQuery } from '@tanstack/react-query';
import { useTaskFilters } from './useTaskFilters';
import { getTasks } from '@/lib/api';

export function useTaskList() {
  const { filters } = useTaskFilters();

  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => getTasks(filters),
    staleTime: 30000, // 30 seconds
  });
}
```

## Backward Compatibility

**Existing Behavior Preserved**:
- Calling `GET /api/tasks` without query parameters returns all tasks for the user, sorted by `created_at DESC` (existing default)
- Response format unchanged: `{ tasks: [...], total: N }`
- Authentication requirements unchanged

**No Breaking Changes**: This is a purely additive change.

## Performance Guarantees

Per success criteria (SC-002, SC-003):
- Search queries return results in < 1 second for up to 1000 tasks
- Sort operations complete in < 1 second
- Leverages existing database indexes on `priority`, `category`, `due_date`, `created_at`

## Testing Checklist

### Backend Tests

- [ ] Search by title (case-insensitive)
- [ ] Search by description (case-insensitive)
- [ ] Search returns tasks matching either title OR description
- [ ] Filter by priority (high, medium, low)
- [ ] Filter by category
- [ ] Sort by created_at (asc and desc)
- [ ] Sort by due_date (asc and desc, nulls last)
- [ ] Sort by priority (high > medium > low, nulls last)
- [ ] Combine search + priority filter
- [ ] Combine search + category filter + sort
- [ ] Empty search string ignored
- [ ] Invalid sort_by returns 422
- [ ] Invalid priority value returns 422
- [ ] Unauthorized request returns 401
- [ ] User isolation: filter results by authenticated user only

### Frontend Tests

- [ ] URL updates when filters change
- [ ] Page load with query params applies filters
- [ ] Search input debounced (no API call until 300ms after typing stops)
- [ ] React Query refetches when queryKey changes
- [ ] Empty state shows "No tasks found..." when filters return 0 results
- [ ] Empty state shows "No tasks yet" when no filters and no tasks
- [ ] Clear filters button resets to default view

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Search for non-existent term | Return empty array, 200 OK |
| Sort by priority with null values | Nulls appear last (priority = 0) |
| Sort by due_date with null values | Nulls appear last (per spec) |
| Multiple filters (search + priority + category) | Apply AND logic, return intersection |
| Empty search string (`?search=`) | Ignore filter, treat as no search |
| Excessively long search term (>255 chars) | Truncate at 255 or return 422 |
| Invalid sort_by value | Return 422 with validation error |
| Invalid priority value | Return 422 with validation error |
| Missing Authorization header | Return 401 Unauthorized |
| No tasks match filters | Return `{ tasks: [], total: 0 }` |

## Migration Path

**No database migration required**: All necessary indexes and fields exist from Spec 004.

**Deployment Steps**:
1. Deploy backend changes (extends existing endpoint)
2. Deploy frontend changes (new toolbar component, URL state management)
3. No data migration needed
4. Monitor query performance; add composite indexes if needed

## Change Summary

**Changed Endpoints**:
- `GET /api/tasks` - Extended with optional query parameters

**New Query Parameters**:
- `search`, `sort_by`, `order`, `priority`, `category`

**Response Format**: Unchanged (backward compatible)

**Authentication**: Unchanged (JWT required)
