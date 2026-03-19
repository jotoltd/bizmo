"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireProfile, requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTasksForPlan } from "@/lib/checklist";

const createBusinessSchema = z.object({
  name: z.string().min(2).max(80),
  type: z.string().min(2).max(60),
});

export const createBusinessAction = async (
  input: z.infer<typeof createBusinessSchema>
) => {
  const parsed = createBusinessSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please provide a valid business name and type." };
  }

  const [user, profile] = await Promise.all([requireUser(), requireProfile()]);
  const supabase = await createSupabaseServerClient();

  if (profile.plan === "free") {
    const { count } = await supabase
      .from("businesses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((count ?? 0) >= 1) {
      return {
        error: "The Free plan allows 1 business. Upgrade to Pro for unlimited brands.",
      };
    }
  }

  const { error } = await supabase.from("businesses").insert({
    user_id: user.id,
    name: parsed.data.name.trim(),
    type: parsed.data.type,
  });

  if (error) {
    console.error("Failed to create business", error.message);
    return { error: "Something went wrong while creating your business." };
  }

  revalidatePath("/dashboard");
  return { success: true };
};

const viewSchema = z.object({
  businessId: z.string().uuid(),
  view: z.enum(["checklist", "wizard"]),
});

export const updateBusinessViewAction = async (
  input: z.infer<typeof viewSchema>
) => {
  const parsed = viewSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid view preference." };

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("businesses")
    .update({ view_preference: parsed.data.view })
    .eq("id", parsed.data.businessId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to update view preference", error.message);
    return { error: "Could not save your preference." };
  }

  revalidatePath(`/business/${parsed.data.businessId}`);
  return { success: true };
};

const toggleSchema = z.object({
  businessId: z.string().uuid(),
  taskId: z.string(),
  completed: z.boolean(),
});

export const toggleTaskCompletionAction = async (
  input: z.infer<typeof toggleSchema>
) => {
  const parsed = toggleSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid task update." };

  const [user, profile] = await Promise.all([requireUser(), requireProfile()]);
  const supabase = await createSupabaseServerClient();
  const { data: business, error: fetchError } = await supabase
    .from("businesses")
    .select("id, user_id, completed_tasks")
    .eq("id", parsed.data.businessId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !business) {
    console.error("Failed to load business", fetchError?.message);
    return { error: "Business not found." };
  }

  const availableTasks = getTasksForPlan(profile.plan).map((task) => task.id);
  if (!availableTasks.includes(parsed.data.taskId)) {
    return { error: "This task is not available on your current plan." };
  }

  const currentTasks = new Set<string>(business.completed_tasks ?? []);
  if (parsed.data.completed) currentTasks.add(parsed.data.taskId);
  else currentTasks.delete(parsed.data.taskId);

  const updatedTasks = Array.from(currentTasks);
  const { error: updateError } = await supabase
    .from("businesses")
    .update({ completed_tasks: updatedTasks })
    .eq("id", parsed.data.businessId)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Failed to update tasks", updateError.message);
    return { error: "Could not update task." };
  }

  revalidatePath(`/business/${parsed.data.businessId}`);
  revalidatePath("/dashboard");
  return { success: true, completedTasks: updatedTasks };
};
