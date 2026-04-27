"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { getQueryClient } from "@/lib/queryClient";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());
  const SP = SessionProvider as unknown as React.ComponentType<{ children: React.ReactNode }>;
  return (
    <SP>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SP>
  );
}
