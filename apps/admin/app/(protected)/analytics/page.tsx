"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api/analytics.api";
import { adminQueryKeys } from "@/constants/queryKeys";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { format } from "date-fns";

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: adminQueryKeys.analytics.all,
    queryFn: analyticsApi.get,
  });

  const userGrowth = (data?.userGrowth as any[] ?? []).map((p: any) => ({
    date: format(new Date(p.date), "MMM dd"),
    count: Number(p.count),
  }));

  const messageVolume = (data?.messageVolume as any[] ?? []).map((p: any) => ({
    date: format(new Date(p.date), "MMM dd"),
    count: Number(p.count),
  }));

  const safetyByType = (data?.safetyTrends as any[] ?? []).reduce((acc: Record<string, any>[], row: any) => {
    const date = format(new Date(row.date), "MMM dd");
    let entry = acc.find((e) => e.date === date);
    if (!entry) { entry = { date }; acc.push(entry); }
    entry[row.flag_type] = Number(row.count);
    return acc;
  }, []);

  const aiUsage = (data?.aiUsage as any[] ?? []).map((p: any) => ({
    date: format(new Date(p.date), "MMM dd"),
    Sessions: Number(p.sessions),
    Summaries: Number(p.summaries),
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-glass rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="glass-panel h-80 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Analytics</h1>
        <p className="text-sm text-ink-soft mt-1">Platform metrics (last 30 days)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Growth */}
        <div className="glass-panel p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">User Signups</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={userGrowth}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#636366", fontSize: 11 }} />
              <YAxis tick={{ fill: "#636366", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#161618", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                labelStyle={{ color: "#f1f1f3" }}
              />
              <Line type="monotone" dataKey="count" stroke="#007aff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Message Volume */}
        <div className="glass-panel p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">Message Volume</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={messageVolume}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#636366", fontSize: 11 }} />
              <YAxis tick={{ fill: "#636366", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#161618", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
              />
              <Line type="monotone" dataKey="count" stroke="#34c759" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Safety Trends */}
        <div className="glass-panel p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">Safety Flags by Type</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={safetyByType}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#636366", fontSize: 11 }} />
              <YAxis tick={{ fill: "#636366", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#161618", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
              />
              <Legend />
              <Bar dataKey="abuse" stackId="a" fill="#ff3b30" />
              <Bar dataKey="harassment" stackId="a" fill="#ff9f0a" />
              <Bar dataKey="spam" stackId="a" fill="#636366" />
              <Bar dataKey="hate_speech" stackId="a" fill="#ff3b30" />
              <Bar dataKey="bullying" stackId="a" fill="#ff9f0a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Usage */}
        <div className="glass-panel p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">AI Usage</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={aiUsage}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#636366", fontSize: 11 }} />
              <YAxis tick={{ fill: "#636366", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#161618", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
              />
              <Legend />
              <Line type="monotone" dataKey="Sessions" stroke="#007aff" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Summaries" stroke="#ff9f0a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Offenders */}
      {data?.topOffenders && (data.topOffenders as any[]).length > 0 && (
        <div className="glass-panel p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">Top Repeat Offenders (30 days)</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-glass-border">
                  <th className="px-4 py-2 text-left text-xs font-medium text-ink-soft">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-ink-soft">Email</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-ink-soft">Flags</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-ink-soft">Last Flag</th>
                </tr>
              </thead>
              <tbody>
                {(data.topOffenders as any[]).map((user: any) => (
                  <tr key={user.id} className="border-b border-glass-border">
                    <td className="px-4 py-2 text-sm text-ink font-medium">{user.name}</td>
                    <td className="px-4 py-2 text-sm text-ink-soft">{user.email}</td>
                    <td className="px-4 py-2 text-sm text-danger text-right font-medium">{user.flag_count}</td>
                    <td className="px-4 py-2 text-sm text-ink-soft text-right">
                      {format(new Date(user.last_flag_at), "MMM dd, yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
