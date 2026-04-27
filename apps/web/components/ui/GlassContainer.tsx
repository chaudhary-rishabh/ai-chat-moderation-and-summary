"use client";

import { cn } from "@/utils/cn";

interface Props {
  children: React.ReactNode;
  variant?: "default" | "strong" | "soft";
  className?: string;
}

export function GlassContainer({ children, variant = "default", className }: Props) {
  return (
    <div
      className={cn(
        variant === "strong" ? "glass-strong" : variant === "soft" ? "glass-soft" : "glass",
        "rounded-[24px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
