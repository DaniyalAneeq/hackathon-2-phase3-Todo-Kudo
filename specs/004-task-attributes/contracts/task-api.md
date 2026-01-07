# API Contract: Task Endpoints (Enhanced)

**Feature**: Task Attributes (Dates, Priority, Categories)
**Date**: 2026-01-05
**Branch**: 004-task-attributes
**Base URL**: `/api/tasks`

## Overview

This document defines the **updated** API contract for task management endpoints with added support for priority, due date, and category attributes. All changes are **backward compatible** - existing clients can continue using endpoints without sending new fields.

## Authentication

All endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Unauthorized requests return `401 Unauthorized`.

## Endpoints

### 1. Create Task

**POST** `/api/tasks`

Creates a new task for the authenticated user with optional priority, due date, and category.

#### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "title": "string (required, 1-255 chars)",
  "description": "string | null (optional, max 2000 chars)",
  "priority": "low" | "medium" | "high" (optional, default: "medium"),
  "due_date": "ISO 8601 datetime string | null" (optional, default: null),
  "category": "string | null" (optional, max 100 chars, default: null)
}
```

**Example Request** (Full):
```json
{
  "title": "Finish project proposal",
  "description": "Draft slides and budget",
  "priority": "high",
  "due_date": "2026-01-15T23:59:59Z",
  "category": "Work"
}
```

**Example Request** (Minimal - backward compatible):
```json
{
  "title": "Buy milk"
}
```

#### Response: 201 Created
```json
{
  "id": 456,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Finish project proposal",
  "description": "Draft slides and budget",
  "is_completed": false,
  "priority": "high",
  "due_date": "2026-01-15T23:59:59Z",
  "category": "Work",
  "created_at": "2026-01-05T14:30:00Z",
  "updated_at": "2026-01-05T14:30:00Z"
}
```

**Response for Minimal Request**:
```json
{
  "id": 457,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy milk",
  "description": null,
  "is_completed": false,
  "priority": "medium",    // Default value
  "due_date": null,        // Default value
  "category": null,        // Default value
  "created_at": "2026-01-05T14:35:00Z",
  "updated_at": "2026-01-05T14:35:00Z"
}
```

#### Error Responses

**400 Bad Request** (invalid JSON):
```json
{
  "detail": "Invalid JSON in request body"
}
```

**401 Unauthorized** (missing/invalid token):
```json
{
  "detail": "Not authenticated"
}
```

**422 Unprocessable Entity** (validation error):
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**422 Unprocessable Entity** (invalid priority):
```json
{
  "detail": [
    {
      "loc": ["body", "priority"],
      "msg": "unexpected value; permitted: 'low', 'medium', 'high'",
      "type": "value_error.const"
    }
  ]
}
```

---

### 2. List Tasks

**GET** `/api/tasks`

Retrieves all tasks for the authenticated user. Returns tasks with all attributes including priority, due date, and category.

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Query Parameters
None (pagination/filtering not in scope for this feature)

#### Response: 200 OK
```json
[
  {
    "id": 123,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "is_completed": false,
    "priority": "medium",      // Default for existing tasks
    "due_date": null,          // Null for existing tasks
    "category": null,          // Null for existing tasks
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-01T10:00:00Z"
  },
  {
    "id": 456,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Finish project proposal",
    "description": "Draft slides and budget",
    "is_completed": false,
    "priority": "high",
    "due_date": "2026-01-15T23:59:59Z",
    "category": "Work",
    "created_at": "2026-01-05T14:30:00Z",
    "updated_at": "2026-01-05T14:30:00Z"
  }
]
```

**Empty List** (no tasks):
```json
[]
```

#### Error Responses

**401 Unauthorized**:
```json
{
  "detail": "Not authenticated"
}
```

---

### 3. Get Task by ID

**GET** `/api/tasks/{task_id}`

Retrieves a specific task by ID for the authenticated user.

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Path Parameters
- `task_id` (integer): The task ID

#### Response: 200 OK
```json
{
  "id": 456,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Finish project proposal",
  "description": "Draft slides and budget",
  "is_completed": false,
  "priority": "high",
  "due_date": "2026-01-15T23:59:59Z",
  "category": "Work",
  "created_at": "2026-01-05T14:30:00Z",
  "updated_at": "2026-01-05T14:30:00Z"
}
```

#### Error Responses

**401 Unauthorized**:
```json
{
  "detail": "Not authenticated"
}
```

**404 Not Found** (task doesn't exist or belongs to another user):
```json
{
  "detail": "Task not found"
}
```

---

### 4. Update Task

**PUT** `/api/tasks/{task_id}`

Updates an existing task. All fields are optional - send only fields you want to change. Supports updating priority, due date, and category.

#### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Path Parameters
- `task_id` (integer): The task ID

#### Request Body (all fields optional)
```json
{
  "title": "string (optional, 1-255 chars)",
  "description": "string | null (optional, max 2000 chars)",
  "is_completed": "boolean (optional)",
  "priority": "low" | "medium" | "high" (optional),
  "due_date": "ISO 8601 datetime string | null" (optional),
  "category": "string | null" (optional, max 100 chars)"
}
```

**Example Request** (Update priority and due date only):
```json
{
  "priority": "low",
  "due_date": "2026-01-20T23:59:59Z"
}
```

**Example Request** (Clear due date and category):
```json
{
  "due_date": null,
  "category": null
}
```

**Example Request** (Mark completed and change priority):
```json
{
  "is_completed": true,
  "priority": "medium"
}
```

#### Response: 200 OK
Returns the updated task with all fields:
```json
{
  "id": 456,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Finish project proposal",
  "description": "Draft slides and budget",
  "is_completed": false,
  "priority": "low",               // Updated
  "due_date": "2026-01-20T23:59:59Z",  // Updated
  "category": "Work",
  "created_at": "2026-01-05T14:30:00Z",
  "updated_at": "2026-01-05T15:00:00Z"  // Timestamp updated
}
```

#### Error Responses

**401 Unauthorized**:
```json
{
  "detail": "Not authenticated"
}
```

**404 Not Found**:
```json
{
  "detail": "Task not found"
}
```

**422 Unprocessable Entity** (validation error):
```json
{
  "detail": [
    {
      "loc": ["body", "priority"],
      "msg": "unexpected value; permitted: 'low', 'medium', 'high'",
      "type": "value_error.const"
    }
  ]
}
```

---

### 5. Delete Task

**DELETE** `/api/tasks/{task_id}`

Deletes a task. No changes from Spec 003 - included for completeness.

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Path Parameters
- `task_id` (integer): The task ID

#### Response: 204 No Content
Empty response body.

#### Error Responses

**401 Unauthorized**:
```json
{
  "detail": "Not authenticated"
}
```

**404 Not Found**:
```json
{
  "detail": "Task not found"
}
```

---

## Data Types

### PriorityLevel (Enum)
```
"low" | "medium" | "high"
```

### DateTime (ISO 8601)
```
"2026-01-15T23:59:59Z"  // UTC timezone
"2026-01-15T18:59:59-05:00"  // Local timezone (converted to UTC on server)
```

**Server behavior**:
- Accepts ISO 8601 strings with or without timezone
- Stores all dates in UTC (timezone-naive in database)
- Returns ISO 8601 strings in UTC with `Z` suffix

### Category (String)
```
"Work" | "Personal" | "Shopping" | "Urgent" | null
```
- Free-form text (no predefined list)
- Maximum 100 characters
- Case-sensitive (no normalization)

---

## Backward Compatibility Guarantees

1. **Existing clients can continue creating tasks without new fields**:
   - Sending only `{"title": "..."}` works as before
   - New fields auto-populate with defaults (`priority="medium"`, `due_date=null`, `category=null`)

2. **Existing tasks return with default values**:
   - Tasks created before migration show `priority="medium"`, `due_date=null`, `category=null`
   - No `null` errors or missing fields

3. **Existing update operations work without changes**:
   - Sending `{"is_completed": true}` works as before
   - New fields remain unchanged if not included in update

4. **Authentication flow unchanged**:
   - JWT verification logic identical to Spec 003
   - `get_current_user` dependency NOT modified (per spec constraint FR-011)

---

## User Scoping (Security)

All operations enforce user-scoped access:

```python
# Example: GET /api/tasks
tasks = session.exec(
    select(Task)
    .where(Task.user_id == current_user.id)  # User isolation
).all()
```

**Security Guarantees**:
- Users can ONLY access their own tasks
- 404 returned if task belongs to another user (not 403 to avoid information leakage)
- No global task access or admin override at this level

---

## Error Response Format

All error responses follow FastAPI standard:

```json
{
  "detail": "string | array of validation errors"
}
```

**Validation Error Format** (422):
```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "Error description",
      "type": "error_type"
    }
  ]
}
```

---

## Change Summary (from Spec 003)

### Request Changes
- **POST /api/tasks**: Added optional `priority`, `due_date`, `category` fields
- **PUT /api/tasks/{id}**: Added optional `priority`, `due_date`, `category` fields

### Response Changes
- **All endpoints**: Added `priority`, `due_date`, `category` to response schema (always present)

### No Breaking Changes
- All existing request payloads continue to work
- All existing field validations remain unchanged
- Response structure extended (not modified)

---

## Testing Checklist

- [ ] Create task with all new fields (priority, due_date, category)
- [ ] Create task with minimal payload (title only) - verify defaults
- [ ] Create task with invalid priority → 422 error
- [ ] Update task priority, due date, category individually
- [ ] Update task to clear due_date and category (set to null)
- [ ] List tasks → verify old tasks show default values
- [ ] Get task by ID → verify all fields present
- [ ] Invalid due_date format → 422 error
- [ ] Category exceeding 100 chars → 422 error
- [ ] Unauthorized access (no token) → 401 error
- [ ] Access another user's task → 404 error (not 403)
