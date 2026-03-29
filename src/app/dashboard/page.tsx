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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
      helper: "Create as many business journeys as you need",
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
          <Card variant="outline" className="relative flex flex-wrap items-center justify-between gap-3 border-[var(--warning)]/30 bg-[var(--warning)]/10 px-5 py-3 text-sm animate-fade-in">
            <p className="text-[var(--warning-light)]">
              Impersonating <span className="font-semibold text-[var(--text-primary)]">{activeProfile.email}</span>
            </p>
            <Link href="/dashboard" className="text-[var(--text-primary)] underline underline-offset-4 hover:text-[var(--warning-light)]">
              Exit impersonation
            </Link>
          </Card>
        )}

        {pendingInvitations.length > 0 && (
          <Card variant="elevated" className="space-y-4 border-[var(--warning)]/20 bg-[var(--warning)]/5 px-5 py-5 animate-fade-in">
            <div>
              <Badge variant="warning" className="mb-2">Invitations</Badge>
              <h2 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">Pending team invites</h2>
              <p className="text-sm text-[var(--text-secondary)]">Approve or reject access before joining a business.</p>
            </div>
            <div className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <Card
                  key={invitation.id}
                  variant="solid"
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {invitation.business_name ?? "Business invitation"}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
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
                      <Button type="submit" size="sm">
                        Accept
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await rejectBusinessInvitationAction({
                          invitationId: invitation.id,
                        });
                      }}
                    >
                      <Button type="submit" variant="secondary" size="sm">
                        Reject
                      </Button>
                    </form>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        <Card variant="gradient" hover="lift" padding="lg" className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10 animate-fade-up">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--electric)]/10 blur-3xl" aria-hidden />
          <div className="space-y-5 relative z-10 flex-1">
            <Badge variant="default" className="uppercase tracking-widest">Your readiness HQ</Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold sm:text-4xl text-[var(--text-primary)]">
                Let&apos;s get every business digital-ready
              </h1>
              <p className="text-base text-[var(--text-secondary)]">
                Centralize launch plans, measure real momentum, and keep each journey on track with guided tasks.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {stats.map((stat) => (
                <Card
                  key={stat.label}
                  variant="solid"
                  hover="scale"
                  padding="sm"
                  className="min-w-[160px] flex-1"
                >
                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-tertiary)]">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {typeof stat.value === "number"
                      ? stat.value.toLocaleString()
                      : stat.value}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">{stat.helper}</p>
                </Card>
              ))}
            </div>
            {hasBusinesses && (
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
                <AddBusinessDialog disabled={false} />
                <span>Create a roadmap in seconds</span>
              </div>
            )}
          </div>

          <Card variant="elevated" className="relative w-full overflow-hidden lg:w-1/3">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--electric)]/20 blur-3xl" aria-hidden />
            <div className="relative space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-secondary)]">
                {highlightBusiness ? "Latest checkpoint" : "Blueprint"}
              </p>
              {highlightBusiness ? (
                <>
                  <h3 className="text-2xl font-semibold text-[var(--text-primary)]">
                    {highlightBusiness.business.name}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {highlightBusiness.completion.completed}/{highlightBusiness.completion.total} tasks complete ·
                    {" "}
                    {highlightBusiness.completion.percentage}% readiness
                  </p>
                  {highlightBusiness.completion.total > 0 && (
                    <Progress 
                      value={highlightBusiness.completion.percentage} 
                      className="h-2 mt-2"
                    />
                  )}
                  <Link
                    href={`/business/${highlightBusiness.business.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--electric)] transition hover:text-[var(--text-primary)]"
                  >
                    Resume journey ↗
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-semibold text-[var(--text-primary)]">No journeys yet</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Add your first business to unlock guided milestones, checklists, and launch rituals.
                  </p>
                </>
              )}
            </div>
          </Card>
        </Card>

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Badge variant="default" className="uppercase tracking-widest mb-2">Journeys</Badge>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Active businesses</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {hasBusinesses
                  ? "Every card shows where momentum is compounding."
                  : "Launch your first roadmap to see progress here."}
              </p>
            </div>
            {!hasBusinesses && null}
          </div>

          {hasBusinesses ? (
            <section className="grid gap-6 md:grid-cols-2 stagger-children">
              {businessesWithProgress.map(({ business, completion }) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  completion={completion}
                />
              ))}
            </section>
          ) : (
            <Card variant="gradient" className="flex flex-col gap-4 p-10 text-center animate-fade-up">
              <Badge variant="default" className="uppercase tracking-widest mx-auto">No businesses yet</Badge>
              <h2 className="text-3xl font-semibold text-[var(--text-primary)]">Start your first roadmap</h2>
              <p className="text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
                Add a business to unlock tailored checklists, wizard flows, and vetted vendor recommendations for every launch milestone.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center mt-4">
                <AddBusinessDialog disabled={false} />
              </div>
            </Card>
          )}
        </section>

        {hasBusinesses && highlightBusiness && (
          <Card variant="solid" className="flex flex-wrap items-center justify-between gap-4 animate-fade-up delay-200">
            <p className="text-sm text-[var(--text-secondary)]">
              Each task includes <strong className="text-[var(--text-primary)]">why</strong>/<strong className="text-[var(--text-primary)]">how</strong> context and vetted tools. Keep cadence by revisiting your most recent business.
            </p>
            <Link
              href={`/business/${highlightBusiness.business.id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--electric)] transition hover:text-[var(--text-primary)]"
            >
              Jump into {highlightBusiness.business.name} ↗
            </Link>
          </Card>
        )}
      </main>
    </div>
  );
}
