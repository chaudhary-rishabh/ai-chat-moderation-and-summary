"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { roomsApi } from "@/api/rooms.api";
import { adminQueryKeys } from "@/constants/queryKeys";
import { adminRoutes } from "@/constants/routes";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Search, MessageSquare } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { AdminRoom } from "@/types/admin.types";

export default function RoomsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [archivedFilter, setArchivedFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: adminQueryKeys.rooms.list({ page, search, type: typeFilter, archived: archivedFilter }),
    queryFn: () => roomsApi.list({ page, limit: 20, search, type: typeFilter, archived: archivedFilter }),
  });

  const columns: ColumnDef<AdminRoom>[] = [
    {
      accessorKey: "name",
      header: "Room",
      cell: ({ row }) => (
        <button
          onClick={() => router.push(adminRoutes.roomDetail(row.original.id))}
          className="font-medium text-ink hover:text-accent transition"
        >
          {row.original.name ?? `Room ${row.original.id.slice(0, 8)}`}
        </button>
      ),
    },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "memberCount", header: "Members" },
    {
      accessorKey: "isArchived",
      header: "Status",
      cell: ({ getValue }) => (getValue() ? <StatusBadge status="deactivated" /> : <StatusBadge status="active" />),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Rooms
        </h1>
        <p className="text-sm text-ink-soft mt-1">Manage all rooms</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="glass-panel flex items-center gap-2 px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-ink-faint" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search rooms..."
            className="bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none flex-1"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="glass-panel px-3 py-2 text-sm text-ink outline-none"
        >
          <option value="">All Types</option>
          <option value="dm">DM</option>
          <option value="group">Group</option>
          <option value="channel">Channel</option>
        </select>
        <select
          value={archivedFilter}
          onChange={(e) => { setArchivedFilter(e.target.value); setPage(1); }}
          className="glass-panel px-3 py-2 text-sm text-ink outline-none"
        >
          <option value="">All</option>
          <option value="false">Active</option>
          <option value="true">Archived</option>
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
