import { checklistCategories } from "@/data/checklist";
import type { PlanTier } from "@/types";

const isCategoryAvailable = (plan: PlanTier, availability: PlanTier | "all") =>
  availability === "all" || availability === plan;

export const getCategoriesForPlan = (plan: PlanTier) =>
  checklistCategories.filter((category) =>
    isCategoryAvailable(plan, category.availableIn)
  );

export const getTasksForPlan = (plan: PlanTier) =>
  getCategoriesForPlan(plan).flatMap((category) => category.tasks);

export const getTaskById = (plan: PlanTier, taskId: string) =>
  getTasksForPlan(plan).find((task) => task.id === taskId);

export const calculateProgress = (plan: PlanTier, completedTaskIds: string[]) => {
  const tasks = getTasksForPlan(plan);
  const completed = tasks.filter((task) => completedTaskIds.includes(task.id));
  const ratio = tasks.length ? completed.length / tasks.length : 0;

  return {
    total: tasks.length,
    completed: completed.length,
    ratio,
    percentage: Math.round(ratio * 100),
  };
};

type BadgeConfigTask = {
  id: string;
  label: string;
  tasks: string[];
};

type BadgeConfigPercentage = {
  id: string;
  label: string;
  percentage: number;
};

const BADGE_CONFIG: (BadgeConfigTask | BadgeConfigPercentage)[] = [
  {
    id: "domain-secured",
    label: "Domain Secured 🏆",
    tasks: ["domain-register", "hosting-setup"],
  },
  {
    id: "brand-ready",
    label: "Brand Ready ✨",
    tasks: ["logo-design", "brand-system"],
  },
  {
    id: "fully-digital",
    label: "Fully Digital 🚀",
    percentage: 100,
  },
];

export type Badge = {
  id: string;
  label: string;
  unlocked: boolean;
};

export const getBadges = (
  plan: PlanTier,
  completedTaskIds: string[],
  completionPercentage: number
): Badge[] =>
  BADGE_CONFIG.map((badge) => {
    if ("percentage" in badge)
      return {
        id: badge.id,
        label: badge.label,
        unlocked: completionPercentage >= badge.percentage,
      };

    const unlocked = badge.tasks.every((taskId: string) =>
      completedTaskIds.includes(taskId)
    );

    return { id: badge.id, label: badge.label, unlocked };
  });
