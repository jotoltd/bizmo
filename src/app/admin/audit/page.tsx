import { getAuditLogs } from "@/lib/admin/extended-actions";
import { AuditLogsManager } from "./audit-manager";

export default async function AuditLogsPage() {
  const logs = await getAuditLogs({ limit: 100 });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-electric">Admin</p>
        <h1 className="text-3xl font-semibold">Audit Logs</h1>
        <p className="text-sm text-slate-400">
          Track all admin actions across the platform.
        </p>
      </div>
      <AuditLogsManager initialLogs={logs} />
    </div>
  );
}
