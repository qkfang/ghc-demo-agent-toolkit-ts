# Feature Plan: Todo App with LocalStorage Persistence

Build a fully-functional todo app using Next.js App Router, Zustand for state management, and localStorage for data persistence. The app will support creating, completing, editing, and deleting todo items with proper SSR hydration handling.

## Overview

Create a todo feature in `web/features/todo/` following existing patterns. Use Zustand with the decoupled actions pattern for state management, integrate localStorage for persistence, and compose the UI from existing shadcn/ui components (Card, Button) plus new form components. The implementation will handle Next.js SSR hydration properly and follow mobile-first responsive design.

## Requirements

**REQ-001**: User can add new todo items with text description  
**REQ-002**: User can mark todos as complete/incomplete via checkbox  
**REQ-003**: User can edit existing todo text  
**REQ-004**: User can delete individual todo items  
**REQ-005**: Todo state persists across browser sessions via localStorage  
**REQ-006**: User can filter todos by status (All / Active / Completed)  
**REQ-007**: User can clear all completed todos at once  
**REQ-008**: App displays count of remaining active todos  
**REQ-009**: UI is responsive and works on mobile devices  
**REQ-010**: No hydration errors when loading from localStorage on initial render  

## Design Decisions

**DES-001**: Use Zustand with decoupled actions pattern for state management (per project zustand skill)  
**DES-002**: Store todos as array of `TodoItem` with id, text, completed, createdAt properties  
**DES-003**: Use localStorage with key `TODOS_STORAGE_KEY` for client-side persistence  
**DES-004**: Implement SSR-safe hydration by checking `typeof window` before localStorage access  
**DES-005**: Place feature code under `web/features/todo/` following project conventions  
**DES-006**: Reuse existing UI primitives (Button, Card, Input) from `web/components/ui/`  
**DES-007**: Feature-specific components go in `web/features/todo/components/` (contain domain logic)  
**DES-008**: Double-click to edit todo item (inline editing pattern)  
**DES-009**: Debounce localStorage writes to optimize performance  
**DES-010**: Mobile-first responsive design using Tailwind CSS  

## Implementation Phases

### Phase 1: Dependencies & Infrastructure

**Task 1.1**: Add Zustand dependency  
- Add `zustand` to `web/package.json` dependencies section
- *Relates to*: DES-001, DES-002
- *Parallel with*: Task 1.2

**Task 1.2**: Install shadcn/ui Input component  
- Run `bunx shadcn@latest add input` from `web/` directory
- Adds Input primitive to `web/components/ui/input.tsx`
- *Relates to*: REQ-001, REQ-003, DES-006
- *Parallel with*: Task 1.1

### Phase 2: State Management Layer

**Task 2.1**: Create todo store with decoupled actions  
- Create `web/features/todo/todo-store.ts`
- Define `TodoItem` interface: `{ id: string; text: string; completed: boolean; createdAt: number }`
- Create store with `create<TodoState>(() => ({ todos: [] }))`
- Export decoupled actions:
  - `addTodo(text: string)` — generates id, creates todo, prepends to array
  - `toggleTodo(id: string)` — toggles completed status
  - `deleteTodo(id: string)` — removes from array
  - `editTodo(id: string, text: string)` — updates text
  - `clearCompleted()` — removes all completed todos
- *Relates to*: REQ-001–004, REQ-007, DES-001, DES-002
- *Depends on*: Task 1.1

**Task 2.2**: Create localStorage persistence hook  
- Create `web/features/todo/use-todo-persistence.ts`
- Export `TODOS_STORAGE_KEY = 'todos-app-state'` constant
- Implement `useTodoPersistence()` hook:
  - Check `typeof window !== 'undefined'` for SSR safety
  - Load from localStorage on mount via `useEffect` (run once)
  - Subscribe to store changes and write to localStorage (debounced)
  - Handle JSON parse errors gracefully
- *Relates to*: REQ-005, REQ-010, DES-003, DES-004, DES-009
- *Depends on*: Task 2.1

### Phase 3: UI Components

**Task 3.1**: Create AddTodoForm component  
- Create `web/features/todo/components/add-todo-form.tsx`
- Client component with `"use client"` directive
- Local state for input value using `useState`
- Input field + Button layout
- Call `addTodo()` action on submit (Enter key or button click)
- Reset input after successful add
- Trim whitespace, prevent empty todos
- *Relates to*: REQ-001, DES-006, DES-007
- *Parallel with*: Tasks 3.2, 3.3

**Task 3.2**: Create TodoItem component  
- Create `web/features/todo/components/todo-item.tsx`
- Client component with `"use client"` directive
- Props: `TodoItem` object
- Display mode: checkbox + text + delete button
- Edit mode: triggered by double-click on text, shows Input + save/cancel
- Call `toggleTodo()`, `deleteTodo()`, `editTodo()` actions
- Proper TypeScript interface for props
- Accessible: checkbox labels, button aria-labels
- *Relates to*: REQ-002–004, DES-006, DES-007, DES-008
- *Parallel with*: Tasks 3.1, 3.3

**Task 3.3**: Create TodoList component  
- Create `web/features/todo/components/todo-list.tsx`
- Client component with `"use client"` directive
- Subscribe to todos array from store with atomic selector
- Local state for filter (All/Active/Completed) using `useState`
- Filter tabs UI with active state styling
- Render filtered TodoItem components
- Empty state message when no todos match filter
- Footer: "{N} items left" counter + "Clear completed" button
- Call `clearCompleted()` action, only show button if completed todos exist
- *Relates to*: REQ-006–008, DES-007
- *Parallel with*: Tasks 3.1, 3.2

### Phase 4: Feature Integration

**Task 4.1**: Create TodoPage entry component  
- Create `web/features/todo/todo-page.tsx`
- Client component with `"use client"` directive
- Call `useTodoPersistence()` hook at top level
- Layout: Heading + Card(AddTodoForm + TodoList)
- Use existing Card subcomponents: CardHeader, CardTitle, CardContent
- Mobile-first responsive layout: max-width container, proper spacing
- *Relates to*: REQ-009, DES-005, DES-006, DES-010
- *Depends on*: Tasks 2.2, 3.1, 3.2, 3.3

**Task 4.2**: Create todo route  
- Create `web/app/todo/page.tsx`
- Import TodoPage from `@/features/todo/todo-page`
- Thin wrapper: `export default function Todo() { return <TodoPage />; }`
- Add metadata export with title: "Todo App"
- *Relates to*: DES-005
- *Depends on*: Task 4.1

**Task 4.3**: Add navigation link from home  
- Update `web/features/home/home-page.tsx`
- Add Link component import from `next/link`
- Add Button or navigation link to `/todo` route
- Place below existing heading and description
- *Relates to*: Navigation UX
- *Depends on*: Task 4.2

## Verification Steps

After all tasks are complete:

1. **Install dependencies**: Run `bun install` from repo root
2. **Type check**: Run `bun run build` — verify no TypeScript errors
3. **Lint**: Run `bun run lint` — verify no linting errors
4. **Format**: Run `bun run format` — verify code formatting
5. **Manual testing**: Run `bun run dev` from repo root and test at `http://localhost:3000/todo`:
   - ✓ Add multiple todos and verify they appear
   - ✓ Check/uncheck todos to toggle completion
   - ✓ Double-click todo text to edit, save changes
   - ✓ Delete individual todos
   - ✓ Switch between All/Active/Completed filters
   - ✓ Clear all completed todos
   - ✓ Verify "items left" counter updates correctly
   - ✓ Refresh page and verify todos persist from localStorage
   - ✓ Test mobile viewport (responsive layout)
   - ✓ Check browser console for no hydration errors
6. **Accessibility**: Test keyboard-only navigation (Tab, Enter, Space, Escape)

## File Tree (Expected Output)

```
specs/features/001-todo-app/plan.md (this file)
web/package.json (modified - add zustand)
web/components/ui/input.tsx (new - from shadcn)
web/features/todo/
  ├── todo-store.ts
  ├── use-todo-persistence.ts
  ├── todo-page.tsx
  └── components/
      ├── add-todo-form.tsx
      ├── todo-item.tsx
      └── todo-list.tsx
web/app/todo/page.tsx
web/features/home/home-page.tsx (modified - add link)
```

## Dependencies Between Phases

- Phase 2 depends on Phase 1 completion (need Zustand installed)
- Phase 3 can start once Task 2.1 is complete (needs store actions)
- Phase 4 depends on all previous phases

## Risks & Mitigations

**Risk**: Hydration mismatch if localStorage loads before React hydrates  
**Mitigation**: Use SSR-safe pattern — initialize store empty, load localStorage in `useEffect` after mount

**Risk**: Multiple tabs could diverge in state  
**Mitigation**: Out of scope for MVP; could add `storage` event listener in future

**Risk**: localStorage could exceed quota (typically 5-10MB)  
**Mitigation**: Minimal data structure; unlikely to hit limits with typical todo usage

## Out of Scope

- Server-side persistence (database)
- Multi-device sync
- User authentication
- Todo categories/tags
- Due dates or priorities
- Drag-and-drop reordering
- Undo/redo functionality
- Search/filter by text
- Bulk operations beyond "clear completed"
- Animations/transitions (nice-to-have)
