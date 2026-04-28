"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { safetyApi } from "@/api/safety.api";
import { adminQueryKeys } from "@/constants/queryKeys";
import { useSafetyStore } from "@/stores/safetyStore";
import { useAdminWs } from "@/hooks/useAdminWs";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FlagTypeBadge } from "@/components/safety/FlagTypeBadge";
import { ConfidenceBar } from "@/components/safety/ConfidenceBar";
import { Shield, Wifi, WifiOff } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { AdminSafetyFlag } from "@/types/admin.types";
import { cn } from "@/utils/cn";
import { toast } from "sonner";

export default function SafetyPage() {
  useAdminWs();
  const queryClient = useQueryClient();
  const liveFlags = useSafetyStore((s) => s.liveFlags);
  const wsConnected = useSafetyStore((s) => s.wsConnected);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: adminQueryKeys.safety.flags({ page, status: statusFilter, flag_type: typeFilter }),
    queryFn: () => safetyApi.flags({ page, limit: 20, status: statusFilter, flag_type: typeFilter }),
  });

  const reviewMut = useMutation({
    mutationFn: ({ flagId, status }: { flagId: string; status: string }) => safetyApi.review(flagId, status),
    onSuccess: () => {
      toast.success("Flag reviewed");
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.safety.all });
    },
    onError: () => toast.error("Failed to review flag"),
  });

  const columns: ColumnDef<AdminSafetyFlag>[] = [
    {
      accessorKey: "senderName",
      header: "Sender",
      cell: ({ row }) => (
        <span className="font-medium text-ink">{row.original.senderName ?? "Unknown"}</span>
      ),
    },
    {
      accessorKey: "flagType",
      header: "Type",
      cell: ({ getValue }) => <FlagTypeBadge type={getValue() as string} />,
    },
    {
      accessorKey: "confidenceScore",
      header: "Confidence",
      cell: ({ getValue }) => <ConfidenceBar value={getValue() as number} />,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
    },
    {
      accessorKey: "createdAt",
      header: "Flagged",
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.status === "pending" ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => reviewMut.mutate({ flagId: row.original.id, status: "reviewed_safe" })}
              className="px-2 py-1 rounded-lg text-xs font-medium bg-success/10 text-success hover:bg-success/20 transition"
            >
              Safe
            </button>
            <button
              onClick={() => reviewMut.mutate({ flagId: row.original.id, status: "reviewed_removed" })}
              className="px-2 py-1 rounded-lg text-xs font-medium bg-danger/10 text-danger hover:bg-danger/20 transition"
            >
              Remove
            </button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Safety</h1>
          <p className="text-sm text-ink-soft mt-1">Monitor and review flagged content</p>
        </div>
        <div className="flex items-center gap-2">
          {wsConnected ? (
            <span className="flex items-center gap-1 text-xs text-success">
              <Wifi className="w-3 h-3" /> Live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-ink-faint">
              <WifiOff className="w-3 h-3" /> Disconnected
            </span>
          )}
        </div>
      </div>

      {/* Live feed */}
      {liveFlags.length > 0 && (
        <div className="glass-panel p-4 border border-warning/20">
          <h2 className="text-xs font-semibold text-warning mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Live Flag Feed
          </h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {liveFlags.map((flag, i) => (
              <div key={i} className={cn("text-sm py-1 border-b border-glass-border last:border-0", i === 0 && "animate-pulse")}>
                <span className="font-medium text-ink">{flag.senderName ?? "Unknown"}</span>
                <span className="text-ink-soft"> — </span>
                <FlagTypeBadge type={flag.flagType} />
                <span className="text-ink-soft ml-2">{flag.offendingSpan?.slice(0, 60)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="glass-panel px-3 py-2 text-sm text-ink outline-none"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed_safe">Reviewed Safe</option>
          <option value="reviewed_removed">Reviewed Removed</option>
          <option value="auto_blocked">Auto Blocked</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="glass-panel px-3 py-2 text-sm text-ink outline-none"
        >
          <option value="">All Types</option>
          <option value="abuse">Abuse</option>
          <option value="bullying">Bullying</option>
          <option value="harassment">Harassment</option>
          <option value="hate_speech">Hate Speech</option>
          <option value="spam">Spam</option>
          <option value="self_harm">Self Harm</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.rows ?? []}
        page={data?.page ?? 1}
        pageCount={Math.ceil((data?.total ?? 1) / (data?.limit ?? 20))}
        total={data?.total}
        loading={isLoading}
        onPageChange={setPage}
      />
    </div>
  );
}
