"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { getQueryClient } from "@/config/queryClient";
import { Toaster } from "sonner";
import { useState, type ReactNode } from "react";

const CompatSessionProvider = SessionProvider as React.ComponentType<{ children: ReactNode }>;

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <CompatSessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </CompatSessionProvider>
  );
}
