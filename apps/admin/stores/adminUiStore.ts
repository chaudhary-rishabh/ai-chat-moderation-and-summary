"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type SidebarState = "expanded" | "collapsed";

interface AdminUIState {
  sidebar: SidebarState;
  toggleSidebar: () => void;
  setSidebar: (state: SidebarState) => void;
}

export const useAdminUIStore = create<AdminUIState>()(
  immer((set) => ({
    sidebar: "expanded",
    toggleSidebar: () =>
      set((s) => {
        s.sidebar = s.sidebar === "expanded" ? "collapsed" : "expanded";
      }),
    setSidebar: (state) =>
      set((s) => {
        s.sidebar = state;
      }),
  })),
);
