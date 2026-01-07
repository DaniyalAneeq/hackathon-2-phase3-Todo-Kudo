# Tasks: Standardization & Stability

**Feature**: Standardization & Stability
**Branch**: `006-refinement`
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)
**Date**: 2026-01-06

## Overview

Transform the application from "Functional" to "Production Quality" by standardizing category data entry, implementing visual polish with color-coded badges, and eliminating all console errors.

**Agent Delegation**:
- `frontend-dev-agent`: UI components, utilities, and visual polish
- `qa-spec-validator`: Build checks, linting, and console error verification

**Goal**: Zero console errors, standardized category input, WCAG 2.1 AA compliant color-coded badges, and professional empty state.

---

## Phase 1: Setup & Infrastructure

**Goal**: Verify dependencies and create utility functions needed across all user stories.

### Tasks

- [X] T001 [P] Verify Shadcn Select Component Installation
  - **File**: `frontend/components/ui/select.tsx`
  - **Action**: Check if Select component exists; install if missing
  - **Command**: `test -f frontend/components/ui/select.tsx || (cd frontend && npx shadcn@latest add select)`
  - **Agent**: frontend-dev-agent
  - **Verification**: File `frontend/components/ui/select.tsx` exists
  - **Acceptance**: Select component ready for use in forms

- [X] T002 [P] Verify Lucide React Icons Installation
  - **File**: `frontend/package.json`
  - **Action**: Ensure `lucide-react` is installed (verify in dependencies)
  - **Command**: `cd frontend && npm list lucide-react`
  - **Agent**: frontend-dev-agent
  - **Verification**: Package appears in npm list output
  - **Acceptance**: Lucide icons available for import

- [X] T003 Create Category Badge Color Utility Function
  - **File**: `frontend/lib/utils.ts`
  - **Action**: Add `getCategoryBadgeColor()` function with case-insensitive category matching
  - **Implementation**:
    ```typescript
    export function getCategoryBadgeColor(category: string | null | undefined): string {
      if (!category) return "bg-secondary text-secondary-foreground";

      const normalized = category.toLowerCase();
      switch (normalized) {
        case "work":
          return "bg-blue-500 hover:bg-blue-600 text-white";
        case "school":
          return "bg-orange-500 hover:bg-orange-600 text-white";
        case "personal":
          return "bg-green-500 hover:bg-green-600 text-white";
        default:
          return "bg-gray-500 hover:bg-gray-600 text-white"; // Legacy/unknown
      }
    }
    ```
  - **Agent**: frontend-dev-agent
  - **Verification**: `grep "getCategoryBadgeColor" frontend/lib/utils.ts`
  - **Acceptance**: Function exported and available for import in components
  - **WCAG Validation**: All colors meet 4.5:1 contrast ratio (verified in plan.md)

---

## Phase 2: User Story 1 - Consistent Category Selection (P1)

**Story Goal**: Restrict category input to exactly three options ("Work", "School", "Personal") preventing users from creating inconsistent category variations.

**Independent Test**: Create a new task and verify only 3 category options appear in dropdown; attempt to type custom text fails; task saves with selected category.

### Tasks

- [X] T004 [US1] Replace Category Input with Select in CreateTaskForm
  - **File**: `frontend/components/CreateTaskForm.tsx` (lines 178-200)
  - **Action**: Replace `<Input>` component with `<Select>` dropdown for category field
  - **Changes**:
    - Remove Input import usage for category
    - Update FormField render to use Select with 3 options: "Work", "School", "Personal"
    - Remove character count display (lines 192-196)
    - Maintain optional field behavior (empty value allowed)
  - **Code Reference**: See plan.md section 1.1 for exact implementation
  - **Agent**: frontend-dev-agent
  - **Verification**:
    - Open `http://localhost:3000/dashboard`
    - Click "Create New Task"
    - Verify Category field shows dropdown (not input)
    - Verify exactly 3 options: Work, School, Personal
    - Verify cannot type custom text
  - **Acceptance**: Category field restricted to 3 dropdown options only

- [X] T005 [US1] Replace Category Input with Select in TaskCard Edit Mode
  - **File**: `frontend/components/TaskCard.tsx` (lines 164-173)
  - **Action**: Replace `<Input>` with `<Select>` for category in edit mode
  - **Legacy Handling**: Update state initialization (line 50) to handle non-standard categories:
    ```typescript
    const normalizedCategory = task.category?.toLowerCase();
    const standardCategories = ['work', 'school', 'personal'];
    const [editedCategory, setEditedCategory] = useState(
      normalizedCategory && standardCategories.includes(normalizedCategory)
        ? task.category
        : ""
    );
    ```
  - **Code Reference**: See plan.md section 1.2 for exact implementation
  - **Agent**: frontend-dev-agent
  - **Verification**:
    - Create task with legacy category (e.g., "homework") via API/database
    - Edit the task in UI
    - Verify dropdown shows empty/unselected state
    - Select a standard category and save
    - Verify task updates with new category
  - **Acceptance**: Edit mode forces selection from 3 standard categories; legacy data handled gracefully

---

## Phase 3: User Story 2 - Visual Category Identification (P2)

**Story Goal**: Enable users to quickly identify task categories through color-coded badges without reading category text.

**Independent Test**: Create tasks with different categories ("Work", "School", "Personal", and a legacy value like "homework"); verify Work=Blue, School=Orange, Personal=Green, legacy=Gray badges display correctly on task cards.

### Tasks

- [X] T006 [US2] Add Color-Coded Badges to TaskCard View Mode
  - **File**: `frontend/components/TaskCard.tsx` (lines 292-296)
  - **Action**: Update category badge to use `getCategoryBadgeColor()` utility function
  - **Changes**:
    - Import `getCategoryBadgeColor` from `@/lib/utils`
    - Replace current badge implementation:
      ```typescript
      {task.category && (
        <Badge className={getCategoryBadgeColor(task.category)}>
          {task.category}
        </Badge>
      )}
      ```
  - **Code Reference**: See plan.md section 1.3 for implementation details
  - **Agent**: frontend-dev-agent
  - **Verification**:
    - Create task with category "Work" → verify blue badge
    - Create task with category "School" → verify orange badge
    - Create task with category "Personal" → verify green badge
    - Create task with category "work" (lowercase) → verify blue badge (case-insensitive)
    - Create task with category "homework" (legacy) → verify gray badge
  - **Acceptance**: All categories display correct color-coded badges with case-insensitive matching

---

## Phase 4: User Story 3 - Error-Free Application Experience (P1)

**Story Goal**: Provide stable, error-free experience with zero console errors, TypeScript errors, and professional empty state.

**Independent Test**: Open browser console, navigate all pages, perform CRUD operations, and verify zero "Hydration failed" or "Unique key prop" errors appear; run `npm run build` and verify zero TypeScript errors; view empty task list and verify professional ClipboardList icon with appropriate message.

### Tasks

- [X] T007 [US3] Update EmptyState Component with ClipboardList Icon
  - **File**: `frontend/components/EmptyState.tsx` (lines 17-29)
  - **Action**: Replace inline SVG with ClipboardList icon from Lucide React
  - **Changes**:
    - Add import: `import { ClipboardList } from 'lucide-react';`
    - Replace SVG (lines 17-29) with: `<ClipboardList className="h-6 w-6 text-muted-foreground" />`
    - Update message prop usage to: `"No tasks yet. Create your first task to get started!"`
  - **Code Reference**: See plan.md section 1.4 for implementation
  - **Agent**: frontend-dev-agent
  - **Verification**:
    - Delete all tasks or filter to zero results
    - Verify ClipboardList icon displays (not old SVG)
    - Verify message reads: "No tasks yet. Create your first task to get started!"
    - Verify centered and visually balanced layout
  - **Acceptance**: Professional empty state with ClipboardList icon and standardized message

- [X] T008 [US3] TypeScript Type Safety Verification
  - **Directory**: `frontend/`
  - **Command**: `cd frontend && npx tsc --noEmit`
  - **Action**: Run TypeScript compiler in check mode; fix any type errors found
  - **Common Issues**:
    - Property does not exist on type
    - Type mismatch in function arguments
    - Missing type annotations
  - **Agent**: qa-spec-validator
  - **Verification**: Command exits with code 0 (no errors)
  - **Acceptance**: Zero TypeScript compilation errors
  - **Constraint**: DO NOT mark complete until command succeeds

- [X] T009 [US3] ESLint Code Quality Verification
  - **Directory**: `frontend/`
  - **Command**: `cd frontend && npm run lint`
  - **Action**: Run ESLint; fix warnings and errors
  - **Common Issues**:
    - Unused variables
    - Missing dependencies in useEffect
    - Console.log statements in production code
  - **Agent**: qa-spec-validator
  - **Verification**: Command exits with code 0 (no errors)
  - **Acceptance**: Zero ESLint errors and warnings
  - **Constraint**: DO NOT mark complete until command succeeds

- [X] T010 [US3] Production Build Verification
  - **Directory**: `frontend/`
  - **Command**: `cd frontend && npm run build`
  - **Action**: Run Next.js production build; fix any build errors
  - **Common Issues**:
    - TypeScript errors blocking build
    - Import errors
    - Missing environment variables
    - Route generation errors
  - **Agent**: qa-spec-validator
  - **Verification**: Command exits with code 0 and outputs "Build successful"
  - **Acceptance**: Next.js production build completes without errors
  - **Constraint**: DO NOT mark complete until build succeeds

- [X] T011 [US3] Manual Console Error Detection and Fix
  - **Directory**: `frontend/`
  - **Action**: Manual testing in browser DevTools console to detect and fix runtime errors
  - **Test Scenarios**:
    1. **Hydration Errors**:
       - Navigate to `/dashboard`
       - Check for "Hydration failed" or "Text content does not match" errors
       - Fix date formatting mismatches (server vs client)
       - Use `suppressHydrationWarning` sparingly as last resort
    2. **Unique Key Prop Errors**:
       - View task list with multiple tasks
       - Create, edit, delete tasks
       - Check for "Each child in a list should have a unique 'key' prop" warnings
       - Verify all lists use `task.id` as key (not array index)
    3. **Fast Navigation Tests**:
       - Rapidly switch between pages
       - Quickly create/edit/delete multiple tasks
       - Check for state update warnings or race conditions
  - **Fix Strategies**: See plan.md section 2.2 for detailed fix approaches
  - **Agent**: qa-spec-validator
  - **Verification**:
    - Open `http://localhost:3000/dashboard` in Chrome DevTools
    - Console shows zero red errors
    - Console shows zero yellow warnings (except known framework warnings)
  - **Acceptance**: Clean console with zero Hydration, Unique Key, or state update errors
  - **Constraint**: Test all scenarios; document any errors found with screenshots

---

## Phase 5: Final Acceptance Testing

**Goal**: Comprehensive end-to-end verification that all user stories meet acceptance criteria.

### Tasks

- [X] T012 Final Acceptance Test - Category Dropdown Functionality
  - **Test Cases**:
    1. Create Form: Dropdown shows exactly 3 options, no text input allowed
    2. Edit Form (standard category): Dropdown pre-selects current category
    3. Edit Form (legacy category): Dropdown shows empty, forces selection
    4. Save: Task saves with selected category value
  - **Agent**: qa-spec-validator
  - **Verification**: All 4 test cases pass
  - **Acceptance**: Category standardization working end-to-end

- [X] T013 Final Acceptance Test - Badge Color Display
  - **Test Cases**:
    1. "Work" task → Blue badge (bg-blue-500)
    2. "School" task → Orange badge (bg-orange-500)
    3. "Personal" task → Green badge (bg-green-500)
    4. "work" (lowercase) task → Blue badge (case-insensitive)
    5. "homework" (legacy) task → Gray badge (bg-gray-500)
  - **Agent**: qa-spec-validator
  - **Verification**: All 5 test cases pass with correct colors
  - **Acceptance**: Color-coded badges display correctly for all category variations

- [X] T014 Final Acceptance Test - Empty State Display
  - **Test Cases**:
    1. Zero tasks → ClipboardList icon visible
    2. Message reads: "No tasks yet. Create your first task to get started!"
    3. Layout is centered and visually balanced
  - **Agent**: qa-spec-validator
  - **Verification**: All 3 test cases pass
  - **Acceptance**: Professional empty state meets design requirements

- [X] T015 Final Acceptance Test - Production Readiness
  - **Test Cases**:
    1. `npm run build` → successful (zero errors)
    2. `tsc --noEmit` → successful (zero errors)
    3. `npm run lint` → successful (zero errors)
    4. Browser console → zero errors during normal usage
  - **Agent**: qa-spec-validator
  - **Verification**: All 4 commands/checks pass
  - **Acceptance**: Application is production-ready with zero errors

---

## Dependencies & Execution Order

### User Story Dependency Graph

```
Phase 1 (Setup) → Foundational for all stories
    ↓
Phase 2 (US1: Category Selection) → Independent, can run after Phase 1
    ↓
Phase 3 (US2: Visual Identification) → Depends on US1 (needs category standardization)
    ↓
Phase 4 (US3: Error-Free Experience) → Can run in parallel with US1/US2 for most tasks
    ↓
Phase 5 (Final Acceptance) → Depends on all user stories complete
```

### Parallel Execution Opportunities

**Phase 1** - All tasks can run in parallel:
- T001 (Select verification) || T002 (Lucide verification) || T003 (utility creation)

**Phase 2** - Tasks are sequential (same files):
- T004 → T005 (both modify form components)

**Phase 3** - Single task (independent):
- T006 (can run after T003 completes)

**Phase 4** - Most tasks can run in parallel:
- T007 (EmptyState) || T008 (TypeScript) || T009 (ESLint)
- T010 must run after T008, T009 pass
- T011 runs after T010 passes

**Phase 5** - Sequential acceptance tests:
- T012 → T013 → T014 → T015

### Critical Path

Longest dependency chain (7 tasks):
```
T003 (utility) → T004 (CreateForm) → T006 (badges) → T008 (TypeScript) → T010 (build) → T011 (console) → T015 (final)
```

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**User Story 1 Only** - Category Standardization:
- T001, T002, T003 (Setup)
- T004, T005 (Category dropdowns)
- T008, T009, T010 (QA validation)

**Delivery**: Users can only select from 3 standard categories, legacy data handled gracefully.

### Incremental Delivery

1. **Sprint 1** (MVP): Phase 1 + Phase 2 → Category standardization working
2. **Sprint 2**: Phase 3 → Visual polish with color-coded badges
3. **Sprint 3**: Phase 4 + Phase 5 → Error elimination and production readiness

### Testing Strategy

**No automated tests** - This feature uses manual QA and build verification:
- TypeScript compilation (T008)
- ESLint validation (T009)
- Production build (T010)
- Manual console error detection (T011)
- Manual acceptance testing (T012-T015)

---

## Task Summary

**Total Tasks**: 15
- Phase 1 (Setup): 3 tasks
- Phase 2 (US1): 2 tasks
- Phase 3 (US2): 1 task
- Phase 4 (US3): 4 tasks
- Phase 5 (Final): 4 tasks

**Parallel Opportunities**: 6 tasks marked [P]
**User Story Tasks**: 7 tasks with [US1], [US2], [US3] labels
**Estimated Duration**: 2-3 days (1 day MVP, 2-3 days full implementation)

**Agent Distribution**:
- frontend-dev-agent: 7 tasks (implementation)
- qa-spec-validator: 8 tasks (verification and testing)

---

## Validation Checklist

✅ All tasks follow strict checkbox format: `- [ ] [TaskID] [P?] [Story?] Description`
✅ All tasks include file paths or directories
✅ All tasks include verification commands or criteria
✅ All tasks include acceptance criteria
✅ All tasks assigned to agents
✅ User stories organized in priority order (P1 → P2 → P1)
✅ Dependencies clearly documented
✅ Parallel execution opportunities identified
✅ Independent test criteria defined for each story
✅ MVP scope clearly defined

**Format Compliance**: 15/15 tasks (100%)
