"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import type {
  Business,
  BusinessActivityLog,
  BusinessInvitation,
  BusinessTeamMember,
  RoadmapPhase,
  RoadmapStep,
} from "@/types";
import { cn, percent } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import {
  cancelBusinessInvitationAction,
  inviteBusinessMemberAction,
  removeBusinessMemberAction,
  resendBusinessInvitationAction,
  toggleTaskCompletionAction,
  transferBusinessOwnershipAction,
  updateBusinessViewAction,
  updateBusinessMemberRoleAction,
} from "@/app/dashboard/actions";

const VIEW_MODES = [
  { id: "checklist", label: "Checklist" },
  { id: "wizard", label: "Wizard" },
] as const;

type ViewMode = (typeof VIEW_MODES)[number]["id"];

export const BusinessExperience = ({
  business,
  team,
  pendingInvitations,
  activityLog,
  phases,
  steps,
  currentUserId,
  canManageTeam,
  showOnboarding,
}: {
  business: Business;
  team: BusinessTeamMember[];
  pendingInvitations: BusinessInvitation[];
  activityLog: BusinessActivityLog[];
  phases: RoadmapPhase[];
  steps: RoadmapStep[];
  currentUserId: string;
  canManageTeam: boolean;
  showOnboarding?: boolean;
}) => {
  const stepsByPhase = useMemo(() => {
    const grouped = new Map<string, RoadmapStep[]>();
    phases.forEach((phase) => grouped.set(phase.id, []));
    steps.forEach((step) => {
      const list = grouped.get(step.phase_id) || [];
      list.push(step);
      grouped.set(step.phase_id, list);
    });
    return grouped;
  }, [phases, steps]);

  const flatSteps = useMemo(() => {
    return phases.flatMap((phase) => {
      const phaseSteps = stepsByPhase.get(phase.id) || [];
      return phaseSteps.map((step) => ({
        ...step,
        phaseTitle: phase.title,
      }));
    });
  }, [phases, stepsByPhase]);

  const [view, setView] = useState<ViewMode>(
    (business.view_preference as ViewMode) ?? "checklist"
  );
  const [completedTasks, setCompletedTasks] = useState<string[]>(
    business.completed_tasks ?? []
  );
  const [wizardIndex, setWizardIndex] = useState(() => {
    if (!flatSteps.length) return 0;
    const completedSet = new Set(business.completed_tasks ?? []);
    const firstIncomplete = flatSteps.findIndex(
      (step) => !completedSet.has(step.id)
    );
    return firstIncomplete >= 0 ? firstIncomplete : 0;
  });
  const [message, setMessage] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<BusinessTeamMember[]>(team);
  const [pendingTeamInvitations, setPendingTeamInvitations] = useState<BusinessInvitation[]>(
    pendingInvitations
  );
  const [teammateEmail, setTeammateEmail] = useState("");
  const [teamMessage, setTeamMessage] = useState<string | null>(null);
  const [pendingTask, setPendingTask] = useState<string | null>(null);
  const [pendingInvitationId, setPendingInvitationId] = useState<string | null>(null);
  const [resendingInvitationId, setResendingInvitationId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [transferringOwnerId, setTransferringOwnerId] = useState<string | null>(null);
  const [invitePending, startInviteTransition] = useTransition();
  const [viewPending, startViewTransition] = useTransition();
  const [taskPending, startTaskTransition] = useTransition();

  const completedSet = useMemo(
    () => new Set<string>(completedTasks ?? []),
    [completedTasks]
  );

  const progress = useMemo(() => {
    const total = flatSteps.length;
    const completed = flatSteps.filter((step) =>
      completedSet.has(step.id)
    ).length;
    const ratio = total ? completed / total : 0;
    return {
      total,
      completed,
      ratio,
      percentage: Math.round(ratio * 100),
    };
  }, [flatSteps, completedSet]);

  const phaseProgress = useMemo(() => {
    return phases.map((phase) => {
      const phaseSteps = stepsByPhase.get(phase.id) || [];
      const total = phaseSteps.length;
      const completed = phaseSteps.filter((step) =>
        completedSet.has(step.id)
      ).length;
      return {
        id: phase.id,
        title: phase.title,
        description: phase.description ?? "",
        total,
        completed,
        percentage: total ? Math.round((completed / total) * 100) : 0,
      };
    });
  }, [phases, stepsByPhase, completedSet]);

  const handleInviteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = teammateEmail.trim().toLowerCase();
    if (!email) return;

    startInviteTransition(async () => {
      setTeamMessage(null);
      const result = await inviteBusinessMemberAction({
        businessId: business.id,
        email,
      });

      if (result?.error) {
        setTeamMessage(result.error);
        return;
      }

      setTeammateEmail("");
      setPendingTeamInvitations((prev) => [
        {
          id: result?.invitationId ?? `pending-${email}`,
          business_id: business.id,
          invited_user_id: "",
          invited_email: email,
          invited_by: business.user_id,
          role: "member",
          status: "pending",
          responded_at: null,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setTeamMessage(
        result?.warning ?? "Invitation sent. They will join after they accept."
      );
    });
  };

  const handleRoleChange = (memberUserId: string, role: "admin" | "member") => {
    setUpdatingRoleId(memberUserId);
    startInviteTransition(async () => {
      const result = await updateBusinessMemberRoleAction({
        businessId: business.id,
        userId: memberUserId,
        role,
      });

      if (result?.error) {
        setTeamMessage(result.error);
      } else {
        setTeamMembers((prev) =>
          prev.map((member) =>
            member.user_id === memberUserId
              ? {
                  ...member,
                  role,
                }
              : member
          )
        );
        setTeamMessage("Member role updated.");
      }

      setUpdatingRoleId(null);
    });
  };

  const handleTransferOwnership = (newOwnerId: string) => {
    setTransferringOwnerId(newOwnerId);
    startInviteTransition(async () => {
      const result = await transferBusinessOwnershipAction({
        businessId: business.id,
        newOwnerId,
      });

      if (result?.error) {
        setTeamMessage(result.error);
      } else {
        setTeamMembers((prev) =>
          prev.map((member) => {
            if (member.user_id === currentUserId) {
              return { ...member, role: "admin" };
            }

            if (member.user_id === newOwnerId) {
              return { ...member, role: "owner" };
            }

            return member;
          })
        );
        setTeamMessage("Ownership transferred.");
      }

      setTransferringOwnerId(null);
    });
  };

  const formatActivityLabel = (entry: BusinessActivityLog) => {
    switch (entry.action) {
      case "member_invited":
        return "Invited a teammate";
      case "member_joined":
        return "A teammate joined";
      case "member_removed":
        return "Removed a teammate";
      case "role_changed":
        return "Updated teammate role";
      case "ownership_transferred":
        return "Transferred ownership";
      case "invitation_cancelled":
        return "Cancelled invitation";
      case "invitation_expired":
        return "Invitation expired";
      case "invitation_resent":
        return "Resent invitation";
      default:
        return entry.action;
    }
  };

  const handleCancelInvitation = (invitationId: string) => {
    setPendingInvitationId(invitationId);
    startInviteTransition(async () => {
      const result = await cancelBusinessInvitationAction({ invitationId });
      if (result?.error) {
        setTeamMessage(result.error);
      } else {
        setPendingTeamInvitations((prev) => prev.filter((invite) => invite.id !== invitationId));
        setTeamMessage("Invitation cancelled.");
      }
      setPendingInvitationId(null);
    });
  };

  const handleResendInvitation = (invitationId: string) => {
    setResendingInvitationId(invitationId);
    startInviteTransition(async () => {
      const result = await resendBusinessInvitationAction({ invitationId });
      setTeamMessage(result?.error ?? "Invitation email resent.");
      setResendingInvitationId(null);
    });
  };

  const handleRemoveMember = (memberUserId: string) => {
    setRemovingMemberId(memberUserId);
    startInviteTransition(async () => {
      const result = await removeBusinessMemberAction({
        businessId: business.id,
        userId: memberUserId,
      });
      if (result?.error) {
        setTeamMessage(result.error);
      } else {
        setTeamMembers((prev) => prev.filter((member) => member.user_id !== memberUserId));
        setTeamMessage("Team member removed.");
      }
      setRemovingMemberId(null);
    });
  };

  const wizardStep = flatSteps[wizardIndex];
  const nextStep = wizardStep ?? flatSteps.find((step) => !completedSet.has(step.id));
  const nextAffiliate = nextStep?.affiliate_link
    ? { url: nextStep.affiliate_link, label: nextStep.affiliate_name || "Get Started ↗" }
    : null;

  const handleViewSwitch = (mode: ViewMode) => {
    if (mode === view) return;
    const previous = view;
    setView(mode);
    startViewTransition(async () => {
      const result = await updateBusinessViewAction({
        businessId: business.id,
        view: mode,
      });
      if (result?.error) {
        setView(previous);
        setMessage(result.error);
      } else {
        setMessage(null);
      }
    });
  };

  const handleTaskToggle = (taskId: string, checked: boolean) => {
    setMessage(null);
    setPendingTask(taskId);
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (checked) next.add(taskId);
      else next.delete(taskId);
      return Array.from(next);
    });

    startTaskTransition(async () => {
      const result = await toggleTaskCompletionAction({
        businessId: business.id,
        taskId,
        completed: checked,
      });

      if (result?.error) {
        setMessage(result.error);
        setCompletedTasks((prev) => {
          const next = new Set(prev);
          if (checked) next.delete(taskId);
          else next.add(taskId);
          return Array.from(next);
        });
      } else if (result?.completedTasks) {
        setCompletedTasks(result.completedTasks);
      }
      setPendingTask(null);
    });
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">
            {business.type}
          </p>
          <h1 className="text-3xl font-semibold">{business.name}</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 p-1">
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleViewSwitch(mode.id)}
              className={cn(
                "px-4 py-1.5 text-sm font-semibold rounded-full transition-colors",
                view === mode.id
                  ? "bg-electric text-black"
                  : "text-slate-400 hover:text-white"
              )}
              disabled={viewPending}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {showOnboarding && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl border-electric/30 bg-gradient-to-br from-electric/10 to-purple-500/5 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-electric">New business onboarding</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Welcome to your business! 🎉</h2>
            </div>
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              🚀
            </motion.div>
          </div>
          <p className="text-slate-300 mb-4">Follow these steps to get started with {business.name}:</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="group rounded-xl border border-white/10 bg-black/20 p-4 hover:border-electric/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-electric/20 flex items-center justify-center text-sm">1</div>
                <span className="text-sm font-medium text-white">Pick your view</span>
              </div>
              <p className="text-xs text-slate-400">Choose between checklist or wizard mode</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="group rounded-xl border border-white/10 bg-black/20 p-4 hover:border-electric/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm">2</div>
                <span className="text-sm font-medium text-white">Complete tasks</span>
              </div>
              <p className="text-xs text-slate-400">Start with your first 3 priority items</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="group rounded-xl border border-white/10 bg-black/20 p-4 hover:border-electric/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-sm">3</div>
                <span className="text-sm font-medium text-white">Invite team</span>
              </div>
              <p className="text-xs text-slate-400">Add teammates to collaborate</p>
            </motion.div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-electric animate-pulse" />
            Tip: Click any step to see detailed guidance on how to complete it
          </div>
        </motion.section>
      )}

      <section className="glass-panel p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Team</p>
            <h2 className="text-lg font-semibold text-white">People in this business</h2>
          </div>
          <span className="text-sm text-slate-400">
            {teamMembers.length} member(s)
            {pendingTeamInvitations.length > 0 ? ` · ${pendingTeamInvitations.length} pending` : ""}
          </span>
        </div>

        <div className="space-y-2">
          {teamMembers.map((member) => (
            <div
              key={`${member.user_id}-${member.email}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300"
            >
              <span>{member.email}</span>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/10 px-2 py-0.5 uppercase tracking-wide text-[0.65rem]">
                  {member.role}
                </span>
                {canManageTeam && member.user_id !== business.user_id && (
                  <>
                    <select
                      value={member.role}
                      onChange={(event) =>
                        handleRoleChange(
                          member.user_id,
                          event.target.value as "admin" | "member"
                        )
                      }
                      disabled={invitePending && updatingRoleId === member.user_id}
                      className="h-7 rounded-md border border-white/10 bg-black/40 px-2 text-[0.65rem] text-slate-200"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.user_id)}
                      disabled={invitePending && removingMemberId === member.user_id}
                      className="rounded-full border border-white/10 px-2 py-0.5 text-[0.65rem] text-white/80 transition hover:text-white disabled:opacity-50"
                    >
                      {invitePending && removingMemberId === member.user_id ? "Removing..." : "Remove"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTransferOwnership(member.user_id)}
                      disabled={invitePending && transferringOwnerId === member.user_id}
                      className="rounded-full border border-electric/30 bg-electric/10 px-2 py-0.5 text-[0.65rem] text-electric transition hover:bg-electric/20 disabled:opacity-50"
                    >
                      {invitePending && transferringOwnerId === member.user_id
                        ? "Transferring..."
                        : "Make owner"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {pendingTeamInvitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200"
            >
              <span>{invitation.invited_email} · pending</span>
              {canManageTeam && (
                <>
                  <button
                    type="button"
                    onClick={() => handleResendInvitation(invitation.id)}
                    disabled={invitePending && resendingInvitationId === invitation.id}
                    className="rounded-full border border-white/10 px-2 py-0.5 text-[0.65rem] text-white/80 transition hover:text-white disabled:opacity-50"
                  >
                    {invitePending && resendingInvitationId === invitation.id ? "Resending..." : "Resend"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancelInvitation(invitation.id)}
                    disabled={invitePending && pendingInvitationId === invitation.id}
                    className="rounded-full border border-white/10 px-2 py-0.5 text-[0.65rem] text-white/80 transition hover:text-white disabled:opacity-50"
                  >
                    {invitePending && pendingInvitationId === invitation.id ? "Cancelling..." : "Cancel"}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {canManageTeam && (
          <form onSubmit={handleInviteSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="email"
              value={teammateEmail}
              onChange={(event) => setTeammateEmail(event.target.value)}
              placeholder="teammate@company.com"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-slate-500 focus:border-electric focus:outline-none"
              required
            />
            <Button type="submit" disabled={invitePending} className="sm:w-auto">
              {invitePending ? "Sending..." : "Invite teammate"}
            </Button>
          </form>
        )}

        {teamMessage && (
          <p className="text-sm text-slate-300">{teamMessage}</p>
        )}

        {activityLog.length > 0 && (
          <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recent team activity</p>
            <div className="space-y-2">
              {activityLog.slice(0, 8).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                >
                  <p className="text-xs text-slate-200">{formatActivityLabel(entry)}</p>
                  <span className="text-[0.65rem] text-slate-500">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {phaseProgress.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {phaseProgress.map((phase) => (
            <PhaseCard key={phase.id} phase={phase} />
          ))}
        </div>
      )}

      {/* Progress bar + badges row */}
      <div className="glass-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <h2 className="text-xl font-semibold">
            {percent(progress.ratio)} digital-ready
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              {progress.completed}/{progress.total} tasks
            </span>
          </div>
        </div>
        <Progress value={progress.percentage} className="h-2" />
      </div>

      {/* Quick tip — compact single row */}
      {nextStep && nextAffiliate && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-amber-400 font-semibold">💰 Affiliate Offer:</span>
            <span className="text-slate-300">{nextStep.title}</span>
          </div>
          <a
            href={nextAffiliate.url}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "bg-amber-500 text-black hover:bg-amber-400"
            )}
          >
            {nextAffiliate.label}
          </a>
        </div>
      )}

      {message && (
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {message}
        </p>
      )}

      {view === "checklist" ? (
        <div className="space-y-4">
          {phases.map((phase) => {
            const phaseSteps = stepsByPhase.get(phase.id) || [];
            if (!phaseSteps.length) return null;
            return (
              <div key={phase.id} className="glass-panel p-6 space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                      {phase.title}
                    </p>
                    <p className="text-sm text-slate-400">{phase.description}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {phaseSteps.filter((step) => completedSet.has(step.id)).length} / {phaseSteps.length} done
                  </span>
                </div>
                <div className="space-y-4">
                  {phaseSteps.map((step) => (
                    <ChecklistStepRow
                      key={step.id}
                      step={step}
                      completed={completedSet.has(step.id)}
                      pending={pendingTask === step.id && taskPending}
                      onToggle={(checked) => handleTaskToggle(step.id, checked)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : wizardStep ? (
        <WizardPanel
          step={wizardStep}
          completed={completedSet.has(wizardStep.id)}
          pending={pendingTask === wizardStep.id && taskPending}
          currentStep={wizardIndex + 1}
          totalSteps={flatSteps.length}
          onNext={() => setWizardIndex((prev) => Math.min(prev + 1, flatSteps.length - 1))}
          onPrev={() => setWizardIndex((prev) => Math.max(prev - 1, 0))}
          onToggle={(checked) => handleTaskToggle(wizardStep.id, checked)}
        />
      ) : (
        <p className="text-sm text-slate-400">No steps available.</p>
      )}
    </section>
  );
};

const ChecklistStepRow = ({
  step,
  completed,
  pending,
  onToggle,
}: {
  step: RoadmapStep;
  completed: boolean;
  pending: boolean;
  onToggle: (checked: boolean) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasAffiliate = step.affiliate_link && step.affiliate_name;

  return (
    <div
      className={cn(
        "rounded-xl border bg-black/30 px-4 py-3 transition-colors",
        completed ? "border-electric/20" : "border-white/10"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <label className="relative inline-flex items-center shrink-0">
            <input
              type="checkbox"
              checked={completed}
              onChange={(event) => onToggle(event.target.checked)}
              disabled={pending}
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/30 bg-transparent checked:bg-electric"
            />
            <span className="pointer-events-none absolute inset-0 rounded-md border border-white/30 peer-checked:border-electric/70" />
          </label>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-left min-w-0"
          >
            <p className={cn("text-sm font-semibold", completed && "line-through text-slate-500")}>
              {step.title}
              {step.mandatory && (
                <span className="ml-2 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300 no-underline">
                  Required
                </span>
              )}
              {hasAffiliate && !completed && (
                <span className="ml-2 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-300 no-underline">
                  💰 Deal
                </span>
              )}
            </p>
            <p className="text-xs text-slate-500 truncate">{step.why || step.description}</p>
          </button>
        </div>
        {hasAffiliate && !completed && (
          <a
            href={step.affiliate_link!}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "bg-green-500 text-black shrink-0 text-xs hover:bg-green-400"
            )}
          >
            {step.affiliate_name} ↗
          </a>
        )}
      </div>
      {expanded && (
        <div className="mt-4 ml-8 border-t border-white/10 pt-4 space-y-4">
          {/* Why this matters section */}
          {step.why && (
            <div className="rounded-xl bg-electric/5 border border-electric/20 p-4">
              <p className="text-xs uppercase tracking-wider text-electric font-semibold mb-2">
                Why this matters
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">{step.why}</p>
            </div>
          )}

          {/* How to complete - Step by step guide */}
          {step.how && step.how.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                How to complete this step
              </p>
              <ol className="space-y-3">
                {step.how.map((instruction: string, index: number) => (
                  <li key={index} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-slate-400">
                      {index + 1}
                    </span>
                    <span className="text-sm text-slate-200 leading-relaxed pt-0.5">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Special Offer Section */}
          {hasAffiliate && (
            <div className="rounded-xl border border-green-500/30 bg-gradient-to-r from-green-500/10 to-green-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💰</span>
                <p className="text-sm text-green-400 font-semibold">Exclusive Partner Offer</p>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                We&apos;ve partnered with {step.affiliate_name} to get you a special deal for this step.
              </p>
              <a
                href={step.affiliate_link!}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "bg-green-500 text-black hover:bg-green-400 w-full sm:w-auto"
                )}
              >
                Claim {step.affiliate_name} Offer →
              </a>
            </div>
          )}

          {/* Tips section */}
          <div className="rounded-lg bg-white/5 p-3">
            <p className="text-xs text-slate-500 mb-1">💡 Pro Tip</p>
            <p className="text-xs text-slate-400">
              Take your time with this step. Completing it properly will save you time later.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

type PhaseProgress = {
  id: string;
  title: string;
  description: string;
  total: number;
  completed: number;
  percentage: number;
};

const PhaseCard = ({ phase }: { phase: PhaseProgress }) => (
  <div className="glass-panel p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          {phase.title}
        </p>
        <p className="text-xs text-slate-500">{phase.description}</p>
      </div>
      <span className="text-sm text-slate-400">
        {phase.completed}/{phase.total}
      </span>
    </div>
    <Progress value={phase.percentage} className="h-2" />
    <p className="text-xs text-slate-400">
      {phase.percentage}% complete
    </p>
  </div>
);

const WizardPanel = ({
  step,
  completed,
  pending,
  onToggle,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
}: {
  step: RoadmapStep & { phaseTitle?: string };
  completed: boolean;
  pending: boolean;
  onToggle: (checked: boolean) => void;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
}) => {
  const hasAffiliate = step.affiliate_link && step.affiliate_name;
  const percentComplete = (currentStep / totalSteps) * 100;

  return (
    <div className="glass-panel p-8 space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{step.phaseTitle}</span>
        </div>
        <Progress value={percentComplete} className="h-2" />
      </div>
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          Wizard view
        </p>
        <h2 className="text-3xl font-semibold">{step.title}</h2>
        <p className="text-slate-300">{step.why || step.description}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-4">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          How to do it
        </p>
        {step.how && step.how.length > 0 && (
          <ol className="space-y-3 text-sm text-slate-200">
            {step.how.map((instruction: string, index: number) => (
              <li key={index} className="flex gap-3">
                <span className="text-electric">{index + 1}.</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        )}
        {hasAffiliate && (
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
            <p className="text-xs text-green-400 font-semibold mb-2">💰 Special Offer Available</p>
            <a
              href={step.affiliate_link!}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "default", size: "default" }),
                "bg-green-500 text-black hover:bg-green-400"
              )}
            >
              {step.affiliate_name} ↗
            </a>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 pt-4">
          <Button
            onClick={() => onToggle(!completed)}
            disabled={pending}
            variant={completed ? "ghost" : "default"}
          >
            {completed ? "Mark as incomplete" : "Mark complete"}
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Button onClick={onPrev} variant="ghost" disabled={currentStep === 1}>
          Back
        </Button>
        <div className="flex items-center gap-3">
          <p className="text-xs text-slate-500">
            {Math.min(currentStep + 1, totalSteps)} / {totalSteps}
          </p>
          <Button onClick={onNext} disabled={currentStep === totalSteps}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
