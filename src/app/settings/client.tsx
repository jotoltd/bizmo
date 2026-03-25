"use client";

import { useEffect, useState, useTransition } from "react";
import { TopNav } from "@/components/layout/top-nav";
import {
  acceptBusinessInvitationAction,
  rejectBusinessInvitationAction,
} from "@/app/dashboard/actions";
import {
  getEmailPreferencesAction,
  updateEmailPreferencesAction,
} from "@/app/dashboard/actions-email";
import type { UserEmailPreferences, BusinessInvitation } from "@/types";

export default function SettingsPage({
  invitations,
  email,
  plan,
  role,
}: {
  invitations: BusinessInvitation[];
  email: string;
  plan: string;
  role?: string;
}) {
  const [preferences, setPreferences] = useState<UserEmailPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, startSaving] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getEmailPreferencesAction().then((result) => {
      if (result.preferences) {
        setPreferences(result.preferences);
      } else {
        // Default preferences if none exist
        setPreferences({
          user_id: "",
          invitation_emails: true,
          invitation_response_emails: true,
          activity_emails: true,
          announcement_emails: true,
          updated_at: new Date().toISOString(),
        });
      }
      setLoading(false);
    });
  }, []);

  const handleToggle = (key: keyof Omit<UserEmailPreferences, "user_id" | "updated_at">) => {
    if (!preferences || saving) return;

    const newPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPreferences);

    startSaving(async () => {
      setMessage(null);
      const result = await updateEmailPreferencesAction({
        invitation_emails: newPreferences.invitation_emails,
        invitation_response_emails: newPreferences.invitation_response_emails,
        activity_emails: newPreferences.activity_emails,
        announcement_emails: newPreferences.announcement_emails,
      });

      if (result.error) {
        setMessage(result.error);
        setPreferences(preferences); // Revert on error
      } else {
        setMessage("Preferences saved.");
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <TopNav email={email} plan={plan as any} role={role as any} invitations={invitations} />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <p className="text-slate-400">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopNav
        email={email}
        plan={plan as any}
        role={role as any}
        invitations={invitations}
        onAcceptInvitation={async (invitationId: string) => {
          "use server";
          await acceptBusinessInvitationAction({ invitationId });
        }}
        onRejectInvitation={async (invitationId: string) => {
          "use server";
          await rejectBusinessInvitationAction({ invitationId });
        }}
      />
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-slate-400">Manage your account preferences</p>
        </div>

        <section className="glass-panel p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Email Preferences</h2>
            <p className="text-sm text-slate-400">
              Choose which emails you want to receive from us
            </p>
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.includes("error") || message.includes("Could not")
                  ? "text-rose-400"
                  : "text-green-400"
              }`}
            >
              {message}
            </p>
          )}

          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 cursor-pointer hover:bg-white/[0.05]">
              <div>
                <p className="font-medium">Invitation Emails</p>
                <p className="text-sm text-slate-400">
                  Receive emails when you&apos;re invited to join a business
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences?.invitation_emails ?? true}
                onChange={() => handleToggle("invitation_emails")}
                disabled={saving}
                className="h-5 w-5 cursor-pointer accent-electric"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 cursor-pointer hover:bg-white/[0.05]">
              <div>
                <p className="font-medium">Invitation Response Emails</p>
                <p className="text-sm text-slate-400">
                  Receive emails when someone accepts or declines your invitation
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences?.invitation_response_emails ?? true}
                onChange={() => handleToggle("invitation_response_emails")}
                disabled={saving}
                className="h-5 w-5 cursor-pointer accent-electric"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 cursor-pointer hover:bg-white/[0.05]">
              <div>
                <p className="font-medium">Activity Emails</p>
                <p className="text-sm text-slate-400">
                  Receive emails about team activity and updates
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences?.activity_emails ?? true}
                onChange={() => handleToggle("activity_emails")}
                disabled={saving}
                className="h-5 w-5 cursor-pointer accent-electric"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 cursor-pointer hover:bg-white/[0.05]">
              <div>
                <p className="font-medium">Announcement Emails</p>
                <p className="text-sm text-slate-400">
                  Receive product updates, tips, and announcements
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences?.announcement_emails ?? true}
                onChange={() => handleToggle("announcement_emails")}
                disabled={saving}
                className="h-5 w-5 cursor-pointer accent-electric"
              />
            </label>
          </div>
        </section>
      </main>
    </div>
  );
}
