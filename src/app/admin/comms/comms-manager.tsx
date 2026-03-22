"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  upsertAnnouncement,
  deleteAnnouncement,
  sendNotification,
} from "@/lib/admin/actions";
import type { Announcement } from "@/types";

const AUDIENCES = [
  { value: "all", label: "All Users" },
  { value: "free", label: "Free Plan" },
  { value: "pro", label: "Pro Plan" },
  { value: "freelancer", label: "Freelancers" },
  { value: "agency", label: "Agencies" },
  { value: "enterprise", label: "Enterprise" },
];

// ── Announcement Form ────────────────────────────────────

function AnnouncementForm({
  announcement,
  onClose,
}: {
  announcement?: Announcement;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="glass-panel space-y-4 p-5"
      action={(fd) => {
        startTransition(async () => {
          await upsertAnnouncement(fd);
          onClose();
        });
      }}
    >
      {announcement && (
        <input type="hidden" name="id" value={announcement.id} />
      )}
      <h3 className="text-sm font-semibold">
        {announcement ? "Edit Announcement" : "New Announcement"}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Title</label>
          <input
            name="title"
            defaultValue={announcement?.title}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
            placeholder="Announcement title"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Audience</label>
          <select
            name="audience"
            defaultValue={announcement?.audience ?? "all"}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            {AUDIENCES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-slate-400">Body</label>
        <textarea
          name="body"
          defaultValue={announcement?.body}
          required
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
          placeholder="Write your announcement..."
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            name="published"
            defaultChecked={announcement?.published ?? false}
            className="accent-electric"
          />
          Publish immediately
        </label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {announcement ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Notification Broadcast Form ──────────────────────────

function NotificationForm({ onClose }: { onClose: () => void }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="glass-panel space-y-4 p-5"
      action={(fd) => {
        startTransition(async () => {
          await sendNotification(fd);
          onClose();
        });
      }}
    >
      <h3 className="text-sm font-semibold">Broadcast Notification</h3>
      <p className="text-xs text-slate-500">
        This sends an in-app notification to every user in the selected segment.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Title</label>
          <input
            name="title"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
            placeholder="Notification title"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Audience</label>
          <select
            name="audience"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            {AUDIENCES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-slate-400">Body</label>
        <textarea
          name="body"
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
          placeholder="Optional body text..."
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          Send to Segment
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Main Manager ─────────────────────────────────────────

export function CommsManager({
  initialAnnouncements,
}: {
  initialAnnouncements: Announcement[];
}) {
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<
    Announcement | undefined
  >();
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <div className="space-y-10">
      {/* Announcements */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Announcements</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNotificationForm(true)}
            >
              Broadcast Notification
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingAnnouncement(undefined);
                setShowAnnouncementForm(true);
              }}
            >
              + New Announcement
            </Button>
          </div>
        </div>

        {showAnnouncementForm && (
          <AnnouncementForm
            announcement={editingAnnouncement}
            onClose={() => {
              setShowAnnouncementForm(false);
              setEditingAnnouncement(undefined);
            }}
          />
        )}

        {showNotificationForm && (
          <NotificationForm onClose={() => setShowNotificationForm(false)} />
        )}

        <div className="space-y-3">
          {initialAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="glass-panel p-5 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">
                      {ann.title}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase ${
                        ann.published
                          ? "bg-green-500/20 text-green-400"
                          : "bg-white/10 text-slate-400"
                      }`}
                    >
                      {ann.published ? "Published" : "Draft"}
                    </span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[0.6rem] text-slate-400 capitalize">
                      {ann.audience}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingAnnouncement(ann);
                      setShowAnnouncementForm(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("Delete this announcement?")) {
                        startTransition(() => deleteAnnouncement(ann.id));
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">
                {ann.body}
              </p>
            </div>
          ))}

          {initialAnnouncements.length === 0 && (
            <div className="glass-panel p-8 text-center text-sm text-slate-500">
              No announcements yet. Create one to engage your users.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
