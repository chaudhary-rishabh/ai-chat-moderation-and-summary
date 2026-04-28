"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storiesApi } from "@/api/stories.api";
import { adminQueryKeys } from "@/constants/queryKeys";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BookOpen, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { AdminStory } from "@/types/admin.types";
import { toast } from "sonner";

export default function StoriesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: adminQueryKeys.stories.active,
    queryFn: storiesApi.active,
    refetchInterval: 30_000,
  });

  const deleteMut = useMutation({
    mutationFn: storiesApi.delete,
    onSuccess: () => {
      toast.success("Story deleted");
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stories.all });
    },
    onError: () => toast.error("Failed to delete story"),
  });

  const columns: ColumnDef<AdminStory>[] = [
    {
      accessorKey: "userName",
      header: "User",
      cell: ({ getValue }) => <span className="font-medium text-ink">{getValue() as string}</span>,
    },
    { accessorKey: "mediaType", header: "Type" },
    {
      accessorKey: "caption",
      header: "Caption",
      cell: ({ getValue }) => (
        <span className="text-ink-soft">{(getValue() as string)?.slice(0, 50) ?? "—"}</span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ getValue }) => (getValue() ? <StatusBadge status="active" /> : <StatusBadge status="deactivated" />),
    },
    {
      accessorKey: "expiresAt",
      header: "Expires",
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => deleteMut.mutate(row.original.id)}
          className="p-1.5 rounded-lg hover:bg-danger/10 text-ink-faint hover:text-danger transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Active Stories
        </h1>
        <p className="text-sm text-ink-soft mt-1">Monitor active stories</p>
      </div>

      <DataTable
        columns={columns}
        data={data?.rows ?? []}
        total={data?.total}
        loading={isLoading}
      />
    </div>
  );
}
