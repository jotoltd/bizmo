"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireProfile, requireUser } from "@/lib/auth";
import { envServer } from "@/lib/env-server";
import {
  sendBusinessInvitationEmail,
  sendBusinessInvitationResponseEmail,
} from "@/lib/email/resend";
import { dispatchPushToUser } from "@/lib/push/dispatch";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTasksForPlan } from "@/lib/checklist";
import type { UserNotification, UserEmailPreferences } from "@/types";

const createUserNotification = async ({
  userId,
  type,
  title,
  body,
  data = {},
}: {
  userId: string;
  type: UserNotification["type"];
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}) => {
  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("user_notifications").insert({
      user_id: userId,
      type,
      title,
      body: body ?? null,
      data,
    });

    if (error) {
      console.error("Failed to create user notification", error.message);
      return;
    }

    await dispatchPushToUser({
      userId,
      title,
      body: body ?? "You have a new update in Bizno.",
      data,
    });
  } catch (error) {
    console.error("Unexpected error creating user notification", error);
  }
};

const logBusinessActivity = async ({
  businessId,
  userId,
  action,
  targetUserId,
  metadata = {},
}: {
  businessId: string;
  userId: string | null;
  action:
    | "member_invited"
    | "member_joined"
    | "member_removed"
    | "role_changed"
    | "ownership_transferred"
    | "invitation_cancelled"
    | "invitation_expired"
    | "invitation_resent";
  targetUserId?: string | null;
  metadata?: Record<string, unknown>;
}) => {
  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("business_activity_log").insert({
      business_id: businessId,
      user_id: userId,
      action,
      target_user_id: targetUserId ?? null,
      metadata,
    });

    if (error) {
      console.error("Failed to log business activity", error.message);
    }
  } catch (error) {
    console.error("Unexpected error logging business activity", error);
  }
};

const canSendInvitationEmail = async (userId: string) => {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("user_email_preferences")
      .select("invitation_emails")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed to read invitation email preference", error.message);
      return true;
    }

    return data?.invitation_emails ?? true;
  } catch (error) {
    console.error("Unexpected error reading invitation email preference", error);
    return true;
  }
};

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

  // App is completely free - no business limits
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
    .select("id, user_id, name")
    .eq("id", parsed.data.businessId)
    .maybeSingle();

  if (!business) {
    return { error: "Business not found." };
  }

  if (business.user_id !== user.id) {
    return { error: "Only the business owner can add teammates." };
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim();
  const admin = createSupabaseAdminClient();
  const { data: targetProfile } = await admin
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

  const { data: existingInvitation } = await supabase
    .from("business_invitations")
    .select("id, status")
    .eq("business_id", parsed.data.businessId)
    .eq("invited_user_id", targetProfile.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existingInvitation) {
    return { error: "That teammate already has a pending invitation." };
  }

  const { data: createdInvitation, error: insertError } = await supabase
    .from("business_invitations")
    .insert({
      business_id: parsed.data.businessId,
      invited_user_id: targetProfile.id,
      invited_email: normalizedEmail,
      invited_by: user.id,
      role: "member",
      status: "pending",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Failed to invite teammate", insertError.message);
    return { error: "Could not send invitation right now." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/business/${parsed.data.businessId}`);

  const shouldSendEmail = await canSendInvitationEmail(targetProfile.id);
  if (!shouldSendEmail) {
    return {
      success: true,
      invitationId: createdInvitation?.id,
      warning: "Invitation created, but this teammate has invitation emails disabled.",
    };
  }

  const emailResult = await sendBusinessInvitationEmail({
    to: normalizedEmail,
    businessName: business.name,
    inviterEmail: user.email ?? "A Bizno teammate",
    dashboardUrl: `${envServer.siteUrl}/dashboard`,
  });

  if (emailResult.error) {
    return {
      success: true,
      invitationId: createdInvitation?.id,
      warning: "Invitation created, but the email could not be sent.",
    };
  }

  return { success: true, invitationId: createdInvitation?.id };
};

const invitationResponseSchema = z.object({
  invitationId: z.string().uuid(),
});

export const cancelBusinessInvitationAction = async (
  input: z.infer<typeof invitationResponseSchema>
) => {
  const parsed = invitationResponseSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid invitation." };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: invitation, error: fetchError } = await supabase
    .from("business_invitations")
    .select("id, business_id")
    .eq("id", parsed.data.invitationId)
    .eq("status", "pending")
    .maybeSingle();

  if (fetchError || !invitation) {
    return { error: "Invitation not found." };
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, user_id")
    .eq("id", invitation.business_id)
    .maybeSingle();

  if (businessError || !business) {
    return { error: "Business not found." };
  }

  if (business.user_id !== user.id) {
    return { error: "Only the business owner can cancel invitations." };
  }

  const { error } = await supabase
    .from("business_invitations")
    .update({ status: "cancelled", responded_at: new Date().toISOString() })
    .eq("id", invitation.id);

  if (error) {
    console.error("Failed to cancel business invitation", error.message);
    return { error: "Could not cancel invitation right now." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/business/${invitation.business_id}`);
  return { success: true };
};

export const resendBusinessInvitationAction = async (
  input: z.infer<typeof invitationResponseSchema>
) => {
  const parsed = invitationResponseSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid invitation." };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: invitation, error } = await supabase
    .from("business_invitations")
    .select("id, business_id, invited_user_id, invited_email, status")
    .eq("id", parsed.data.invitationId)
    .eq("status", "pending")
    .maybeSingle();

  if (error || !invitation) {
    return { error: "Invitation not found." };
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, user_id, name")
    .eq("id", invitation.business_id)
    .maybeSingle();

  if (businessError || !business) {
    return { error: "Business not found." };
  }

  if (business.user_id !== user.id) {
    return { error: "Only the business owner can resend invitations." };
  }

  const shouldSendEmail = await canSendInvitationEmail(invitation.invited_user_id);
  if (shouldSendEmail) {
    const emailResult = await sendBusinessInvitationEmail({
      to: invitation.invited_email,
      businessName: business.name,
      inviterEmail: user.email ?? "A Bizno teammate",
      dashboardUrl: `${envServer.siteUrl}/dashboard`,
    });

    if (emailResult.error) {
      return { error: emailResult.error };
    }
  }

  await logBusinessActivity({
    businessId: invitation.business_id,
    userId: user.id,
    action: "invitation_resent",
    targetUserId: invitation.invited_user_id,
    metadata: { invited_email: invitation.invited_email },
  });

  return {
    success: true,
    warning: shouldSendEmail
      ? undefined
      : "Invitation resent in-app. Email is disabled for this teammate.",
  };
};

export const acceptBusinessInvitationAction = async (
  input: z.infer<typeof invitationResponseSchema>
) => {
  const parsed = invitationResponseSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid invitation." };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: invitation, error: invitationError } = await supabase
    .from("business_invitations")
    .select("id, business_id, invited_user_id, invited_by, role, status, invited_email")
    .eq("id", parsed.data.invitationId)
    .eq("invited_user_id", user.id)
    .maybeSingle();

  if (invitationError || !invitation || invitation.status !== "pending") {
    return { error: "Invitation not found." };
  }

  const { error: membershipError } = await supabase.from("business_memberships").upsert(
    {
      business_id: invitation.business_id,
      user_id: user.id,
      role: invitation.role,
      invited_by: invitation.invited_by,
    },
    { onConflict: "business_id,user_id" }
  );

  if (membershipError) {
    console.error("Failed to accept business invitation", membershipError.message);
    return { error: "Could not join this business right now." };
  }

  const { error: updateError } = await supabase
    .from("business_invitations")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", invitation.id);

  if (updateError) {
    console.error("Failed to mark business invitation accepted", updateError.message);
    return { error: "Could not accept invitation. Please try again." };
  }

  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", invitation.invited_by)
    .maybeSingle();

  const { data: business } = await supabase
    .from("businesses")
    .select("name")
    .eq("id", invitation.business_id)
    .maybeSingle();

  if (ownerProfile?.email && business?.name) {
    await sendBusinessInvitationResponseEmail({
      to: ownerProfile.email,
      businessName: business.name,
      inviteeEmail: invitation.invited_email,
      status: "accepted",
      businessUrl: `${envServer.siteUrl}/business/${invitation.business_id}`,
    });
  }

  await createUserNotification({
    userId: invitation.invited_by,
    type: "invitation_accepted",
    title: "Invitation accepted",
    body: `${invitation.invited_email} accepted your invitation.`,
    data: {
      business_id: invitation.business_id,
      invitation_id: invitation.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/business/${invitation.business_id}`);
  return { success: true, businessId: invitation.business_id };
};

export const rejectBusinessInvitationAction = async (
  input: z.infer<typeof invitationResponseSchema>
) => {
  const parsed = invitationResponseSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid invitation." };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: invitation, error: fetchError } = await supabase
    .from("business_invitations")
    .select("id, business_id, invited_by, invited_email")
    .eq("id", parsed.data.invitationId)
    .eq("invited_user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (fetchError || !invitation) {
    return { error: "Invitation not found." };
  }

  const { error } = await supabase
    .from("business_invitations")
    .update({ status: "rejected", responded_at: new Date().toISOString() })
    .eq("id", invitation.id);

  if (error) {
    console.error("Failed to reject business invitation", error.message);
    return { error: "Could not reject invitation right now." };
  }

  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", invitation.invited_by)
    .maybeSingle();

  const { data: business } = await supabase
    .from("businesses")
    .select("name")
    .eq("id", invitation.business_id)
    .maybeSingle();

  if (ownerProfile?.email && business?.name) {
    await sendBusinessInvitationResponseEmail({
      to: ownerProfile.email,
      businessName: business.name,
      inviteeEmail: invitation.invited_email,
      status: "rejected",
      businessUrl: `${envServer.siteUrl}/business/${invitation.business_id}`,
    });
  }

  await createUserNotification({
    userId: invitation.invited_by,
    type: "invitation_rejected",
    title: "Invitation declined",
    body: `${invitation.invited_email} declined your invitation.`,
    data: {
      business_id: invitation.business_id,
      invitation_id: invitation.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/business/${invitation.business_id}`);
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
    .select("id, user_id, name")
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

const removeMemberSchema = z.object({
  businessId: z.string().uuid(),
  userId: z.string().uuid(),
});

const toggleSchema = z.object({
  businessId: z.string().uuid(),
  taskId: z.string(),
  completed: z.boolean(),
});

export const removeBusinessMemberAction = async (
  input: z.infer<typeof removeMemberSchema>
) => {
  const parsed = removeMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid request." };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, user_id, name")
    .eq("id", parsed.data.businessId)
    .maybeSingle();

  if (businessError || !business) {
    return { error: "Business not found." };
  }

  if (business.user_id !== user.id) {
    return { error: "Only the business owner can remove team members." };
  }

  if (business.user_id === parsed.data.userId) {
    return { error: "You cannot remove yourself as the business owner." };
  }

  const { error: deleteError } = await supabase
    .from("business_memberships")
    .delete()
    .eq("business_id", parsed.data.businessId)
    .eq("user_id", parsed.data.userId);

  if (deleteError) {
    console.error("Failed to remove team member", deleteError.message);
    return { error: "Could not remove team member right now." };
  }

  await createUserNotification({
    userId: parsed.data.userId,
    type: "member_removed",
    title: "Removed from business",
    body: `You were removed from ${business.name}.`,
    data: { business_id: parsed.data.businessId },
  });

  await logBusinessActivity({
    businessId: parsed.data.businessId,
    userId: user.id,
    action: "member_removed",
    targetUserId: parsed.data.userId,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/business/${parsed.data.businessId}`);
  return { success: true };
};

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
  // All tasks available for free - no plan restrictions
  // if (!availableTasks.includes(parsed.data.taskId)) {
  //   return { error: "This task is not available on your current plan." };
  // }

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

  if (parsed.data.completed) {
    const { data: completedStep } = await supabase
      .from("roadmap_steps")
      .select("title")
      .eq("id", parsed.data.taskId)
      .maybeSingle();

    await createUserNotification({
      userId: user.id,
      type: "task_completed",
      title: "Task completed",
      body: `You completed \"${completedStep?.title ?? "a task"}\".`,
      data: {
        business_id: parsed.data.businessId,
        task_id: parsed.data.taskId,
      },
    });
  }

  revalidatePath(`/business/${parsed.data.businessId}`);
  revalidatePath("/dashboard");
  return { success: true, completedTasks: updatedTasks };
};

// Bulk invite schema and action
const bulkInviteSchema = z.object({
  businessId: z.string().uuid(),
  emails: z.array(z.string().email()).min(1).max(10),
});

export const bulkInviteBusinessMembersAction = async (
  input: z.infer<typeof bulkInviteSchema>
) => {
  const parsed = bulkInviteSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please provide 1-10 valid email addresses." };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, user_id, name")
    .eq("id", parsed.data.businessId)
    .maybeSingle();

  if (!business) {
    return { error: "Business not found." };
  }

  if (business.user_id !== user.id) {
    return { error: "Only the business owner can invite teammates." };
  }

  const admin = createSupabaseAdminClient();
  const results = { success: 0, failed: 0, errors: [] as string[] };

  for (const email of parsed.data.emails) {
    const normalizedEmail = email.toLowerCase().trim();
    
    const { data: targetProfile } = await admin
      .from("profiles")
      .select("id, email")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (!targetProfile) {
      results.failed++;
      results.errors.push(`${normalizedEmail}: No account found`);
      continue;
    }

    const { data: existingMembership } = await supabase
      .from("business_memberships")
      .select("id")
      .eq("business_id", parsed.data.businessId)
      .eq("user_id", targetProfile.id)
      .maybeSingle();

    if (existingMembership) {
      results.failed++;
      results.errors.push(`${normalizedEmail}: Already a member`);
      continue;
    }

    const { data: existingInvitation } = await supabase
      .from("business_invitations")
      .select("id")
      .eq("business_id", parsed.data.businessId)
      .eq("invited_user_id", targetProfile.id)
      .eq("status", "pending")
      .maybeSingle();

    if (existingInvitation) {
      results.failed++;
      results.errors.push(`${normalizedEmail}: Already invited`);
      continue;
    }

    const { error: insertError } = await supabase
      .from("business_invitations")
      .insert({
        business_id: parsed.data.businessId,
        invited_user_id: targetProfile.id,
        invited_email: normalizedEmail,
        invited_by: user.id,
        role: "member",
        status: "pending",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (insertError) {
      results.failed++;
      results.errors.push(`${normalizedEmail}: Failed to create invitation`);
      continue;
    }

    await sendBusinessInvitationEmail({
      to: normalizedEmail,
      businessName: business.name,
      inviterEmail: user.email ?? "A Bizno teammate",
      dashboardUrl: `${envServer.siteUrl}/dashboard`,
    });

    results.success++;
  }

  revalidatePath("/dashboard");
  revalidatePath(`/business/${parsed.data.businessId}`);
  return { success: true, results };
};

// Update member role action
const updateMemberRoleSchema = z.object({
  businessId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["admin", "member"]),
});

export const updateBusinessMemberRoleAction = async (
  input: z.infer<typeof updateMemberRoleSchema>
) => {
  const parsed = updateMemberRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid request." };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, user_id, name")
    .eq("id", parsed.data.businessId)
    .maybeSingle();

  if (!business) {
    return { error: "Business not found." };
  }

  if (business.user_id !== user.id) {
    return { error: "Only the business owner can change member roles." };
  }

  if (business.user_id === parsed.data.userId) {
    return { error: "Cannot change the owner's role." };
  }

  const { error } = await supabase
    .from("business_memberships")
    .update({ role: parsed.data.role })
    .eq("business_id", parsed.data.businessId)
    .eq("user_id", parsed.data.userId);

  if (error) {
    console.error("Failed to update member role", error.message);
    return { error: "Could not update member role." };
  }

  await createUserNotification({
    userId: parsed.data.userId,
    type: "role_changed",
    title: "Role updated",
    body: `Your role in ${business.name} is now ${parsed.data.role}.`,
    data: {
      business_id: parsed.data.businessId,
      role: parsed.data.role,
    },
  });

  await logBusinessActivity({
    businessId: parsed.data.businessId,
    userId: user.id,
    action: "role_changed",
    targetUserId: parsed.data.userId,
    metadata: { role: parsed.data.role },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/business/${parsed.data.businessId}`);
  return { success: true };
};

// Transfer ownership action
const transferOwnershipSchema = z.object({
  businessId: z.string().uuid(),
  newOwnerId: z.string().uuid(),
});

export const transferBusinessOwnershipAction = async (
  input: z.infer<typeof transferOwnershipSchema>
) => {
  const parsed = transferOwnershipSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid request." };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, user_id, name")
    .eq("id", parsed.data.businessId)
    .maybeSingle();

  if (!business) {
    return { error: "Business not found." };
  }

  if (business.user_id !== user.id) {
    return { error: "Only the owner can transfer ownership." };
  }

  // Verify new owner is a member
  const { data: membership } = await supabase
    .from("business_memberships")
    .select("id")
    .eq("business_id", parsed.data.businessId)
    .eq("user_id", parsed.data.newOwnerId)
    .maybeSingle();

  if (!membership) {
    return { error: "New owner must be a team member first." };
  }

  // Start transaction: update business owner, update old owner to admin, update new owner to owner
  const { error: updateBusinessError } = await supabase
    .from("businesses")
    .update({ user_id: parsed.data.newOwnerId })
    .eq("id", parsed.data.businessId);

  if (updateBusinessError) {
    console.error("Failed to transfer ownership", updateBusinessError.message);
    return { error: "Could not transfer ownership." };
  }

  // Update old owner to admin
  await supabase
    .from("business_memberships")
    .upsert({
      business_id: parsed.data.businessId,
      user_id: user.id,
      role: "admin",
      invited_by: user.id,
    }, { onConflict: "business_id,user_id" });

  // Update new owner to owner
  await supabase
    .from("business_memberships")
    .update({ role: "owner" })
    .eq("business_id", parsed.data.businessId)
    .eq("user_id", parsed.data.newOwnerId);

  await createUserNotification({
    userId: parsed.data.newOwnerId,
    type: "ownership_transferred",
    title: "You are now business owner",
    body: `${business.name} ownership was transferred to you.`,
    data: { business_id: parsed.data.businessId },
  });

  await createUserNotification({
    userId: user.id,
    type: "business_update",
    title: "Ownership transferred",
    body: `You transferred ${business.name} ownership to another teammate.`,
    data: {
      business_id: parsed.data.businessId,
      new_owner_id: parsed.data.newOwnerId,
    },
  });

  await logBusinessActivity({
    businessId: parsed.data.businessId,
    userId: user.id,
    action: "ownership_transferred",
    targetUserId: parsed.data.newOwnerId,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/business/${parsed.data.businessId}`);
  return { success: true };
};
