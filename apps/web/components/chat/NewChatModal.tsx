"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Hash, MessageSquare, Search, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { scaleIn } from "@/lib/animations";
import { CreateRoomSchema } from "@/validators/room.validators";
import { roomsApi } from "@/lib/api/rooms.api";
import { usersApi } from "@/lib/api/users.api";
import { useChatStore } from "@/stores/chatStore";
import type { UserPublic } from "@repo/types/auth";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NewChatModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"dm" | "group" | "channel">("dm");
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<UserPublic[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserPublic[]>([]);
  const [searching, setSearching] = useState(false);
  const [focused, setFocused] = useState(false);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);
  const debounce = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Search users
  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      return;
    }
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await usersApi.search(query);
        setResults(r.filter((u) => !selected.some((s) => s.id === u.id)));
      } catch {
        // ignore
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query, selected]);

  const toggleUser = (user: UserPublic) => {
    setSelected((prev) =>
      prev.some((s) => s.id === user.id)
        ? prev.filter((s) => s.id !== user.id)
        : [...prev, user],
    );
  };

  const handleCreate = async () => {
    const data = {
      type,
      name: type !== "dm" ? name : undefined,
      memberIds: selected.map((s) => s.id),
    };

    const result = CreateRoomSchema.safeParse(data);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Validation failed");
      return;
    }

    setLoading(true);
    try {
      const room = await roomsApi.create(result.data);
      setActiveRoom(room.id);
      onClose();
      toast.success("Conversation created");
    } catch (err) {
      console.error("Create room failed:", err);
      toast.error("Failed to create conversation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="glass rounded-3xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-ink">New Conversation</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition">
                <X className="w-4 h-4 text-ink-soft" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type */}
              <div className="flex gap-2">
                {(["dm", "group", "channel"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setType(t); setSelected([]); }}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition flex items-center justify-center gap-1.5 ${
                      type === t
                        ? "bg-white/25 text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)]"
                        : "glass-soft text-ink-soft hover:bg-white/15"
                    }`}
                  >
                    {t === "dm" ? <MessageSquare className="w-3.5 h-3.5" /> : t === "group" ? <Users className="w-3.5 h-3.5" /> : <Hash className="w-3.5 h-3.5" />}
                    {t === "dm" ? "DM" : t === "group" ? "Group" : "Channel"}
                  </button>
                ))}
              </div>

              {/* Name (group/channel) */}
              {type !== "dm" && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={type === "channel" ? "Channel name" : "Group name"}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none"
                />
              )}

              {/* Selected users */}
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selected.map((u) => (
                    <span
                      key={u.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 text-ink text-xs"
                    >
                      {u.name}
                      <button onClick={() => toggleUser(u)} className="hover:text-red-400 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search users */}
              <div ref={containerRef} className="relative">
                <div className="glass-input rounded-xl px-3 py-2 flex items-center gap-2">
                  <Search className="w-4 h-4 text-ink-faint shrink-0" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    placeholder="Search users by name or email..."
                    className="bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none w-full"
                  />
                  {searching && <Loader2 className="w-3.5 h-3.5 text-ink-faint animate-spin" />}
                </div>

                {/* Dropdown */}
                {focused && query.length >= 1 && (
                  <div className="absolute top-full mt-1 left-0 right-0 glass-strong rounded-xl overflow-hidden z-10 max-h-48 overflow-y-auto">
                    {results.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-ink-faint text-center">
                        {searching ? "Searching..." : "No users found"}
                      </p>
                    ) : (
                      results.map((u) => {
                        const isSelected = selected.some((s) => s.id === u.id);
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => toggleUser(u)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition text-left"
                          >
                            <div className="w-8 h-8 rounded-full glass-soft flex items-center justify-center text-sm font-medium text-ink shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-ink truncate">{u.name}</p>
                              <p className="text-[11px] text-ink-faint truncate">{u.email}</p>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-accent shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 glass-soft rounded-xl text-sm text-ink-soft hover:bg-white/15 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-hover transition disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
