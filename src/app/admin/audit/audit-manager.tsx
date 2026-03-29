"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getAuditLogs } from "@/lib/admin/extended-actions";

type AuditLog = {
  id: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_email: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

export function AuditLogsManager({
  initialLogs,
}: {
  initialLogs: AuditLog[];
}) {
  const router = useRouter();
  const [logs, setLogs] = useState(initialLogs);
  const [filter, setFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredLogs = logs.filter((log) => {
    if (filter && !log.admin_email?.toLowerCase().includes(filter.toLowerCase()) && 
        !log.target_email?.toLowerCase().includes(filter.toLowerCase())) return false;
    if (actionFilter && log.action !== actionFilter) return false;
    return true;
  });

  const handleRefresh = () => {
    startTransition(async () => {
      const newLogs = await getAuditLogs({
        action: actionFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        limit: 100,
      });
      setLogs(newLogs as AuditLog[]);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Search</label>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Admin or target email..."
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Action</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            <option value="">All</option>
            <option value="create_user">Create User</option>
            <option value="update_user">Update User</option>
            <option value="delete_user">Delete User</option>
            <option value="suspend_user">Suspend User</option>
            <option value="update_business">Update Business</option>
            <option value="send_campaign">Send Campaign</option>
            <option value="update_ticket">Update Ticket</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          />
        </div>
        <Button onClick={handleRefresh} disabled={isPending} size="sm">
          {isPending ? "Loading..." : "Filter"}
        </Button>
      </div>

      <div className="glass-panel overflow-x-auto">
        <table className="min-w-[800px] w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">Time</th>
              <th className="px-5 py-3">Admin</th>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Target</th>
              <th className="px-5 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-slate-400">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-5 py-3 text-white">{log.admin_email}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-electric/20 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-electric">
                    {log.action}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-300">
                  {log.target_type}: {log.target_email || "N/A"}
                </td>
                <td className="px-5 py-3 text-slate-400 text-xs">
                  {JSON.stringify(log.details).slice(0, 50)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLogs.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            No audit logs found.
          </p>
        )}
      </div>
    </div>
  );
}
