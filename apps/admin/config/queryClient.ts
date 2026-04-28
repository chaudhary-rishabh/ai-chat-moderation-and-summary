"use client";

import { QueryClient } from "@tanstack/react-query";

let queryClient: QueryClient | null = null;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!queryClient) queryClient = makeQueryClient();
  return queryClient;
}
