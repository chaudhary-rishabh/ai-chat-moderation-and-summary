"use client";

import { useEffect, useRef, useCallback } from "react";

export function useScrollToBottom(deps: unknown[] = []) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  // Auto-scroll when deps change (e.g., message count)
  useEffect(() => {
    const currentLength = deps[0];
    if (typeof currentLength === "number" && currentLength > prevLengthRef.current) {
      scrollToBottom(true);
    }
    prevLengthRef.current = typeof currentLength === "number" ? currentLength : prevLengthRef.current;
  }, deps);

  return { containerRef, bottomRef, scrollToBottom };
}
