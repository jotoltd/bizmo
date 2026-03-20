"use client";

import { useMemo, useState, useTransition } from "react";
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
import type { Business, PlanTier } from "@/types";
import {
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
}: {
  business: Business;
  plan: PlanTier;
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
  const [pendingTask, setPendingTask] = useState<string | null>(null);
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
          onToggle={(checked) => handleTaskToggle(wizardTask.id, checked)}
          pending={pendingTask === wizardTask.id && taskPending}
          currentStep={wizardIndex + 1}
          totalSteps={flatTasks.length}
          onNext={() => setWizardIndex((prev) => Math.min(prev + 1, flatTasks.length - 1))}
          onPrev={() => setWizardIndex((prev) => Math.max(prev - 1, 0))}
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

const WizardPanel = ({
  task,
  completed,
  pending,
  onToggle,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
}: {
  task: WizardTask;
  completed: boolean;
  pending: boolean;
  onToggle: (checked: boolean) => void;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
}) => {
  const affiliate = affiliateLinks[task.affiliate];
  return (
    <div className="glass-panel p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span>{task.categoryLabel}</span>
      </div>
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          Wizard view
        </p>
        <h2 className="text-3xl font-semibold">{task.title}</h2>
        <p className="text-slate-300">{task.why}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          How to do it
        </p>
        <ol className="mt-4 space-y-3 text-sm text-slate-200">
          {task.how.map((step: string) => (
            <li key={step} className="flex gap-3">
              <span className="text-electric">•</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap items-center gap-3">
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
        <Button onClick={onNext} disabled={currentStep === totalSteps}>
          Next
        </Button>
      </div>
    </div>
  );
};
