"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useChatStore } from "@/stores/chatStore";
import { useAISuggest } from "@/hooks/useAISuggest";
import { Send, Paperclip, Smile, X, Sparkles } from "lucide-react";
import { cn } from "@/utils/cn";

export function ChatInput() {
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const threadParentId = useChatStore((s) => s.threadParentId);
  const setThreadParent = useChatStore((s) => s.setThreadParent);
  const { sendMessage, sendTypingStart, sendTypingStop } = useMessages(activeRoomId);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AI suggestions
  const { suggestions, isLoading: suggestLoading, dismiss } = useAISuggest(activeRoomId, text);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeRoomId]);

  const handleTyping = () => {
    sendTypingStart();
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTypingStop();
    }, 2000);
  };

  const handleSend = (content?: string) => {
    const msg = (content ?? text).trim();
    if (!msg) return;
    sendMessage(msg, "text", threadParentId ?? undefined);
    setText("");
    sendTypingStop();
    setThreadParent(null);
    dismiss();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab: accept first suggestion
    if (e.key === "Tab" && suggestions.length > 0) {
      e.preventDefault();
      handleSend(suggestions[0]);
      return;
    }
    // Escape: dismiss suggestions
    if (e.key === "Escape" && suggestions.length > 0) {
      e.preventDefault();
      dismiss();
      return;
    }
    // Enter: send
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeRoomId) return null;

  const ghostText = suggestions.length > 0 ? suggestions[0] : null;

  return (
    <div className="px-5 py-4 border-t border-white/8 shrink-0">
      {threadParentId && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-xs text-ink-faint">Replying in thread</span>
          <button
            onClick={() => setThreadParent(null)}
            className="p-0.5 rounded hover:bg-white/10"
          >
            <X className="w-3 h-3 text-ink-faint" />
          </button>
        </div>
      )}

      {/* Ghost suggestion */}
      {ghostText && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-ai-accent" />
            <button
              onClick={() => handleSend(ghostText)}
              className="text-[13px] text-ink-faint hover:text-ink transition text-left truncate"
            >
              {ghostText}
            </button>
            <button
              onClick={dismiss}
              className="p-0.5 rounded hover:bg-white/10 shrink-0"
            >
              <X className="w-3 h-3 text-ink-faint" />
            </button>
            <span className="text-[10px] text-ink-faint bg-glass-soft rounded px-1.5 py-0.5 ml-auto">
              Tab
            </span>
          </div>
        </div>
      )}

      <div className="glass-input rounded-2xl px-4 py-3 flex items-end gap-2">
        <button className="p-1.5 rounded-lg hover:bg-white/10 transition shrink-0 mb-0.5">
          <Paperclip className="w-4 h-4 text-ink-soft" />
        </button>

        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none resize-none max-h-32 py-0.5"
        />

        <button className="p-1.5 rounded-lg hover:bg-white/10 transition shrink-0 mb-0.5">
          <Smile className="w-4 h-4 text-ink-soft" />
        </button>

        <button
          onClick={() => handleSend()}
          disabled={!text.trim()}
          className={cn(
            "p-2 rounded-xl shrink-0 transition-all",
            text.trim()
              ? "bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/30"
              : "bg-white/10 text-ink-faint",
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
