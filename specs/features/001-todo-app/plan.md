# Plan: Todo App with LocalStorage Persistence

**Feature ID:** 001  
**Feature Name:** todo-app  
**Status:** Draft  

---

## Overview

Build a client-side todo application that persists all state to `localStorage` via Zustand's `persist` middleware. Users can add, complete, and delete todos. State survives page refreshes.

---

## Goals

- Add, toggle, and delete todos
- Persist todos to `localStorage` (survives refresh/reopen)
- Clean, minimal UI using existing design system
- Follow all repo conventions (feature folder, decoupled Zustand actions, thin route module)

## Out of scope

- Server-side persistence / API
- Authentication
- Drag-and-drop reordering
- Due dates / priorities

---

## Data Model

```ts
// web/features/todo/types.ts

export interface Todo {
  id: string;         // crypto.randomUUID()
  text: string;
  completed: boolean;
  createdAt: number;  // Date.now()
}

export type FilterValue = "all" | "active" | "completed";
```

---

## State (Zustand Store)

**File:** `web/store/use-todo-store.ts`

```ts
import { create } from "zustand";
import { subscribeWithSelector, persist, createJSONStorage } from "zustand/middleware";
import { Todo, FilterValue } from "@/features/todo/types";

export interface TodoState {
  todos: Todo[];
  filter: FilterValue;
}

export const useTodoStore = create<TodoState>()(
  subscribeWithSelector(
    persist(
      () => ({
        todos: [] as Todo[],
        filter: "all" as FilterValue,
      }),
      {
        name: "todo-store",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

// Decoupled actions
export const addTodo = (text: string) => { ... };
export const toggleTodo = (id: string) => { ... };
export const deleteTodo = (id: string) => { ... };
export const clearCompleted = () => { ... };
export const setFilter = (filter: FilterValue) => { ... };
```

### Actions summary

| Action | Description |
|---|---|
| `addTodo(text)` | Prepend new `Todo` with `crypto.randomUUID()` |
| `toggleTodo(id)` | Flip `completed` on matching todo |
| `deleteTodo(id)` | Filter out todo by `id` |
| `clearCompleted()` | Remove all todos where `completed === true` |
| `setFilter(filter)` | Update the active filter tab |

---

## Dependency Change

Zustand is not currently installed. Add it:

```bash
bun add zustand
```

No other new dependencies needed. IDs use the built-in `crypto.randomUUID()`.

---

## File Plan

### New files

| File | Purpose |
|---|---|
| `web/store/use-todo-store.ts` | Zustand store + decoupled actions with `persist` middleware |
| `web/features/todo/types.ts` | `Todo` interface and `FilterValue` type |
| `web/features/todo/todo-page.tsx` | Feature entry component (`"use client"`) |
| `web/features/todo/todo-input.tsx` | Controlled text input + "Add" button |
| `web/features/todo/todo-list.tsx` | Filtered list; renders `TodoItem` per todo |
| `web/features/todo/todo-item.tsx` | Single row: checkbox, label, delete button |
| `web/features/todo/todo-stats.tsx` | "N remaining" count + "Clear completed" button |
| `web/features/todo/todo-filter.tsx` | All / Active / Completed filter tabs |
| `web/app/todos/page.tsx` | Thin route module — renders `<TodoPage />` |

### Modified files

| File | Change |
|---|---|
| `web/package.json` | Add `zustand` dependency |

---

## Component Tree

```
app/todos/page.tsx                  ← thin route (RSC)
└── features/todo/todo-page.tsx     ← "use client", feature entry
    ├── Heading "My Todos"
    ├── todo-input.tsx              ← text input + Add button
    ├── todo-stats.tsx              ← "N remaining" + Clear completed
    ├── todo-filter.tsx             ← All | Active | Completed tabs
    └── todo-list.tsx               ← maps filtered todos
        └── todo-item.tsx[]         ← checkbox + text + delete icon
```

---

## UI Notes

- Use existing `Button` from `@/components/ui/button` (ghost + icon-sm variant for delete)
- Use existing `Heading` from `@/components/ui/heading`
- Checkbox: build a minimal accessible checkbox using a `<input type="checkbox">` or Base UI Checkbox — **no new shadcn component install needed** for MVP
- Strikethrough + muted text on completed items via Tailwind (`line-through text-muted-foreground`)
- Layout: centered card, max-w-lg, matching the existing home page style
- Filter tabs: styled `<button>` elements with an active underline/highlight — no extra component needed

---

## Routing

New route: `/todos`

```
web/app/todos/page.tsx
```

No changes to existing routes. No navigation link added (out of scope for this feature).

---

## localStorage Key

- Key: `"todo-store"` (set via `persist` `name` option)
- Storage: `localStorage` via `createJSONStorage`
- Hydration: Zustand `persist` handles hydration automatically on mount

---

## Implementation Order

1. `bun add zustand`
2. `web/features/todo/types.ts` — data model
3. `web/store/use-todo-store.ts` — store + all actions
4. `web/features/todo/todo-item.tsx`
5. `web/features/todo/todo-list.tsx`
6. `web/features/todo/todo-input.tsx`
7. `web/features/todo/todo-stats.tsx`
8. `web/features/todo/todo-filter.tsx`
9. `web/features/todo/todo-page.tsx` — assemble above
10. `web/app/todos/page.tsx` — thin route

---

## Verification

```bash
bun run lint      # no oxlint errors
bun run format    # no formatting issues
```

Manual: navigate to `/todos`, add todos, refresh — todos persist.
