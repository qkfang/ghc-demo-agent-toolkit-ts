# Implementation Tasks: Todo App with LocalStorage

Breaking down the plan into small, independently executable tasks with clear completion criteria.

---

## TASK-001: Add Zustand Dependency

**Traceability**: DES-001, DES-002  
**Files**: `web/package.json`

**Steps**:
1. Add `"zustand": "^5.0.2"` to dependencies section in `web/package.json`

**Done When**:
- ✓ `zustand` appears in `web/package.json` dependencies (not devDependencies)
- ✓ Run `bun install` from repo root — completes without errors
- ✓ Run `bun run build` — completes without errors

---

## TASK-002: Install shadcn/ui Input Component

**Traceability**: REQ-001, REQ-003, DES-006  
**Files**: `web/components/ui/input.tsx` (new)

**Steps**:
1. From `web/` directory, run: `bunx shadcn@latest add input`
2. Accept defaults if prompted

**Done When**:
- ✓ File `web/components/ui/input.tsx` exists
- ✓ Input component exports properly typed React component
- ✓ Can import via `@/components/ui/input` without errors

---

## TASK-003: Create Todo Store with Decoupled Actions

**Traceability**: REQ-001, REQ-002, REQ-003, REQ-004, REQ-007, DES-001, DES-002  
**Files**: `web/features/todo/todo-store.ts` (new)

**Steps**:
1. Create directory `web/features/todo/`
2. Create `todo-store.ts` with:
   - `TodoItem` interface: `{ id: string; text: string; completed: boolean; createdAt: number }`
   - `TodoState` interface: `{ todos: TodoItem[] }`
   - Store created with `create<TodoState>(() => ({ todos: [] }))`
   - Export store as `useTodoStore`
3. Export decoupled actions:
   - `addTodo(text: string)` — Generate UUID id, create todo with completed=false, prepend to array
   - `toggleTodo(id: string)` — Find by id, flip completed boolean
   - `deleteTodo(id: string)` — Filter out by id
   - `editTodo(id: string, text: string)` — Find by id, update text
   - `clearCompleted()` — Filter out all completed todos
4. Use `store.setState(...)` pattern as per zustand skill

**Done When**:
- ✓ File exists at `web/features/todo/todo-store.ts`
- ✓ All TypeScript interfaces defined with proper typing
- ✓ Store export: `export const useTodoStore = create<TodoState>(...)`
- ✓ All 5 action functions exported as named exports
- ✓ Actions use `useTodoStore.setState((state) => ...)` pattern
- ✓ No TypeScript errors when importing store in a test file
- ✓ Actions are pure functions (no side effects except setState)

---

## TASK-004: Create LocalStorage Persistence Hook

**Traceability**: REQ-005, REQ-010, DES-003, DES-004, DES-009  
**Files**: `web/features/todo/use-todo-persistence.ts` (new)

**Steps**:
1. Create `use-todo-persistence.ts` with:
   - Export constant: `export const TODOS_STORAGE_KEY = 'todos-app-state'`
   - Export hook: `export const useTodoPersistence = () => { ... }`
2. In hook implementation:
   - Check `typeof window !== 'undefined'` before accessing localStorage
   - Use `useEffect` with empty deps to load on mount:
     - Try to parse localStorage JSON
     - Call `useTodoStore.setState({ todos: parsed })` if valid
     - Catch JSON errors gracefully
   - Use `useEffect` with store subscription to save:
     - Subscribe to store changes: `useTodoStore.subscribe((state) => ...)`
     - Debounce writes (300ms) to localStorage as JSON
     - Return cleanup function to unsubscribe

**Done When**:
- ✓ File exists at `web/features/todo/use-todo-persistence.ts`
- ✓ `TODOS_STORAGE_KEY` constant exported
- ✓ `useTodoPersistence()` hook exported
- ✓ Hook loads from localStorage only after component mount (not during SSR)
- ✓ Hook writes to localStorage on state changes with debounce
- ✓ No hydration warnings in console when using the hook
- ✓ No TypeScript errors

---

## TASK-005: Create AddTodoForm Component

**Traceability**: REQ-001, DES-006, DES-007  
**Files**: `web/features/todo/components/add-todo-form.tsx` (new)

**Steps**:
1. Create directory `web/features/todo/components/`
2. Create client component file with `"use client"` directive
3. Import Input from `@/components/ui/input`, Button from `@/components/ui/button`
4. Import `addTodo` action from `@/features/todo/todo-store`
5. Local state: `const [text, setText] = useState("")`
6. Form layout: Input + Button in flex container
7. Handle submit:
   - Prevent default form submission
   - Trim text, skip if empty
   - Call `addTodo(text.trim())`
   - Reset input to empty string
8. Support Enter key submit and button click

**Done When**:
- ✓ File exists at `web/features/todo/components/add-todo-form.tsx`
- ✓ Component is a client component (`"use client"` at top)
- ✓ Exports named export: `export const AddTodoForm = () => { ... }`
- ✓ Uses Input and Button UI primitives
- ✓ Calls `addTodo()` action when form submitted
- ✓ Input resets to empty after adding todo
- ✓ Empty/whitespace-only input does not create todo
- ✓ No TypeScript errors

---

## TASK-006: Create TodoItem Component

**Traceability**: REQ-002, REQ-003, REQ-004, DES-006, DES-007, DES-008  
**Files**: `web/features/todo/components/todo-item.tsx` (new)

**Steps**:
1. Create client component with `"use client"` directive
2. Import Input, Button from `@/components/ui/*`
3. Import `toggleTodo`, `deleteTodo`, `editTodo` from `@/features/todo/todo-store`
4. Props interface: `{ todo: TodoItem }`
5. Local state: `isEditing` boolean, `editText` string
6. Display mode rendering:
   - Checkbox: checked={todo.completed}, onChange calls `toggleTodo(todo.id)`
   - Text: click or double-click triggers edit mode, strikethrough if completed
   - Delete Button: onClick calls `deleteTodo(todo.id)`
7. Edit mode rendering:
   - Input with editText value
   - Save button: calls `editTodo(todo.id, editText)`, exits edit mode
   - Cancel button or Escape key: exits edit mode without saving
8. Add ARIA labels for accessibility

**Done When**:
- ✓ File exists at `web/features/todo/components/todo-item.tsx`
- ✓ Component exported as `export const TodoItem`
- ✓ TypeScript props interface defined and used
- ✓ Checkbox toggles completion when clicked
- ✓ Double-click on text enters edit mode
- ✓ Edit mode shows Input with save/cancel controls
- ✓ Delete button removes todo from list
- ✓ Completed todos show strikethrough styling
- ✓ No TypeScript errors

---

## TASK-007: Create TodoList Component

**Traceability**: REQ-006, REQ-007, REQ-008, DES-007  
**Files**: `web/features/todo/components/todo-list.tsx` (new)

**Steps**:
1. Create client component with `"use client"` directive
2. Import TodoItem from same directory, Button from `@/components/ui/button`
3. Import `useTodoStore`, `clearCompleted` from `@/features/todo/todo-store`
4. Subscribe to todos: `const todos = useTodoStore((state) => state.todos)` (atomic selector)
5. Local state: `const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')`
6. Filter logic: compute `filteredTodos` based on filter state
7. UI sections:
   - Filter tabs: Three buttons (All/Active/Completed) with active state styling
   - Todo list: Map filteredTodos to TodoItem components
   - Empty state: Show message when filteredTodos.length === 0
   - Footer: "{N} items left" (count active todos) + "Clear completed" button (only if completed exist)
8. Button actions: setFilter for tabs, clearCompleted() for clear button

**Done When**:
- ✓ File exists at `web/features/todo/components/todo-list.tsx`
- ✓ Component exported as `export const TodoList`
- ✓ Subscribes to todos from store with atomic selector
- ✓ Three filter tabs render and update filter state
- ✓ Todos filtered correctly based on selected filter
- ✓ Shows empty state message when no todos match filter
- ✓ Active items counter shows correct count
- ✓ "Clear completed" button only appears when completed todos exist
- ✓ Clicking "Clear completed" removes all completed todos
- ✓ No TypeScript errors

---

## TASK-008: Create TodoPage Entry Component

**Traceability**: REQ-009, DES-005, DES-006, DES-010  
**Files**: `web/features/todo/todo-page.tsx` (new)

**Steps**:
1. Create client component with `"use client"` directive
2. Import Heading from `@/components/ui/heading`
3. Import Card, CardHeader, CardTitle, CardContent from `@/components/ui/card`
4. Import AddTodoForm, TodoList from `@/features/todo/components/*`
5. Import and call `useTodoPersistence()` hook at component top level
6. Layout structure:
   - Container div: `mx-auto max-w-2xl py-8 px-4`
   - Heading with "Todo App" title
   - Card wrapper containing:
     - CardHeader with CardTitle
     - CardContent with AddTodoForm
     - CardContent with TodoList
7. Mobile-first Tailwind classes (test at 375px width)

**Done When**:
- ✓ File exists at `web/features/todo/todo-page.tsx`
- ✓ Component exported as `export const TodoPage`
- ✓ Calls `useTodoPersistence()` to enable localStorage sync
- ✓ Renders Heading, Card with proper layout
- ✓ Composes AddTodoForm and TodoList
- ✓ Mobile-responsive (works at 375px viewport width)
- ✓ Proper spacing and max-width constraints
- ✓ No TypeScript errors

---

## TASK-009: Create Todo Route

**Traceability**: DES-005  
**Files**: `web/app/todo/page.tsx` (new)

**Steps**:
1. Create directory `web/app/todo/`
2. Create `page.tsx` file
3. Import TodoPage: `import { TodoPage } from "@/features/todo/todo-page"`
4. Export metadata: `export const metadata = { title: "Todo App" }`
5. Default export wrapper function:
   ```tsx
   export default function Todo() {
     return <TodoPage />;
   }
   ```

**Done When**:
- ✓ File exists at `web/app/todo/page.tsx`
- ✓ Default export function named `Todo`
- ✓ Imports TodoPage from features
- ✓ Metadata export with title defined
- ✓ Route accessible at `/todo` when dev server runs
- ✓ No TypeScript errors

---

## TASK-010: Add Navigation Link

**Traceability**: Navigation UX, REQ-009  
**Files**: `web/features/home/home-page.tsx` (modified)

**Steps**:
1. Add import: `import Link from "next/link"`
2. Add import: `import { Button } from "@/components/ui/button"`
3. After the existing description paragraph, add a Button wrapped in Link:
   ```tsx
   <Link href="/todo">
     <Button>Try Todo App</Button>
   </Link>
   ```
4. Maintain existing responsive layout and spacing

**Done When**:
- ✓ Link component imported from `next/link`
- ✓ Button component imported and used
- ✓ Link points to `/todo` route
- ✓ Button renders on home page below description
- ✓ Clicking button navigates to `/todo` page
- ✓ Layout remains responsive and matches existing design
- ✓ No TypeScript errors

---

## Task Dependencies Graph

```
TASK-001 (Add Zustand) ─────┐
                             ├─→ TASK-003 (Todo Store) ─→ TASK-004 (Persistence Hook) ─┐
TASK-002 (Install Input) ────┤                                                           │
                             └─→ TASK-005 (AddTodoForm) ────────────────────────────────┤
                                 TASK-006 (TodoItem)     ────────────────────────────────┼─→ TASK-008 (TodoPage) ─→ TASK-009 (Route) ─→ TASK-010 (Nav Link)
                                 TASK-007 (TodoList)     ────────────────────────────────┘
```

**Parallelization Opportunities**:
- Tasks 1-2 can run in parallel (independent)
- Tasks 5-7 can run in parallel (all depend on Task 3 but independent of each other)

---

## Execution Order (Recommended)

1. **Batch 1**: TASK-001, TASK-002 (parallel — dependencies)
2. **Batch 2**: TASK-003 (requires zustand)
3. **Batch 3**: TASK-004, TASK-005, TASK-006, TASK-007 (parallel — all need store, independent of each other)
4. **Batch 4**: TASK-008 (requires all components)
5. **Batch 5**: TASK-009 (requires TodoPage)
6. **Batch 6**: TASK-010 (requires route)

---

## End-to-End Verification Checklist

After completing all tasks, verify the entire feature works:

### Build & Quality Checks
- [ ] `bun install` completes successfully
- [ ] `bun run build` completes with no errors
- [ ] `bun run lint` shows no errors
- [ ] `bun run format` completes successfully

### Functional Testing (at http://localhost:3000/todo)
- [ ] Page loads without errors
- [ ] Can add new todo by typing text and pressing Enter
- [ ] Can add new todo by typing text and clicking Add button
- [ ] Empty/whitespace input does not create todo
- [ ] New todos appear at top of list
- [ ] Can check checkbox to mark todo complete (shows strikethrough)
- [ ] Can uncheck checkbox to mark todo active (removes strikethrough)
- [ ] Can double-click todo text to enter edit mode
- [ ] In edit mode, can modify text and save
- [ ] In edit mode, can cancel without saving
- [ ] Can delete individual todo via delete button
- [ ] Filter tabs work: All shows all, Active shows only incomplete, Completed shows only complete
- [ ] "N items left" counter shows correct count of active todos
- [ ] "Clear completed" button only appears when completed todos exist
- [ ] Clicking "Clear completed" removes all completed todos
- [ ] Refresh page — todos persist from localStorage
- [ ] Open new tab to same URL — todos load from localStorage

### Browser Console Checks
- [ ] No hydration mismatch errors
- [ ] No React warnings
- [ ] No TypeScript errors in console
- [ ] localStorage shows `todos-app-state` key with JSON data

### Responsive/Accessibility Testing
- [ ] Resize browser to 375px width — layout works on mobile
- [ ] Tab key navigates through interactive elements
- [ ] Enter/Space keys activate buttons and checkboxes
- [ ] Escape key cancels edit mode
- [ ] Screen reader can read todo items and buttons (basic ARIA)

### Navigation Testing
- [ ] Home page shows "Try Todo App" button (or similar link)
- [ ] Clicking link navigates to `/todo` route
- [ ] Browser back button returns to home page

---

## Success Criteria Summary

**Feature is complete when**:
1. All 10 tasks show ✓ for all "Done When" criteria
2. All end-to-end verification checks pass
3. No build, lint, or format errors
4. Todos persist across browser sessions via localStorage
5. All CRUD operations work correctly
6. Responsive design works on mobile and desktop
7. No hydration errors or console warnings
