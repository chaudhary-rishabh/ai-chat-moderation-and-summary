"use client";

import { produce } from "immer";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserPublic } from "@repo/types/auth";

type AuthState = {
  user: UserPublic | null;
  isLoading: boolean;
  setUser: (user: UserPublic | null) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) =>
        set((state) =>
          produce(state, (draft) => {
            draft.user = user;
          }),
        ),
      clearUser: () =>
        set((state) =>
          produce(state, (draft) => {
            draft.user = null;
          }),
        ),
      setLoading: (loading) =>
        set((state) =>
          produce(state, (draft) => {
            draft.isLoading = loading;
          }),
        ),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
