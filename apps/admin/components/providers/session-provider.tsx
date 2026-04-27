"use client";

import { SessionProvider } from "next-auth/react";

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const SessionProviderCompat = SessionProvider as unknown as React.ComponentType<{ children: React.ReactNode }>;
  return <SessionProviderCompat>{children}</SessionProviderCompat>;
}
