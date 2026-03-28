import { useEffect } from "react";

import { useTodoStore } from "@/features/todo/todo-store";

export const TODOS_STORAGE_KEY = "todos-app-state";

export const useTodoPersistence = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(TODOS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          useTodoStore.setState({ todos: parsed });
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = useTodoStore.subscribe((state) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(state.todos));
        } catch {
          // ignore storage errors
        }
      }, 300);
    });

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, []);
};
