# Frontend Component Generator

Rapidly generates React/Next.js components and pages from UI specifications with proper API integration, authentication, and styling.

## Purpose

This skill transforms UI and feature specifications into production-ready Next.js components with minimal manual intervention. It focuses on rapid, consistent component generation with proper TypeScript typing, API integration via the centralized API client, JWT authentication, and consistent ShadcnUI + Tailwind styling.

## Core Capabilities

- **Spec-to-Component Translation**: Convert UI specs into functional React components
- **API Client Integration**: Connect components to backend via `lib/api.ts`
- **Authentication Handling**: Include JWT token management for protected features
- **Form Generation**: Create forms with validation, error handling, and submission logic
- **State Management**: Implement appropriate state patterns (local, context, server)
- **ShadcnUI Components**: Use pre-built components consistently
- **TypeScript Support**: Full type safety for props, state, and API responses
- **Responsive Design**: Mobile-first layouts with Tailwind breakpoints

## When to Use This Skill

Use this skill when:
- Building new pages or components from UI specifications
- Creating forms that submit to backend APIs
- Implementing authenticated features requiring JWT tokens
- Generating list/grid views with data from APIs
- Creating reusable component libraries
- Updating existing components based on spec changes
- Rapid prototyping from design specifications

Do NOT use this skill for:
- Complex architectural decisions (use Frontend Design Specialist)
- Backend API implementation (use API Endpoint Generator)
- Database operations (use Database_Dev_Agent)
- Authentication configuration (use Auth_Integration_Agent)

## Execution Workflow

### Step 1: Specification Analysis

**Input Sources**:
- UI Spec: `@specs/ui/<component-name>.md`
- Feature Spec: `@specs/features/<feature-name>/spec.md`
- API Spec: `@specs/api/<endpoint>.md` (if API-connected)

**Extract**:
1. Component type (page, form, list, card, modal, etc.)
2. Data requirements (static, API-fetched, user input)
3. Interactions (clicks, form submissions, navigation)
4. Authentication requirements (public vs protected)
5. Layout structure (grid, list, single column, etc.)

### Step 2: Component Type Detection

**Page Component** (`app/[route]/page.tsx`):
- Full route with layout
- May be Server Component (default) or Client Component
- Usually fetches or displays data

**Form Component**:
- Client Component (`'use client'`)
- Handles user input and submission
- Validates and sends data to API
- Manages loading and error states

**List/Grid Component**:
- Displays collections of items
- May be Server Component (SSR) or Client Component (CSR)
- Supports filtering, pagination, sorting

**Card/Item Component**:
- Reusable display component
- Usually receives props from parent
- May include actions (edit, delete, view)

**Modal/Dialog Component**:
- Client Component with ShadcnUI Dialog
- Overlays on current page
- Handles form submission or confirmation

### Step 3: Generate Component Code

**For each component**:
1. Determine file location
2. Choose Server vs Client Component
3. Define TypeScript interfaces
4. Implement component logic
5. Add API integration if needed
6. Apply Tailwind + ShadcnUI styling
7. Add error handling and loading states

### Step 4: API Integration (if required)

1. **Check if API client exists**: Read `Frontend/lib/api.ts`
2. **Add API functions if missing**: Extend API client with new endpoints
3. **Connect component to API**: Use API client functions
4. **Handle authentication**: Include JWT token in requests
5. **Manage states**: Loading, success, error

### Step 5: Output Component

**Deliverables**:
- Component file with full implementation
- API client updates (if needed)
- TypeScript types (if new)
- Usage example

## Component Generation Templates

### Template 1: API-Connected List Page (Server Component)

```tsx
// Frontend/app/[route]/page.tsx

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Import types from API client
import type { {{ResourceType}} } from "@/lib/api"

// Server-side data fetching
async function get{{ResourcePlural}}(): Promise<{{ResourceType}}[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/{{resources}}`, {
    cache: 'no-store',
    headers: {
      'Authorization': `Bearer ${process.env.SERVER_API_TOKEN}`, // For SSR with server token
    },
  })

  if (!res.ok) throw new Error('Failed to fetch {{resources}}')
  return res.json()
}

export default async function {{ResourcePlural}}Page() {
  const {{resources}} = await get{{ResourcePlural}}()

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{{Title}}</h1>
            <p className="mt-2 text-gray-600">{{Description}}</p>
          </div>
          <Button>Add New</Button>
        </div>

        {/* Grid Layout */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {{{resources}}.map(({{resource}}) => (
            <Card key={{{resource}}.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{{{resource}}.{{titleField}}}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{{{resource}}.{{descriptionField}}}</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {{{resources}}.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No {{resources}} found</p>
            <Button>Create {{Resource}}</Button>
          </div>
        )}
      </div>
    </main>
  )
}

export const metadata = {
  title: '{{Title}}',
  description: '{{Description}}',
}
```

### Template 2: Client-Side List with API Integration

```tsx
// Frontend/app/[route]/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'
import { {{resourceApi}}, type {{ResourceType}} } from '@/lib/api'

export default function {{ResourcePlural}}Page() {
  const [{{resources}}, set{{ResourcePlural}}] = useState<{{ResourceType}}[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await {{resourceApi}}.list()
      set{{ResourcePlural}}(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load {{resources}}')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return

    try {
      await {{resourceApi}}.delete(id)
      set{{ResourcePlural}}(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      alert('Failed to delete {{resource}}')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadData}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{{Title}}</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {{{resources}}.map(({{resource}}) => (
            <Card key={{{resource}}.id}>
              <CardHeader>
                <CardTitle>{{{resource}}.{{titleField}}}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{{{resource}}.{{descriptionField}}}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete({{resource}}.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {{{resources}}.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No {{resources}} found</p>
          </div>
        )}
      </div>
    </main>
  )
}
```

### Template 3: Form Component with Validation

```tsx
// Frontend/components/{{Resource}}Form.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { {{resourceApi}} } from '@/lib/api'

interface {{Resource}}FormProps {
  initialData?: {
    {{field1}}: string
    {{field2}}?: string
  }
  {{resourceId}}?: number // For edit mode
  onSuccess?: () => void
}

export default function {{Resource}}Form({
  initialData,
  {{resourceId}},
  onSuccess
}: {{Resource}}FormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [{{field1}}, set{{Field1}}] = useState(initialData?.{{field1}} || '')
  const [{{field2}}, set{{Field2}}] = useState(initialData?.{{field2}} || '')

  // Validation errors
  const [errors, setErrors] = useState<{
    {{field1}}?: string
    {{field2}}?: string
  }>({})

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    // Validate {{field1}}
    if (!{{field1}}.trim()) {
      newErrors.{{field1}} = '{{Field1}} is required'
    } else if ({{field1}}.length > {{maxLength1}}) {
      newErrors.{{field1}} = '{{Field1}} must be less than {{maxLength1}} characters'
    }

    // Validate {{field2}} (if required)
    if ({{field2}} && {{field2}}.length > {{maxLength2}}) {
      newErrors.{{field2}} = '{{Field2}} must be less than {{maxLength2}} characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const data = {
        {{field1}},
        {{field2}}: {{field2}} || undefined,
      }

      if ({{resourceId}}) {
        // Update existing
        await {{resourceApi}}.update({{resourceId}}, data)
        toast({
          title: "Success",
          description: "{{Resource}} updated successfully",
        })
      } else {
        // Create new
        await {{resourceApi}}.create(data)
        toast({
          title: "Success",
          description: "{{Resource}} created successfully",
        })
      }

      // Reset form or redirect
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/{{resources}}')
      }

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save {{resource}}',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* {{Field1}} Field */}
      <div className="space-y-2">
        <Label htmlFor="{{field1}}">
          {{Field1}} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="{{field1}}"
          type="text"
          value={{{field1}}}
          onChange={(e) => set{{Field1}}(e.target.value)}
          placeholder="Enter {{field1}}"
          className={errors.{{field1}} ? 'border-red-500' : ''}
          aria-required="true"
          aria-invalid={!!errors.{{field1}}}
          aria-describedby={errors.{{field1}} ? '{{field1}}-error' : undefined}
        />
        {errors.{{field1}} && (
          <p id="{{field1}}-error" className="text-sm text-red-500" role="alert">
            {errors.{{field1}}}
          </p>
        )}
      </div>

      {/* {{Field2}} Field */}
      <div className="space-y-2">
        <Label htmlFor="{{field2}}">{{Field2}}</Label>
        <Textarea
          id="{{field2}}"
          value={{{field2}}}
          onChange={(e) => set{{Field2}}(e.target.value)}
          placeholder="Enter {{field2}} (optional)"
          rows={4}
          className={errors.{{field2}} ? 'border-red-500' : ''}
          aria-invalid={!!errors.{{field2}}}
          aria-describedby={errors.{{field2}} ? '{{field2}}-error' : undefined}
        />
        {errors.{{field2}} && (
          <p id="{{field2}}-error" className="text-sm text-red-500" role="alert">
            {errors.{{field2}}}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : ({{resourceId}} ? 'Update' : 'Create')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
```

### Template 4: Reusable Card Component

```tsx
// Frontend/components/{{Resource}}Card.tsx

'use client'

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye } from 'lucide-react'
import type { {{ResourceType}} } from '@/lib/api'

interface {{Resource}}CardProps {
  {{resource}}: {{ResourceType}}
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
  onView?: (id: number) => void
  showActions?: boolean
}

export default function {{Resource}}Card({
  {{resource}},
  onEdit,
  onDelete,
  onView,
  showActions = true
}: {{Resource}}CardProps) {
  const handleDelete = () => {
    if (confirm(`Delete "${{{resource}}.{{titleField}}}"?`)) {
      onDelete?.({{resource}}.id)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-2">
            {{{resource}}.{{titleField}}}
          </CardTitle>
          {{{resource}}.{{statusField}} && (
            <Badge
              variant="secondary"
              className={
                {{resource}}.{{statusField}} === '{{status1}}'
                  ? 'bg-green-100 text-green-800'
                  : {{resource}}.{{statusField}} === '{{status2}}'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }
            >
              {{{resource}}.{{statusField}}}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {{{resource}}.{{descriptionField}} && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {{{resource}}.{{descriptionField}}}
          </p>
        )}
        {{{resource}}.{{dateField}} && (
          <p className="text-xs text-gray-500 mt-2">
            {new Date({{resource}}.{{dateField}}).toLocaleDateString()}
          </p>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="flex gap-2 border-t pt-4">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView({{resource}}.id)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit({{resource}}.id)}
              aria-label={`Edit ${{{resource}}.{{titleField}}}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              aria-label={`Delete ${{{resource}}.{{titleField}}}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
```

### Template 5: Modal/Dialog Component

```tsx
// Frontend/components/{{Resource}}Dialog.tsx

'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from 'react'
import {{Resource}}Form from './{{Resource}}Form'

interface {{Resource}}DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  {{resourceId}}?: number // For edit mode
  mode?: 'create' | 'edit' | 'view'
}

export default function {{Resource}}Dialog({
  open,
  onOpenChange,
  {{resourceId}},
  mode = 'create'
}: {{Resource}}DialogProps) {
  const handleSuccess = () => {
    onOpenChange(false)
    // Optional: refresh parent data
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' && 'Create {{Resource}}'}
            {mode === 'edit' && 'Edit {{Resource}}'}
            {mode === 'view' && 'View {{Resource}}'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' && 'Fill in the details to create a new {{resource}}'}
            {mode === 'edit' && 'Update the {{resource}} information'}
            {mode === 'view' && 'View {{resource}} details'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {mode !== 'view' ? (
            <{{Resource}}Form
              {{resourceId}}={{{resourceId}}}
              onSuccess={handleSuccess}
            />
          ) : (
            <div>{/* View mode content */}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Template 6: API Client Extension

```typescript
// Frontend/lib/api.ts (ADD to existing file)

export interface {{ResourceType}} {
  id: number
  {{field1}}: string
  {{field2}}: string | null
  {{statusField}}?: string
  {{dateField}}: string
  created_at: string
  updated_at: string
}

export interface Create{{Resource}}Data {
  {{field1}}: string
  {{field2}}?: string
}

export interface Update{{Resource}}Data {
  {{field1}}?: string
  {{field2}}?: string
  {{statusField}}?: string
}

export const {{resourceApi}} = {
  /**
   * List all {{resources}}
   */
  async list(params?: {
    {{statusField}}?: string
    skip?: number
    limit?: number
  }): Promise<{{ResourceType}}[]> {
    const queryParams = new URLSearchParams()
    if (params?.{{statusField}}) queryParams.append('{{statusField}}', params.{{statusField}})
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString())
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())

    const query = queryParams.toString()
    return apiRequest<{{ResourceType}}[]>(`/api/{{resources}}${query ? `?${query}` : ''}`)
  },

  /**
   * Get single {{resource}}
   */
  async get(id: number): Promise<{{ResourceType}}> {
    return apiRequest<{{ResourceType}}>(`/api/{{resources}}/${id}`)
  },

  /**
   * Create {{resource}}
   */
  async create(data: Create{{Resource}}Data): Promise<{{ResourceType}}> {
    return apiRequest<{{ResourceType}}>('/api/{{resources}}', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Update {{resource}}
   */
  async update(id: number, data: Update{{Resource}}Data): Promise<{{ResourceType}}> {
    return apiRequest<{{ResourceType}}>(`/api/{{resources}}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete {{resource}}
   */
  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/api/{{resources}}/${id}`, {
      method: 'DELETE',
    })
  },
}
```

## Quick Generation Patterns

### Pattern 1: Generate from Spec

**Input**: UI Spec file path
**Output**: Component file ready for use

```
1. Read spec: @specs/ui/todo-list.md
2. Extract: component type, fields, interactions
3. Choose template: List page (Server or Client)
4. Replace placeholders:
   - {{Resource}} → Todo
   - {{field1}} → title
   - {{field2}} → description
5. Generate component code
6. Add API client functions if needed
```

### Pattern 2: Form Generation

**Input**: Feature spec with form requirements
**Output**: Form component with validation

```
1. Identify fields from spec
2. Determine validation rules
3. Use Template 3 (Form Component)
4. Replace:
   - Fields
   - Validation logic
   - API endpoint
5. Add to API client if needed
```

### Pattern 3: CRUD Page Suite

**Input**: Resource name (e.g., "Todo")
**Output**: Complete CRUD pages

```
Generate:
1. List page (Template 1 or 2)
2. Create form (Template 3)
3. Edit form (Template 3 with initialData)
4. Detail/view page
5. Card component (Template 4)
6. API client extension (Template 6)
```

## Tool Usage

### Required Tools

**Read**: Load specifications
- `Read(@specs/ui/<component>.md)`
- `Read(@specs/features/<feature>/spec.md)`
- `Read(Frontend/lib/api.ts)` - Check existing API client

**Write**: Create new components
- `Write(Frontend/app/[route]/page.tsx)` - New page
- `Write(Frontend/components/[name].tsx)` - New component

**Edit**: Update existing files
- `Edit(Frontend/lib/api.ts)` - Add API functions
- `Edit(Frontend/components/[name].tsx)` - Update component

**Grep**: Check for existing implementations
- `Grep("export.*{{Component}}")` - Check if component exists
- `Grep("{{resourceApi}}")` - Check if API client exists

### Tool Workflow

**Generate New Component**:
```
1. Read(@specs/ui/[component].md)
2. Read(Frontend/lib/api.ts) - Check API client
3. Write(Frontend/components/[Component].tsx) - Generate component
4. Edit(Frontend/lib/api.ts) - Add API functions if needed
```

**Update Existing Component**:
```
1. Read(@specs/ui/[component].md) - Get updated spec
2. Read(Frontend/components/[Component].tsx) - Get current code
3. Edit(Frontend/components/[Component].tsx) - Update component
```

## Decision Points

### Server Component vs Client Component

**Use Server Component when**:
- No interactivity (forms, buttons with onClick)
- Can fetch data on server
- SEO important
- Static or slowly changing data

**Use Client Component when**:
- Needs useState, useEffect, or other hooks
- Event handlers (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)
- Real-time updates or interactivity

### List Rendering Strategy

**Server-Side Rendering** (Template 1):
- Better SEO
- Faster initial load
- No loading spinner
- Use when: Public pages, static data

**Client-Side Rendering** (Template 2):
- Dynamic updates without page reload
- Better for authenticated, user-specific data
- More interactive (delete, update without refresh)
- Use when: Dashboard, user-specific lists

### Form Placement

**Separate Page** (`/[resource]/new`):
- Complex forms with many fields
- Needs dedicated space
- Better for mobile

**Modal/Dialog** (Template 5):
- Quick actions
- Simple forms (2-3 fields)
- Keep user in context

**Inline** (Editable cards):
- Very simple updates
- Single field edits

## Acceptance Criteria

Every generated component must:
- [ ] Be valid TypeScript with proper types
- [ ] Use ShadcnUI components where applicable
- [ ] Use Tailwind CSS for all styling
- [ ] Include proper error handling
- [ ] Show loading states for async operations
- [ ] Be responsive (mobile, tablet, desktop)
- [ ] Include ARIA attributes for accessibility
- [ ] Connect to API via `lib/api.ts` (not direct fetch)
- [ ] Include JWT authentication if protected
- [ ] Have meaningful variable and function names
- [ ] Include comments for complex logic
- [ ] Follow Next.js 16 App Router conventions

## Common Substitution Patterns

When generating from templates, replace these placeholders:

| Placeholder | Example | Description |
|-------------|---------|-------------|
| `{{Resource}}` | `Todo` | Singular resource name (PascalCase) |
| `{{resource}}` | `todo` | Singular resource name (camelCase) |
| `{{ResourcePlural}}` | `Todos` | Plural resource name (PascalCase) |
| `{{resources}}` | `todos` | Plural resource name (camelCase) |
| `{{ResourceType}}` | `Todo` | TypeScript type name |
| `{{resourceApi}}` | `todoApi` | API client object name |
| `{{field1}}` | `title` | Primary field (camelCase) |
| `{{Field1}}` | `Title` | Primary field label |
| `{{field2}}` | `description` | Secondary field (camelCase) |
| `{{titleField}}` | `title` | Field to display as title |
| `{{descriptionField}}` | `description` | Field to display as description |
| `{{statusField}}` | `status` | Status/state field |
| `{{dateField}}` | `created_at` | Date field to display |
| `{{Title}}` | `My Todos` | Page title |
| `{{Description}}` | `Manage your tasks` | Page description |

## Examples

### Example 1: Generate Todo List Page

**Input Spec**:
```markdown
# UI Spec: Todo List Page

Route: /dashboard/todos
Type: Server Component (SSR)
Data: GET /api/todos
Layout: Grid (1 col mobile, 2 tablet, 3 desktop)
Display: title, description (truncated), status badge
Actions: View, Edit, Delete
```

**Generated Output**:
```tsx
// Use Template 1, substitute:
// {{Resource}} = Todo
// {{resources}} = todos
// {{titleField}} = title
// {{descriptionField}} = description
// {{statusField}} = status
```
(See Template 1 with substitutions)

### Example 2: Generate Todo Form

**Input Spec**:
```markdown
# UI Spec: Todo Form

Type: Client Component
Fields:
  - title (required, max 255)
  - description (optional, max 1000)
API: POST /api/todos
Validation: Client-side with error messages
Success: Show toast, redirect to /todos
```

**Generated Output**:
```tsx
// Use Template 3, substitute:
// {{Resource}} = Todo
// {{field1}} = title
// {{field2}} = description
// {{maxLength1}} = 255
// {{maxLength2}} = 1000
```
(See Template 3 with substitutions)

## Advanced Features

### Optimistic Updates

```tsx
const handleComplete = async (id: number) => {
  // Optimistic update
  setTodos(prev =>
    prev.map(todo =>
      todo.id === id ? { ...todo, status: 'completed' } : todo
    )
  )

  try {
    await todoApi.complete(id)
  } catch (error) {
    // Revert on error
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, status: 'pending' } : todo
      )
    )
    toast({ title: "Error", description: "Failed to complete todo" })
  }
}
```

### Debounced Search

```tsx
import { useEffect, useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebounce'

export default function SearchableList() {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebouncedValue(searchQuery, 500)

  useEffect(() => {
    if (debouncedQuery) {
      // Search API
      searchApi(debouncedQuery)
    }
  }, [debouncedQuery])

  return (
    <Input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

### Pagination

```tsx
const [page, setPage] = useState(0)
const [hasMore, setHasMore] = useState(true)

const loadMore = async () => {
  const newItems = await api.list({ skip: page * 20, limit: 20 })
  if (newItems.length < 20) setHasMore(false)
  setItems(prev => [...prev, ...newItems])
  setPage(prev => prev + 1)
}
```

## Integration Points

**Works with**:
- API Endpoint Generator → Consumes backend APIs
- Auth Integration Agent → Uses JWT authentication
- Database Dev Agent → Displays data from database
- QA Spec Validator → Tests generated components

**Workflow**:
1. Specs written → `/sp.specify`
2. Backend ready → API Endpoint Generator
3. **Generate frontend** → This skill
4. Test → QA Spec Validator

## Best Practices

1. **Always use API client**: Never direct fetch in components
2. **Type everything**: Use TypeScript interfaces from API client
3. **Handle all states**: Loading, error, success, empty
4. **Mobile-first**: Start with mobile layout, scale up
5. **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
6. **Consistent styling**: Use ShadcnUI + Tailwind, not custom CSS
7. **Meaningful names**: Clear variable and function names
8. **Error messages**: User-friendly, actionable error messages

## Changelog

### v1.0.0 (2025-01-15)
- Initial release
- 6 component templates
- API client integration patterns
- Form validation templates
- Server and Client component patterns
- Quick generation workflow
- Placeholder substitution system
