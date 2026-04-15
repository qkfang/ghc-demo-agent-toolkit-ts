"use client";

import { TodoItem } from "@/features/todos/todo-item";
import { useTodoStore } from "@/store/use-todo-store";

export const TodoList = () => {
  const todos = useTodoStore((state) => state.todos);

  if (todos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No todos yet. Add one above!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
};
