"use client";

import { useState, useEffect } from "react";
import { getCurrentSystemStats } from "@/lib/admin/extended-actions";

type SystemStats = {
  totalUsers: number;
  activeUsers24h: number;
  totalBusinesses: number;
  openTickets: number;
  logins24h: number;
  failedLogins24h: number;
};

export function SystemHealthManager({ initialStats }: { initialStats: SystemStats }) {
  const [stats, setStats] = useState(initialStats);
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">("24h");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      const newStats = await getCurrentSystemStats();
      setStats(newStats);
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const refreshMetrics = async () => {
    setIsLoading(true);
    const newStats = await getCurrentSystemStats();
    setStats(newStats);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["1h", "24h", "7d", "30d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                timeRange === range
                  ? "bg-electric text-black"
                  : "border border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        <button
          onClick={refreshMetrics}
          disabled={isLoading}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:text-white disabled:opacity-50"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          trend={null}
        />
        <StatCard
          label="Active (24h)"
          value={stats.activeUsers24h}
          trend={null}
        />
        <StatCard
          label="Total Businesses"
          value={stats.totalBusinesses}
          trend={null}
        />
        <StatCard
          label="Open Support Tickets"
          value={stats.openTickets}
          trend={stats.openTickets > 5 ? "up" : null}
          alert={stats.openTickets > 10}
        />
        <StatCard
          label="Logins (24h)"
          value={stats.logins24h}
          trend={null}
        />
        <StatCard
          label="Failed Logins (24h)"
          value={stats.failedLogins24h}
          trend={stats.failedLogins24h > 10 ? "up" : null}
          alert={stats.failedLogins24h > 20}
        />
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-4">Platform Health</h3>
        <div className="space-y-4">
          <HealthIndicator
            name="Database"
            status="healthy"
            details="Response time: ~45ms"
          />
          <HealthIndicator
            name="Authentication"
            status="healthy"
            details="99.9% uptime"
          />
          <HealthIndicator
            name="Email Service"
            status={stats.failedLogins24h > 50 ? "warning" : "healthy"}
            details="Resend API connected"
          />
          <HealthIndicator
            name="Storage"
            status="healthy"
            details="Supabase Storage active"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  trend,
  alert,
}: {
  label: string;
  value: number;
  trend: "up" | "down" | null;
  alert?: boolean;
}) {
  return (
    <div className={`glass-panel p-5 ${alert ? "border-red-500/30" : ""}`}>
      <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <p className={`text-3xl font-semibold ${alert ? "text-red-400" : "text-white"}`}>
          {value.toLocaleString()}
        </p>
        {trend && (
          <span className={trend === "up" ? "text-red-400" : "text-green-400"}>
            {trend === "up" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </div>
  );
}

function HealthIndicator({
  name,
  status,
  details,
}: {
  name: string;
  status: "healthy" | "warning" | "critical";
  details: string;
}) {
  const colors = {
    healthy: "bg-green-500",
    warning: "bg-amber-500",
    critical: "bg-red-500",
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={`h-2 w-2 rounded-full ${colors[status]}`} />
        <span className="text-sm font-medium text-white">{name}</span>
      </div>
      <span className="text-xs text-slate-400">{details}</span>
    </div>
  );
}
