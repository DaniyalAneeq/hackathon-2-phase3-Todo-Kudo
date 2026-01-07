# Feature Specification: Task Attributes (Dates, Priority, Categories)

**Feature Branch**: `004-task-attributes`
**Created**: 2026-01-05
**Status**: Draft
**Input**: User description: "Feature: Task Attributes (Dates, Priority, Categories) - Enrich tasks with due dates, priority levels, and categories while preserving existing authentication and CRUD operations"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set Task Priority (Priority: P1)

As a task creator, I want to assign a priority level to each task so that I can focus on the most important work first.

**Why this priority**: Priority is the most fundamental organizing principle for task management. Users immediately need to distinguish urgent work from routine tasks. This delivers value even without dates or categories.

**Independent Test**: Can be fully tested by creating a task with "High" priority, viewing it in the task list with a red badge, and confirming it displays correctly. Delivers immediate visual organization value.

**Acceptance Scenarios**:

1. **Given** I am creating a new task, **When** I select "High" from the priority dropdown, **Then** the task is saved with high priority and displays a red badge
2. **Given** I have an existing task with medium priority, **When** I edit it and change to "Low" priority, **Then** the task updates and displays a blue/gray badge
3. **Given** I create a task without selecting priority, **When** the task is saved, **Then** it defaults to "medium" priority with a yellow badge

---

### User Story 2 - Set Task Due Date (Priority: P2)

As a task planner, I want to set due dates on tasks so that I can track deadlines and plan my schedule.

**Why this priority**: Due dates add temporal structure to tasks. While important, tasks can be managed by priority alone initially. Due dates enhance organization but aren't critical for MVP.

**Independent Test**: Can be fully tested by creating a task with a due date of "January 15, 2026", viewing it display as "Jan 15" on the task card, and confirming persistence after page reload.

**Acceptance Scenarios**:

1. **Given** I am creating a task, **When** I select a date from the calendar picker, **Then** the task saves with that due date and displays formatted (e.g., "Jan 15")
2. **Given** I have a task with a due date, **When** I edit and clear the due date, **Then** the task updates with no due date displayed
3. **Given** today is January 5, **When** I set a due date of January 6, **Then** the task displays "Tomorrow"
4. **Given** I set a due date, **When** I close and reopen the edit form, **Then** the previously set date appears in the picker

---

### User Story 3 - Categorize Tasks (Priority: P3)

As a task organizer, I want to assign categories to tasks (like "Work", "Personal", "Shopping") so that I can group related tasks together.

**Why this priority**: Categories provide flexible organization but are the least critical attribute. Users can manage tasks effectively with just priority and dates. Categories are a "nice-to-have" enhancement.

**Independent Test**: Can be fully tested by creating a task with category "Work", seeing it display as a small tag on the task card, and creating another task with category "Personal" to verify independent categorization.

**Acceptance Scenarios**:

1. **Given** I am creating a task, **When** I type "Work" into the category field, **Then** the task saves with category "Work" displayed as a tag
2. **Given** I have a task without a category, **When** I edit it and add category "Personal", **Then** the task updates and displays the category tag
3. **Given** I create a task, **When** I leave the category field empty, **Then** the task saves without a category tag
4. **Given** I type a new category name, **When** I save the task, **Then** that category is stored as plain text (no predefined list required)

---

### User Story 4 - View Enhanced Task Cards (Priority: P1)

As a task viewer, I want to see priority, due date, and category displayed clearly on each task card so that I can quickly understand task details at a glance.

**Why this priority**: Display is as critical as data entry. Without proper visualization, the attributes have no value. This must be implemented alongside P1 (priority) to deliver user value.

**Independent Test**: Can be fully tested by creating tasks with various attribute combinations and verifying each displays correctly: priority badge (colored), due date (formatted), and category tag.

**Acceptance Scenarios**:

1. **Given** a task has high priority, due date "Jan 15", and category "Work", **When** I view the task card, **Then** I see a red "High" badge, "Jan 15" date text, and "Work" category tag
2. **Given** a task has only a priority set, **When** I view the task card, **Then** I see only the priority badge (no empty date/category elements)
3. **Given** multiple tasks with different priorities, **When** I view the task list, **Then** I can distinguish them by badge color (High=Red, Medium=Yellow, Low=Blue/Gray)

---

### Edge Cases

- What happens when a user sets a due date in the past? (Display normally - no special handling required at this stage)
- How does the system handle very long category names? (Truncate display with ellipsis after 20 characters, store full text)
- What happens when editing a task that was created before this feature existed? (Task loads with default "medium" priority, no due date, no category)
- How are tasks displayed when only some attributes are set? (Show only the attributes that exist - no placeholders for empty fields)
- What happens if the user types the same category name with different capitalization (e.g., "work" vs "Work")? (Store as-is - no normalization. Treat as different categories for now)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to assign a priority level ("low", "medium", "high") to any task during creation or editing
- **FR-002**: System MUST default new tasks to "medium" priority when no priority is explicitly selected
- **FR-003**: System MUST allow users to set an optional due date on any task using a calendar date picker
- **FR-004**: System MUST allow users to clear/remove a due date from a task after it has been set
- **FR-005**: System MUST allow users to assign an optional category name (plain text string) to any task
- **FR-006**: System MUST persist priority, due date, and category data with each task in the database
- **FR-007**: System MUST display task priority as a colored badge on the task card (High=Red, Medium=Yellow, Low=Blue/Gray)
- **FR-008**: System MUST display due dates in a human-readable format (e.g., "Jan 12", "Tomorrow", "Today")
- **FR-009**: System MUST display category as a small text tag on the task card when present
- **FR-010**: System MUST NOT display empty placeholders for attributes that are not set (only show what exists)
- **FR-011**: System MUST maintain all existing authentication and user isolation functionality without modification
- **FR-012**: System MUST maintain all existing task CRUD operations (create, read, update, delete) without breaking changes
- **FR-013**: System MUST accept priority, due date, and category as optional fields in task creation/update API endpoints
- **FR-014**: System MUST index the new database columns (priority, due_date, category) to support future sorting features
- **FR-015**: System MUST preserve backward compatibility - tasks created before this feature must load and display correctly with default/empty attribute values

### Key Entities

- **Task**: Represents a user's todo item, now enhanced with:
  - Priority level (required, defaults to "medium"): Indicates task urgency/importance
  - Due date (optional): Target completion date for the task
  - Category (optional): User-defined label for grouping related tasks
  - Relationships: Belongs to one User (existing relationship preserved)
  - Constraints: Priority must be one of "low", "medium", "high"; due date must be valid date or null; category is free-form text

- **User**: Represents an authenticated user (existing entity - no changes)
  - Relationships: Has many Tasks (existing relationship preserved)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can set a priority level on a new task and see it reflected with correct badge color in under 5 seconds
- **SC-002**: Users can set a due date using the calendar picker and see it formatted correctly on the task card within 3 seconds
- **SC-003**: Users can assign a category and see it displayed as a tag on the task card immediately after saving
- **SC-004**: 100% of existing tasks (created before this feature) load and display without errors when viewed after deployment
- **SC-005**: Users can edit any task to change priority, update due date, or modify category, and changes persist after page reload
- **SC-006**: All existing authentication flows (login, logout, token refresh) continue to work without any degradation or errors
- **SC-007**: Task creation/editing completes within 2 seconds from user submission to confirmation display
- **SC-008**: Users can complete the full workflow (create task with all three attributes, view it, edit it, verify persistence) in under 60 seconds

## Assumptions

- Users understand priority as a standard three-level scale (low, medium, high) without needing detailed definitions
- Date formatting follows locale defaults (implementation will use standard date formatting libraries)
- Categories are simple text labels - no predefined list or autocomplete required at this stage
- The existing task schema supports adding nullable columns without data migration issues
- Current API versioning strategy supports adding optional fields without breaking existing clients
- UI component library (Shadcn) provides necessary calendar, select, and badge components
- Backend framework supports updating Pydantic models with optional fields without breaking existing validation

## Dependencies

- **External Dependencies**:
  - Shadcn UI components (Calendar, Popover, Select, Badge) must be available and compatible with current Next.js version
  - Database system must support adding columns with default values without table locks or downtime
  - Existing authentication system must remain stable (no modifications allowed)

- **Internal Dependencies**:
  - Requires existing User authentication system (from Spec 003)
  - Requires existing Task CRUD operations (from Spec 003)
  - Requires existing database connection and ORM setup
  - Requires existing API client (`api-client.ts`) for frontend-backend communication

- **Team Dependencies**: None - this feature is self-contained and can be implemented by the assigned agents without external team coordination

## Constraints

- **Non-Functional Constraints**:
  - MUST NOT modify existing `user_id` column or foreign key relationships in tasks table
  - MUST NOT alter existing authentication middleware or security logic
  - MUST NOT break existing task creation/editing forms (all new fields are optional)
  - MUST maintain API backward compatibility (existing clients without new fields must still work)
  - Changes must be purely additive - no removal or modification of existing functionality

- **Scope Constraints**:
  - OUT OF SCOPE: Task sorting by priority/date (future feature)
  - OUT OF SCOPE: Filtering tasks by category (future feature)
  - OUT OF SCOPE: Category autocomplete or suggestion (simple text input only)
  - OUT OF SCOPE: Due date notifications or reminders
  - OUT OF SCOPE: Priority-based color coding in task lists (only individual card badges)
  - OUT OF SCOPE: Recurring tasks or date ranges

## Security & Privacy

- **Security Requirements**:
  - All task attribute operations must require valid authentication token (existing security model)
  - Users can only view/modify attributes on tasks they own (existing user isolation)
  - Input validation: Priority must be enum value; category text must be sanitized to prevent XSS
  - Date input must be validated to prevent invalid dates or date injection attacks

- **Privacy Requirements**:
  - Task attributes (priority, due date, category) are private to the task owner
  - No sharing or visibility of categories across users at this stage
  - Attributes follow same privacy model as existing task data

## Open Questions

None - all requirements are specified with reasonable defaults and assumptions documented above.
