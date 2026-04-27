import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { PanelMode, Language } from "@/types/ui.types";

interface UIState {
  sidebarOpen: boolean;
  searchQuery: string;
  aiPanelOpen: boolean;
  panelMode: PanelMode;
  targetLanguage: Language;
  suggestions: string[];
  summaryContent: string | null;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  toggleAIPanel: () => void;
  setPanelMode: (mode: PanelMode) => void;
  setTargetLanguage: (lang: Language) => void;
  setSuggestions: (suggestions: string[]) => void;
  setSummaryContent: (content: string | null) => void;
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    sidebarOpen: true,
    searchQuery: "",
    aiPanelOpen: false,
    panelMode: "chat",
    targetLanguage: "en",
    suggestions: [],
    summaryContent: null,

    toggleSidebar: () =>
      set((s) => {
        s.sidebarOpen = !s.sidebarOpen;
      }),

    setSidebarOpen: (open) =>
      set((s) => {
        s.sidebarOpen = open;
      }),

    setSearchQuery: (query) =>
      set((s) => {
        s.searchQuery = query;
      }),

    toggleAIPanel: () =>
      set((s) => {
        s.aiPanelOpen = !s.aiPanelOpen;
      }),

    setPanelMode: (mode) =>
      set((s) => {
        s.panelMode = mode;
        s.aiPanelOpen = mode !== "chat";
      }),

    setTargetLanguage: (lang) =>
      set((s) => {
        s.targetLanguage = lang;
      }),

    setSuggestions: (suggestions) =>
      set((s) => {
        s.suggestions = suggestions;
      }),

    setSummaryContent: (content) =>
      set((s) => {
        s.summaryContent = content;
      }),
  })),
);
