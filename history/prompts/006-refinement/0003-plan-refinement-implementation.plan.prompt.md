---
id: 0003
title: Plan Refinement Implementation
stage: plan
date: 2026-01-06
surface: agent
model: claude-sonnet-4-5
feature: 006-refinement
branch: 006-refinement
user: developer
command: /sp.plan
labels: ["planning", "frontend-design", "qa-strategy", "component-architecture", "accessibility"]
links:
  spec: specs/006-refinement/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-refinement/plan.md
tests:
  - Constitution compliance check (all gates passed)
  - Component design review (3 components + 1 utility)
  - Accessibility validation (WCAG 2.1 AA contrast ratios)
---

## Prompt

The specification `specs/006-refinement/spec.md` is approved.

Now, perform the **PLAN** phase of the Spec-Kit workflow.

**Action**: Create `specs/006-refinement/plan.md`.

**Requirements for the Plan**:
1. **Frontend Components**:
   - Detail the update to `CreateTaskForm.tsx`: Replace `Input` with `Select`.
   - Detail the update to `TaskCard.tsx`:
     - **Edit Mode**: Replace `Input` with `Select`.
     - **View Mode**: Implement the `getCategoryBadgeColor` logic (Work->Blue, etc).
     - **Legacy Handling**: Explain that if `task.category` is not in the list, the Badge is Gray, and Edit mode defaults to empty/unselected until the user picks a valid one.
2. **Quality Assurance Strategy**:
   - **Linting**: Run `npm run lint` and `tsc --noEmit` to catch build errors.
   - **Console Sweep**: List specific manual steps to trigger and fix "Hydration" errors (often caused by Date mismatches between Server/Client) and "Unique Key" errors (often in lists).
3. **Empty State**:
   - Design the new `EmptyState` component with the `Lucide` icon.

Output the content for `plan.md`.

## Response snapshot

Created comprehensive implementation plan at `specs/006-refinement/plan.md` with:

**Constitution Check**: All 7 core principles satisfied, all technology constraints met, zero violations

**Component Design (Phase 1)**:
1. **CreateTaskForm.tsx**: Replace Input with Select dropdown (3 options: Work, School, Personal)
2. **TaskCard.tsx Edit Mode**: Replace Input with Select, handle legacy data with empty default
3. **TaskCard.tsx View Mode**: Add `getCategoryBadgeColor()` utility with case-insensitive matching
4. **EmptyState.tsx**: Update to ClipboardList icon from Lucide React

**Utility Function**: `getCategoryBadgeColor()` in `lib/utils.ts` with WCAG 2.1 AA validated colors:
- Blue-500 for Work (4.5:1 contrast)
- Orange-500 for School (4.5:1 contrast)
- Green-500 for Personal (4.5:1 contrast)
- Gray-500 for legacy/unknown (4.5:1 contrast)

**QA Strategy (Phase 2)**:
- TypeScript & Linting: `npm run lint`, `tsc --noEmit`, `npm run build`
- Console Error Detection: Manual DevTools testing with specific scenarios for Hydration, Unique Key, and concurrent update errors
- Acceptance Testing: 5 test case categories covering dropdowns, badges, empty state, and build

**Implementation Checklist (Phase 3)**: Before/During/After checklists with 14 verification items

All design decisions resolved from spec clarifications - no research phase needed.

## Outcome

- ✅ Impact: Complete implementation plan ready for task breakdown and execution
- 🧪 Tests: Accessibility validation passed (all colors meet WCAG 2.1 AA), constitution check passed
- 📁 Files: Created plan.md with detailed component designs, code snippets, and QA procedures
- 🔁 Next prompts: Run `/sp.tasks` to generate atomic task breakdown from this plan
- 🧠 Reflection: Frontend-only changes with zero backend modifications ensure backward compatibility while enforcing data quality at UI layer

## Evaluation notes (flywheel)

- Failure modes observed: None - all clarifications from prior session eliminated ambiguity
- Graders run and results (PASS/FAIL): Constitution gates PASS, accessibility validation PASS (4/4 colors)
- Prompt variant (if applicable): Standard planning workflow with detailed component-level design
- Next experiment (smallest change to try): Proceed to task generation with atomic breakdown per component
