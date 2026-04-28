"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function AdminTopbar() {
  const { data: session } = useSession();

  return (
    <header className="h-14 bg-surface border-b border-glass-border flex items-center justify-between px-6 shrink-0">
      <span className="text-sm text-ink-soft">
        Welcome, <span className="text-ink font-medium">{session?.user?.name}</span>
      </span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-ink-faint bg-glass px-2 py-1 rounded-lg">
          {session?.user?.role}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1.5 text-xs text-ink-soft hover:text-danger transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </header>
  );
}
