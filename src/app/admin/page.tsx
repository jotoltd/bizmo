import { getAdminStats } from "@/lib/admin/actions";
import { getRecentActivity, getSystemStatus } from "@/lib/admin/extended-actions";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Admin | Bizno",
  description: "Admin dashboard overview with system stats, recent activity, and system health.",
};

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  const activity = await getRecentActivity(5);
  const status = await getSystemStatus();

  const cards = [
    { label: "Total Users", value: stats.totalUsers, href: "/admin/users" },
    { label: "Active (7d)", value: stats.activeUsers, href: "/admin/users" },
    { label: "Signups (30d)", value: stats.recentSignups, href: "/admin/users" },
    { label: "Businesses", value: stats.totalBusinesses, href: "/admin/businesses" },
    { label: "Avg Tasks Done", value: stats.avgTasksCompleted, href: "/admin/businesses" },
    { label: "Published Steps", value: stats.publishedSteps, href: "/admin/roadmap" },
    { label: "Draft Steps", value: stats.draftSteps, href: "/admin/roadmap" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-electric">Admin</p>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-400">Platform overview at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="glass-panel flex flex-col gap-1 p-5 transition-all hover:border-electric/50 hover:bg-white/5 cursor-pointer active:scale-[0.98]"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">
              {card.label}
            </p>
            <p className="text-3xl font-semibold text-white">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Breakdowns */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan breakdown */}
        <Link href="/admin/users" className="glass-panel p-6 space-y-4 transition-all hover:border-electric/50 hover:bg-white/5 cursor-pointer active:scale-[0.98] block">
          <h2 className="text-lg font-semibold">Plan Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(stats.planBreakdown).map(([plan, count]) => {
              const pct = stats.totalUsers
                ? Math.round(((count as number) / stats.totalUsers) * 100)
                : 0;
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize text-slate-300">{plan}</span>
                    <span className="text-slate-400">
                      {count as number} ({pct}%)
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-white/5">
                    <div
                      className="h-2 rounded-full bg-electric transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Link>

        {/* User type breakdown */}
        <Link href="/admin/users" className="glass-panel p-6 space-y-4 transition-all hover:border-electric/50 hover:bg-white/5 cursor-pointer active:scale-[0.98] block">
          <h2 className="text-lg font-semibold">User Types</h2>
          <div className="space-y-3">
            {Object.entries(stats.typeBreakdown).map(([type, count]) => {
              const pct = stats.totalUsers
                ? Math.round(((count as number) / stats.totalUsers) * 100)
                : 0;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize text-slate-300">{type}</span>
                    <span className="text-slate-400">
                      {count as number} ({pct}%)
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-white/5">
                    <div
                      className="h-2 rounded-full bg-electric transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Link>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Link href="/admin/activity" className="text-sm text-electric hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {activity.length === 0 ? (
              <p className="text-slate-500 text-sm">No recent activity</p>
            ) : (
              activity.map((item) => (
                <Link
                  key={item.id}
                  href={item.link || "#"}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer"
                >
                  <span className="text-xl">
                    {item.type === "user_signup" && "👤"}
                    {item.type === "business_created" && "🏢"}
                    {item.type === "support_ticket" && "🎫"}
                    {item.type === "invitation_sent" && "📧"}
                    {item.type === "login" && "🔑"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-slate-400 truncate">{item.description}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Database</span>
              <span className={`text-sm font-medium ${
                status.database === "healthy" ? "text-green-400" : 
                status.database === "degraded" ? "text-yellow-400" : "text-red-400"
              }`}>
                {status.database === "healthy" ? "● Operational" : 
                 status.database === "degraded" ? "● Degraded" : "● Down"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Storage</span>
              <span className={`text-sm font-medium ${
                status.storage === "healthy" ? "text-green-400" : 
                status.storage === "degraded" ? "text-yellow-400" : "text-red-400"
              }`}>
                {status.storage === "healthy" ? "● Operational" : 
                 status.storage === "degraded" ? "● Degraded" : "● Down"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Auth</span>
              <span className={`text-sm font-medium ${
                status.auth === "healthy" ? "text-green-400" : 
                status.auth === "degraded" ? "text-yellow-400" : "text-red-400"
              }`}>
                {status.auth === "healthy" ? "● Operational" : 
                 status.auth === "degraded" ? "● Degraded" : "● Down"}
              </span>
            </div>
            {status.issues.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400 font-medium mb-1">Issues detected:</p>
                {status.issues.map((issue, i) => (
                  <p key={i} className="text-xs text-red-300">• {issue}</p>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-4">
              Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/roadmap"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-electric hover:text-electric"
          >
            Manage Roadmap →
          </Link>
          <Link
            href="/admin/users"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-electric hover:text-electric"
          >
            View Users →
          </Link>
          <Link
            href="/admin/comms"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-electric hover:text-electric"
          >
            Send Announcement →
          </Link>
        </div>
      </div>
    </div>
  );
}
