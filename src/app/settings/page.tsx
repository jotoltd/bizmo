import { requireProfile } from "@/lib/auth";
import { getPendingBusinessInvitations } from "@/lib/business";
import SettingsPage from "./client";

export default async function Settings() {
  const profile = await requireProfile();
  const invitations = await getPendingBusinessInvitations(profile.id);

  return (
    <SettingsPage
      email={profile.email}
      plan={profile.plan}
      role={profile.role}
      invitations={invitations}
    />
  );
}
