"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const SessionProviderCompat = SessionProvider as unknown as React.ComponentType<{ children: React.ReactNode }>;
  return (
    <SessionProviderCompat>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProviderCompat>
  );
}
