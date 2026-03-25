import Link from "next/link";
import {
  acceptBusinessInvitationAction,
  rejectBusinessInvitationAction,
} from "@/app/dashboard/actions";
import { requireProfile } from "@/lib/auth";
import { getBusinesses, getPendingBusinessInvitations } from "@/lib/business";
import { calculateProgress } from "@/lib/checklist";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/layout/top-nav";
import { AddBusinessDialog } from "@/components/dashboard/add-business-dialog";
import { BusinessCard } from "@/components/business/business-card";

type DashboardPageProps = {
  searchParams: Promise<{ impersonate?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const profile = await requireProfile();

  let activeProfile = profile;
  let isImpersonating = false;

  if (profile.role === "admin" && params.impersonate) {
    const supabase = await createSupabaseServerClient();
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("id, email, plan, role, user_type, last_active, suspended")
      .eq("id", params.impersonate)
      .maybeSingle();

    if (targetProfile) {
      activeProfile = targetProfile;
      isImpersonating = targetProfile.id !== profile.id;
    }
  }

  const [businesses, pendingInvitations] = await Promise.all([
    getBusinesses(activeProfile.id),
    getPendingBusinessInvitations(activeProfile.id),
  ]);
  const businessesWithProgress = businesses.map((business) => ({
    business,
    completion: calculateProgress(activeProfile.plan, business.completed_tasks ?? []),
  }));

  const freePlanLimitReached =
    activeProfile.plan === "free" && businessesWithProgress.length >= 1;
  const hasBusinesses = businessesWithProgress.length > 0;

  const averageCompletion = hasBusinesses
    ? Math.round(
        businessesWithProgress.reduce(
          (total, { completion }) => total + completion.percentage,
          0
        ) / businessesWithProgress.length
      )
    : 0;

  const totalCompletedTasks = businessesWithProgress.reduce(
    (acc, { completion }) => acc + completion.completed,
    0
  );
  const totalTasks = businessesWithProgress.reduce(
    (acc, { completion }) => acc + completion.total,
    0
  );

  const highlightBusiness = businessesWithProgress[0];

  const stats = [
    {
      label: "Active businesses",
      value: businessesWithProgress.length,
      helper:
        activeProfile.plan === "free"
          ? "Free plan limited to one journey"
          : "Unlimited journeys on Pro",
    },
    {
      label: "Avg. readiness",
      value: hasBusinesses ? `${averageCompletion}%` : "—",
      helper: hasBusinesses ? "Across every active business" : "Start your first roadmap",
    },
    {
      label: "Tasks shipped",
      value: totalCompletedTasks,
      helper:
        totalTasks > 0
          ? `${totalCompletedTasks}/${totalTasks} tasks finished`
          : "Checklist progress will appear here",
    },
  ];

  return (
    <div className="min-h-screen">
      <TopNav 
        email={profile.email} 
        plan={activeProfile.plan} 
        role={profile.role} 
        invitations={pendingInvitations}
        onAcceptInvitation={async (invitationId: string) => {
          "use server";
          await acceptBusinessInvitationAction({ invitationId });
        }}
        onRejectInvitation={async (invitationId: string) => {
          "use server";
          await rejectBusinessInvitationAction({ invitationId });
        }}
      />
      <main className="relative mx-auto max-w-6xl px-4 py-10 space-y-10 lg:py-12">
        <div className="grid-mask absolute inset-0 opacity-40" aria-hidden />

        {isImpersonating && (
          <section className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-electric/30 bg-electric/10 px-5 py-3 text-sm">
            <p className="text-electric">
              Impersonating <span className="font-semibold text-white">{activeProfile.email}</span>
            </p>
            <Link href="/dashboard" className="text-white underline underline-offset-4 hover:text-electric">
              Exit impersonation
            </Link>
          </section>
        )}

        {pendingInvitations.length > 0 && (
          <section className="space-y-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Invitations</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Pending team invites</h2>
              <p className="text-sm text-slate-300">Approve or reject access before joining a business.</p>
            </div>
            <div className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {invitation.business_name ?? "Business invitation"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Invited as {invitation.role} · {invitation.invited_email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form
                      action={async () => {
                        "use server";
                        await acceptBusinessInvitationAction({
                          invitationId: invitation.id,
                        });
                      }}
                    >
                      <button className="rounded-lg bg-electric px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110">
                        Accept
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await rejectBusinessInvitationAction({
                          invitationId: invitation.id,
                        });
                      }}
                    >
                      <button className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:text-white">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="relative flex flex-col gap-8 rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-8 shadow-[0_20px_60px_rgba(3,7,18,0.65)] lg:flex-row lg:items-center lg:gap-10 lg:px-10">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.5em] text-electric">
              Your readiness HQ
            </p>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold sm:text-4xl">
                Let&apos;s get every business digital-ready
              </h1>
              <p className="text-base text-slate-400">
                Centralize launch plans, measure real momentum, and keep each journey on track with guided tasks.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="min-w-[160px] flex-1 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4"
                >
                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold text-white">
                    {typeof stat.value === "number"
                      ? stat.value.toLocaleString()
                      : stat.value}
                  </p>
                  <p className="text-xs text-slate-400">{stat.helper}</p>
                </div>
              ))}
            </div>
            {hasBusinesses && (
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <AddBusinessDialog disabled={freePlanLimitReached} />
                <span>
                  {freePlanLimitReached
                    ? "Upgrade to add more concurrent journeys"
                    : "Create a roadmap in seconds"}
                </span>
              </div>
            )}
          </div>

          <div className="glass-panel relative w-full overflow-hidden border-white/5 px-6 py-6 sm:px-8 lg:w-1/3">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-electric/20 blur-3xl" aria-hidden />
            <div className="relative space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                {highlightBusiness ? "Latest checkpoint" : "Blueprint"}
              </p>
              {highlightBusiness ? (
                <>
                  <h3 className="text-2xl font-semibold text-white">
                    {highlightBusiness.business.name}
                  </h3>
                  <p className="text-sm text-slate-300">
                    {highlightBusiness.completion.completed}/{highlightBusiness.completion.total} tasks complete ·
                    {" "}
                    {highlightBusiness.completion.percentage}% readiness
                  </p>
                  <Link
                    href={`/business/${highlightBusiness.business.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-electric transition hover:text-white"
                  >
                    Resume journey ↗
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-semibold text-white">No journeys yet</h3>
                  <p className="text-sm text-slate-300">
                    Add your first business to unlock guided milestones, checklists, and launch rituals.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-electric">Journeys</p>
              <h2 className="text-2xl font-semibold">Active businesses</h2>
              <p className="text-sm text-slate-400">
                {hasBusinesses
                  ? "Every card shows where momentum is compounding."
                  : "Launch your first roadmap to see progress here."}
              </p>
            </div>
            {!hasBusinesses && null}
          </div>

          {hasBusinesses ? (
            <section className="grid gap-6 md:grid-cols-2">
              {businessesWithProgress.map(({ business, completion }) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  completion={completion}
                  plan={activeProfile.plan}
                />
              ))}
            </section>
          ) : (
            <section className="glass-panel flex flex-col gap-4 p-10 text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-electric">
                No businesses yet
              </p>
              <h2 className="text-3xl font-semibold">Start your first roadmap</h2>
              <p className="text-sm text-slate-400">
                Add a business to unlock tailored checklists, wizard flows, and vetted vendor recommendations for every launch milestone.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                <AddBusinessDialog disabled={freePlanLimitReached} />
                {activeProfile.plan === "free" && (
                  <p className="text-xs text-slate-500">
                    Free plan includes one business. Upgrade whenever you need parallel launches.
                  </p>
                )}
              </div>
            </section>
          )}
        </section>

        {hasBusinesses && highlightBusiness && (
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-4">
            <p className="text-sm text-slate-300">
              Each task includes <strong className="text-white">why</strong>/<strong className="text-white">how</strong> context and vetted tools. Keep cadence by revisiting your most recent business.
            </p>
            <Link
              href={`/business/${highlightBusiness.business.id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-electric transition hover:text-white"
            >
              Jump into {highlightBusiness.business.name} ↗
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}
