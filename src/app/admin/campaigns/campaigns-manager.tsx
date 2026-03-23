"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  getEmailCampaigns,
  upsertEmailCampaign,
  sendCampaignNow,
  deleteCampaign,
} from "@/lib/admin/extended-actions";

type Campaign = {
  id: string;
  name: string;
  subject: string;
  audience: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "paused" | "failed";
  scheduled_at: string | null;
  sent_at: string | null;
  sent_count: number;
  opened_count: number;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-500/20 text-slate-400",
  scheduled: "bg-amber-500/20 text-amber-400",
  sending: "bg-electric/20 text-electric",
  sent: "bg-green-500/20 text-green-400",
  paused: "bg-red-500/20 text-red-400",
  failed: "bg-red-500/20 text-red-400",
};

export function CampaignsManager({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredCampaigns = campaigns.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });

  const handleSend = (id: string) => {
    startTransition(async () => {
      await sendCampaignNow(id);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this campaign?")) {
      startTransition(async () => {
        await deleteCampaign(id);
        router.refresh();
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-end gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
            >
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sent">Sent</option>
            </select>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingCampaign(null);
            setShowForm(true);
          }}
          size="sm"
        >
          + New Campaign
        </Button>
      </div>

      {showForm && (
        <CampaignForm
          campaign={editingCampaign}
          onClose={() => {
            setShowForm(false);
            setEditingCampaign(null);
          }}
        />
      )}

      <div className="space-y-3">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="glass-panel p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{campaign.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase ${STATUS_COLORS[campaign.status]}`}>
                    {campaign.status}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{campaign.subject}</p>
                <p className="text-xs text-slate-500">
                  Audience: {campaign.audience} · Created: {new Date(campaign.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                {campaign.status === "draft" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSend(campaign.id)}
                    disabled={isPending}
                  >
                    Send Now
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingCampaign(campaign);
                    setShowForm(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(campaign.id)}
                  disabled={isPending}
                >
                  Delete
                </Button>
              </div>
            </div>

            {campaign.status === "sent" && (
              <div className="flex gap-4 text-xs text-slate-400">
                <span>Sent: {campaign.sent_count.toLocaleString()}</span>
                <span>Opened: {campaign.opened_count.toLocaleString()}</span>
                <span>
                  Rate: {campaign.sent_count > 0 ? Math.round((campaign.opened_count / campaign.sent_count) * 100) : 0}%
                </span>
              </div>
            )}
          </div>
        ))}

        {filteredCampaigns.length === 0 && (
          <div className="glass-panel p-8 text-center text-sm text-slate-500">
            No campaigns found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}

function CampaignForm({
  campaign,
  onClose,
}: {
  campaign: Campaign | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="glass-panel space-y-4 p-5"
      action={(formData) => {
        startTransition(async () => {
          await upsertEmailCampaign(formData);
          onClose();
          router.refresh();
        });
      }}
    >
      <h3 className="text-sm font-semibold">
        {campaign ? "Edit Campaign" : "New Campaign"}
      </h3>
      {campaign && <input type="hidden" name="id" value={campaign.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Name</label>
          <input
            name="name"
            defaultValue={campaign?.name}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
            placeholder="Newsletter March 2026"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Subject</label>
          <input
            name="subject"
            defaultValue={campaign?.subject}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
            placeholder="Your monthly update"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Audience</label>
          <select
            name="audience"
            defaultValue={campaign?.audience || "all"}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            <option value="all">All Users</option>
            <option value="free">Free Plan</option>
            <option value="pro">Pro Plan</option>
            <option value="freelancer">Freelancers</option>
            <option value="agency">Agencies</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Status</label>
          <select
            name="status"
            defaultValue={campaign?.status || "draft"}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Schedule At</label>
          <input
            name="scheduled_at"
            type="datetime-local"
            defaultValue={campaign?.scheduled_at?.slice(0, 16)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400">HTML Body</label>
        <textarea
          name="body_html"
          defaultValue={campaign?.subject}
          required
          rows={6}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
          placeholder="<html>...</html>"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : campaign ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
