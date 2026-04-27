"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useAIStore } from "@/stores/aiStore";
import { useDirectChat } from "@/hooks/useDirectChat";
import { Sparkles, X, Send, Loader2, Copy, Check, StopCircle } from "lucide-react";
import { cn } from "@/utils/cn";

export function AIPanel() {
  const setPanelMode = useUIStore((s) => s.setPanelMode);
  const targetLanguage = useUIStore((s) => s.targetLanguage);
  const setTargetLanguage = useUIStore((s) => s.setTargetLanguage);

  const { messages, isStreaming, sendMessage, cancel } = useDirectChat();
  const streamBuffer = useAIStore((s) => s.streamBuffer);
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamBuffer]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  }, [input, sendMessage]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-80 h-full glass-strong rounded-l-3xl flex flex-col shrink-0 border-l border-white/10">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-ai-accent" />
          <span className="text-sm font-semibold text-ink">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value as any)}
            className="glass-soft rounded-lg px-2 py-1 text-xs text-ink outline-none"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
            <option value="de">DE</option>
            <option value="zh">ZH</option>
            <option value="ja">JA</option>
          </select>
          <button
            onClick={() => setPanelMode("chat")}
            className="p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4 text-ink-soft" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !isStreaming && (
          <div className="text-center text-ink-faint text-sm mt-8">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-ai-accent/40" />
            <p>Ask me to draft, translate, or search your chats</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed",
              msg.role === "user"
                ? "bubble-sent ml-auto"
                : "bubble-received",
            )}
          >
            {msg.content}
            {msg.role === "assistant" && (
              <button
                onClick={() => handleCopy(msg.content)}
                className="ml-2 text-ink-faint hover:text-ink transition"
              >
                {copied ? (
                  <Check className="w-3 h-3 inline" />
                ) : (
                  <Copy className="w-3 h-3 inline" />
                )}
              </button>
            )}
          </div>
        ))}

        {isStreaming && streamBuffer && (
          <div className="bubble-received max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed">
            {streamBuffer}
            <span className="inline-block w-1.5 h-4 bg-ai-accent ml-0.5 animate-pulse align-middle" />
          </div>
        )}

        {isStreaming && !streamBuffer && (
          <div className="flex justify-start px-1">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/8">
        <div className="glass-input rounded-xl px-3 py-2 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isStreaming) handleSend();
              if (e.key === "Escape" && isStreaming) cancel();
            }}
            placeholder={isStreaming ? "AI is typing..." : "Ask AI..."}
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none"
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button
              onClick={cancel}
              className="p-1.5 rounded-lg text-danger hover:bg-white/10 transition"
            >
              <StopCircle className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={cn(
                "p-1.5 rounded-lg transition",
                input.trim()
                  ? "bg-ai-accent text-white"
                  : "text-ink-faint",
              )}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
