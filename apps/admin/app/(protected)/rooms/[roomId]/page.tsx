"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { roomsApi } from "@/api/rooms.api";
import { adminQueryKeys } from "@/constants/queryKeys";
import { adminRoutes } from "@/constants/routes";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ArrowLeft, Archive, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function RoomDetailPage() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const roomId = params.roomId;
  const [showArchive, setShowArchive] = useState(false);
  const [deleteMsgId, setDeleteMsgId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: adminQueryKeys.rooms.detail(roomId),
    queryFn: () => roomsApi.detail(roomId),
  });

  const archiveMut = useMutation({
    mutationFn: () => roomsApi.archive(roomId),
    onSuccess: () => {
      toast.success("Room archived");
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.rooms.detail(roomId) });
      setShowArchive(false);
    },
    onError: () => toast.error("Failed to archive room"),
  });

  const deleteMsgMut = useMutation({
    mutationFn: (messageId: string) => roomsApi.deleteMessage(messageId),
    onSuccess: () => {
      toast.success("Message deleted");
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.rooms.detail(roomId) });
      setDeleteMsgId(null);
    },
    onError: () => toast.error("Failed to delete message"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-glass rounded animate-pulse" />
        <div className="glass-panel p-6 space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-6 bg-glass rounded animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { room, members, recentMessages } = data;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push(adminRoutes.rooms)}
        className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Rooms
      </button>

      <div className="glass-panel p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-ink">{room.name ?? `Room ${room.id.slice(0, 8)}`}</h1>
            <p className="text-sm text-ink-soft">
              {room.type} {room.isArchived && "· Archived"} · {members.length} members · Created{" "}
              {new Date(room.createdAt).toLocaleDateString()}
            </p>
          </div>
          {!room.isArchived && (
            <button
              onClick={() => setShowArchive(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-danger/10 text-danger hover:bg-danger/20 transition"
            >
              <Archive className="w-3.5 h-3.5" />
              Archive Room
            </button>
          )}
        </div>

        <h2 className="text-sm font-semibold text-ink mb-2">Members</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {members.map((m) => (
            <span key={m.id} className="text-sm bg-glass px-2 py-1 rounded-lg text-ink">
              {m.name}
              {m.role !== "member" && (
                <span className="text-ink-faint ml-1 text-xs">({m.role})</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6">
        <h2 className="text-sm font-semibold text-ink mb-4">Recent Messages ({recentMessages.length})</h2>
        <div className="space-y-2">
          {recentMessages.map((msg) => (
            <div
              key={msg.id}
              className="flex items-start justify-between py-2 border-b border-glass-border last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ink-soft mb-0.5">
                  <span className="font-medium text-ink">{msg.senderName}</span> ·{" "}
                  {new Date(msg.createdAt).toLocaleString()}
                  {msg.isFlagged && <StatusBadge status="pending" />}
                </p>
                <p className="text-sm text-ink truncate">{msg.content ?? "(no content)"}</p>
              </div>
              <button
                onClick={() => setDeleteMsgId(msg.id)}
                className="p-1.5 rounded-lg hover:bg-danger/10 text-ink-faint hover:text-danger transition shrink-0 ml-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={showArchive}
        title="Archive Room"
        description="Are you sure you want to archive this room? Members will no longer be able to send messages."
        confirmLabel="Archive"
        variant="danger"
        onConfirm={() => archiveMut.mutate()}
        onCancel={() => setShowArchive(false)}
        loading={archiveMut.isPending}
      />

      <ConfirmDialog
        open={!!deleteMsgId}
        title="Delete Message"
        description="This permanently deletes the message. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteMsgId && deleteMsgMut.mutate(deleteMsgId)}
        onCancel={() => setDeleteMsgId(null)}
        loading={deleteMsgMut.isPending}
      />
    </div>
  );
}
