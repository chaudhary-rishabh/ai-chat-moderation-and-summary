"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { usersApi } from "@/api/users.api";
import { adminQueryKeys } from "@/constants/queryKeys";
import { adminRoutes } from "@/constants/routes";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Search, Filter, MoreHorizontal, UserX, Shield, Key } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { AdminUser } from "@/types/admin.types";
import { toast } from "sonner";

export default function UsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [resetPwId, setResetPwId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: adminQueryKeys.users.list({ page, search, role: roleFilter, status: statusFilter }),
    queryFn: () => usersApi.list({ page, limit: 20, search, role: roleFilter, status: statusFilter }),
  });

  const columns: ColumnDef<AdminUser>[] = [
    { accessorKey: "name", header: "Name", cell: ({ getValue }) => <span className="font-medium text-ink">{getValue() as string}</span> },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role", cell: ({ getValue }) => <RoleBadge role={getValue() as string} /> },
    { accessorKey: "isActive", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.isActive ? "active" : "deactivated"} /> },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(adminRoutes.userDetail(row.original.id))}
            className="p-1.5 rounded-lg hover:bg-glass text-ink-soft hover:text-ink transition"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Users</h1>
        <p className="text-sm text-ink-soft mt-1">Manage user accounts</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="glass-panel flex items-center gap-2 px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-ink-faint" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none flex-1"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="glass-panel px-3 py-2 text-sm text-ink outline-none"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Superadmin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="glass-panel px-3 py-2 text-sm text-ink outline-none"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="deactivated">Deactivated</option>
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
