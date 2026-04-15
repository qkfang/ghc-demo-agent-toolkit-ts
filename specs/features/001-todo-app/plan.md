# 001 — Todo App with Local Storage Persistence

## Summary

Build a fully functional todo app at `/todos` that persists state to `localStorage` via Zustand's `persist` middleware. Users can add, toggle complete, and delete todos. State survives page refreshes.

---

## Goals

- [ ] Route `/todos` renders the todo page
- [ ] Users can add a new todo via a text input
- [ ] Users can mark a todo complete / incomplete (toggle)
- [ ] Users can delete a todo
- [ ] All todo state persists in `localStorage` (survives refresh)

## Non-Goals

- No backend / API — client-side only
- No authentication
- No due dates, priorities, or tags (can be added later)

---

## File Plan

### 1. Route

| File | Purpose |
|---|---|
| `web/app/todos/page.tsx` | Thin route module — renders `<TodosPage />` |

### 2. Feature (`web/features/todos/`)

| File | Purpose |
|---|---|
| `todos-page.tsx` | Feature entry component (layout, heading) |
| `todo-add-form.tsx` | Controlled input + submit button; calls `addTodo` action |
| `todo-list.tsx` | Maps over todos from store; renders `<TodoItem>` per todo |
| `todo-item.tsx` | Single row: checkbox (toggle), label, delete button |
| `todo.types.ts` | Shared `Todo` and `TodoFilter` types |

### 3. Store (`web/store/`)

| File | Purpose |
|---|---|
| `use-todo-store.ts` | Zustand store with `subscribeWithSelector` + `persist` middleware; decoupled actions |

---

## Data Model

```ts
// web/features/todos/todo.types.ts
export interface Todo {
  id: string;       // crypto.randomUUID()
  text: string;
  completed: boolean;
  createdAt: number; // Date.now()
}
```

---

## Store Design

```ts
// web/store/use-todo-store.ts
import { create } from "zustand";
import { subscribeWithSelector, persist } from "zustand/middleware";
import type { Todo } from "@/features/todos/todo.types";

export interface TodoState {
  todos: Todo[];
}

export const useTodoStore = create<TodoState>()(
  subscribeWithSelector(
    persist(
      () => ({
        todos: [] as Todo[],
      }),
      { name: "todo-storage" } // localStorage key
    )
  )
);

// Decoupled actions
export const addTodo = (text: string) => {
  useTodoStore.setState((state) => ({
    todos: [
      ...state.todos,
      { id: crypto.randomUUID(), text, completed: false, createdAt: Date.now() },
    ],
  }));
};

export const toggleTodo = (id: string) => {
  useTodoStore.setState((state) => ({
    todos: state.todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ),
  }));
};

export const deleteTodo = (id: string) => {
  useTodoStore.setState((state) => ({
    todos: state.todos.filter((t) => t.id !== id),
  }));
};
```

---

## Component Responsibilities

### `TodosPage` (`todos-page.tsx`)
- `"use client"` — imports store/actions
- Renders page heading and composes `<TodoAddForm>` + `<TodoList>`

### `TodoAddForm` (`todo-add-form.tsx`)
- `"use client"`
- Local controlled `<input>` for the new todo text (one-off `useState` for the input value is acceptable per Zustand skill)
- On submit: calls `addTodo(text)`, clears input
- Renders a text `<Input>` and a `<Button>` (existing UI primitives)

### `TodoList` (`todo-list.tsx`)
- `"use client"`
- Selects `todos` from store with atomic selector
- Maps over todos → `<TodoItem>`
- Shows empty state message when list is empty

### `TodoItem` (`todo-item.tsx`)
- `"use client"`
- Props: `todo: Todo`
- Checkbox toggles `completed` via `toggleTodo(todo.id)`
- Label displays `todo.text` with strikethrough when completed
- Delete `<Button variant="ghost">` calls `deleteTodo(todo.id)`

---

## Dependency Direction

```
web/app/todos/page.tsx
  └─ web/features/todos/todos-page.tsx
       ├─ web/features/todos/todo-add-form.tsx  → web/store/use-todo-store.ts
       └─ web/features/todos/todo-list.tsx      → web/store/use-todo-store.ts
            └─ web/features/todos/todo-item.tsx → web/store/use-todo-store.ts
```

Components import from `@/store/use-todo-store` and `@/components/ui/*`. No cross-feature imports.

---

## Implementation Tasks (ordered)

1. `web/features/todos/todo.types.ts` — `Todo` interface
2. `web/store/use-todo-store.ts` — store + persist + decoupled actions
3. `web/features/todos/todo-item.tsx` — leaf component
4. `web/features/todos/todo-list.tsx` — list wrapper
5. `web/features/todos/todo-add-form.tsx` — add form
6. `web/features/todos/todos-page.tsx` — page composition
7. `web/app/todos/page.tsx` — route module

---

## Packages

No new dependencies needed. `zustand` (already in the project) ships `persist` and `subscribeWithSelector` middleware.

---

## Acceptance Criteria

- Navigating to `http://localhost:3000/todos` shows the todo page
- Adding a todo appends it to the list
- Clicking the checkbox toggles completed styling (strikethrough)
- Clicking delete removes the todo
- Refreshing the page restores all todos from `localStorage`
- `localStorage` key `"todo-storage"` contains the serialised state
