"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { storiesApi } from "@/lib/api/stories.api";
import type { Story } from "@/types/chat.types";
import { cn } from "@/utils/cn";

interface Props {
  onStoryClick: (stories: Story[], index: number) => void;
}

export function StoriesBar({ onStoryClick }: Props) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storiesApi
      .feed()
      .then(setStories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Group by user, deduplicate
  const grouped = stories.reduce(
    (acc, story) => {
      if (!acc[story.userId]) acc[story.userId] = [];
      acc[story.userId]!.push(story);
      return acc;
    },
    {} as Record<string, Story[]>,
  );

  const entries = Object.entries(grouped);

  if (loading) {
    return (
      <div className="px-4 py-3 flex gap-3 overflow-x-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-16 h-16 rounded-full glass-soft animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) return null;

  return (
    <div className="px-4 py-3 border-b border-white/8">
      <div className="flex gap-3 overflow-x-auto">
        {/* Add story */}
        <button className="flex flex-col items-center gap-1 shrink-0">
          <div className="w-16 h-16 rounded-full glass-soft flex items-center justify-center hover:bg-white/15 transition">
            <Plus className="w-5 h-5 text-ink-soft" />
          </div>
          <span className="text-[10px] text-ink-faint">Add</span>
        </button>

        {entries.map(([userId, userStories]) => {
          const latest = userStories[0]!;
          const hasUnseen = userStories.some((s) => s.isActive);
          return (
            <button
              key={userId}
              onClick={() => onStoryClick(userStories, 0)}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              <div
                className={cn(
                  "w-16 h-16 rounded-full p-0.5",
                  hasUnseen
                    ? "bg-linear-to-tr from-accent to-ai-accent"
                    : "bg-white/15",
                )}
              >
                <div className="w-full h-full rounded-full glass flex items-center justify-center overflow-hidden">
                  {latest.user.avatarUrl ? (
                    <img
                      src={latest.user.avatarUrl}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-ink-soft">
                      {latest.user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-ink-faint max-w-16 truncate">
                {latest.user.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
