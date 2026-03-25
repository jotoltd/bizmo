import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type RoadmapStepRecord = {
  id: string;
  title: string;
  sort_order: number;
};

type BusinessRecord = {
  id: string;
  user_id: string;
  created_at: string;
  completed_tasks: string[] | null;
};

const DEADLINE_DAYS_PER_STEP = 7;
const APPROACHING_WINDOW_HOURS = 48;

const stepDueDate = (businessCreatedAtIso: string, stepIndex: number) => {
  const createdAt = new Date(businessCreatedAtIso);
  return new Date(createdAt.getTime() + (stepIndex + 1) * DEADLINE_DAYS_PER_STEP * 24 * 60 * 60 * 1000);
};

const hasNotification = async ({
  userId,
  type,
  businessId,
  taskId,
}: {
  userId: string;
  type: "deadline_approaching" | "deadline_missed";
  businessId: string;
  taskId: string;
}) => {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("user_notifications")
    .select("id")
    .eq("user_id", userId)
    .eq("type", type)
    .contains("data", { business_id: businessId, task_id: taskId })
    .limit(1);

  if (error) {
    console.error("Failed to check existing deadline notification", error.message);
    return false;
  }

  return (data ?? []).length > 0;
};

export const emitDeadlineNotifications = async () => {
  const admin = createSupabaseAdminClient();
  const now = new Date();
  const approachingWindowMs = APPROACHING_WINDOW_HOURS * 60 * 60 * 1000;

  const [{ data: businesses, error: businessesError }, { data: steps, error: stepsError }] =
    await Promise.all([
      admin
        .from("businesses")
        .select("id, user_id, created_at, completed_tasks")
        .order("created_at", { ascending: true }),
      admin
        .from("roadmap_steps")
        .select("id, title, sort_order")
        .or(`status.eq.published,and(status.eq.scheduled,publish_at.lte.${now.toISOString()})`)
        .order("sort_order", { ascending: true }),
    ]);

  if (businessesError) {
    throw new Error(`Failed to load businesses: ${businessesError.message}`);
  }

  if (stepsError) {
    throw new Error(`Failed to load roadmap steps: ${stepsError.message}`);
  }

  const orderedSteps = (steps ?? []) as RoadmapStepRecord[];
  const businessRows = (businesses ?? []) as BusinessRecord[];

  let approachingCreated = 0;
  let missedCreated = 0;

  for (const business of businessRows) {
    const completedSet = new Set(business.completed_tasks ?? []);

    for (const [index, step] of orderedSteps.entries()) {
      if (completedSet.has(step.id)) {
        continue;
      }

      const dueAt = stepDueDate(business.created_at, index);
      const msUntilDue = dueAt.getTime() - now.getTime();
      const isApproaching = msUntilDue > 0 && msUntilDue <= approachingWindowMs;
      const isMissed = msUntilDue <= 0;

      if (isApproaching) {
        const alreadyNotified = await hasNotification({
          userId: business.user_id,
          type: "deadline_approaching",
          businessId: business.id,
          taskId: step.id,
        });

        if (!alreadyNotified) {
          const { error } = await admin.from("user_notifications").insert({
            user_id: business.user_id,
            type: "deadline_approaching",
            title: "Upcoming task deadline",
            body: `\"${step.title}\" is due soon.`,
            data: {
              business_id: business.id,
              task_id: step.id,
              due_at: dueAt.toISOString(),
            },
          });

          if (error) {
            console.error("Failed to create deadline_approaching notification", error.message);
          } else {
            approachingCreated += 1;
          }
        }
      }

      if (isMissed) {
        const alreadyNotified = await hasNotification({
          userId: business.user_id,
          type: "deadline_missed",
          businessId: business.id,
          taskId: step.id,
        });

        if (!alreadyNotified) {
          const { error } = await admin.from("user_notifications").insert({
            user_id: business.user_id,
            type: "deadline_missed",
            title: "Task deadline missed",
            body: `\"${step.title}\" is overdue.`,
            data: {
              business_id: business.id,
              task_id: step.id,
              due_at: dueAt.toISOString(),
            },
          });

          if (error) {
            console.error("Failed to create deadline_missed notification", error.message);
          } else {
            missedCreated += 1;
          }
        }
      }
    }
  }

  return {
    businessesChecked: businessRows.length,
    stepsChecked: orderedSteps.length,
    approachingCreated,
    missedCreated,
  };
};
