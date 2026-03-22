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

  const { data: business, error } = await supabase
    .from("businesses")
    .insert({
    user_id: user.id,
    name: parsed.data.name.trim(),
    type: parsed.data.type,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create business", error.message);
    return { error: "Something went wrong while creating your business." };
  }

  if (!business) {
    return { error: "Business created but onboarding could not start." };
  }

  await supabase.from("business_memberships").upsert(
    {
      business_id: business.id,
      user_id: user.id,
      role: "owner",
      invited_by: user.id,
    },
    { onConflict: "business_id,user_id" }
  );

  revalidatePath("/dashboard");
  return {
    success: true,
    businessId: business.id,
    onboardingPath: `/business/${business.id}?onboarding=1`,
  };
};

const inviteBusinessMemberSchema = z.object({
  businessId: z.string().uuid(),
  email: z.string().email(),
});

export const inviteBusinessMemberAction = async (
  input: z.infer<typeof inviteBusinessMemberSchema>
) => {
  const parsed = inviteBusinessMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please provide a valid teammate email." };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, user_id")
    .eq("id", parsed.data.businessId)
    .maybeSingle();

  if (!business) {
    return { error: "Business not found." };
  }

  if (business.user_id !== user.id) {
    return { error: "Only the business owner can add teammates." };
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim();
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id, email")
    .ilike("email", normalizedEmail)
    .maybeSingle();

  if (!targetProfile) {
    return {
      error: "No account found with that email yet. Ask them to create an account first.",
    };
  }

  const { data: existingMembership } = await supabase
    .from("business_memberships")
    .select("id")
    .eq("business_id", parsed.data.businessId)
    .eq("user_id", targetProfile.id)
    .maybeSingle();

  if (existingMembership) {
    return { error: "That teammate is already in this business." };
  }

  const { error: insertError } = await supabase.from("business_memberships").insert({
    business_id: parsed.data.businessId,
    user_id: targetProfile.id,
    role: "member",
    invited_by: user.id,
  });

  if (insertError) {
    console.error("Failed to invite teammate", insertError.message);
    return { error: "Could not add teammate right now." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/business/${parsed.data.businessId}`);
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
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, user_id")
    .eq("id", parsed.data.businessId)
    .maybeSingle();

  if (businessError || !business) {
    return { error: "Business not found." };
  }

  if (business.user_id !== user.id) {
    const { data: membership } = await supabase
      .from("business_memberships")
      .select("id")
      .eq("business_id", parsed.data.businessId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) {
      return { error: "Business not found." };
    }
  }

  const { error } = await supabase
    .from("businesses")
    .update({ view_preference: parsed.data.view })
    .eq("id", parsed.data.businessId);

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
    .single();

  if (fetchError || !business) {
    console.error("Failed to load business", fetchError?.message);
    return { error: "Business not found." };
  }

  if (business.user_id !== user.id) {
    const { data: membership } = await supabase
      .from("business_memberships")
      .select("id")
      .eq("business_id", parsed.data.businessId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) {
      return { error: "Business not found." };
    }
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
    .eq("id", parsed.data.businessId);

  if (updateError) {
    console.error("Failed to update tasks", updateError.message);
    return { error: "Could not update task." };
  }

  revalidatePath(`/business/${parsed.data.businessId}`);
  revalidatePath("/dashboard");
  return { success: true, completedTasks: updatedTasks };
};
