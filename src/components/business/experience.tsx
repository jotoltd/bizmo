"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { affiliateLinks } from "@/data/affiliates";
import type { ChecklistTask } from "@/data/checklist";
import {
  calculateProgress,
  getBadges,
  getCategoriesForPlan,
} from "@/lib/checklist";
import { cn, percent } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Business, BusinessTeamMember, PlanTier } from "@/types";
import {
  inviteBusinessMemberAction,
  toggleTaskCompletionAction,
  updateBusinessViewAction,
} from "@/app/dashboard/actions";

const VIEW_MODES = [
  { id: "checklist", label: "Checklist" },
  { id: "wizard", label: "Wizard" },
] as const;

type ViewMode = (typeof VIEW_MODES)[number]["id"];

type TaskCardProps = {
  task: ChecklistTask;
  completed: boolean;
  onToggle: (checked: boolean) => void;
  pending: boolean;
};

type WizardTask = ChecklistTask & {
  categoryLabel: string;
};

export const BusinessExperience = ({
  business,
  plan,
  team,
  canManageTeam,
  showOnboarding,
}: {
  business: Business;
  plan: PlanTier;
  team: BusinessTeamMember[];
  canManageTeam: boolean;
  showOnboarding?: boolean;
}) => {
  const categories = useMemo(() => getCategoriesForPlan(plan), [plan]);
  const flatTasks = useMemo<WizardTask[]>(() => {
    return categories.flatMap((category) =>
      category.tasks.map((task) => ({
        ...task,
        categoryLabel: category.label,
      }))
    );
  }, [categories]);

  const [view, setView] = useState<ViewMode>(
    (business.view_preference as ViewMode) ?? "checklist"
  );
  const [completedTasks, setCompletedTasks] = useState<string[]>(
    business.completed_tasks ?? []
  );
  const [wizardIndex, setWizardIndex] = useState(() => {
    if (!flatTasks.length) return 0;
    const completedSet = new Set(business.completed_tasks ?? []);
    const firstIncomplete = flatTasks.findIndex(
      (task) => !completedSet.has(task.id)
    );
    return firstIncomplete >= 0 ? firstIncomplete : 0;
  });
  const [message, setMessage] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<BusinessTeamMember[]>(team);
  const [teammateEmail, setTeammateEmail] = useState("");
  const [teamMessage, setTeamMessage] = useState<string | null>(null);
  const [pendingTask, setPendingTask] = useState<string | null>(null);
  const [invitePending, startInviteTransition] = useTransition();
  const [viewPending, startViewTransition] = useTransition();
  const [taskPending, startTaskTransition] = useTransition();

  const completedSet = useMemo(
    () => new Set<string>(completedTasks ?? []),
    [completedTasks]
  );

  const progress = useMemo(
    () => calculateProgress(plan, Array.from(completedSet)),
    [plan, completedSet]
  );

  const badges = useMemo(
    () => getBadges(plan, Array.from(completedSet), progress.percentage),
    [plan, completedSet, progress.percentage]
  );

  const categoryProgress = useMemo(
    () =>
      categories.map((category) => {
        const total = category.tasks.length;
        const completed = category.tasks.filter((task) =>
          completedSet.has(task.id)
        ).length;
        return {
          id: category.id,
          label: category.label,
          description: category.description,
          total,
          completed,
          percentage: total ? Math.round((completed / total) * 100) : 0,
        };
      }),
    [categories, completedSet]
  );

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

      setTeamMembers((prev) => [
        ...prev,
        {
          user_id: `local-${email}`,
          email,
          role: "member",
          created_at: new Date().toISOString(),
        },
      ]);
      setTeammateEmail("");
      setTeamMessage("Teammate added to this business.");
    });
  };

  const wizardTask = flatTasks[wizardIndex];
  const nextTask = wizardTask ?? flatTasks.find((task) => !completedSet.has(task.id));

  const toolkitAffiliate = nextTask ? affiliateLinks[nextTask.affiliate] : null;

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
        <section className="glass-panel rounded-2xl border-electric/30 bg-electric/10 p-5">
          <p className="text-xs uppercase tracking-[0.35em] text-electric">New business onboarding</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Nice — your business is ready.</h2>
          <div className="mt-3 grid gap-3 text-sm text-slate-200 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">1) Pick checklist or wizard view</div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">2) Complete your first 3 tasks</div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">3) Add teammates to keep momentum</div>
          </div>
        </section>
      )}

      <section className="glass-panel p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Team</p>
            <h2 className="text-lg font-semibold text-white">People in this business</h2>
          </div>
          <span className="text-sm text-slate-400">{teamMembers.length} member(s)</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {teamMembers.map((member) => (
            <span
              key={`${member.user_id}-${member.email}`}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300"
            >
              {member.email} · {member.role}
            </span>
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
              {invitePending ? "Adding..." : "Add teammate"}
            </Button>
          </form>
        )}

        {teamMessage && (
          <p className="text-sm text-slate-300">{teamMessage}</p>
        )}
      </section>

      {categoryProgress.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {categoryProgress.map((phase) => (
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
            <div className="flex gap-1.5">
              {badges.map((badge) => (
                <span
                  key={badge.id}
                  title={badge.label}
                  className={cn(
                    "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    badge.unlocked
                      ? "bg-electric/20 text-electric border border-electric/40"
                      : "bg-white/5 text-slate-500 border border-white/10"
                  )}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </div>
        <Progress value={progress.percentage} className="h-2" />
      </div>

      {/* Quick tip — compact single row */}
      {nextTask && toolkitAffiliate && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-5 py-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-electric font-semibold">Next up:</span>
            <span className="text-slate-300">{nextTask.title}</span>
          </div>
          <a
            href={toolkitAffiliate.url}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "bg-electric text-black"
            )}
          >
            {toolkitAffiliate.label} ↗
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
          {categories.map((category) => (
            <div key={category.id} className="glass-panel p-6 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                    {category.label}
                  </p>
                  <p className="text-sm text-slate-400">{category.description}</p>
                </div>
                <span className="text-xs text-slate-500">
                  {category.tasks.filter((task) => completedSet.has(task.id)).length} / {category.tasks.length} done
                </span>
              </div>
              <div className="space-y-4">
                {category.tasks.map((task) => (
                  <ChecklistTaskRow
                    key={task.id}
                    task={task}
                    completed={completedSet.has(task.id)}
                    pending={pendingTask === task.id && taskPending}
                    onToggle={(checked) => handleTaskToggle(task.id, checked)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : wizardTask ? (
        <WizardPanel
          task={wizardTask}
          completed={completedSet.has(wizardTask.id)}
          pending={pendingTask === wizardTask.id && taskPending}
          currentStep={wizardIndex + 1}
          totalSteps={flatTasks.length}
          onNext={() => setWizardIndex((prev) => Math.min(prev + 1, flatTasks.length - 1))}
          onPrev={() => setWizardIndex((prev) => Math.max(prev - 1, 0))}
          upcomingTask={flatTasks[wizardIndex + 1]}
          onToggle={(checked) => handleTaskToggle(wizardTask.id, checked)}
        />
      ) : (
        <p className="text-sm text-slate-400">No tasks available.</p>
      )}
    </section>
  );
};

const ChecklistTaskRow = ({ task, completed, pending, onToggle }: TaskCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const affiliate = affiliateLinks[task.affiliate];
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
              {task.title}
              {task.priority && (
                <span className="ml-2 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300 no-underline">
                  Priority
                </span>
              )}
            </p>
            <p className="text-xs text-slate-500 truncate">{task.why}</p>
          </button>
        </div>
        <a
          href={affiliate.url}
          target="_blank"
          rel="noreferrer"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "bg-electric text-black shrink-0 text-xs"
          )}
        >
          {affiliate.label} ↗
        </a>
      </div>
      {expanded && (
        <div className="mt-3 ml-8 border-t border-white/5 pt-3">
          <ol className="space-y-1.5 text-sm text-slate-300">
            {task.how.map((step: string, index: number) => (
              <li key={step} className="flex gap-2">
                <span className="text-slate-500 text-xs">{index + 1}.</span>
                <span className="text-xs">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

type PhaseProgress = {
  id: string;
  label: string;
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
          {phase.label}
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
  task,
  completed,
  pending,
  onToggle,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  upcomingTask,
}: {
  task: WizardTask;
  completed: boolean;
  pending: boolean;
  onToggle: (checked: boolean) => void;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  upcomingTask?: WizardTask;
}) => {
  const affiliate = affiliateLinks[task.affiliate];
  const percentComplete = (currentStep / totalSteps) * 100;
  return (
    <div className="glass-panel p-8 space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{task.categoryLabel}</span>
        </div>
        <Progress value={percentComplete} className="h-2" />
        {upcomingTask && (
          <p className="text-xs text-slate-500">
            Next: <span className="text-slate-200">{upcomingTask.title}</span>
          </p>
        )}
      </div>
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          Wizard view
        </p>
        <h2 className="text-3xl font-semibold">{task.title}</h2>
        <p className="text-slate-300">{task.why}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-4">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          How to do it
        </p>
        <ol className="space-y-3 text-sm text-slate-200">
          {task.how.map((step: string) => (
            <li key={step} className="flex gap-3">
              <span className="text-electric">•</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm text-slate-300">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">
            Context
          </p>
          <p>
            Stay focused on the business outcome: complete this step to unlock the next milestone and keep
            your launch crew aligned.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => onToggle(!completed)}
            disabled={pending}
            variant={completed ? "ghost" : "default"}
          >
            {completed ? "Mark as incomplete" : "Mark complete"}
          </Button>
          <a
            href={affiliate.url}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "border-electric text-electric"
            )}
          >
            {affiliate.label} ↗
          </a>
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
