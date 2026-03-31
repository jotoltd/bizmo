'use client';

import { useEffect, useState, useTransition } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  acceptBusinessInvitationAction,
  rejectBusinessInvitationAction,
} from "@/app/dashboard/actions";
import {
  getEmailPreferencesAction,
  updateEmailPreferencesAction,
} from "@/app/dashboard/actions-email";
import { uploadAvatar, removeAvatar, uploadBusinessLogo, removeBusinessLogo } from "@/lib/storage/actions";
import type { UserEmailPreferences, BusinessInvitation, UserRole, Business } from "@/types";

export default function SettingsPage({
  userId,
  email,
  role,
  avatarUrl,
  fullName,
  invitations,
  businesses,
}: {
  userId: string;
  email: string;
  role?: UserRole;
  avatarUrl: string | null;
  fullName: string | null;
  invitations: BusinessInvitation[];
  businesses: Business[];
}) {
  const [preferences, setPreferences] = useState<UserEmailPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, startSaving] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleAcceptInvitation = async (invitationId: string) => {
    await acceptBusinessInvitationAction({ invitationId });
  };

  const handleRejectInvitation = async (invitationId: string) => {
    await rejectBusinessInvitationAction({ invitationId });
  };

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
        <TopNav email={email} role={role} invitations={invitations} />
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
        role={role}
        invitations={invitations}
        onAcceptInvitation={handleAcceptInvitation}
        onRejectInvitation={handleRejectInvitation}
      />
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-slate-400">Manage your account preferences</p>
        </div>

        {/* Profile Photo */}
        <section className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-4">
            <ImageUpload
              currentImageUrl={avatarUrl}
              onUpload={uploadAvatar}
              onRemove={() => removeAvatar(userId)}
              entityId={userId}
              entityType="profile"
              size="lg"
              shape="circle"
            />
            <div>
              <h2 className="text-lg font-semibold">Profile Photo</h2>
              <p className="text-sm text-slate-400">
                Upload a photo to personalize your account
              </p>
            </div>
          </div>
        </section>

        {/* Business Logos */}
        {businesses.length > 0 && (
          <section className="glass-panel p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Business Logos</h2>
              <p className="text-sm text-slate-400">
                Add logos to your businesses
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {businesses.map((business) => (
                <div
                  key={business.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.03]"
                >
                  <ImageUpload
                    currentImageUrl={business.logo_url}
                    onUpload={(formData) => {
                      formData.append("userId", userId);
                      return uploadBusinessLogo(formData);
                    }}
                    onRemove={() => removeBusinessLogo(business.id, userId)}
                    entityId={business.id}
                    entityType="business"
                    size="md"
                    shape="square"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {business.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {business.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
