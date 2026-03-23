import { getCurrentSystemStats } from "@/lib/admin/extended-actions";
import { SystemHealthManager } from "./health-manager";

export default async function SystemHealthPage() {
  const stats = await getCurrentSystemStats();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-electric">Admin</p>
        <h1 className="text-3xl font-semibold">System Health</h1>
        <p className="text-sm text-slate-400">
          Real-time monitoring and platform status.
        </p>
      </div>
      <SystemHealthManager initialStats={stats} />
    </div>
  );
}
