"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { clearCompleted, useTodoStore } from "@/features/todo/todo-store";
import { TodoItem } from "@/features/todo/components/todo-item";

type Filter = "all" | "active" | "completed";

export const TodoList = () => {
  const todos = useTodoStore((state) => state.todos);
  const [filter, setFilter] = useState<Filter>("all");

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const hasCompleted = todos.some((t) => t.completed);

  const filterButtons: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1">
        {filterButtons.map(({ label, value }) => (
          <Button
            key={value}
            size="sm"
            variant={filter === value ? "default" : "ghost"}
            onClick={() => setFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {filteredTodos.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-sm">
          {filter === "completed"
            ? "No completed todos."
            : filter === "active"
              ? "No active todos."
              : "No todos yet. Add one above!"}
        </p>
      ) : (
        <ul className="divide-y">
          {filteredTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between pt-2 text-sm">
        <span className="text-muted-foreground">
          {activeCount} {activeCount === 1 ? "item" : "items"} left
        </span>
        {hasCompleted && (
          <Button size="sm" variant="ghost" onClick={clearCompleted}>
            Clear completed
          </Button>
        )}
      </div>
    </div>
  );
};
