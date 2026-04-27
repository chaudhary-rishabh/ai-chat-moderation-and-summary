"use client";

import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data, status } = useSession();
  if (status === "loading") {
    return <div className="min-h-screen animate-pulse bg-gray-100" />;
  }

  return (
    <main className="space-y-4 p-6">
      <div className="rounded border p-4">
        <h1 className="text-2xl font-semibold">Welcome, {data?.user?.name}</h1>
        <p className="text-sm text-gray-600">Role: {(data?.user as any)?.role}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {["Total Users", "Active Rooms", "Flagged Messages", "AI Sessions"].map((label) => (
          <div key={label} className="rounded border p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <div className="mt-2 h-8 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </main>
  );
}
