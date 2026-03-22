import { getAdminStats } from "@/lib/admin/actions";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

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
            className="glass-panel flex flex-col gap-1 p-5 transition hover:border-electric/30"
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
        <div className="glass-panel p-6 space-y-4">
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
        </div>

        {/* User type breakdown */}
        <div className="glass-panel p-6 space-y-4">
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
          <Link
            href="/admin/settings"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-electric hover:text-electric"
          >
            Feature Flags →
          </Link>
        </div>
      </div>
    </div>
  );
}
