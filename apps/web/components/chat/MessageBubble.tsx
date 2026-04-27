"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Trash2, Flag, Smile } from "lucide-react";
import { messageIn } from "@/lib/animations";
import type { ChatMessage } from "@/types/chat.types";

interface Props {
  message: ChatMessage;
  onDelete?: (id: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

export function MessageBubble({ message, onDelete, onReact }: Props) {
  const { data: session } = useSession();
  const isMine = message.sender.id === session?.user?.id;

  if (message.isDeleted) {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-ink-faint italic">Message deleted</span>
      </div>
    );
  }

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      variants={messageIn}
      initial="hidden"
      animate="visible"
      className={`flex gap-2.5 px-5 py-0.5 group ${isMine ? "justify-end" : "justify-start"}`}
    >
      {/* Avatar for received messages */}
      {!isMine && (
        <div className="w-8 h-8 rounded-xl glass-soft flex items-center justify-center shrink-0 mt-1">
          {message.sender.avatarUrl ? (
            <img
              src={message.sender.avatarUrl}
              alt=""
              className="w-8 h-8 rounded-xl object-cover"
            />
          ) : (
            <span className="text-xs font-medium text-ink-soft">
              {message.sender.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      )}

      {/* Bubble */}
      <div className={`max-w-[70%] ${isMine ? "-order-1" : ""}`}>
        {!isMine && (
          <span className="text-[11px] text-ink-faint ml-1 mb-0.5 block">
            {message.sender.name}
          </span>
        )}

        <div
          className={
            isMine
              ? "bubble-sent relative px-3.5 py-2 text-sm leading-relaxed break-words"
              : "bubble-received relative px-3.5 py-2 text-sm leading-relaxed break-words"
          }
        >
          {message.content}

          <span className="text-[10px] ml-2 opacity-50 whitespace-nowrap float-right mt-1">
            {time}
          </span>

          {/* Hover actions */}
          <div
            className={`absolute -top-2 ${isMine ? "-left-20" : "-right-20"} hidden group-hover:flex items-center gap-1`}
          >
            {isMine && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(message.id);
                }}
                className="p-1 rounded-md glass-soft hover:bg-white/15 transition"
              >
                <Trash2 className="w-3 h-3 text-ink-soft" />
              </button>
            )}
            {!isMine && (
              <button className="p-1 rounded-md glass-soft hover:bg-white/15 transition">
                <Flag className="w-3 h-3 text-ink-soft" />
              </button>
            )}
            {onReact && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReact(message.id, "👍");
                }}
                className="p-1 rounded-md glass-soft hover:bg-white/15 transition"
              >
                <Smile className="w-3 h-3 text-ink-soft" />
              </button>
            )}
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 ml-1">
            {message.reactions.map((r, i) => (
              <span
                key={`${r.emoji}-${r.userId}-${i}`}
                className="glass-soft rounded-full px-2 py-0.5 text-xs"
              >
                {r.emoji} {r.userName}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Avatar for sent messages */}
      {isMine && (
        <div className="w-8 h-8 rounded-xl bg-accent/30 flex items-center justify-center shrink-0 mt-1">
          {session?.user?.avatarUrl ? (
            <img
              src={session.user.avatarUrl}
              alt=""
              className="w-8 h-8 rounded-xl object-cover"
            />
          ) : (
            <span className="text-xs font-medium text-accent">
              {session?.user?.name?.charAt(0).toUpperCase() ?? "?"}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
