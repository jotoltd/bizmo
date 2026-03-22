import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { getBusiness, getBusinessTeam } from "@/lib/business";
import { TopNav } from "@/components/layout/top-nav";
import { BusinessExperience } from "@/components/business/experience";

type BusinessPageProps = {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ onboarding?: string }>;
};

export default async function BusinessPage({ params, searchParams }: BusinessPageProps) {
  const { businessId } = await params;
  const query = await searchParams;
  const profile = await requireProfile();
  const [business, team] = await Promise.all([
    getBusiness(profile.id, businessId),
    getBusinessTeam(profile.id, businessId),
  ]);

  if (!business) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <TopNav email={profile.email} plan={profile.plan} role={profile.role} />
      <BusinessExperience
        business={business}
        plan={profile.plan}
        team={team}
        canManageTeam={business.user_id === profile.id || profile.role === "admin"}
        showOnboarding={query.onboarding === "1"}
      />
    </div>
  );
}
