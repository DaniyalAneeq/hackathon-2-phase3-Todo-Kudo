# Frontend Design Specialist

Generates modern, responsive, and accessible frontend components and pages using Next.js 16 (App Router), Tailwind CSS, and ShadcnUI.

## Purpose

This skill transforms UI/UX specifications into production-ready React components and Next.js pages. It ensures mobile-first responsive design, WCAG accessibility compliance, optimal performance, and seamless integration with backend APIs using JWT authentication.

## Core Capabilities

- **Next.js 16 App Router**: Server and client components, layouts, route groups, parallel routes
- **React Component Generation**: Functional components with TypeScript, props, state management
- **ShadcnUI Integration**: Consistent use of pre-built, accessible UI components
- **Tailwind CSS Styling**: Utility-first responsive design with custom theme configuration
- **API Integration**: Client-side data fetching with JWT authentication
- **Responsive Design**: Mobile-first layouts using Tailwind breakpoints
- **Accessibility**: WCAG 2.1 AA compliance with ARIA attributes and keyboard navigation
- **Performance Optimization**: Code splitting, lazy loading, image optimization
- **Form Handling**: Client-side validation, error states, loading states
- **State Management**: React hooks (useState, useEffect, useContext) and server state

## When to Use This Skill

Use this skill when:
- Building new pages or components from UI specifications
- Converting design mockups or wireframes into code
- Creating reusable UI component libraries
- Implementing responsive layouts and mobile-first designs
- Integrating frontend with backend API endpoints
- Adding authentication flows and protected routes
- Optimizing frontend performance and accessibility
- Standardizing UI patterns across the application

Do NOT use this skill for:
- Backend API development (use API Endpoint Generator)
- Database schema design (use Database_Dev_Agent)
- Authentication configuration (use Auth_Integration_Agent for Better Auth setup)
- Static content or documentation pages (simple HTML/Markdown suffices)

## Execution Workflow

### Phase 1: Specification Analysis

1. **Read UI and Feature Specifications**
   - Use Read: `@specs/ui/<component-name>.md`
   - Use Read: `@specs/features/<feature-name>/spec.md`
   - Extract: Layout structure, interactions, states, data requirements

2. **Identify Component Type**
   - **Page Component**: Full route with layout (`app/[route]/page.tsx`)
   - **Client Component**: Interactive UI with state (`'use client'`)
   - **Server Component**: Static or data-fetched content (default)
   - **Layout Component**: Shared UI wrapper (`app/[route]/layout.tsx`)
   - **Reusable Component**: Library component (`components/ui/` or `components/`)

3. **Determine Data Requirements**
   - Static content (no API)
   - Server-side data fetching (fetch in Server Component)
   - Client-side data fetching (API calls with `useEffect`)
   - Real-time updates (polling, WebSocket)

### Phase 2: Component Architecture

1. **Choose Component Pattern**
   - **Server Component** (default): No interactivity, can fetch data on server
   - **Client Component**: Requires `'use client'`, uses hooks, event handlers
   - **Hybrid**: Server Component wrapping Client Components

2. **Define Component Structure**
   ```
   Component
   ├── Props interface (TypeScript)
   ├── State management (if client component)
   ├── Data fetching logic
   ├── Event handlers
   ├── Render logic (JSX)
   └── Styling (Tailwind classes)
   ```

3. **Plan ShadcnUI Components**
   - Identify which ShadcnUI components to use:
     - Button, Input, Card, Dialog, Dropdown, Tabs, etc.
   - Import from `@/components/ui/`
   - Customize with Tailwind classes

### Phase 3: Component Generation

1. **Create File Structure**
   - Pages: `Frontend/app/[route]/page.tsx`
   - Layouts: `Frontend/app/[route]/layout.tsx`
   - Components: `Frontend/components/[name].tsx`
   - UI Components: `Frontend/components/ui/[name].tsx` (ShadcnUI)

2. **Generate Component Code**
   - Add TypeScript interfaces for props
   - Implement component logic
   - Add Tailwind CSS classes for styling
   - Integrate ShadcnUI components
   - Add ARIA attributes for accessibility

3. **Implement Responsive Design**
   - Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
   - Mobile-first approach (base styles for mobile, then scale up)
   - Test layouts at multiple screen sizes

### Phase 4: API Integration

1. **Create API Client Functions**
   - Location: `Frontend/lib/api.ts`
   - Include JWT token in headers
   - Handle errors and loading states
   - Type-safe with TypeScript

2. **Connect Component to API**
   - Server Component: Use `fetch()` directly with `cache` options
   - Client Component: Use `useEffect` + `fetch` or custom hook
   - Handle loading, success, and error states

3. **Authentication Flow**
   - Protected routes: Check auth status
   - Redirect to login if unauthenticated
   - Store JWT token in httpOnly cookies or localStorage
   - Include token in API requests

### Phase 5: Accessibility and Performance

1. **Accessibility Checklist**
   - [ ] Semantic HTML elements (`<main>`, `<nav>`, `<article>`, etc.)
   - [ ] ARIA labels and roles where needed
   - [ ] Keyboard navigation support (Tab, Enter, Escape)
   - [ ] Focus management (visible focus indicators)
   - [ ] Color contrast ratio ≥ 4.5:1 (WCAG AA)
   - [ ] Alt text for images
   - [ ] Form labels and error messages
   - [ ] Screen reader friendly

2. **Performance Optimization**
   - [ ] Use Next.js Image component for images
   - [ ] Lazy load components with `React.lazy()` or `next/dynamic`
   - [ ] Minimize JavaScript bundle size
   - [ ] Use Server Components where possible
   - [ ] Implement proper caching strategies
   - [ ] Avoid unnecessary re-renders

### Phase 6: Testing and Validation

1. **Visual Testing**
   - Test on multiple screen sizes (mobile, tablet, desktop)
   - Verify responsive breakpoints work correctly
   - Check color contrast and readability

2. **Functional Testing**
   - Test all interactive elements (buttons, forms, links)
   - Verify API integration works correctly
   - Test error states and edge cases

3. **Accessibility Testing**
   - Use keyboard only (no mouse)
   - Test with screen reader
   - Validate with Lighthouse or axe DevTools

## Templates

### Template 1: Server Component Page (with Server-Side Data Fetching)

```tsx
// Frontend/app/[route]/page.tsx

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Todo {
  id: number
  title: string
  description: string
  status: string
  created_at: string
}

async function getTodos(): Promise<Todo[]> {
  // Server-side data fetching
  const res = await fetch('http://localhost:8000/api/todos', {
    cache: 'no-store', // or 'force-cache', 'revalidate'
    headers: {
      'Authorization': `Bearer ${process.env.SERVER_API_TOKEN}` // Server-side token
    }
  })

  if (!res.ok) {
    throw new Error('Failed to fetch todos')
  }

  return res.json()
}

export default async function TodosPage() {
  const todos = await getTodos()

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            My Todos
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your tasks efficiently
          </p>
        </div>

        {/* Todos Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {todos.map((todo) => (
            <Card key={todo.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{todo.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {todo.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${todo.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'}
                  `}>
                    {todo.status}
                  </span>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {todos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No todos yet</p>
            <Button>Create Your First Todo</Button>
          </div>
        )}
      </div>
    </main>
  )
}

// Optional: Generate metadata
export const metadata = {
  title: 'My Todos',
  description: 'Manage your todo list'
}
```

### Template 2: Client Component (Interactive Form)

```tsx
// Frontend/components/TodoForm.tsx

'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface TodoFormProps {
  onSuccess?: () => void
}

export default function TodoForm({ onSuccess }: TodoFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({})
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters'
    }

    if (description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters'
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
      // Get JWT token from localStorage (or cookies)
      const token = localStorage.getItem('auth_token')

      const response = await fetch('http://localhost:8000/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create todo')
      }

      const newTodo = await response.json()

      // Success
      toast({
        title: "Success",
        description: "Todo created successfully",
      })

      // Reset form
      setTitle('')
      setDescription('')

      // Call success callback
      onSuccess?.()

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create todo",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Field */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter todo title"
          className={errors.title ? 'border-red-500' : ''}
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <p id="title-error" className="text-sm text-red-500" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter todo description (optional)"
          rows={4}
          className={errors.description ? 'border-red-500' : ''}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p id="description-error" className="text-sm text-red-500" role="alert">
            {errors.description}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={isLoading}
      >
        {isLoading ? 'Creating...' : 'Create Todo'}
      </Button>
    </form>
  )
}
```

### Template 3: API Client (lib/api.ts)

```typescript
// Frontend/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Get authentication token from storage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

/**
 * Generic API request function
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    // Handle authentication errors
    if (response.status === 401) {
      // Redirect to login or refresh token
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }

    const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
    throw new Error(error.detail || `API error: ${response.status}`)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

// Todo API functions

export interface Todo {
  id: number
  title: string
  description: string | null
  status: string
  due_date: string | null
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
  status?: string
  due_date?: string
}

export const todoApi = {
  /**
   * Get all todos for the current user
   */
  async list(params?: { status?: string; skip?: number; limit?: number }): Promise<Todo[]> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString())
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())

    const query = queryParams.toString()
    return apiRequest<Todo[]>(`/api/todos${query ? `?${query}` : ''}`)
  },

  /**
   * Get a single todo by ID
   */
  async get(id: number): Promise<Todo> {
    return apiRequest<Todo>(`/api/todos/${id}`)
  },

  /**
   * Create a new todo
   */
  async create(data: CreateTodoData): Promise<Todo> {
    return apiRequest<Todo>('/api/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Update a todo
   */
  async update(id: number, data: UpdateTodoData): Promise<Todo> {
    return apiRequest<Todo>(`/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete a todo
   */
  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/api/todos/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Mark todo as complete
   */
  async complete(id: number): Promise<Todo> {
    return apiRequest<Todo>(`/api/todos/${id}/complete`, {
      method: 'POST',
    })
  },
}

// Auth API functions

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name?: string
}

export interface AuthResponse {
  access_token: string
  user: {
    id: number
    email: string
    name: string | null
  }
}

export const authApi = {
  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    // Store token
    if (typeof window !== 'undefined' && response.access_token) {
      localStorage.setItem('auth_token', response.access_token)
    }

    return response
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    // Store token
    if (typeof window !== 'undefined' && response.access_token) {
      localStorage.setItem('auth_token', response.access_token)
    }

    return response
  },

  /**
   * Logout user
   */
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
  },
}
```

### Template 4: Layout Component

```tsx
// Frontend/app/layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Todo App',
    default: 'Todo App',
  },
  description: 'Manage your tasks efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <div className="min-h-full">
          {/* Navigation (if global) */}
          <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="text-xl font-bold text-gray-900">
                  Todo App
                </div>
                {/* Nav items */}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          {children}

          {/* Footer (if global) */}
          <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <p className="text-center text-gray-500 text-sm">
                © 2025 Todo App. All rights reserved.
              </p>
            </footer>
        </div>

        {/* Global Toast Notifications */}
        <Toaster />
      </body>
    </html>
  )
}
```

### Template 5: Protected Route (Middleware Pattern)

```tsx
// Frontend/app/dashboard/layout.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('auth_token')

    if (!token) {
      router.push('/login')
      return
    }

    // Optional: Verify token with backend
    // For now, just check if token exists
    setIsAuthenticated(true)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex space-x-8">
              <a href="/dashboard" className="text-gray-900 font-medium">
                Dashboard
              </a>
              <a href="/dashboard/todos" className="text-gray-600 hover:text-gray-900">
                Todos
              </a>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('auth_token')
                router.push('/login')
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Protected Content */}
      <main>{children}</main>
    </div>
  )
}
```

### Template 6: Reusable Component with TypeScript

```tsx
// Frontend/components/TodoCard.tsx

'use client'

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Trash2, Edit } from 'lucide-react'
import { formatDistance } from 'date-fns'

interface TodoCardProps {
  id: number
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  created_at: string
  onComplete?: (id: number) => void
  onDelete?: (id: number) => void
  onEdit?: (id: number) => void
  className?: string
}

export default function TodoCard({
  id,
  title,
  description,
  status,
  created_at,
  onComplete,
  onDelete,
  onEdit,
  className = ''
}: TodoCardProps) {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    in_progress: { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
  }

  const currentStatus = statusConfig[status]

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {title}
          </CardTitle>
          <Badge variant="secondary" className={currentStatus.color}>
            {currentStatus.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {description && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
            {description}
          </p>
        )}
        <p className="text-xs text-gray-500">
          Created {formatDistance(new Date(created_at), new Date(), { addSuffix: true })}
        </p>
      </CardContent>

      <CardFooter className="flex gap-2 pt-3 border-t">
        {status !== 'completed' && onComplete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onComplete(id)}
            className="flex-1"
            aria-label={`Mark "${title}" as complete`}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Complete
          </Button>
        )}

        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(id)}
            aria-label={`Edit "${title}"`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}

        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            aria-label={`Delete "${title}"`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
```

### Template 7: Loading State Component

```tsx
// Frontend/components/TodoListSkeleton.tsx

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function TodoListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
```

## Tool Usage

### Required Tools

**Read**: Read UI and feature specifications
- `Read(@specs/ui/<component>.md)` - Component specifications
- `Read(@specs/features/<feature>/spec.md)` - Feature requirements
- `Read(Frontend/components/ui/*.tsx)` - Existing ShadcnUI components

**Glob**: Discover existing components
- `Glob(Frontend/app/**/page.tsx)` - Find all pages
- `Glob(Frontend/components/**/*.tsx)` - Find all components

**Grep**: Search for patterns
- `Grep("'use client'")` - Find client components
- `Grep("export default function")` - Find component definitions

**Write**: Create new components and pages
- `Write(Frontend/app/[route]/page.tsx)` - New page
- `Write(Frontend/components/[name].tsx)` - New component

**Edit**: Update existing files
- `Edit(Frontend/app/layout.tsx)` - Update root layout
- `Edit(Frontend/lib/api.ts)` - Add API functions

### Tool Patterns

**Pattern 1: New Page Creation**
```
1. Read(@specs/ui/[page-name].md) - Get specification
2. Read(@specs/features/[feature].md) - Understand feature context
3. Glob(Frontend/components/ui/*.tsx) - Check available ShadcnUI components
4. Write(Frontend/app/[route]/page.tsx) - Create page
```

**Pattern 2: Reusable Component**
```
1. Read specification
2. Check existing similar components with Glob
3. Write(Frontend/components/[name].tsx)
4. Export from index if needed
```

**Pattern 3: API Integration**
```
1. Read(Backend/app/routes/[resource].py) - Understand API endpoints
2. Edit(Frontend/lib/api.ts) - Add API client functions
3. Edit(Frontend/components/[name].tsx) - Integrate API calls
```

## Decision Points

### When to use Server Component vs Client Component:

**Server Component** (default):
- No interactivity needed
- Can fetch data on server
- Better performance, smaller bundle size
- Use when: displaying static content, SEO important

**Client Component** (`'use client'`):
- Requires hooks (useState, useEffect, etc.)
- Event handlers (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)
- Use when: forms, interactive UI, real-time updates

### When to use ShadcnUI component vs custom:

**Use ShadcnUI**:
- Standard UI patterns (buttons, inputs, cards, dialogs)
- Need accessibility out of the box
- Want consistent styling
- Components: Button, Input, Card, Dialog, Dropdown, Tabs, etc.

**Build Custom**:
- Highly specific design requirements
- Complex interactions not covered by ShadcnUI
- Performance-critical components

### Responsive Design Strategy:

**Mobile-First Approach**:
```tsx
// Base styles for mobile (default)
className="p-4 text-sm"

// Scale up for larger screens
className="p-4 text-sm md:p-6 md:text-base lg:p-8 lg:text-lg"
```

**Tailwind Breakpoints**:
- `sm:` - 640px (small tablets)
- `md:` - 768px (tablets)
- `lg:` - 1024px (laptops)
- `xl:` - 1280px (desktops)
- `2xl:` - 1536px (large desktops)

### State Management Choice:

**Local State** (useState):
- Component-specific state
- Form inputs, toggles, local UI state

**Context API**:
- Shared state across multiple components
- Theme, auth user, global settings

**Server State** (fetch/SWR/React Query):
- API data
- Caching, revalidation

## Acceptance Criteria

Every generated component/page must:
- [ ] Include proper TypeScript types for props and state
- [ ] Use Tailwind CSS for all styling (no inline styles or CSS modules)
- [ ] Integrate ShadcnUI components where applicable
- [ ] Be responsive (mobile-first design)
- [ ] Include proper ARIA attributes for accessibility
- [ ] Handle loading, error, and success states
- [ ] Follow Next.js 16 App Router conventions
- [ ] Use semantic HTML elements
- [ ] Include meaningful alt text for images
- [ ] Have keyboard navigation support
- [ ] Meet WCAG 2.1 AA color contrast requirements
- [ ] Be performant (optimized images, code splitting)

## Validation Checklist

Before finalizing component code, verify:

### 1. TypeScript & Type Safety
- [ ] All props have TypeScript interfaces
- [ ] No `any` types (use proper types)
- [ ] Event handlers properly typed
- [ ] API responses typed

### 2. Responsive Design
- [ ] Tested on mobile (320px - 640px)
- [ ] Tested on tablet (640px - 1024px)
- [ ] Tested on desktop (1024px+)
- [ ] Uses Tailwind breakpoints correctly
- [ ] Mobile-first approach

### 3. Accessibility (WCAG 2.1 AA)
- [ ] Semantic HTML (`<main>`, `<nav>`, `<article>`, `<section>`)
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] Color contrast ≥ 4.5:1
- [ ] Alt text for images
- [ ] Form labels and error messages
- [ ] Screen reader friendly

### 4. Performance
- [ ] Uses Next.js Image component
- [ ] Lazy loads heavy components
- [ ] Minimal JavaScript bundle
- [ ] No unnecessary re-renders
- [ ] Proper memoization if needed

### 5. ShadcnUI Integration
- [ ] Uses ShadcnUI components correctly
- [ ] Customizes with Tailwind (not inline styles)
- [ ] Consistent with design system

### 6. API Integration
- [ ] Proper error handling
- [ ] Loading states shown
- [ ] JWT token included in requests
- [ ] Type-safe API calls

### 7. Code Quality
- [ ] Follows naming conventions
- [ ] No unused imports
- [ ] Properly formatted (Prettier)
- [ ] No console.log in production
- [ ] Comments for complex logic

## Examples

### Example 1: Todo List Page (Server Component)

**Input Spec**:
```markdown
# UI Spec: Todo List Page

## Route
/dashboard/todos

## Layout
- Header with title "My Todos"
- Grid of todo cards (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
- Each card shows: title, description (truncated), status badge, actions
- Empty state when no todos

## Data
- Fetch todos from GET /api/todos
- Server-side rendering

## Interactions
- Click card to view details
- Complete button marks todo as done
- Delete button removes todo
```

**Generated Code**: (See Template 1 above)

### Example 2: Create Todo Form (Client Component)

**Input Spec**:
```markdown
# UI Spec: Todo Form

## Component
Client component with form validation

## Fields
- Title (required, max 255 chars)
- Description (optional, max 1000 chars)

## Validation
- Client-side validation with error messages
- Show loading state during submission

## API
- POST /api/todos
- Include JWT token
- Show success toast on creation
```

**Generated Code**: (See Template 2 above)

### Example 3: Protected Dashboard Layout

**Input Spec**:
```markdown
# UI Spec: Dashboard Layout

## Purpose
Wrapper for all dashboard pages with auth check

## Features
- Check for JWT token on mount
- Redirect to /login if not authenticated
- Show loading spinner during check
- Include navigation bar
```

**Generated Code**: (See Template 5 above)

## Advanced Patterns

### Pattern 1: Optimistic UI Updates

```tsx
'use client'

import { useState, useTransition } from 'react'
import { todoApi } from '@/lib/api'

export default function TodoItem({ todo }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticStatus, setOptimisticStatus] = useState(todo.status)

  const handleComplete = async () => {
    // Optimistic update
    setOptimisticStatus('completed')

    startTransition(async () => {
      try {
        await todoApi.complete(todo.id)
      } catch (error) {
        // Revert on error
        setOptimisticStatus(todo.status)
      }
    })
  }

  return (
    <div>
      <span className={optimisticStatus === 'completed' ? 'line-through' : ''}>
        {todo.title}
      </span>
      <button onClick={handleComplete} disabled={isPending}>
        {isPending ? 'Completing...' : 'Complete'}
      </button>
    </div>
  )
}
```

### Pattern 2: Infinite Scroll with Pagination

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { todoApi, Todo } from '@/lib/api'

export default function InfiniteTodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  const loadMore = async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const newTodos = await todoApi.list({ skip: page * 20, limit: 20 })

      if (newTodos.length === 0) {
        setHasMore(false)
      } else {
        setTodos(prev => [...prev, ...newTodos])
        setPage(prev => prev + 1)
      }
    } catch (error) {
      console.error('Failed to load todos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 1.0 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isLoading])

  // Initial load
  useEffect(() => {
    loadMore()
  }, [])

  return (
    <div className="space-y-4">
      {todos.map(todo => (
        <TodoCard key={todo.id} {...todo} />
      ))}

      {isLoading && <TodoListSkeleton count={3} />}

      {/* Intersection observer target */}
      <div ref={observerTarget} className="h-4" />

      {!hasMore && todos.length > 0 && (
        <p className="text-center text-gray-500 py-4">
          No more todos to load
        </p>
      )}
    </div>
  )
}
```

### Pattern 3: Form with Real-Time Validation

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function EmailInput() {
  const [email, setEmail] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  // Debounced validation
  useEffect(() => {
    if (!email) {
      setIsValid(null)
      return
    }

    const timer = setTimeout(async () => {
      setIsChecking(true)

      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setIsValid(false)
        setIsChecking(false)
        return
      }

      // Optional: Check if email exists in backend
      try {
        const response = await fetch(`/api/auth/check-email?email=${email}`)
        const { exists } = await response.json()
        setIsValid(!exists)
      } catch (error) {
        setIsValid(null)
      } finally {
        setIsChecking(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [email])

  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <div className="relative">
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`pr-10 ${
            isValid === false ? 'border-red-500' :
            isValid === true ? 'border-green-500' : ''
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isChecking && <span className="text-gray-400">⏳</span>}
          {!isChecking && isValid === true && <span className="text-green-500">✓</span>}
          {!isChecking && isValid === false && <span className="text-red-500">✗</span>}
        </div>
      </div>
      {isValid === false && (
        <p className="text-sm text-red-500">Email is invalid or already taken</p>
      )}
    </div>
  )
}
```

### Pattern 4: Dark Mode Toggle

```tsx
// Frontend/components/ThemeToggle.tsx

'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Check system preference or saved preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'

    const initialTheme = savedTheme || systemTheme
    setTheme(initialTheme)
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  )
}
```

## Integration with Frontend_Dev_Agent

This skill provides the design patterns and templates that Frontend_Dev_Agent uses:

**Workflow Integration**:
1. Database_Dev_Agent creates models
2. Backend_Dev_Agent creates API endpoints
3. **This skill generates frontend components/pages**
4. Frontend_Dev_Agent integrates and tests
5. QA_Spec_Validator validates UI and functionality

## Best Practices

### Component Organization
```
Frontend/
├── app/
│   ├── (auth)/          # Route group for auth pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/     # Route group for protected pages
│   │   ├── layout.tsx   # Dashboard layout with auth
│   │   ├── page.tsx     # Dashboard home
│   │   └── todos/
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/
│   ├── ui/              # ShadcnUI components
│   ├── TodoCard.tsx     # Feature components
│   ├── TodoForm.tsx
│   └── Navigation.tsx
├── lib/
│   ├── api.ts           # API client
│   ├── utils.ts         # Utilities
│   └── auth.ts          # Auth helpers
└── styles/
    └── globals.css      # Global styles + Tailwind
```

### Naming Conventions
- **Components**: PascalCase (`TodoCard.tsx`)
- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx` (Next.js convention)
- **Utilities**: camelCase (`formatDate.ts`)
- **API functions**: camelCase (`todoApi.list()`)

### Performance Tips
- Use Server Components by default
- Only add `'use client'` when necessary
- Lazy load heavy components: `const HeavyComponent = dynamic(() => import('./Heavy'))`
- Optimize images: Always use `<Image>` from `next/image`
- Minimize bundle size: Tree shake, remove unused code
- Use React.memo for expensive re-renders (sparingly)

### Accessibility Best Practices
- Always use semantic HTML
- Include ARIA labels for icon-only buttons
- Ensure keyboard navigation works
- Test with screen readers
- Maintain focus management
- Provide sufficient color contrast
- Use focus-visible for focus indicators

## Changelog

### v1.0.0 (2025-01-15)
- Initial release
- Next.js 16 App Router patterns
- ShadcnUI component integration
- Tailwind CSS responsive design
- JWT authentication integration
- Accessibility (WCAG 2.1 AA)
- Performance optimization patterns
- 7 comprehensive templates
- Advanced patterns (optimistic UI, infinite scroll, real-time validation)
