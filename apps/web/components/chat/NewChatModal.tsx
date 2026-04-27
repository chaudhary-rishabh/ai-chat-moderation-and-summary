"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Hash, MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { scaleIn } from "@/lib/animations";
import { CreateRoomSchema, type CreateRoomData } from "@/validators/room.validators";
import { roomsApi } from "@/lib/api/rooms.api";
import { useChatStore } from "@/stores/chatStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NewChatModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const setRooms = useChatStore((s) => s.setRooms);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);

  const form = useForm<CreateRoomData>({
    resolver: zodResolver(CreateRoomSchema),
    defaultValues: { type: "dm", memberIds: [] },
  });

  const handleSubmit = async (data: CreateRoomData) => {
    setLoading(true);
    try {
      const room = await roomsApi.create({
        type: data.type,
        name: data.name,
        memberIds: data.memberIds,
      });
      // Fetch updated rooms list (simplified — should invalidate query)
      setActiveRoom(room.id);
      onClose();
      toast.success("Conversation created");
    } catch {
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
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-4 h-4 text-ink-soft" />
              </button>
            </div>

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Type */}
              <div className="flex gap-2">
                {(["dm", "group", "channel"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => form.setValue("type", type)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition flex items-center justify-center gap-1.5 ${
                      form.watch("type") === type
                        ? "bg-white/25 text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)]"
                        : "glass-soft text-ink-soft hover:bg-white/15"
                    }`}
                  >
                    {type === "dm" ? (
                      <MessageSquare className="w-3.5 h-3.5" />
                    ) : type === "group" ? (
                      <Users className="w-3.5 h-3.5" />
                    ) : (
                      <Hash className="w-3.5 h-3.5" />
                    )}
                    {type === "dm" ? "DM" : type === "group" ? "Group" : "Channel"}
                  </button>
                ))}
              </div>

              {form.watch("type") !== "dm" && (
                <input
                  {...form.register("name")}
                  placeholder={form.watch("type") === "channel" ? "Channel name" : "Group name"}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none"
                />
              )}

              <div className="space-y-1.5">
                <label className="text-xs text-ink-faint">Members (comma-separated IDs)</label>
                <textarea
                  placeholder="user-id-1, user-id-2"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none min-h-[60px]"
                  onChange={(e) => {
                    const ids = e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
                    form.setValue("memberIds", ids);
                  }}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 glass-soft rounded-xl text-sm text-ink-soft hover:bg-white/15 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-hover transition disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
