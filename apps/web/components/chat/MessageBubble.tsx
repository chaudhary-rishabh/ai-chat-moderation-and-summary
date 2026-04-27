"use client";

import { type ChatMessage } from "@/stores/chatStore";
import { useSession } from "next-auth/react";
import { Trash2, Flag } from "lucide-react";

interface Props {
  message: ChatMessage;
  onDelete?: (id: string) => void;
}

export function MessageBubble({ message, onDelete }: Props) {
  const { data: session } = useSession();
  const isMine = message.sender.id === session?.user?.id;
  const isDeleted = message.isDeleted;

  if (isDeleted) {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-white/30 italic">Message deleted</span>
      </div>
    );
  }

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex gap-2.5 px-5 py-0.5 group ${isMine ? "justify-end" : "justify-start"}`}>
      {/* Avatar for received messages */}
      {!isMine && (
        <div className="w-8 h-8 rounded-xl glass-subtle flex items-center justify-center shrink-0 mt-1">
          {message.sender.avatarUrl ? (
            <img src={message.sender.avatarUrl} alt="" className="w-8 h-8 rounded-xl object-cover" />
          ) : (
            <span className="text-xs font-medium text-white/60">
              {message.sender.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      )}

      {/* Bubble */}
      <div className={`max-w-[70%] ${isMine ? "order-[-1]" : ""}`}>
        {!isMine && (
          <span className="text-[11px] text-white/40 ml-1 mb-0.5 block">
            {message.sender.name}
          </span>
        )}

        <div
          className={`relative rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words ${
            isMine
              ? "bg-accent text-white rounded-br-md shadow-lg shadow-accent/20"
              : "bg-white/12 text-white/90 rounded-bl-md border border-white/10"
          }`}
        >
          {message.content}

          <span
            className={`text-[10px] ml-2 opacity-50 whitespace-nowrap ${
              isMine ? "text-white/70" : "text-white/40"
            }`}
          >
            {time}
          </span>

          {/* Hover actions */}
          <div className={`absolute top-1 ${isMine ? "-left-16" : "-right-16"} hidden group-hover:flex items-center gap-1`}>
            {isMine && onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(message.id); }}
                className="p-1 rounded-md glass-subtle hover:bg-white/15 transition"
              >
                <Trash2 className="w-3 h-3 text-white/60" />
              </button>
            )}
            {!isMine && (
              <button className="p-1 rounded-md glass-subtle hover:bg-white/15 transition">
                <Flag className="w-3 h-3 text-white/60" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Avatar for sent messages */}
      {isMine && (
        <div className="w-8 h-8 rounded-xl bg-accent/30 flex items-center justify-center shrink-0 mt-1">
          {session?.user?.image ? (
            <img src={session.user.image} alt="" className="w-8 h-8 rounded-xl object-cover" />
          ) : (
            <span className="text-xs font-medium text-accent">
              {session?.user?.name?.charAt(0).toUpperCase() ?? "?"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
