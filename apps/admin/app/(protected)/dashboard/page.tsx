"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api/analytics.api";
import { adminQueryKeys } from "@/constants/queryKeys";
import { StatCard } from "@/components/dashboard/StatCard";
import { Users, MessageSquare, Shield, Sparkles, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: adminQueryKeys.analytics.all,
    queryFn: analyticsApi.get,
  });

  const totalUsers = (data?.userGrowth as any[] | undefined)?.reduce((s: number, p: any) => s + Number(p.count), 0) ?? 0;
  const totalMessages = (data?.messageVolume as any[] | undefined)?.reduce((s: number, p: any) => s + Number(p.count), 0) ?? 0;
  const totalFlags = (data?.safetyTrends as any[] | undefined)?.reduce((s: number, p: any) => s + Number(p.count), 0) ?? 0;
  const aiSessions = (data?.aiUsage as any[] | undefined)?.reduce((s: number, p: any) => s + Number(p.sessions), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-ink-soft mt-1">Overview of your platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users (30d)" value={totalUsers} icon={Users} loading={isLoading} />
        <StatCard title="Messages (30d)" value={totalMessages} icon={MessageSquare} loading={isLoading} />
        <StatCard title="Safety Flags (30d)" value={totalFlags} icon={Shield} loading={isLoading} />
        <StatCard title="AI Sessions (30d)" value={aiSessions} icon={Sparkles} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Offenders */}
        <div className="glass-panel p-5">
          <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Top Repeat Offenders
          </h2>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-glass rounded animate-pulse" />
              ))}
            </div>
          ) : (data?.topOffenders as any[])?.length > 0 ? (
            <div className="space-y-2">
              {(data!.topOffenders as any[]).slice(0, 5).map((user: any) => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b border-glass-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-ink">{user.name}</p>
                    <p className="text-xs text-ink-faint">{user.email}</p>
                  </div>
                  <span className="text-xs font-medium text-danger bg-danger/10 px-2 py-0.5 rounded-full">
                    {user.flag_count} flags
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-faint">No flagged users in last 30 days</p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="glass-panel p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { label: "User Growth", data: data?.userGrowth as any[] },
              { label: "Message Volume", data: data?.messageVolume as any[] },
            ].map((metric) => (
              <div key={metric.label}>
                <p className="text-xs text-ink-soft mb-1.5">{metric.label}</p>
                <div className="h-20 flex items-end gap-1">
                  {isLoading
                    ? Array.from({ length: 30 }).map((_, i) => (
                        <div key={i} className="flex-1 bg-glass rounded-t animate-pulse" style={{ height: `${Math.random() * 100}%` }} />
                      ))
                    : (metric.data ?? []).map((point: any, i: number) => {
                        const max = Math.max(...(metric.data ?? []).map((p: any) => Number(p.count)), 1);
                        const h = (Number(point.count) / max) * 100;
                        return (
                          <div
                            key={i}
                            className="flex-1 bg-accent/30 rounded-t hover:bg-accent/50 transition-colors"
                            style={{ height: `${h}%` }}
                            title={`${point.date}: ${point.count}`}
                          />
                        );
                      })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
