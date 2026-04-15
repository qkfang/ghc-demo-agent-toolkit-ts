import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

import type { Todo } from "@/features/todos/todo.types";

export interface TodoState {
  todos: Todo[];
}

export const useTodoStore = create<TodoState>()(
  subscribeWithSelector(
    persist(() => ({ todos: [] as Todo[] }), { name: "todo-storage" })
  )
);

export const addTodo = (text: string) => {
  useTodoStore.setState((state) => ({
    todos: [
      ...state.todos,
      {
        id: crypto.randomUUID(),
        text,
        completed: false,
        createdAt: Date.now(),
      },
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
