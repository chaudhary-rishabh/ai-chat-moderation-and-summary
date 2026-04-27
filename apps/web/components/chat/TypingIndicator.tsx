"use client";

import type { TypingUser } from "@/types/chat.types";

interface Props {
  users: TypingUser[];
}

export function TypingIndicator({ users }: Props) {
  if (users.length === 0) return null;

  const names = users.map((u) => u.userName).join(", ");
  const verb = users.length === 1 ? "is" : "are";

  return (
    <div className="flex items-center gap-2 px-5 py-1">
      <span className="text-xs text-ink-faint">
        {names} {verb} typing
      </span>
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}
