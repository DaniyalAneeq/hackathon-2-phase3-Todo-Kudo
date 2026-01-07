# Feature Specification: Task List Discovery (Search, Sort, Filter)

**Feature Branch**: `005-list-discovery`
**Created**: 2026-01-05
**Status**: Draft
**Input**: User description: "I want to create a new specification for **Feature: List Discovery (Search, Sort, Filter)**. **Context**: We have tasks with rich attributes (Spec 004). Users now need to organize this list. We will implement **Server-Side** filtering/sorting to ensure scalability."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search Tasks by Keywords (Priority: P1)

As a user with many tasks, I want to quickly find specific tasks by searching for keywords in their titles or descriptions, so I can locate relevant tasks without scrolling through the entire list.

**Why this priority**: Search is the most fundamental discovery mechanism. Without it, users with more than a handful of tasks will struggle to find what they need. This is the MVP for list discovery.

**Independent Test**: Can be fully tested by creating tasks with distinct keywords, performing searches, and verifying only matching tasks appear. Delivers immediate value for users with growing task lists.

**Acceptance Scenarios**:

1. **Given** I have tasks titled "Buy milk" and "Buy groceries", **When** I search for "milk", **Then** only the "Buy milk" task appears in the list
2. **Given** I have a task with description containing "project deadline", **When** I search for "deadline", **Then** the task appears in results even though "deadline" is not in the title
3. **Given** I search for "MILK" (uppercase), **When** the search is processed, **Then** tasks containing "milk" in any case are returned (case-insensitive)
4. **Given** I have search filters active, **When** I clear the search input, **Then** all tasks are displayed again

---

### User Story 2 - Sort Tasks by Priority or Due Date (Priority: P2)

As a user managing multiple tasks, I want to sort my task list by priority or due date, so I can focus on what's most important or most urgent.

**Why this priority**: Once users can find tasks, they need to prioritize their attention. Sorting enables users to quickly identify high-priority or time-sensitive tasks without manual scanning.

**Independent Test**: Can be tested by creating tasks with various priorities and due dates, changing sort options, and verifying the list reorders correctly. Works independently of search functionality.

**Acceptance Scenarios**:

1. **Given** I have tasks with priorities "high", "medium", and "low", **When** I sort by "Highest Priority", **Then** high-priority tasks appear first, followed by medium, then low
2. **Given** I have tasks with various due dates, **When** I sort by "Due Soon", **Then** tasks are ordered by due date with the earliest dates first and tasks without due dates appearing last
3. **Given** I have the list sorted by priority, **When** I switch to sort by "Newest", **Then** tasks are reordered by creation date with most recent first
4. **Given** I sort by "Oldest", **When** the list is displayed, **Then** tasks created earliest appear first

---

### User Story 3 - Filter Tasks by Priority or Category (Priority: P2)

As a user organizing tasks across different areas of life, I want to filter tasks by priority level or category, so I can focus on specific types of work without distraction.

**Why this priority**: Filtering enables users to create focused views of their task list. This is especially valuable for users managing both personal and work tasks, or those who want to see only critical items.

**Independent Test**: Can be tested by creating tasks with different priorities and categories, applying filters, and verifying only matching tasks display. Works independently as a standalone filtering feature.

**Acceptance Scenarios**:

1. **Given** I have tasks in "Work" and "Personal" categories, **When** I filter by "Work", **Then** only work-related tasks are displayed
2. **Given** I have tasks with various priorities, **When** I filter by priority "high", **Then** only high-priority tasks appear in the list
3. **Given** I have both a priority filter and category filter active, **When** viewing the list, **Then** only tasks matching BOTH criteria are shown
4. **Given** I have filters active, **When** I remove all filters, **Then** all tasks are displayed again

---

### User Story 4 - Persist Filters in URL (Priority: P3)

As a user who frequently uses specific filters, I want my filter settings saved in the URL, so I can bookmark or share specific filtered views of my task list.

**Why this priority**: URL persistence is a quality-of-life enhancement that enables power users to create custom workflows. While valuable, the feature works without this - it's an optimization rather than core functionality.

**Independent Test**: Can be tested by applying filters, copying the URL, clearing filters, then pasting the URL to verify filters are restored. Delivers value independently as a convenience feature.

**Acceptance Scenarios**:

1. **Given** I search for "project" and filter by "high" priority, **When** I copy the browser URL, **Then** the URL contains query parameters reflecting my filters (e.g., `?q=project&priority=high`)
2. **Given** I have a bookmarked URL with filters, **When** I navigate to that URL, **Then** the search, sort, and filter settings are automatically applied
3. **Given** I have filters active and reload the page, **When** the page loads, **Then** my previous filter settings are restored from the URL
4. **Given** I share a filtered URL with another user, **When** they open it, **Then** they see the same filtered view (assuming they have access to those tasks)

---

### Edge Cases

- What happens when a search query returns zero results? Display an empty state message: "No tasks found matching '[query]'" distinct from the general empty state.
- What happens when sorting by priority but tasks have null/missing priority values? Tasks without priority should appear last in the sorted list.
- What happens when sorting by due_date but some tasks have no due date? Tasks without due dates should appear last when sorting ascending, first when sorting descending.
- What happens when a user types very quickly in the search box? The search input must be debounced (300ms) to prevent excessive API calls.
- What happens when combining search with filters (e.g., search "milk" + filter "Work")? Both conditions must be applied (AND logic): only tasks matching the search AND the filters are shown.
- What happens when the user navigates away and returns? If using URL state, filters should persist; if not, the default view (all tasks, newest first) should display.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept a `search` query parameter that filters tasks by matching the query against task title OR description using case-insensitive substring matching
- **FR-002**: System MUST accept a `sort_by` query parameter with allowed values: `created_at`, `due_date`, `priority`, defaulting to `created_at` if not specified
- **FR-003**: System MUST accept an `order` query parameter with allowed values: `asc`, `desc`, defaulting to `desc` for `created_at` and `asc` for other sort fields
- **FR-004**: System MUST accept a `priority` query parameter that filters tasks by exact priority match (e.g., "high", "medium", "low")
- **FR-005**: System MUST accept a `category` query parameter that filters tasks by exact category match
- **FR-006**: System MUST perform all filtering and sorting operations on the server side to ensure scalability with large datasets
- **FR-007**: System MUST map priority text values ("high", "medium", "low") to sortable numeric equivalents (high=3, medium=2, low=1, null=0) when sorting by priority
- **FR-008**: System MUST place tasks with null `due_date` values last when sorting by due date ascending, and first when sorting descending
- **FR-009**: System MUST place tasks with null `priority` values last in any priority-based sort order
- **FR-010**: Search input in the user interface MUST be debounced with a 300ms delay to prevent excessive API requests during typing
- **FR-011**: System MUST encode all active filters (search, sort, priority filter, category filter) in URL query parameters
- **FR-012**: System MUST parse URL query parameters on page load and apply the specified filters automatically
- **FR-013**: System MUST display an empty state message "No tasks found matching '[query]'" when a search returns zero results, distinct from the "No tasks yet" message when no tasks exist
- **FR-014**: System MUST allow combining multiple filters simultaneously (search + priority + category) using AND logic
- **FR-015**: System MUST provide a way to clear all active filters and return to the default unfiltered view

### Key Entities

- **Task**: Already defined in Spec 004. This feature leverages existing task attributes (title, description, priority, category, due_date, created_at) for filtering and sorting operations.
- **FilterState**: Represents the current set of active filters (not a database entity, but a client-side concept). Includes: search query, sort field, sort order, priority filter, category filter.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can locate a specific task using search in under 5 seconds when the task list contains 50+ tasks
- **SC-002**: The search functionality returns results in under 1 second for task lists containing up to 1000 tasks
- **SC-003**: Users can reorder their task list by any supported sort criterion (newest, oldest, priority, due date) and see the results update in under 1 second
- **SC-004**: When a user applies filters and reloads the page, the filtered view is automatically restored without requiring the user to reapply settings
- **SC-005**: 90% of users successfully locate their desired task within 3 interactions (search, sort, or filter operations)
- **SC-006**: Search input debouncing reduces API calls by at least 70% compared to querying on every keystroke during typical typing speed (5 characters per second)

## Assumptions

- Users are already authenticated (authentication is handled by Better Auth as per project specs)
- Tasks already have the necessary attributes (priority, category, due_date, created_at) as defined in Spec 004
- Database indexes for filtering and sorting fields already exist (added in Spec 004 migration)
- The frontend uses Next.js App Router with support for URL query parameters
- The backend API is built with FastAPI and can accept query parameters
- Performance target is to support task lists up to 1000 tasks efficiently; pagination will be addressed in a future spec if needed

## Dependencies

- **Spec 004 - Task Attributes**: This feature depends on the priority, category, and due_date attributes added in Spec 004
- **Database Indexes**: Requires indexes on priority, category, due_date, and created_at columns (should already exist from Spec 004)
- **ShadcnUI Components**: Requires Input, Select, Popover, and potentially Chip/Badge components for the UI
- **URL State Management**: Frontend must support Next.js router query parameter manipulation (useSearchParams, useRouter)

## Out of Scope

- Pagination: This spec handles filtering/sorting but not pagination. If needed, pagination will be a separate spec.
- Saved filters/presets: Users cannot save named filter configurations for later reuse (potential future enhancement)
- Advanced search operators: No support for boolean operators (AND/OR), wildcards, or regex in search queries
- Multi-select filters: Cannot filter by multiple priorities or multiple categories simultaneously (e.g., "high OR medium")
- Real-time collaborative filtering: Changes to filter settings by one user are not broadcast to other users
- Filter suggestions/autocomplete: Search input does not provide autocomplete suggestions based on existing task content
