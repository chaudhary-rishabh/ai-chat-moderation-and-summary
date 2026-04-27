"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useChatStore } from "@/stores/chatStore";
import { Send, Paperclip, Smile } from "lucide-react";

export function ChatInput() {
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const { sendMessage, sendTypingStart, sendTypingStop } = useMessages(activeRoomId);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [activeRoomId]);

  const handleTyping = () => {
    sendTypingStart();
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTypingStop();
    }, 2000);
  };

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText("");
    sendTypingStop();
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeRoomId) return null;

  return (
    <div className="px-5 py-4 border-t border-white/8">
      <div className="glass-input rounded-2xl px-4 py-3 flex items-end gap-2">
        <button className="p-1.5 rounded-lg hover:bg-white/10 transition shrink-0 mb-0.5">
          <Paperclip className="w-4 h-4 text-white/50" />
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
          className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none resize-none max-h-32 py-0.5"
        />

        <button className="p-1.5 rounded-lg hover:bg-white/10 transition shrink-0 mb-0.5">
          <Smile className="w-4 h-4 text-white/50" />
        </button>

        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className={`p-2 rounded-xl shrink-0 transition-all ${
            text.trim()
              ? "bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/30"
              : "bg-white/10 text-white/30"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
