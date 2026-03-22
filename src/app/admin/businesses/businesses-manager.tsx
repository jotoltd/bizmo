"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateBusiness } from "@/lib/admin/actions";
import type { Business } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/20 text-green-400",
  approved: "bg-electric/20 text-electric",
  flagged: "bg-amber-500/20 text-amber-400",
  suspended: "bg-red-500/20 text-red-400",
};

function EditBusinessForm({
  business,
  onClose,
}: {
  business: Business;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="glass-panel space-y-4 p-5"
      action={(fd) => {
        startTransition(async () => {
          await updateBusiness(fd);
          onClose();
        });
      }}
    >
      <input type="hidden" name="id" value={business.id} />
      <h3 className="text-sm font-semibold">
        Edit: <span className="text-electric">{business.name}</span>
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Name</label>
          <input
            name="name"
            defaultValue={business.name}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Status</label>
          <select
            name="status"
            defaultValue={business.status}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            <option value="active">Active</option>
            <option value="approved">Approved</option>
            <option value="flagged">Flagged</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          Save
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function BusinessesManager({
  initialBusinesses,
}: {
  initialBusinesses: Business[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [, startTransition] = useTransition();

  const businesses = initialBusinesses.filter((b) => {
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (statusFilter && b.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Search</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
            placeholder="Search by name..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="approved">Approved</option>
            <option value="flagged">Flagged</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {editingBusiness && (
        <EditBusinessForm
          business={editingBusiness}
          onClose={() => setEditingBusiness(null)}
        />
      )}

      {/* Business grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {businesses.map((biz) => {
          const taskCount = biz.completed_tasks?.length ?? 0;
          return (
            <div key={biz.id} className="glass-panel p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {biz.name}
                  </h3>
                  <p className="text-xs text-slate-500 capitalize">{biz.type}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase ${
                    STATUS_COLORS[biz.status] ?? STATUS_COLORS.active
                  }`}
                >
                  {biz.status}
                </span>
              </div>

              <div className="text-xs text-slate-400">
                <p>{taskCount} tasks completed</p>
                <p className="text-slate-500">
                  Created{" "}
                  {new Date(biz.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-white/5">
                <div
                  className="h-1.5 rounded-full bg-electric transition-all"
                  style={{ width: `${Math.min(taskCount * 10, 100)}%` }}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingBusiness(biz)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newStatus =
                      biz.status === "flagged" ? "active" : "flagged";
                    const fd = new FormData();
                    fd.set("id", biz.id);
                    fd.set("status", newStatus);
                    startTransition(() => updateBusiness(fd));
                  }}
                >
                  {biz.status === "flagged" ? "Unflag" : "Flag"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const fd = new FormData();
                    fd.set("id", biz.id);
                    fd.set("status", "approved");
                    startTransition(() => updateBusiness(fd));
                  }}
                >
                  Approve
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {businesses.length === 0 && (
        <div className="glass-panel p-8 text-center text-sm text-slate-500">
          No businesses match the current filters.
        </div>
      )}
    </div>
  );
}
