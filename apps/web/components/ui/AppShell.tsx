"use client";

import { cn } from "@/utils/cn";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function AppShell({ children, className }: Props) {
  return (
    <div
      className={cn(
        "h-screen flex overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
