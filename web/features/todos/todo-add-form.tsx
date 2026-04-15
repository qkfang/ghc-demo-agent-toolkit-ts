"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addTodo } from "@/store/use-todo-store";

export const TodoAddForm = () => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    addTodo(trimmed);
    setInputValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Add a new todo…"
      />
      <Button type="submit">Add</Button>
    </form>
  );
};
