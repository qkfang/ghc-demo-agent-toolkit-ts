"use client";

import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";

export const HomePage = () => {
  return (
    <div className="mx-auto max-w-2xl h-screen flex flex-col justify-center gap-6">
      <Image src="/copilot-cli.svg" alt="Copilot CLI" width={60} height={60} />
      <Heading variant="h1" className="">
        Ship faster. Same team.
      </Heading>
      <p className="text-lg text-muted-foreground text-balance">
        GitHub Copilot Agents and Skills that accelerate modern frontend development.
      </p>
      <div>
        <Link href="/todo">
          <Button>Try Todo App</Button>
        </Link>
      </div>
    </div>
  );
};
