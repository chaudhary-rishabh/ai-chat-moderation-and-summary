"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import type { Story } from "@/types/chat.types";
import { storiesApi } from "@/lib/api/stories.api";

interface Props {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

export function StoryViewer({ stories, initialIndex, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  const current = stories[index];

  // Auto-advance every 5 seconds
  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (index < stories.length - 1) {
            setIndex(index + 1);
            return 0;
          }
          onClose();
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [index, stories.length, onClose]);

  // Reset progress when index changes
  useEffect(() => {
    setProgress(0);
  }, [index]);

  const goNext = useCallback(() => {
    if (index < stories.length - 1) {
      setIndex(index + 1);
    } else {
      onClose();
    }
  }, [index, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      setIndex(index - 1);
    }
  }, [index]);

  const handleReact = useCallback(
    async (emoji: string) => {
      if (!current) return;
      try {
        await storiesApi.react(current.id, emoji);
      } catch {
        // silent
      }
    },
    [current],
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, goNext, goPrev]);

  if (!current) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 p-2 rounded-xl glass-soft hover:bg-white/15 transition"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Prev */}
        {index > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-5 z-10 p-2 rounded-xl glass-soft hover:bg-white/15 transition"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Next */}
        <button
          onClick={goNext}
          className="absolute right-5 z-10 p-2 rounded-xl glass-soft hover:bg-white/15 transition"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Story content */}
        <motion.div
          key={current.id}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-sm aspect-[9/16] glass rounded-3xl overflow-hidden"
        >
          {/* Progress bar */}
          <div className="absolute top-3 left-3 right-3 z-10 flex gap-1">
            {stories.map((_, i) => (
              <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-75"
                  style={{
                    width: i < index ? "100%" : i === index ? `${progress}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Media */}
          <img
            src={current.mediaUrl}
            alt={current.caption ?? ""}
            className="w-full h-full object-cover"
          />

          {/* Caption */}
          {current.caption && (
            <div className="absolute bottom-16 left-4 right-4 glass rounded-xl px-4 py-2 text-sm text-white">
              {current.caption}
            </div>
          )}

          {/* User info */}
          <div className="absolute top-8 left-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full glass flex items-center justify-center text-white text-xs font-medium">
              {current.user.avatarUrl ? (
                <img
                  src={current.user.avatarUrl}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                current.user.name.charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-sm font-medium text-white">
              {current.user.name}
            </span>
          </div>

          {/* React */}
          <button
            onClick={() => handleReact("❤️")}
            className="absolute bottom-4 right-4 p-3 glass rounded-full hover:bg-white/20 transition"
          >
            <Heart className="w-5 h-5 text-white" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
