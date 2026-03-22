import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { getBusiness } from "@/lib/business";
import { TopNav } from "@/components/layout/top-nav";
import { BusinessExperience } from "@/components/business/experience";

type BusinessPageProps = {
  params: Promise<{ businessId: string }>;
};

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { businessId } = await params;
  const profile = await requireProfile();
  const business = await getBusiness(profile.id, businessId);

  if (!business) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <TopNav email={profile.email} plan={profile.plan} role={profile.role} />
      <BusinessExperience business={business} plan={profile.plan} />
    </div>
  );
}
