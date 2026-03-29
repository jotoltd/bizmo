"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { updateTicketStatus } from "@/lib/admin/extended-actions";

type SupportTicket = {
  id: string;
  user_email: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-slate-500/20 text-slate-400",
  billing: "bg-amber-500/20 text-amber-400",
  technical: "bg-red-500/20 text-red-400",
  feature_request: "bg-electric/20 text-electric",
  bug_report: "bg-red-500/20 text-red-400",
  account: "bg-blue-500/20 text-blue-400",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-500/20 text-slate-400",
  medium: "bg-amber-500/20 text-amber-400",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-red-500/20 text-red-400",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-electric/20 text-electric",
  waiting_user: "bg-amber-500/20 text-amber-400",
  resolved: "bg-green-500/20 text-green-400",
  closed: "bg-slate-500/20 text-slate-400",
};

export function SupportTicketsManager({
  initialTickets,
}: {
  initialTickets: SupportTicket[];
}) {
  const router = useRouter();
  const [tickets] = useState(initialTickets);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter && ticket.status !== statusFilter) return false;
    if (priorityFilter && ticket.priority !== priorityFilter) return false;
    if (categoryFilter && ticket.category !== categoryFilter) return false;
    return true;
  });

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", ticketId);
      formData.set("status", newStatus);
      await updateTicketStatus(formData);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_user">Waiting User</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Priority</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            <option value="">All</option>
            <option value="general">General</option>
            <option value="billing">Billing</option>
            <option value="technical">Technical</option>
            <option value="feature_request">Feature Request</option>
            <option value="bug_report">Bug Report</option>
            <option value="account">Account</option>
          </select>
        </div>
        <Button
          onClick={() => {
            setStatusFilter("");
            setPriorityFilter("");
            setCategoryFilter("");
          }}
          variant="ghost"
          size="sm"
        >
          Clear
        </Button>
      </div>

      <div className="glass-panel overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">Ticket</th>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Priority</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Assigned</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/support/${ticket.id}`}
                    className="text-white hover:text-electric transition"
                  >
                    {ticket.subject}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-400">{ticket.user_email}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase ${CATEGORY_COLORS[ticket.category]}`}>
                    {ticket.category}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase ${PRIORITY_COLORS[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase ${STATUS_COLORS[ticket.status]}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-400">
                  {ticket.assigned_to ? "Assigned" : "Unassigned"}
                </td>
                <td className="px-5 py-3 text-slate-400">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                    disabled={isPending}
                    className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_user">Waiting User</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTickets.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            No tickets match the current filters.
          </p>
        )}
      </div>
    </div>
  );
}
