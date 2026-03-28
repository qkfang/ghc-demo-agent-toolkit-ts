import { create } from "zustand";

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface TodoState {
  todos: TodoItem[];
}

export const useTodoStore = create<TodoState>(() => ({ todos: [] }));

export const addTodo = (text: string) => {
  const newTodo: TodoItem = {
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: Date.now(),
  };
  useTodoStore.setState((state) => ({ todos: [newTodo, ...state.todos] }));
};

export const toggleTodo = (id: string) => {
  useTodoStore.setState((state) => ({
    todos: state.todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    ),
  }));
};

export const deleteTodo = (id: string) => {
  useTodoStore.setState((state) => ({
    todos: state.todos.filter((todo) => todo.id !== id),
  }));
};

export const editTodo = (id: string, text: string) => {
  useTodoStore.setState((state) => ({
    todos: state.todos.map((todo) => (todo.id === id ? { ...todo, text } : todo)),
  }));
};

export const clearCompleted = () => {
  useTodoStore.setState((state) => ({
    todos: state.todos.filter((todo) => !todo.completed),
  }));
};
