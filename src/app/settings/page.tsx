import { requireProfile } from "@/lib/auth";
import { getPendingBusinessInvitations, getBusinesses } from "@/lib/business";
import SettingsPage from "./client";

export default async function Settings() {
  const profile = await requireProfile();
  const invitations = await getPendingBusinessInvitations(profile.id);
  const businesses = await getBusinesses(profile.id);

  return (
    <SettingsPage
      userId={profile.id}
      email={profile.email}
      role={profile.role}
      avatarUrl={profile.avatar_url}
      fullName={profile.full_name}
      invitations={invitations}
      businesses={businesses}
    />
  );
}
