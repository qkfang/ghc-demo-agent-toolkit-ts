"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { AddTodoForm } from "@/features/todo/components/add-todo-form";
import { TodoList } from "@/features/todo/components/todo-list";
import { useTodoPersistence } from "@/features/todo/use-todo-persistence";

export const TodoPage = () => {
  useTodoPersistence();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Heading variant="h1" className="mb-6">
        Todo App
      </Heading>
      <Card>
        <CardHeader>
          <CardTitle>My Todos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <AddTodoForm />
          <TodoList />
        </CardContent>
      </Card>
    </div>
  );
};
