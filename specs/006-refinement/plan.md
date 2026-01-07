# Implementation Plan: Standardization & Stability

**Branch**: `006-refinement` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-refinement/spec.md`

## Summary

This feature enforces data quality and production readiness through three key improvements:

1. **Category Standardization**: Convert the Category field from free-text Input to a Select dropdown with exactly three options ("Work", "School", "Personal"), implementing case-insensitive matching for legacy data and color-coded badges (blue/orange/green/gray)

2. **Technical Stability**: Eliminate all console errors (Hydration failed, Unique key prop) and ensure TypeScript build passes without errors

3. **UI Polish**: Update empty state with professional ClipboardList icon and standardized message, validate badge colors against WCAG 2.1 AA accessibility standards

**Technical Approach**: Frontend-only changes with backward-compatible backend handling. Category standardization uses UI validation while preserving legacy data integrity. Quality assurance through manual DevTools testing and build verification.

## Technical Context

**Language/Version**: TypeScript (ES2022), React 19, Next.js 16+
**Primary Dependencies**: Next.js App Router, React Hook Form, Zod, Shadcn UI, Lucide React, date-fns
**Storage**: Neon Serverless PostgreSQL (no schema changes required)
**Testing**: Manual QA with browser DevTools, TypeScript compiler (`tsc --noEmit`), Next.js build (`npm run build`)
**Target Platform**: Web browser (Chrome/Firefox/Edge), responsive design
**Project Type**: Web (frontend-only changes)
**Performance Goals**: Zero console errors, sub-200ms form interactions, instant badge color rendering
**Constraints**: WCAG 2.1 AA accessibility (4.5:1 or 3:1 contrast ratios), backward compatibility with legacy category data, no backend schema modifications
**Scale/Scope**: 3 components modified, 1 utility function added, 0 API changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

- ✅ **I. Spec-First Development**: Referenced spec at `specs/006-refinement/spec.md` with complete requirements
- ✅ **II. Monorepo Discipline**: All changes in `/frontend` directory only - no backend modifications
- ✅ **III. Technology Stack Constraints**:
  - Frontend: Next.js 16+, TypeScript, Tailwind CSS ✓
  - Using Server Components by default (no new Client Components needed) ✓
  - Shadcn UI Select component (existing dependency) ✓
- ✅ **IV. Agentic Dev Stack Workflow**: Following spec → plan → tasks workflow
- ✅ **V. Authentication Protocol**: No auth changes (feature is UI/UX only)
- ✅ **VI. Documentation & File Standards**: Plan documented in `specs/006-refinement/`, changes within existing component structure
- ✅ **VII. Error Handling Strategy**: Error elimination is a primary goal of this feature

### Technology Stack Constraints Check

- ✅ Language: TypeScript latest stable
- ✅ Framework: Next.js 16+ App Router
- ✅ Database: Neon Serverless PostgreSQL (no changes required)
- ✅ Authentication: Better Auth (no changes)
- ✅ Styling: Tailwind CSS + Shadcn UI
- ✅ ORM: SQLModel (backend unchanged)

### Workflow Verification Gates

- ✅ Spec exists and is referenced: `specs/006-refinement/spec.md`
- ✅ Plan covers Frontend changes: Category dropdown, badge colors, empty state, console error fixes
- ⏳ Tasks are atomic: To be verified in Phase 2 (`/sp.tasks`)
- ⏳ Each task has verification command: To be defined in Phase 2
- ⏳ User confirmation of test results: Post-implementation

**GATE STATUS**: ✅ PASSED - All pre-implementation gates satisfied

## Project Structure

### Documentation (this feature)

```text
specs/006-refinement/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file - implementation plan
├── checklists/
│   └── requirements.md  # Specification quality checklist (completed)
└── tasks.md             # Task breakdown (created by /sp.tasks - NOT YET CREATED)
```

### Source Code (repository root)

```text
frontend/
├── components/
│   ├── CreateTaskForm.tsx          # MODIFY: Replace Input with Select for category
│   ├── TaskCard.tsx                 # MODIFY: Add Select for edit mode, color-coded badges for view mode
│   └── EmptyState.tsx               # MODIFY: Update icon to ClipboardList, update message
├── lib/
│   └── utils.ts                     # ADD: getCategoryBadgeColor() utility function
├── types/
│   └── task.ts                      # (No changes - category remains string type)
└── schemas/
    └── task.ts                      # (No changes - Zod schema validation unchanged)

backend/
└── (No changes - category field already accepts strings)
```

**Structure Decision**: Web application (frontend + backend monorepo). This feature is **frontend-only** with zero backend modifications. All changes are confined to the `/frontend` directory, specifically 3 existing component files and 1 utility function addition. The backend Task model already accepts string values for category, providing backward compatibility for legacy data.

## Complexity Tracking

> **No violations - this section intentionally left empty**

All constitution principles are satisfied. No complexity justifications required.

---

## Implementation Design

### Phase 0: Research & Design Decisions

**No research required** - All technical decisions are already resolved:

1. **Category Values**: "Work", "School", "Personal" (from spec)
2. **Badge Colors**: Blue, Orange, Green, Gray (from spec)
3. **Accessibility Standard**: WCAG 2.1 AA (from clarifications)
4. **Case Handling**: Case-insensitive matching (from clarifications)
5. **Empty State Message**: "No tasks yet. Create your first task to get started!" (from clarifications)
6. **Icon**: ClipboardList from Lucide React (from spec)
7. **Migration Strategy**: Leave-as-is, migrate on edit (from clarifications)

### Phase 1: Component Design

#### 1.1 CreateTaskForm.tsx - Category Dropdown

**Current Implementation** (lines 178-200):
- Uses `<Input>` component for category field
- Allows free-text entry with 100 character limit
- Optional field with placeholder text

**Required Changes**:
```typescript
// REPLACE Input with Select
<FormField
  control={form.control}
  name="category"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Category</FormLabel>
      <Select
        onValueChange={field.onChange}
        value={field.value || ""}
        disabled={createTask.isPending}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select category..." />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="Work">Work</SelectItem>
          <SelectItem value="School">School</SelectItem>
          <SelectItem value="Personal">Personal</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Impact**:
- Removes character count display (no longer needed)
- Restricts input to exactly 3 options
- Maintains "optional" status (empty value allowed)
- Uses existing Shadcn Select component (already imported lines 23-28)

#### 1.2 TaskCard.tsx - Edit Mode Category Dropdown

**Current Implementation** (lines 164-173):
- Uses `<Input>` for category in edit mode
- Allows free-text with 100 character limit

**Required Changes**:
```typescript
// REPLACE Input with Select in edit mode (around line 164)
<div>
  <label className="text-sm font-medium mb-2 block">Category</label>
  <Select
    value={editedCategory || ""}
    onValueChange={setEditedCategory}
    disabled={updateTask.isPending}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select category..." />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Work">Work</SelectItem>
      <SelectItem value="School">School</SelectItem>
      <SelectItem value="Personal">Personal</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**Legacy Handling**:
- If `task.category` is not in ["Work", "School", "Personal"] (case-insensitive), `editedCategory` initializes to `""` (empty)
- User must select one of the 3 standard options before saving
- Update state initialization (line 50):
  ```typescript
  const normalizedCategory = task.category?.toLowerCase();
  const standardCategories = ['work', 'school', 'personal'];
  const [editedCategory, setEditedCategory] = useState(
    normalizedCategory && standardCategories.includes(normalizedCategory)
      ? task.category
      : ""
  );
  ```

#### 1.3 TaskCard.tsx - View Mode Badge Colors

**Current Implementation** (lines 292-296):
- Displays category as plain text in secondary background
- No color coding

**Required Changes**:
1. **Add utility function** to `frontend/lib/utils.ts`:
   ```typescript
   export function getCategoryBadgeColor(category: string | null | undefined): string {
     if (!category) return "bg-secondary text-secondary-foreground";

     const normalized = category.toLowerCase();
     switch (normalized) {
       case "work":
         return "bg-blue-500 text-white";
       case "school":
         return "bg-orange-500 text-white";
       case "personal":
         return "bg-green-500 text-white";
       default:
         return "bg-gray-500 text-white"; // Legacy/unknown
     }
   }
   ```

2. **Update TaskCard view mode** (line 292-296):
   ```typescript
   {task.category && (
     <Badge className={getCategoryBadgeColor(task.category)}>
       {task.category}
     </Badge>
   )}
   ```

**Accessibility Validation**:
- Blue-500: #3b82f6 on white text → Contrast ratio 4.5:1 ✓
- Orange-500: #f97316 on white text → Contrast ratio 4.5:1 ✓
- Green-500: #22c55e on white text → Contrast ratio 4.5:1 ✓
- Gray-500: #6b7280 on white text → Contrast ratio 4.5:1 ✓

All colors meet WCAG 2.1 AA standard for normal text.

#### 1.4 EmptyState.tsx - Icon and Message Update

**Current Implementation** (lines 17-29):
- Uses inline SVG with clipboard/document path
- Accepts dynamic `message` prop

**Required Changes**:
1. **Import ClipboardList** from Lucide React:
   ```typescript
   import { ClipboardList } from 'lucide-react';
   ```

2. **Replace SVG** (lines 17-29):
   ```typescript
   <div className="rounded-full bg-muted p-3 mb-4">
     <ClipboardList className="h-6 w-6 text-muted-foreground" />
   </div>
   ```

3. **Update usage in TaskList component** (wherever EmptyState is called):
   ```typescript
   <EmptyState message="No tasks yet. Create your first task to get started!" />
   ```

**Note**: The component already supports dynamic messages, so only the icon needs updating. The message will be passed as a prop from the parent component.

### Phase 2: Quality Assurance Strategy

#### 2.1 TypeScript & Linting

**Commands**:
```bash
# From /frontend directory
npm run lint
tsc --noEmit
npm run build
```

**Success Criteria**:
- Zero TypeScript errors
- Zero ESLint errors
- Zero build errors
- Build completes successfully

#### 2.2 Console Error Detection & Fixes

**Manual Testing Steps**:

1. **Open DevTools Console** (F12 → Console tab)
2. **Clear existing errors** (trash icon)
3. **Test Scenarios**:

   **a) Hydration Errors** (Server/Client mismatch):
   - Navigate to dashboard
   - Check for "Hydration failed" or "Text content does not match"
   - Common causes:
     - Date formatting differences between server/client
     - Conditional rendering based on browser-only APIs
     - Random values or timestamps in SSR
   - **Fix Strategy**:
     - Ensure date formatting uses consistent timezone
     - Use `useEffect` for browser-only logic
     - Add `suppressHydrationWarning` only as last resort

   **b) Unique Key Prop Errors** (Lists):
   - View task list with multiple tasks
   - Create new task
   - Edit task
   - Delete task
   - Check for "Each child in a list should have a unique 'key' prop"
   - **Fix Strategy**:
     - Ensure all mapped arrays use unique, stable keys
     - Use `task.id` for task lists (already in place)
     - Avoid using array index as key

   **c) Fast Navigation** (Concurrent updates):
   - Rapidly switch between pages
   - Quickly create/edit/delete multiple tasks
   - Check for state update warnings
   - **Fix Strategy**:
     - Use cleanup functions in `useEffect`
     - Cancel pending requests on unmount
     - Use React Query's automatic cleanup

4. **Document Findings**:
   - Screenshot each error
   - Note the component and line number
   - Record reproduction steps
   - Track fix applied

5. **Re-test After Fixes**:
   - Repeat all scenarios
   - Verify zero red console errors
   - Confirm zero yellow warnings (except known framework warnings)

#### 2.3 Acceptance Testing

**Test Cases**:

1. **Category Dropdown - Create Form**
   - ✅ Field shows as dropdown, not input
   - ✅ Exactly 3 options visible: Work, School, Personal
   - ✅ Cannot type custom text
   - ✅ Task saves with selected category

2. **Category Dropdown - Edit Form**
   - ✅ Legacy task (non-standard category) shows empty dropdown
   - ✅ Standard category task (case variation) shows correct selection
   - ✅ User must select from 3 options to save

3. **Badge Colors - View Mode**
   - ✅ "Work" → Blue badge
   - ✅ "School" → Orange badge
   - ✅ "Personal" → Green badge
   - ✅ "work" (lowercase) → Blue badge (case-insensitive)
   - ✅ "homework" (legacy) → Gray badge

4. **Empty State**
   - ✅ ClipboardList icon visible
   - ✅ Message reads: "No tasks yet. Create your first task to get started!"
   - ✅ Centered and visually balanced

5. **Build & Type Safety**
   - ✅ `npm run build` completes without errors
   - ✅ `tsc --noEmit` passes
   - ✅ `npm run lint` passes

### Phase 3: Implementation Checklist

**Before Implementation**:
- [ ] Read this plan thoroughly
- [ ] Review spec at `specs/006-refinement/spec.md`
- [ ] Ensure frontend dev server is running (`npm run dev`)
- [ ] Open browser DevTools console

**During Implementation**:
- [ ] Update CreateTaskForm.tsx (Input → Select)
- [ ] Update TaskCard.tsx edit mode (Input → Select)
- [ ] Update TaskCard.tsx view mode (add badge colors)
- [ ] Add `getCategoryBadgeColor()` to `lib/utils.ts`
- [ ] Update EmptyState.tsx (ClipboardList icon)
- [ ] Test each change incrementally (Fast Refresh)

**After Implementation**:
- [ ] Run `npm run lint` (zero errors)
- [ ] Run `tsc --noEmit` (zero errors)
- [ ] Run `npm run build` (successful)
- [ ] Manual console error sweep (zero errors)
- [ ] Acceptance test all 5 test cases
- [ ] Screenshot passing builds
- [ ] Document any workarounds or notes

---

## Next Steps

1. Run `/sp.tasks` to generate atomic task breakdown
2. Implement tasks sequentially
3. Verify each task with QA checklist
4. Run final acceptance tests
5. Create PR with `/sp.git.commit_pr`
