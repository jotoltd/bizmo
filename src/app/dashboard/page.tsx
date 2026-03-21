import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { getBusinesses } from "@/lib/business";
import { calculateProgress } from "@/lib/checklist";
import { TopNav } from "@/components/layout/top-nav";
import { AddBusinessDialog } from "@/components/dashboard/add-business-dialog";
import { BusinessCard } from "@/components/business/business-card";

export default async function DashboardPage() {
  const profile = await requireProfile();
  const businesses = await getBusinesses(profile.id);
  const businessesWithProgress = businesses.map((business) => ({
    business,
    completion: calculateProgress(profile.plan, business.completed_tasks ?? []),
  }));

  const freePlanLimitReached =
    profile.plan === "free" && businessesWithProgress.length >= 1;

  return (
    <div className="min-h-screen">
      <TopNav email={profile.email} plan={profile.plan} />
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-electric">
              Your readiness HQ
            </p>
            <h1 className="text-3xl font-semibold">
              Let&apos;s get every business digital-ready
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Track progress, unlock playbooks, and keep each launch on pace.
            </p>
          </div>
          <AddBusinessDialog disabled={freePlanLimitReached} />
        </section>

        {businessesWithProgress.length ? (
          <section className="grid gap-6 md:grid-cols-2">
            {businessesWithProgress.map(({ business, completion }) => (
              <BusinessCard
                key={business.id}
                business={business}
                completion={completion}
                plan={profile.plan}
              />
            ))}
          </section>
        ) : (
          <section className="glass-panel p-10 text-center space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-electric">
              No businesses yet
            </p>
            <h2 className="text-3xl font-semibold">Start your first roadmap</h2>
            <p className="text-sm text-slate-400">
              Add a business to unlock tailored checklists and wizard flows for
              every launch milestone.
            </p>
            <AddBusinessDialog disabled={freePlanLimitReached} />
            {profile.plan === "free" && (
              <p className="text-xs text-slate-500">
                Free plan includes one business. Upgrade via the banner in the
                top nav when you’re ready for more.
              </p>
            )}
          </section>
        )}

        {businessesWithProgress.length > 0 && (
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-5 py-3">
            <p className="text-sm text-slate-400">
              Each task has &ldquo;why&rdquo; and &ldquo;how&rdquo; steps, plus vetted tools to speed things up.
            </p>
            <Link
              href={`/business/${businessesWithProgress[0].business.id}`}
              className="text-sm font-semibold text-electric hover:text-white"
            >
              Jump into latest business ↗
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}
