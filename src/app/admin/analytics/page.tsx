import { getAdminStats } from "@/lib/admin/actions";

export default async function AdminAnalyticsPage() {
  const stats = await getAdminStats();

  const dropOffEntries = Object.entries(stats.dropOffPoints ?? {});

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-electric">Admin</p>
        <h1 className="text-3xl font-semibold">Analytics & Reporting</h1>
        <p className="text-sm text-slate-400">
          Signups, active users, completion, and roadmap drop-off points.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Active Users (7d)" value={stats.activeUsers} />
        <StatCard label="Signups (30d)" value={stats.recentSignups} />
        <StatCard label="Businesses" value={stats.totalBusinesses} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-panel p-6 space-y-4">
          <h2 className="text-lg font-semibold">Roadmap Completion</h2>
          <div className="space-y-2">
            <MetricRow label="Average tasks completed" value={stats.avgTasksCompleted} />
            <MetricRow label="Published steps" value={stats.publishedSteps} />
            <MetricRow label="Draft steps" value={stats.draftSteps} />
          </div>
        </section>

        <section className="glass-panel p-6 space-y-4">
          <h2 className="text-lg font-semibold">Plan Breakdown</h2>
          <div className="space-y-3">
            <BreakdownBar
              label="Free"
              count={stats.planBreakdown.free}
              total={stats.totalUsers}
            />
            <BreakdownBar
              label="Pro"
              count={stats.planBreakdown.pro}
              total={stats.totalUsers}
            />
          </div>
        </section>
      </div>

      <section className="glass-panel p-6 space-y-4">
        <h2 className="text-lg font-semibold">User Type Breakdown</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <BreakdownBar
            label="Freelancer"
            count={stats.typeBreakdown.freelancer}
            total={stats.totalUsers}
          />
          <BreakdownBar
            label="Agency"
            count={stats.typeBreakdown.agency}
            total={stats.totalUsers}
          />
          <BreakdownBar
            label="Enterprise"
            count={stats.typeBreakdown.enterprise}
            total={stats.totalUsers}
          />
        </div>
      </section>

      <section className="glass-panel p-6 space-y-4">
        <h2 className="text-lg font-semibold">Roadmap Drop-off Funnel</h2>
        <div className="space-y-3">
          {dropOffEntries.map(([stage, count], index) => {
            const max = (dropOffEntries[0]?.[1] as number) || 1;
            const pct = Math.round(((count as number) / max) * 100);
            return (
              <div key={stage} className="space-y-1">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span className="capitalize">
                    {index + 1}. {stage.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span className="text-slate-400">
                    {count as number} ({pct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5">
                  <div
                    className="h-2 rounded-full bg-electric transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-panel p-5">
      <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2 text-sm">
      <span className="text-slate-300">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function BreakdownBar({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">
          {count} ({pct}%)
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5">
        <div
          className="h-2 rounded-full bg-electric transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
