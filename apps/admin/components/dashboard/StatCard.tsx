import { cn } from "@/utils/cn";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down";
  loading?: boolean;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, loading }: StatCardProps) {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-xl bg-glass">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trend === "up" ? "bg-success/20 text-success" : "bg-danger/20 text-danger",
            )}
          >
            {trend === "up" ? "+" : "-"}
          </span>
        )}
      </div>
      {loading ? (
        <>
          <div className="h-7 w-20 bg-glass rounded animate-pulse mb-1" />
          <div className="h-4 w-32 bg-glass rounded animate-pulse" />
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-ink">{value}</p>
          {subtitle && <p className="text-xs text-ink-faint mt-1">{subtitle}</p>}
        </>
      )}
      <p className="text-xs text-ink-soft mt-2">{title}</p>
    </div>
  );
}
