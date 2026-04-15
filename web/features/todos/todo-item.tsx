"use client";

import { cn } from "@/components/lib/utils";
import { Button } from "@/components/ui/button";
import type { Todo } from "@/features/todos/todo.types";
import { deleteTodo, toggleTodo } from "@/store/use-todo-store";

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem = ({ todo }: TodoItemProps) => {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
        className="size-4 cursor-pointer"
      />
      <span
        className={cn(
          "flex-1 text-sm",
          todo.completed && "line-through text-muted-foreground"
        )}
      >
        {todo.text}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => deleteTodo(todo.id)}
        aria-label="Delete todo"
      >
        ×
      </Button>
    </div>
  );
};
