# Quickstart: List Discovery Implementation

**Feature**: 005-list-discovery
**Date**: 2026-01-05
**Estimated Effort**: 4-6 hours (split across backend and frontend)

## Prerequisites

- [x] Spec 004 (Task Attributes) implemented 
- [x] Database indexes on `priority`, `category`, `due_date`, `created_at` exist
- [x] Better Auth authentication functional
- [x] React Query (TanStack Query) installed in frontend
- [x] ShadcnUI components available (Input, Select, Popover, Button)

## Implementation Order

Follow this sequence for incremental delivery and testing:

### Phase 1: Backend API Enhancement (P1 - 1.5 hours)

**Goal**: Extend `GET /api/tasks` to accept query parameters and return filtered/sorted results.

**Files to Modify**:
1. `backend/app/api/routes/tasks.py`

**Implementation Steps**:

1. **Update the `list_tasks` function signature** with query parameters:
   ```python
   from typing import Literal, Optional
   from fastapi import Query

   @router.get("", response_model=dict)
   async def list_tasks(
       search: Optional[str] = Query(None, max_length=255),
       sort_by: Literal["created_at", "due_date", "priority"] = Query("created_at"),
       order: Literal["asc", "desc"] = Query("desc"),
       priority: Optional[Literal["low", "medium", "high"]] = Query(None),
       category: Optional[str] = Query(None, max_length=100),
       session: Session = Depends(get_session),
       user_id_str: str = Depends(get_current_user)
   ):
   ```

2. **Build the query with filters**:
   ```python
   user_id = UUID(user_id_str)
   statement = select(Task).where(Task.user_id == user_id)

   # Apply search filter
   if search:
       search_pattern = f"%{search}%"
       statement = statement.where(
           (Task.title.ilike(search_pattern)) |
           (Task.description.ilike(search_pattern))
       )

   # Apply priority filter
   if priority:
       statement = statement.where(Task.priority == priority)

   # Apply category filter
   if category:
       statement = statement.where(Task.category == category)
   ```

3. **Add sorting logic**:
   ```python
   from sqlalchemy import case

   if sort_by == "priority":
       priority_order = case(
           (Task.priority == "high", 3),
           (Task.priority == "medium", 2),
           (Task.priority == "low", 1),
           else_=0
       )
       order_expr = priority_order.desc() if order == "desc" else priority_order.asc()
   elif sort_by == "due_date":
       order_expr = Task.due_date.asc().nullslast() if order == "asc" else Task.due_date.desc().nullslast()
   else:  # created_at (default)
       order_expr = Task.created_at.desc() if order == "desc" else Task.created_at.asc()

   statement = statement.order_by(order_expr)
   ```

4. **Execute and return**:
   ```python
   tasks = session.exec(statement).all()
   return {"tasks": tasks, "total": len(tasks)}
   ```

**Testing**:
```bash
# Start backend
cd backend
fastapi dev main.py

# Test with curl (replace <TOKEN> with valid JWT)
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:8000/api/tasks"
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:8000/api/tasks?search=project"
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:8000/api/tasks?priority=high"
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:8000/api/tasks?sort_by=priority&order=desc"
```

**Success Criteria**:
- [ ] API accepts query parameters without errors
- [ ] Search filters by title OR description
- [ ] Priority and category filters work
- [ ] Sorting by created_at, due_date, priority works
- [ ] Null values appear last in sorts

---

### Phase 2: Frontend Types and Hooks (P1 - 1 hour)

**Goal**: Create TypeScript types and custom hooks for filter state management.

**Files to Create**:
1. `frontend/types/filters.ts`
2. `frontend/hooks/useTaskFilters.ts`
3. `frontend/hooks/useTaskList.ts` (modify existing if present)

**Implementation Steps**:

1. **Create filter types** (`frontend/types/filters.ts`):
   ```typescript
   export interface TaskFilters {
     search: string;
     sortBy: 'created_at' | 'due_date' | 'priority';
     order: 'asc' | 'desc';
     priority: '' | 'low' | 'medium' | 'high';
     category: string;
   }

   export const DEFAULT_FILTERS: TaskFilters = {
     search: '',
     sortBy: 'created_at',
     order: 'desc',
     priority: '',
     category: '',
   };

   export interface SortOption {
     label: string;
     sortBy: TaskFilters['sortBy'];
     order: TaskFilters['order'];
   }

   export const SORT_OPTIONS: SortOption[] = [
     { label: 'Newest', sortBy: 'created_at', order: 'desc' },
     { label: 'Oldest', sortBy: 'created_at', order: 'asc' },
     { label: 'Highest Priority', sortBy: 'priority', order: 'desc' },
     { label: 'Due Soon', sortBy: 'due_date', order: 'asc' },
   ];
   ```

2. **Create URL state hook** (`frontend/hooks/useTaskFilters.ts`):
   ```typescript
   'use client';
   import { useSearchParams, useRouter } from 'next/navigation';
   import { useCallback } from 'react';
   import { TaskFilters, DEFAULT_FILTERS } from '@/types/filters';

   export function useTaskFilters() {
     const searchParams = useSearchParams();
     const router = useRouter();

     const filters: TaskFilters = {
       search: searchParams.get('q') || DEFAULT_FILTERS.search,
       sortBy: (searchParams.get('sort_by') as TaskFilters['sortBy']) || DEFAULT_FILTERS.sortBy,
       order: (searchParams.get('order') as TaskFilters['order']) || DEFAULT_FILTERS.order,
       priority: (searchParams.get('priority') as TaskFilters['priority']) || DEFAULT_FILTERS.priority,
       category: searchParams.get('category') || DEFAULT_FILTERS.category,
     };

     const setFilters = useCallback((newFilters: Partial<TaskFilters>) => {
       const params = new URLSearchParams(searchParams.toString());
       const updated = { ...filters, ...newFilters };

       // Set or delete params
       Object.entries(updated).forEach(([key, value]) => {
         const paramKey = key === 'search' ? 'q' : key;
         if (value) {
           params.set(paramKey, value);
         } else {
           params.delete(paramKey);
         }
       });

       router.push(`?${params.toString()}`, { scroll: false });
     }, [searchParams, router, filters]);

     const clearFilters = useCallback(() => {
       router.push(window.location.pathname, { scroll: false });
     }, [router]);

     return { filters, setFilters, clearFilters };
   }
   ```

3. **Create React Query hook** (`frontend/hooks/useTaskList.ts`):
   ```typescript
   import { useQuery } from '@tanstack/react-query';
   import { useTaskFilters } from './useTaskFilters';
   import { api } from '@/lib/api';

   export function useTaskList() {
     const { filters } = useTaskFilters();

     return useQuery({
       queryKey: ['tasks', filters],
       queryFn: () => api.getTasks(filters),
       staleTime: 30000,
     });
   }
   ```

**Testing**:
- [ ] useTaskFilters hook reads URL params correctly
- [ ] setFilters updates URL without page reload
- [ ] clearFilters removes all query params

---

### Phase 3: TaskToolbar Component (P2 - 1.5 hours)

**Goal**: Create the toolbar with search, sort, and filter controls.

**Files to Create**:
1. `frontend/components/TaskToolbar.tsx`
2. `frontend/hooks/useDebounced.ts` (debounce utility)

**Implementation Steps**:

1. **Create debounce hook** (`frontend/hooks/useDebounced.ts`):
   ```typescript
   import { useEffect, useState } from 'react';

   export function useDebounced<T>(value: T, delay: number): T {
     const [debouncedValue, setDebouncedValue] = useState<T>(value);

     useEffect(() => {
       const handler = setTimeout(() => {
         setDebouncedValue(value);
       }, delay);

       return () => {
         clearTimeout(handler);
       };
     }, [value, delay]);

     return debouncedValue;
   }
   ```

2. **Create TaskToolbar component**:
   ```typescript
   'use client';
   import { Search, X } from 'lucide-react';
   import { useState, useEffect } from 'react';
   import { Input } from '@/components/ui/input';
   import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
   import { Button } from '@/components/ui/button';
   import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
   import { useTaskFilters } from '@/hooks/useTaskFilters';
   import { useDebounced } from '@/hooks/useDebounced';
   import { SORT_OPTIONS } from '@/types/filters';

   export function TaskToolbar() {
     const { filters, setFilters, clearFilters } = useTaskFilters();
     const [searchInput, setSearchInput] = useState(filters.search);
     const debouncedSearch = useDebounced(searchInput, 300);

     // Update URL when debounced search changes
     useEffect(() => {
       setFilters({ search: debouncedSearch });
     }, [debouncedSearch]);

     const currentSort = SORT_OPTIONS.find(
       opt => opt.sortBy === filters.sortBy && opt.order === filters.order
     )?.label || 'Newest';

     const hasActiveFilters = !!(filters.search || filters.priority || filters.category);

     return (
       <div className="flex gap-4 items-center mb-6">
         {/* Search Input */}
         <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             placeholder="Search tasks..."
             value={searchInput}
             onChange={(e) => setSearchInput(e.target.value)}
             className="pl-10"
           />
         </div>

         {/* Sort Select */}
         <Select
           value={currentSort}
           onValueChange={(label) => {
             const option = SORT_OPTIONS.find(opt => opt.label === label);
             if (option) {
               setFilters({ sortBy: option.sortBy, order: option.order });
             }
           }}
         >
           <SelectTrigger className="w-[180px]">
             <SelectValue />
           </SelectTrigger>
           <SelectContent>
             {SORT_OPTIONS.map(option => (
               <SelectItem key={option.label} value={option.label}>
                 {option.label}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>

         {/* Filter Popover */}
         <Popover>
           <PopoverTrigger asChild>
             <Button variant="outline">
               Filter {hasActiveFilters && <span className="ml-1 text-xs">({
                 [filters.priority, filters.category].filter(Boolean).length
               })</span>}
             </Button>
           </PopoverTrigger>
           <PopoverContent className="w-80">
             <div className="space-y-4">
               <div>
                 <label className="text-sm font-medium">Priority</label>
                 <Select value={filters.priority} onValueChange={(val) => setFilters({ priority: val as any })}>
                   <SelectTrigger>
                     <SelectValue placeholder="All" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="">All</SelectItem>
                     <SelectItem value="high">High</SelectItem>
                     <SelectItem value="medium">Medium</SelectItem>
                     <SelectItem value="low">Low</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <label className="text-sm font-medium">Category</label>
                 <Input
                   placeholder="Enter category"
                   value={filters.category}
                   onChange={(e) => setFilters({ category: e.target.value })}
                 />
               </div>
             </div>
           </PopoverContent>
         </Popover>

         {/* Clear Filters */}
         {hasActiveFilters && (
           <Button variant="ghost" size="icon" onClick={clearFilters}>
             <X className="h-4 w-4" />
           </Button>
         )}
       </div>
     );
   }
   ```

**Testing**:
- [ ] Search input triggers debounced API call (300ms)
- [ ] Sort dropdown updates URL and refetches
- [ ] Filter popover applies priority and category filters
- [ ] Clear button removes all filters

---

### Phase 4: Dashboard Integration (P3 - 1 hour)

**Goal**: Integrate TaskToolbar into the dashboard and handle empty states.

**Files to Modify**:
1. `frontend/app/dashboard/DashboardClient.tsx`
2. Create `frontend/components/EmptyState.tsx`

**Implementation Steps**:

1. **Update DashboardClient**:
   ```typescript
   'use client';
   import { useTaskList } from '@/hooks/useTaskList';
   import { useTaskFilters } from '@/hooks/useTaskFilters';
   import { TaskToolbar } from '@/components/TaskToolbar';
   import { TaskCard } from '@/components/TaskCard';
   import { EmptyState } from '@/components/EmptyState';
   import { CreateTaskForm } from '@/components/CreateTaskForm';

   export function DashboardClient({ session }) {
     const { data, isLoading } = useTaskList();
     const { filters, clearFilters } = useTaskFilters();

     if (isLoading) return <div>Loading...</div>;

     const hasActiveFilters = !!(filters.search || filters.priority || filters.category);
     const tasks = data?.tasks || [];

     return (
       <div className="container mx-auto p-6">
         <h1>My Tasks</h1>
         <TaskToolbar />

         {tasks.length === 0 ? (
           hasActiveFilters ? (
             <EmptyState
               message={`No tasks found matching "${filters.search || 'your filters'}"`}
               action={<Button onClick={clearFilters}>Clear Filters</Button>}
             />
           ) : (
             <EmptyState
               message="No tasks yet"
               action={<CreateTaskForm />}
             />
           )
         ) : (
           <div className="grid gap-4">
             {tasks.map(task => <TaskCard key={task.id} task={task} />)}
           </div>
         )}
       </div>
     );
   }
   ```

2. **Create EmptyState component**:
   ```typescript
   import { ReactNode } from 'react';

   export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
     return (
       <div className="flex flex-col items-center justify-center py-12 text-center">
         <p className="text-lg text-muted-foreground mb-4">{message}</p>
         {action}
       </div>
     );
   }
   ```

**Testing**:
- [ ] Toolbar appears above task list
- [ ] Empty state shows "No tasks yet" when no tasks and no filters
- [ ] Empty state shows "No tasks found..." when filters active and no results
- [ ] Task list updates when filters change

---

### Phase 5: Update API Client (30 minutes)

**Goal**: Add getTasks function with filter parameters.

**Files to Modify**:
1. `frontend/lib/api.ts`

**Implementation**:
```typescript
import { TaskFilters } from '@/types/filters';

export const api = {
  async getTasks(filters: TaskFilters) {
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

    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },
  // ... other methods
};
```

---

## Testing Checklist

### Backend Tests
- [ ] Search returns tasks matching title (case-insensitive)
- [ ] Search returns tasks matching description
- [ ] Priority filter works for low, medium, high
- [ ] Category filter works
- [ ] Sort by created_at (newest first is default)
- [ ] Sort by due_date (nulls last)
- [ ] Sort by priority (high > medium > low, nulls last)
- [ ] Combine search + priority + sort
- [ ] Invalid parameters return 422

### Frontend Tests
- [ ] URL updates when filters change
- [ ] Page reload preserves filters from URL
- [ ] Search input is debounced (no call until 300ms after typing stops)
- [ ] React Query refetches when filters change
- [ ] Empty state differentiates "no tasks" vs "no results"
- [ ] Clear filters button resets everything

### End-to-End Tests
- [ ] User can search for "milk" and see only relevant tasks
- [ ] User can sort by "Highest Priority" and see high-priority tasks first
- [ ] User can filter by "Work" category
- [ ] User can bookmark filtered URL and restore view on reload

---

## Deployment

1. **Backend**: Deploy API changes (backward compatible, no migration needed)
2. **Frontend**: Deploy UI changes
3. **Verify**: Test in production with real user authentication

---

## Performance Monitoring

Post-deployment, monitor:
- Query execution time for filtered/sorted requests
- API response times (should be < 1 second per SC-002, SC-003)
- Database index usage (EXPLAIN ANALYZE on production queries)

If performance degrades:
- Add composite index: `CREATE INDEX idx_user_priority ON tasks(user_id, priority)`
- Consider full-text search index (GIN) for title/description

---

## Rollback Plan

If issues arise:
- Backend: Revert changes to `tasks.py` (parameters are optional, no breaking change)
- Frontend: Revert dashboard changes, remove toolbar component
- No database migration to roll back
