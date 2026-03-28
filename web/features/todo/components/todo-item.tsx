"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type TodoItem as TodoItemType,
  deleteTodo,
  editTodo,
  toggleTodo,
} from "@/features/todo/todo-store";

interface TodoItemProps {
  todo: TodoItemType;
}

export const TodoItem = ({ todo }: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed) {
      editTodo(todo.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (isEditing) {
    return (
      <li className="flex items-center gap-2 py-2">
        <Input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1"
          aria-label="Edit todo text"
        />
        <Button size="sm" onClick={handleSave}>
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2 py-2">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
        className="h-4 w-4 cursor-pointer rounded border-gray-300"
        aria-label={`Mark "${todo.text}" as ${todo.completed ? "incomplete" : "complete"}`}
      />
      <span
        onDoubleClick={() => {
          setEditText(todo.text);
          setIsEditing(true);
        }}
        className={`flex-1 cursor-pointer select-none ${todo.completed ? "text-muted-foreground line-through" : ""}`}
        title="Double-click to edit"
      >
        {todo.text}
      </span>
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={() => deleteTodo(todo.id)}
        aria-label={`Delete "${todo.text}"`}
      >
        ✕
      </Button>
    </li>
  );
};
