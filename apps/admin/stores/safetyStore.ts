"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { AdminSafetyFlag } from "@/types/admin.types";

interface SafetyState {
  liveFlags: AdminSafetyFlag[];
  wsConnected: boolean;
  addLiveFlag: (flag: AdminSafetyFlag) => void;
  setWsConnected: (connected: boolean) => void;
  clearLiveFlags: () => void;
}

export const useSafetyStore = create<SafetyState>()(
  immer((set) => ({
    liveFlags: [],
    wsConnected: false,
    addLiveFlag: (flag) =>
      set((s) => {
        s.liveFlags.unshift(flag);
        if (s.liveFlags.length > 50) s.liveFlags.pop();
      }),
    setWsConnected: (connected) =>
      set((s) => {
        s.wsConnected = connected;
      }),
    clearLiveFlags: () =>
      set((s) => {
        s.liveFlags = [];
      }),
  })),
);
