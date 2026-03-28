# Implementation Tasks: 001 — Todo App with LocalStorage Persistence

Build a client-side todo app in 4 sequential phases: foundation → shared UI primitives → feature components → route wiring. Each phase is independently verifiable before the next begins. Zustand's `persist` middleware handles all localStorage hydration automatically.

---

## Design Identifiers (DES-*)

Defined here; referenced consistently across all tasks below.

| ID | Decision |
|---|---|
| DES-1 | Data model: `Todo { id, text, completed, createdAt }` + `FilterValue = "all" \| "active" \| "completed"` in `web/features/todo/types.ts` |
| DES-2 | Zustand store at `web/store/use-todo-store.ts` composed with `subscribeWithSelector` + `persist` (outer → inner order) |
| DES-2.1 | Decoupled actions pattern: `addTodo`, `toggleTodo`, `deleteTodo`, `clearCompleted`, `setFilter` exported as plain functions using `useTodoStore.setState(...)` |
| DES-2.2 | localStorage key `"todo-store"` via `createJSONStorage(() => localStorage)` |
| DES-3 | Feature component tree rooted at `web/features/todo/todo-page.tsx` (`"use client"`) |
| DES-3.1 | `todo-input.tsx`: controlled `<Input>` + `<Button>` — submit on Enter key or click; trim + guard empty strings |
| DES-3.2 | `todo-item.tsx`: `<Checkbox>` + `<label>` (strikethrough when completed) + ghost icon-sm `<Button>` for delete |
| DES-3.3 | `todo-filter.tsx`: three styled `<button>` tabs (All / Active / Completed); active tab highlighted |
| DES-3.4 | `todo-stats.tsx`: "N items remaining" count + "Clear completed" `<Button>` (rendered only when completed todos exist) |
| DES-4 | `web/components/ui/checkbox.tsx`: Base UI `@base-ui/react/checkbox` primitive — no new npm dependency (Base UI already installed) |
| DES-5 | `web/components/ui/input.tsx`: styled `<input>` wrapper with focus-visible ring, matching existing button/card design tokens |
| DES-6 | Thin RSC route: `web/app/todos/page.tsx` imports and renders only `<TodoPage />` |
| DES-7 | Layout: `Card` + `CardContent` wrapper, `mx-auto max-w-lg`, vertically padded — consistent with `HomePage` centring pattern |

---

## Requirements (REQ-*) from plan.md

| ID | Requirement |
|---|---|
| REQ-1 | Add todos |
| REQ-2 | Toggle todo completion |
| REQ-3 | Delete todos |
| REQ-4 | Todos persist to localStorage across refreshes |
| REQ-5 | Filter todos: All / Active / Completed |
| REQ-6 | Clear all completed todos in one action |
| REQ-7 | Follow repo conventions: feature folder, decoupled Zustand actions, thin route module |

---

## Phase 1 — Foundation

_Prerequisite for all other phases._

- [ ] 1.1 Install Zustand
  - Run `bun add zustand` from the `web/` directory to add Zustand to `web/package.json`
  - Confirm `"zustand"` appears in the `dependencies` block of `web/package.json`
  - _Requirements: REQ-4, REQ-7_
  - _Design: DES-2_
  - **Done when:** `web/package.json` contains `zustand` in dependencies and `web/bun.lockb` (or `bun.lock`) is updated

- [ ] 1.2 Create the Todo types module
  - Create `web/features/todo/types.ts` exporting `Todo` interface and `FilterValue` type per the data model
  - `Todo`: `id: string`, `text: string`, `completed: boolean`, `createdAt: number`
  - `FilterValue`: `"all" | "active" | "completed"`
  - Use named exports
  - _Requirements: REQ-1, REQ-2, REQ-3, REQ-5_
  - _Design: DES-1_
  - **Done when:** File exists, TypeScript reports no errors, both `Todo` and `FilterValue` are importable

- [ ] 1.3 Create the Zustand store with persist middleware
  - _Depends on 1.1 and 1.2_
  - Create `web/store/use-todo-store.ts`
  - Compose `subscribeWithSelector` (outer) wrapping `persist` (inner) wrapping the state factory
  - State shape: `{ todos: Todo[], filter: FilterValue }`; initial: `todos: []`, `filter: "all"`
  - `persist` options: `name: "todo-store"`, `storage: createJSONStorage(() => localStorage)`
  - Export decoupled actions (DES-2.1):
    - `addTodo(text: string)` — prepend a new `Todo` with `crypto.randomUUID()` and `Date.now()`; skip if `text.trim()` is empty
    - `toggleTodo(id: string)` — map todos, flip `completed` on match
    - `deleteTodo(id: string)` — filter out by id
    - `clearCompleted()` — filter out where `completed === true`
    - `setFilter(filter: FilterValue)` — set filter state
  - _Requirements: REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-6_
  - _Design: DES-2, DES-2.1, DES-2.2_
  - **Done when:** TypeScript reports no errors; store initialises in a browser context and `localStorage.getItem("todo-store")` returns a JSON string after adding a todo

**Relevant files**

- `web/package.json` — add `zustand` dependency
- `web/features/todo/types.ts` — create (new)
- `web/store/use-todo-store.ts` — create (new); import types from `@/features/todo/types`

**Verification**

1. `bun run --cwd web build` — TypeScript compilation passes with no errors in the new files

---

## Phase 2 — Shared UI Primitives

_Parallel: 2.1 and 2.2 are independent of each other. Both depend on Phase 1 completing types._

- [ ] 2.1 Create `checkbox.tsx` UI primitive
  - Create `web/components/ui/checkbox.tsx`
  - Use `@base-ui/react/checkbox` — exports `Checkbox.Root` and `Checkbox.Indicator`
  - Export a single `Checkbox` component accepting `checked`, `onCheckedChange`, `id`, `className`, and `disabled` props
  - Style: `size-4 rounded border border-input bg-background` base; checked state adds `bg-primary border-primary`; focus-visible ring using Tailwind
  - Indicator renders a checkmark SVG icon (inline, not from Hugeicons to avoid import complexity)
  - Use `cn()` from `@/components/lib/utils`
  - _Requirements: REQ-2_
  - _Design: DES-4_
  - **Done when:** Component renders a styled, accessible checkbox in isolation; TypeScript no errors

- [ ] 2.2 Create `input.tsx` UI primitive
  - Create `web/components/ui/input.tsx`
  - Export a single `Input` component wrapping a native `<input>` element
  - Accept all standard `React.InputHTMLAttributes<HTMLInputElement>` props
  - Style: `h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground disabled:opacity-50`
  - Use `cn()` from `@/components/lib/utils`
  - _Requirements: REQ-1_
  - _Design: DES-5_
  - **Done when:** Component renders a styled input in isolation; TypeScript no errors

**Relevant files**

- `web/components/ui/checkbox.tsx` — create (new)
- `web/components/ui/input.tsx` — create (new)
- `web/components/lib/utils.ts` — import `cn` from here (already exists)

**Verification**

1. `bun run --cwd web build` — no TypeScript errors from the new primitive files

---

## Phase 3 — Feature Components

_All tasks in this phase depend on Phase 1 and Phase 2 completing. 3.2 depends on 3.1. 3.3–3.6 are independent of each other except 3.6 which depends on all of 3.1–3.5._

- [ ] 3.1 Create `todo-item.tsx`
  - Create `web/features/todo/todo-item.tsx` as a named export `TodoItem`
  - Props: `todo: Todo`
  - Render: flex row with `gap-3 items-center`:
    - `<Checkbox>` (`id={todo.id}`) bound to `todo.completed`; `onCheckedChange` calls `toggleTodo(todo.id)`
    - `<label>` (`htmlFor={todo.id}`) showing `todo.text`; add `line-through text-muted-foreground` when `todo.completed`
    - `<Button variant="ghost" size="icon-sm">` at the right with a trash/delete icon from `@hugeicons/react`; `onClick` calls `deleteTodo(todo.id)`
  - `"use client"` directive — imports store actions directly (not via hook return)
  - _Requirements: REQ-2, REQ-3_
  - _Design: DES-3, DES-3.2_

  **Done when:** Component renders without TypeScript errors; clicking the checkbox calls `toggleTodo`; clicking delete calls `deleteTodo`

- [ ] 3.2 Create `todo-list.tsx`
  - _Depends on 3.1_
  - Create `web/features/todo/todo-list.tsx` as a named export `TodoList`
  - Read `todos` and `filter` from store using atomic selectors
  - Derive `filteredTodos` inline:
    - `"all"` → all todos
    - `"active"` → `completed === false`
    - `"completed"` → `completed === true`
  - If `filteredTodos` is empty, render a muted placeholder: `"No todos here."` centred
  - Map `filteredTodos` to `<TodoItem key={todo.id} todo={todo} />`
  - `"use client"` directive
  - _Requirements: REQ-2, REQ-3, REQ-5_
  - _Design: DES-3_

  **Done when:** Renders a list from store state; filter changes update the visible list

- [ ] 3.3 Create `todo-input.tsx`
  - Create `web/features/todo/todo-input.tsx` as a named export `TodoInput`
  - Local state (single `useState<string>`) for the controlled input value (ephemeral, justified exception to Zustand-default rule)
  - Submit handler: trims value, calls `addTodo(trimmedValue)`, clears input; no-ops on empty string
  - `<Input>` with `placeholder="What needs to be done?"` and `onKeyDown` for Enter (`e.key === "Enter"`)
  - `<Button variant="default">Add</Button>` that calls the same submit handler
  - Flex row layout: `flex gap-2`
  - `"use client"` directive
  - _Requirements: REQ-1_
  - _Design: DES-3, DES-3.1_

  **Done when:** Typing and pressing Enter or clicking Add calls `addTodo`; input resets to empty after submit

- [ ] 3.4 Create `todo-stats.tsx`
  - Create `web/features/todo/todo-stats.tsx` as a named export `TodoStats`
  - Read `todos` from store using atomic selector; derive:
    - `remainingCount = todos.filter(t => !t.completed).length`
    - `hasCompleted = todos.some(t => t.completed)`
  - Render: flex row `justify-between items-center`:
    - `<span className="text-sm text-muted-foreground">{remainingCount} item{remainingCount !== 1 ? 's' : ''} remaining</span>`
    - `<Button variant="ghost" size="sm">` with text "Clear completed" — calls `clearCompleted()`; only rendered when `hasCompleted === true`
  - `"use client"` directive
  - _Requirements: REQ-6_
  - _Design: DES-3, DES-3.4_

  **Done when:** "Clear completed" only appears when at least one completed todo exists; clicking it calls `clearCompleted`

- [ ] 3.5 Create `todo-filter.tsx`
  - Create `web/features/todo/todo-filter.tsx` as a named export `TodoFilter`
  - Read `filter` from store using atomic selector
  - Render three `<button>` elements labelled "All", "Active", "Completed"; `onClick` calls `setFilter(value)`
  - Active tab styling: `font-medium text-foreground border-b-2 border-primary pb-0.5`; inactive: `text-muted-foreground hover:text-foreground`
  - Wrap in a flex row with `gap-4`
  - `"use client"` directive
  - _Requirements: REQ-5_
  - _Design: DES-3, DES-3.3_

  **Done when:** Active filter tab is visually highlighted; selecting a tab calls `setFilter` and the change reflects in `TodoList`

- [ ] 3.6 Compose `todo-page.tsx`
  - _Depends on 3.1, 3.2, 3.3, 3.4, 3.5_
  - Create `web/features/todo/todo-page.tsx` as a named export `TodoPage`
  - `"use client"` directive
  - Structure:
    ```
    <div className="min-h-screen flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <Heading variant="h1">My Todos</Heading>
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <TodoInput />
            <TodoFilter />
            <TodoList />
            <TodoStats />
          </CardContent>
        </Card>
      </div>
    </div>
    ```
  - Imports: `Heading` from `@/components/ui/heading`, `Card`, `CardContent` from `@/components/ui/card`, and feature components from sibling files
  - _Requirements: REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-6, REQ-7_
  - _Design: DES-3, DES-7_

  **Done when:** Page renders all sub-components assembled correctly; no TypeScript errors

**Relevant files**

- `web/features/todo/types.ts` — import `Todo`, `FilterValue`
- `web/store/use-todo-store.ts` — import store hook + actions
- `web/components/ui/checkbox.tsx` — used in `todo-item.tsx`
- `web/components/ui/input.tsx` — used in `todo-input.tsx`
- `web/components/ui/button.tsx` — used in `todo-item.tsx`, `todo-input.tsx`, `todo-stats.tsx`
- `web/components/ui/heading.tsx` — used in `todo-page.tsx`
- `web/components/ui/card.tsx` — `Card`, `CardContent` in `todo-page.tsx`

**Verification**

1. `bun run --cwd web build` — no TypeScript errors across new feature files

---

## Phase 4 — Route Wiring

_Depends on Phase 3 (specifically 3.6)._

- [ ] 4.1 Create the `/todos` route module
  - Create `web/app/todos/page.tsx`
  - `default` export function `TodosPage` (RSC — no `"use client"`)
  - Body: import `TodoPage` from `@/features/todo/todo-page` and render `<TodoPage />`
  - No metadata needed for MVP
  - _Requirements: REQ-7_
  - _Design: DES-6_

  **Done when:** `web/app/todos/page.tsx` exists, renders `<TodoPage />`, no TypeScript errors

**Relevant files**

- `web/app/todos/page.tsx` — create (new); mirrors the pattern in `web/app/page.tsx`

**Verification**

1. `bun run --cwd web build` — full project builds cleanly

---

## Phase 5 — Final Verification

- [ ] 5.1 Run lint and format checks
  - Run `bun run --cwd web lint` — verify zero oxlint errors across all new files
  - Run `bun run --cwd web format` — verify no formatting issues
  - _Requirements: REQ-7_
  - _Design: all_

  **Done when:** Both commands exit with code 0

- [ ] 5.2 Manual end-to-end verification
  - Start `bun run --cwd web dev` and open `http://localhost:3000/todos`
  - Add three todos → all appear in the list
  - Check one todo as complete → it gets strikethrough; "x items remaining" decrements
  - Switch to "Active" filter → completed todo disappears from list
  - Switch to "Completed" filter → only completed todo shows
  - Click "Clear completed" → completed todo removed
  - Refresh the page → all todos still present (localStorage persisted)
  - Open DevTools → Application → Local Storage → confirm key `"todo-store"` exists with JSON data
  - _Requirements: REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-6_
  - _Design: DES-2.2_

  **Done when:** All manual steps pass without console errors

---

## Dependency Summary

**Critical path (sequential):**
```
1.1 (install zustand) ─┐
                        ├─→ 1.3 (store) ─→ 3.1 (item) ─→ 3.2 (list) ─┐
1.2 (types) ───────────┘                                                │
                                            3.3 (input) ───────────────┤
2.1 (checkbox) ─────────────────────────── (needed by 3.1)             ├─→ 3.6 (page) ─→ 4.1 (route) ─→ 5.x
2.2 (input) ──────────────────────────────(needed by 3.3)              │
                                            3.4 (stats) ───────────────┤
                                            3.5 (filter) ──────────────┘
```

**Parallelizable groups:**

| Group | Tasks |
|---|---|
| Can run together | 1.1 and 1.2 |
| Can run together after 1.1 + 1.2 complete | 2.1 and 2.2 |
| Can run together after 1.3 + 2.x complete | 3.3, 3.4, 3.5 |
| Sequential after 3.1 | 3.1 → 3.2 |
| Sequential after all of 3.x | 3.6 → 4.1 → 5.x |
