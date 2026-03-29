import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import {
  getBusiness,
  getBusinessActivityLog,
  getBusinessPendingInvitations,
  getBusinessTeam,
  getPendingBusinessInvitations,
  getPublishedRoadmap,
} from "@/lib/business";
import { TopNav } from "@/components/layout/top-nav";
import { BusinessExperience } from "@/components/business/experience";
import {
  acceptBusinessInvitationAction,
  rejectBusinessInvitationAction,
} from "@/app/dashboard/actions";

type BusinessPageProps = {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ onboarding?: string }>;
};

export default async function BusinessPage({ params, searchParams }: BusinessPageProps) {
  const { businessId } = await params;
  const query = await searchParams;
  const profile = await requireProfile();
  const [business, team, roadmap, pendingInvitations, userPendingInvitations, activityLog] = await Promise.all([
    getBusiness(profile.id, businessId),
    getBusinessTeam(profile.id, businessId),
    getPublishedRoadmap(),
    getBusinessPendingInvitations(profile.id, businessId),
    getPendingBusinessInvitations(profile.id),
    getBusinessActivityLog(profile.id, businessId),
  ]);

  if (!business) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <TopNav 
        email={profile.email} 
        role={profile.role} 
        invitations={userPendingInvitations}
        onAcceptInvitation={async (invitationId: string) => {
          "use server";
          await acceptBusinessInvitationAction({ invitationId });
        }}
        onRejectInvitation={async (invitationId: string) => {
          "use server";
          await rejectBusinessInvitationAction({ invitationId });
        }}
      />
      <BusinessExperience
        business={business}
        team={team}
        pendingInvitations={pendingInvitations}
        activityLog={activityLog}
        phases={roadmap.phases}
        steps={roadmap.steps}
        currentUserId={profile.id}
        canManageTeam={business.user_id === profile.id || profile.role === "admin"}
        showOnboarding={query.onboarding === "1"}
      />
    </div>
  );
}
