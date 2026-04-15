"use client";

import { Heading } from "@/components/ui/heading";
import { TodoAddForm } from "@/features/todos/todo-add-form";
import { TodoList } from "@/features/todos/todo-list";

export const TodosPage = () => {
  return (
    <div className="mx-auto max-w-2xl py-12 flex flex-col gap-6">
      <Heading variant="h1">Todos</Heading>
      <TodoAddForm />
      <TodoList />
    </div>
  );
};
