"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { aiService } from "@/services/ai.service";
import { useUIStore } from "@/stores/uiStore";

export function useAISuggest(roomId: string | null, content: string) {
  const suggestions = useUIStore((s) => s.suggestions);
  const setSuggestions = useUIStore((s) => s.setSuggestions);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInputRef = useRef("");

  const fetchSuggestions = useCallback(
    async (input: string) => {
      if (!roomId || !input.trim()) {
        setSuggestions([]);
        return;
      }

      if (input === lastInputRef.current) return;
      lastInputRef.current = input;

      setLoading(true);
      try {
        await aiService.fetchSuggestions(roomId, input);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [roomId, setSuggestions],
  );

  // Debounce 600ms
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!content.trim()) {
      setSuggestions([]);
      return;
    }
    timerRef.current = setTimeout(() => fetchSuggestions(content), 600);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [content, fetchSuggestions, setSuggestions]);

  const dismiss = useCallback(() => {
    setSuggestions([]);
    lastInputRef.current = "";
  }, [setSuggestions]);

  return { suggestions, isLoading: loading, dismiss };
}
