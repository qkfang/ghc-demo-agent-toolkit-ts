# Implementation Tasks: Todo App with Local Storage Persistence

Implements the todo page at `/todos` in three incremental phases: foundation (types, dependencies, store), UI slice (components), and route wiring. Each phase is independently verifiable. Tasks within each phase that share no file overlap can be executed in parallel.

---

## Requirement Index (from `plan.md`)

| ID | Requirement |
|---|---|
| REQ-1 | Route `/todos` renders the todo page |
| REQ-2 | Users can add a new todo via a text input |
| REQ-3 | Users can mark a todo complete / incomplete (toggle) |
| REQ-4 | Users can delete a todo |
| REQ-5 | All todo state persists in `localStorage` (survives refresh) |

## Design Token Index (defined here)

| ID | Design Decision |
|---|---|
| DES-1 | `Todo` interface in `web/features/todos/todo.types.ts` |
| DES-2 | Zustand store module `web/store/use-todo-store.ts` |
| DES-2.1 | Store state shape: `{ todos: Todo[] }` |
| DES-2.2 | `addTodo(text: string)` decoupled action |
| DES-2.3 | `toggleTodo(id: string)` decoupled action |
| DES-2.4 | `deleteTodo(id: string)` decoupled action |
| DES-2.5 | `persist` middleware with `name: "todo-storage"` localStorage key |
| DES-3 | `<TodoItem>` leaf component `web/features/todos/todo-item.tsx` |
| DES-4 | `<TodoList>` wrapper component `web/features/todos/todo-list.tsx` |
| DES-5 | `<TodoAddForm>` form component `web/features/todos/todo-add-form.tsx` |
| DES-6 | `<TodosPage>` feature entry component `web/features/todos/todos-page.tsx` |
| DES-7 | Thin route module `web/app/todos/page.tsx` |
| DES-8 | shadcn `input` primitive installed via CLI |
| DES-9 | `zustand` package installed as a runtime dependency |

---

## Phase 1 — Foundation

Establish types, install dependencies, and build the store. All of Phase 2 depends on this phase completing first.

- [x] **1.1 Install `zustand`**
  - Objective: Add `zustand` to the project so `persist` and `subscribeWithSelector` middleware are available.
  - Run `bun add zustand` from `web/` directory.
  - Verify `web/package.json` lists `zustand` under `dependencies`.
  - Done when: `import { create } from "zustand"` resolves without TypeScript errors.
  - _Requirements: REQ-5_
  - _Design: DES-9_

- [x] **1.2 Install shadcn `input` component**
  - Objective: Add the `<Input>` primitive needed by `<TodoAddForm>` — no existing `web/components/ui/input.tsx` exists.
  - Run `bunx shadcn@latest add input` from `web/` directory.
  - Verify `web/components/ui/input.tsx` is created.
  - Done when: `import { Input } from "@/components/ui/input"` resolves without TypeScript errors.
  - _Requirements: REQ-2_
  - _Design: DES-8_
  - _Parallel with: 1.1_

- [x] **1.3 Define `Todo` type**
  - Objective: Create the shared `Todo` interface consumed by the store and all components.
  - Create `web/features/todos/todo.types.ts` and export:
    - `Todo` interface with fields: `id: string`, `text: string`, `completed: boolean`, `createdAt: number`
  - Done when: Other modules can import `Todo` from `@/features/todos/todo.types` without errors.
  - _Requirements: REQ-2, REQ-3, REQ-4_
  - _Design: DES-1_
  - _Parallel with: 1.1, 1.2_

- [x] **1.4 Create the Zustand store with persistence**
  - Objective: Build the single source of truth for todo state, wired to `localStorage`.
  - Create `web/store/use-todo-store.ts`:
    - Export `TodoState` interface: `{ todos: Todo[] }`
    - Export `useTodoStore` using `create<TodoState>()` wrapped in `subscribeWithSelector(persist(..., { name: "todo-storage" }))`
    - Initial state: `{ todos: [] }`
    - Export decoupled action `addTodo(text: string)` — appends a new `Todo` with `crypto.randomUUID()`, `Date.now()`, `completed: false`
    - Export decoupled action `toggleTodo(id: string)` — maps over todos, flips `completed` on matching id
    - Export decoupled action `deleteTodo(id: string)` — filters out todo with matching id
    - All actions use functional `setState` updates
  - Import `Todo` from `@/features/todos/todo.types`
  - Done when: TypeScript compiles the file cleanly and all three actions are exported.
  - _Depends on: 1.1, 1.3_
  - _Requirements: REQ-2, REQ-3, REQ-4, REQ-5_
  - _Design: DES-2, DES-2.1, DES-2.2, DES-2.3, DES-2.4, DES-2.5_

---

## Phase 2 — UI Components

Build the feature UI bottom-up (leaf → parent). Each component depends on DES-2 (store) and DES-1 (types) from Phase 1. `TodoItem` and `TodoAddForm` can be built in parallel; `TodoList` depends on `TodoItem`; `TodosPage` depends on all three.

- [x] **2.1 Build `<TodoItem>`**
  - Objective: Render a single todo row with a completion checkbox, label, and delete button.
  - Create `web/features/todos/todo-item.tsx`:
    - `"use client"` directive at top
    - Props: `todo: Todo` (import type from `@/features/todos/todo.types`)
    - Render a `<div>` row containing:
      - A native `<input type="checkbox">` bound to `todo.completed`; `onChange` calls `toggleTodo(todo.id)` (import from `@/store/use-todo-store`)
      - A `<span>` or `<label>` displaying `todo.text`; apply `line-through text-muted-foreground` Tailwind classes when `todo.completed` is true using `cn()`
      - A `<Button variant="ghost" size="sm">` (import from `@/components/ui/button`) with a delete icon or "×" text; `onClick` calls `deleteTodo(todo.id)`
    - Use `cn()` from `@/components/lib/utils` for conditional classNames
  - Done when: Component renders without TypeScript errors and all three interactive elements are present.
  - _Depends on: 1.3, 1.4_
  - _Requirements: REQ-3, REQ-4_
  - _Design: DES-3_

- [x] **2.2 Build `<TodoAddForm>`**
  - Objective: Render a text input and submit button; on submission call `addTodo` and clear the field.
  - Create `web/features/todos/todo-add-form.tsx`:
    - `"use client"` directive at top
    - Use React `useState` for the local `inputValue: string` (acceptable per Zustand skill for one-off input state)
    - Render a `<form>` with `onSubmit`:
      - Guard: trim input, skip if empty
      - Call `addTodo(inputValue.trim())` (import from `@/store/use-todo-store`)
      - Reset `inputValue` to `""`
      - `e.preventDefault()`
    - Inside form: `<Input>` (import from `@/components/ui/input`) bound to `inputValue` with `onChange`; `placeholder="Add a new todo…"`
    - A `<Button type="submit">` with label "Add"
    - Row layout via Tailwind flex classes
  - Done when: Submitting a non-empty value calls `addTodo` and clears the input; empty submission is a no-op.
  - _Depends on: 1.2, 1.4_
  - _Parallel with: 2.1_
  - _Requirements: REQ-2_
  - _Design: DES-5_

- [x] **2.3 Build `<TodoList>`**
  - Objective: Display all todos from the store; show empty state when none exist.
  - Create `web/features/todos/todo-list.tsx`:
    - `"use client"` directive at top
    - Select `todos` from store with atomic selector: `const todos = useTodoStore((state) => state.todos)`
    - If `todos.length === 0` render a centered paragraph with text "No todos yet. Add one above!"
    - Otherwise map `todos` to `<TodoItem key={todo.id} todo={todo} />` (import from `@/features/todos/todo-item`)
    - Wrap list in a `<ul>` or `<div>` with appropriate spacing (`space-y-2` or similar)
  - Done when: Component renders the empty state and a mapped list of `<TodoItem>` elements.
  - _Depends on: 2.1_
  - _Requirements: REQ-2, REQ-3, REQ-4_
  - _Design: DES-4_

- [x] **2.4 Build `<TodosPage>`**
  - Objective: Compose the page layout — heading, add form, todo list.
  - Create `web/features/todos/todos-page.tsx`:
    - `"use client"` directive at top
    - Render a centered container (`mx-auto max-w-2xl`) matching the style of `web/features/home/home-page.tsx`
    - Include a `<Heading variant="h1">` with text "Todos" (import from `@/components/ui/heading`)
    - Render `<TodoAddForm />` below the heading
    - Render `<TodoList />` below the form
  - Done when: Component compiles and composes all three child components without prop errors.
  - _Depends on: 2.2, 2.3_
  - _Requirements: REQ-1, REQ-2, REQ-3, REQ-4_
  - _Design: DES-6_

---

## Phase 3 — Route Wiring

Connect the feature to the Next.js router.

- [x] **3.1 Create the `/todos` route module**
  - Objective: Add the route so `/todos` resolves to the todos feature.
  - Create `web/app/todos/page.tsx`:
    - Default export `TodosPage` function that renders `<TodosPage />` (import from `@/features/todos/todos-page`)
    - No `"use client"` directive — this is a thin RSC route shell; the feature component carries the directive
    - No metadata needed for this task
  - Done when: Next.js dev server routes `http://localhost:3000/todos` to the todos page without 404.
  - _Depends on: 2.4_
  - _Requirements: REQ-1_
  - _Design: DES-7_

---

## Relevant Files

- `web/features/todos/todo.types.ts` — create; defines `Todo` interface (DES-1)
- `web/store/use-todo-store.ts` — create; store + persist + actions (DES-2)
- `web/features/todos/todo-item.tsx` — create; leaf row component (DES-3)
- `web/features/todos/todo-list.tsx` — create; list wrapper (DES-4)
- `web/features/todos/todo-add-form.tsx` — create; add form (DES-5)
- `web/features/todos/todos-page.tsx` — create; page entry (DES-6)
- `web/app/todos/page.tsx` — create; route module (DES-7)
- `web/components/ui/input.tsx` — installed via shadcn CLI (DES-8)
- `web/package.json` — updated by `bun add zustand` (DES-9)

---

## Verification

1. `bun add zustand` completes with exit code 0 from `web/`
2. `bunx shadcn@latest add input` completes and `web/components/ui/input.tsx` exists
3. `cd web && bun run lint` — no lint errors
4. `cd web && bun run format` — no format errors
5. `cd web && bun run build` — TypeScript compilation passes with no errors
6. Start dev server (`bun dev` from `web/`) and navigate to `http://localhost:3000/todos`:
   - Page renders with heading "Todos" and an input field
   - Add a todo → appears in the list
   - Check the checkbox → text gains strikethrough styling
   - Click delete → todo is removed
   - Refresh the page → todos are restored from `localStorage`
7. In DevTools → Application → Local Storage → `localhost:3000` confirm key `todo-storage` contains serialised todos JSON

---

## Dependency Summary

**Critical path:**
1.1 → 1.4 → 2.1 → 2.3 → 2.4 → 3.1

**Parallelisable groups:**
- 1.1, 1.2, 1.3 can all start simultaneously
- 2.1 and 2.2 can start simultaneously once Phase 1 is complete

**Full DAG:**
```
1.1 ─┬─→ 1.4 ─→ 2.1 ─→ 2.3 ─┐
1.3 ─┘                        ├─→ 2.4 ─→ 3.1
1.2 ──────────→ 2.2 ──────────┘
```
