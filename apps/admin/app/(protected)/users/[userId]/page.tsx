"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { usersApi } from "@/api/users.api";
import { adminQueryKeys } from "@/constants/queryKeys";
import { adminRoutes } from "@/constants/routes";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ArrowLeft, Shield, UserX, Key } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function UserDetailPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = params.userId;
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [newRole, setNewRole] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: adminQueryKeys.users.detail(userId),
    queryFn: () => usersApi.detail(userId),
  });

  const deactivateMut = useMutation({
    mutationFn: () => usersApi.deactivate(userId),
    onSuccess: () => {
      toast.success("User deactivated");
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users.detail(userId) });
      setShowDeactivate(false);
    },
    onError: () => toast.error("Failed to deactivate user"),
  });

  const roleMut = useMutation({
    mutationFn: () => usersApi.changeRole(userId, newRole),
    onSuccess: () => {
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users.detail(userId) });
      setShowRole(false);
    },
    onError: () => toast.error("Failed to change role"),
  });

  const resetPwMut = useMutation({
    mutationFn: () => usersApi.resetPassword(userId),
    onSuccess: (result) => {
      toast.success(`Password reset token: ${result.resetToken.slice(0, 16)}...`);
    },
    onError: () => toast.error("Failed to reset password"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-glass rounded animate-pulse" />
        <div className="glass-panel p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-6 bg-glass rounded animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { user, rooms, safetyFlags, auditLogs } = data;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push(adminRoutes.users)}
        className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </button>

      <div className="glass-panel p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-ink">{user.name}</h1>
            <p className="text-sm text-ink-soft">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <RoleBadge role={user.role} />
            <StatusBadge status={user.isActive ? "active" : "deactivated"} />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setShowRole(true); setNewRole(user.role); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-glass hover:bg-glass-hover transition"
          >
            <Shield className="w-3.5 h-3.5" />
            Change Role
          </button>
          <button
            onClick={() => setShowDeactivate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-danger/10 text-danger hover:bg-danger/20 transition"
          >
            <UserX className="w-3.5 h-3.5" />
            Deactivate
          </button>
          <button
            onClick={() => resetPwMut.mutate()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-glass hover:bg-glass-hover transition"
          >
            <Key className="w-3.5 h-3.5" />
            Reset Password
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-panel p-4">
          <h2 className="text-sm font-semibold text-ink mb-3">Rooms ({rooms.length})</h2>
          <div className="space-y-2">
            {rooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between py-1.5 border-b border-glass-border last:border-0">
                <span className="text-sm text-ink">{room.name ?? `Room ${room.id.slice(0, 8)}`}</span>
                <span className="text-xs text-ink-faint">{room.type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-4">
          <h2 className="text-sm font-semibold text-ink mb-3">Safety Flags ({safetyFlags.length})</h2>
          <div className="space-y-2">
            {safetyFlags.map((flag) => (
              <div key={flag.id} className="flex items-center justify-between py-1.5 border-b border-glass-border last:border-0">
                <span className="text-sm text-ink">{flag.flagType}</span>
                <StatusBadge status={flag.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-4">
          <h2 className="text-sm font-semibold text-ink mb-3">Audit Logs ({auditLogs.length})</h2>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-1.5 border-b border-glass-border last:border-0">
                <span className="text-sm text-ink block">{log.event}</span>
                <span className="text-xs text-ink-faint">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeactivate}
        title="Deactivate User"
        description={`Are you sure you want to deactivate ${user.name}? This will prevent them from accessing the platform.`}
        confirmLabel="Deactivate"
        variant="danger"
        onConfirm={() => deactivateMut.mutate()}
        onCancel={() => setShowDeactivate(false)}
        loading={deactivateMut.isPending}
      />

      <ConfirmDialog
        open={showRole}
        title="Change Role"
        description={
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="mt-2 glass-panel px-3 py-2 text-sm text-ink outline-none w-full"
          >
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select> as any
        }
        confirmLabel="Update Role"
        onConfirm={() => roleMut.mutate()}
        onCancel={() => setShowRole(false)}
        loading={roleMut.isPending}
      />
    </div>
  );
}
