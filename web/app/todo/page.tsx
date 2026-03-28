import { type Metadata } from "next";

import { TodoPage } from "@/features/todo/todo-page";

export const metadata: Metadata = {
  title: "Todo App",
};

export default function Todo() {
  return <TodoPage />;
}
