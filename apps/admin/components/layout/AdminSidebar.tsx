"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminUIStore } from "@/stores/adminUiStore";
import { cn } from "@/utils/cn";
import { adminRoutes } from "@/constants/routes";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Shield,
  BarChart3,
  BookOpen,
  ChevronLeft,
} from "lucide-react";

const navItems = [
  { href: adminRoutes.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: adminRoutes.users, label: "Users", icon: Users },
  { href: adminRoutes.rooms, label: "Rooms", icon: MessageSquare },
  { href: adminRoutes.stories, label: "Stories", icon: BookOpen },
  { href: adminRoutes.safety, label: "Safety", icon: Shield },
  { href: adminRoutes.analytics, label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const sidebar = useAdminUIStore((s) => s.sidebar);
  const toggleSidebar = useAdminUIStore((s) => s.toggleSidebar);
  const collapsed = sidebar === "collapsed";

  return (
    <aside
      className={cn(
        "h-screen bg-surface border-r border-glass-border flex flex-col shrink-0 transition-all duration-200",
        collapsed ? "w-16" : "w-56",
      )}
    >
      <div className="h-14 flex items-center px-4 border-b border-glass-border">
        {!collapsed && <span className="text-sm font-semibold text-ink">Glass Chat Admin</span>}
        <button
          onClick={toggleSidebar}
          className={cn("p-1 rounded-lg hover:bg-glass transition", collapsed ? "mx-auto" : "ml-auto")}
        >
          <ChevronLeft className={cn("w-4 h-4 text-ink-soft transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors",
                active
                  ? "bg-accent/15 text-accent font-medium"
                  : "text-ink-soft hover:bg-glass hover:text-ink",
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
