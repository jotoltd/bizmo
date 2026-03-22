"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// ── helpers ──────────────────────────────────────────────

async function guardAdmin() {
  await requireAdmin();
  return createSupabaseServerClient();
}

// ── Roadmap Phases ───────────────────────────────────────

export async function getPhases() {
  const supabase = await guardAdmin();
  const { data } = await supabase
    .from("roadmap_phases")
    .select("*")
    .order("sort_order");
  return data ?? [];
}

export async function upsertPhase(formData: FormData) {
  const supabase = await guardAdmin();
  const id = formData.get("id") as string | null;
  const payload = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    sort_order: Number(formData.get("sort_order") ?? 0),
    updated_at: new Date().toISOString(),
  };

  if (id) {
    await supabase.from("roadmap_phases").update(payload).eq("id", id);
  } else {
    await supabase.from("roadmap_phases").insert(payload);
  }
  revalidatePath("/admin/roadmap");
}

export async function deletePhase(id: string) {
  const supabase = await guardAdmin();
  await supabase.from("roadmap_phases").delete().eq("id", id);
  revalidatePath("/admin/roadmap");
}

// ── Roadmap Steps ────────────────────────────────────────

export async function getSteps(phaseId?: string) {
  const supabase = await guardAdmin();
  let query = supabase.from("roadmap_steps").select("*").order("sort_order");
  if (phaseId) query = query.eq("phase_id", phaseId);
  const { data } = await query;
  return data ?? [];
}

export async function upsertStep(formData: FormData) {
  const supabase = await guardAdmin();
  const id = formData.get("id") as string | null;
  const howRaw = formData.get("how") as string;
  const payload = {
    phase_id: formData.get("phase_id") as string,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    why: formData.get("why") as string,
    how: howRaw ? howRaw.split("\n").filter(Boolean) : [],
    mandatory: formData.get("mandatory") === "on",
    status: (formData.get("status") as string) || "draft",
    publish_at: (formData.get("publish_at") as string) || null,
    sort_order: Number(formData.get("sort_order") ?? 0),
    updated_at: new Date().toISOString(),
  };

  if (id) {
    await supabase.from("roadmap_steps").update(payload).eq("id", id);
  } else {
    await supabase.from("roadmap_steps").insert(payload);
  }
  revalidatePath("/admin/roadmap");
}

export async function deleteStep(id: string) {
  const supabase = await guardAdmin();
  await supabase.from("roadmap_steps").delete().eq("id", id);
  revalidatePath("/admin/roadmap");
}

// ── Audience Tags ────────────────────────────────────────

export async function getTags() {
  const supabase = await guardAdmin();
  const { data } = await supabase.from("audience_tags").select("*").order("label");
  return data ?? [];
}

export async function upsertTag(formData: FormData) {
  const supabase = await guardAdmin();
  const id = formData.get("id") as string | null;
  const label = formData.get("label") as string;
  if (id) {
    await supabase.from("audience_tags").update({ label }).eq("id", id);
  } else {
    await supabase.from("audience_tags").insert({ label });
  }
  revalidatePath("/admin/roadmap");
}

// ── Step Tags ────────────────────────────────────────────

export async function setStepTags(stepId: string, tagIds: string[]) {
  const supabase = await guardAdmin();
  await supabase.from("roadmap_step_tags").delete().eq("step_id", stepId);
  if (tagIds.length > 0) {
    await supabase
      .from("roadmap_step_tags")
      .insert(tagIds.map((tag_id) => ({ step_id: stepId, tag_id })));
  }
  revalidatePath("/admin/roadmap");
}

// ── Users ────────────────────────────────────────────────

export async function getUsers(filters?: {
  plan?: string;
  user_type?: string;
  search?: string;
}) {
  const supabase = await guardAdmin();
  let query = supabase
    .from("profiles")
    .select("*")
    .order("last_active", { ascending: false });

  if (filters?.plan) query = query.eq("plan", filters.plan);
  if (filters?.user_type) query = query.eq("user_type", filters.user_type);
  if (filters?.search) query = query.ilike("email", `%${filters.search}%`);

  const { data } = await query;
  return data ?? [];
}

export async function updateUser(formData: FormData) {
  const supabase = await guardAdmin();
  const id = formData.get("id") as string;
  const payload: Record<string, unknown> = {};

  const plan = formData.get("plan") as string | null;
  const role = formData.get("role") as string | null;
  const user_type = formData.get("user_type") as string | null;
  const suspended = formData.get("suspended");

  if (plan) payload.plan = plan;
  if (role) payload.role = role;
  if (user_type) payload.user_type = user_type;
  if (suspended !== null) payload.suspended = suspended === "on";

  await supabase.from("profiles").update(payload).eq("id", id);
  revalidatePath("/admin/users");
}

export async function createUser(formData: FormData) {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const user_type = (formData.get("user_type") as string) || "freelancer";

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw new Error(error.message);

  // Update profile with user_type
  await admin.from("profiles").update({ user_type }).eq("id", data.user.id);
  revalidatePath("/admin/users");
}

export async function suspendUser(id: string, suspend: boolean) {
  const supabase = await guardAdmin();
  await supabase.from("profiles").update({ suspended: suspend }).eq("id", id);
  revalidatePath("/admin/users");
}

export async function deleteUser(id: string) {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  await admin.auth.admin.deleteUser(id);
  revalidatePath("/admin/users");
}

export async function getUserById(userId: string) {
  const supabase = await guardAdmin();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

export async function getBusinessesByUser(userId: string) {
  const supabase = await guardAdmin();
  const { data } = await supabase
    .from("businesses")
    .select("*, business_memberships!inner(user_id)")
    .eq("business_memberships.user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function reassignBusiness(formData: FormData) {
  const supabase = await guardAdmin();
  const businessId = formData.get("business_id") as string;
  const targetUserId = formData.get("target_user_id") as string;

  await supabase
    .from("businesses")
    .update({ user_id: targetUserId })
    .eq("id", businessId);

  await supabase.from("business_memberships").upsert(
    {
      business_id: businessId,
      user_id: targetUserId,
      role: "owner",
      invited_by: targetUserId,
    },
    { onConflict: "business_id,user_id" }
  );

  revalidatePath("/admin/users");
}

export async function mergeUsers(formData: FormData) {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const sourceUserId = formData.get("source_user_id") as string;
  const targetUserId = formData.get("target_user_id") as string;

  if (!sourceUserId || !targetUserId || sourceUserId === targetUserId) {
    throw new Error("Invalid merge request");
  }

  await admin
    .from("businesses")
    .update({ user_id: targetUserId })
    .eq("user_id", sourceUserId);

  const { data: sourceMemberships } = await admin
    .from("business_memberships")
    .select("business_id, role")
    .eq("user_id", sourceUserId);

  if (sourceMemberships?.length) {
    await admin.from("business_memberships").upsert(
      sourceMemberships.map((membership) => ({
        business_id: membership.business_id,
        user_id: targetUserId,
        role: membership.role,
        invited_by: targetUserId,
      })),
      { onConflict: "business_id,user_id" }
    );

    await admin.from("business_memberships").delete().eq("user_id", sourceUserId);
  }

  await admin.from("notifications").delete().eq("user_id", sourceUserId);
  await admin.from("profiles").delete().eq("id", sourceUserId);
  await admin.auth.admin.deleteUser(sourceUserId);

  revalidatePath("/admin/users");
}

export async function getImpersonationPath(userId: string) {
  await requireAdmin();
  return `/dashboard?impersonate=${userId}`;
}

// ── Businesses ───────────────────────────────────────────

export async function getAllBusinesses(filters?: {
  status?: string;
  search?: string;
}) {
  const supabase = await guardAdmin();
  let query = supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.search) query = query.ilike("name", `%${filters.search}%`);

  const { data } = await query;
  return data ?? [];
}

export async function updateBusiness(formData: FormData) {
  const supabase = await guardAdmin();
  const id = formData.get("id") as string;
  const payload: Record<string, unknown> = {};

  const name = formData.get("name") as string | null;
  const status = formData.get("status") as string | null;

  if (name) payload.name = name;
  if (status) payload.status = status;

  await supabase.from("businesses").update(payload).eq("id", id);
  revalidatePath("/admin/businesses");
}

// ── Roadmap Preview ──────────────────────────────────────

export async function getRoadmapPreview(userType: "freelancer" | "agency" | "enterprise") {
  const supabase = await guardAdmin();
  const nowIso = new Date().toISOString();

  const [{ data: phases }, { data: steps }, { data: tags }, { data: stepTags }] =
    await Promise.all([
      supabase.from("roadmap_phases").select("*").order("sort_order"),
      supabase
        .from("roadmap_steps")
        .select("*")
        .or(`status.eq.published,and(status.eq.scheduled,publish_at.lte.${nowIso})`)
        .order("sort_order"),
      supabase.from("audience_tags").select("id,label"),
      supabase.from("roadmap_step_tags").select("step_id,tag_id"),
    ]);

  const tagMap = new Map((tags ?? []).map((t: { id: string; label: string }) => [t.id, t.label]));

  const filteredSteps = (steps ?? []).filter((step: { id: string }) => {
    const links = (stepTags ?? []).filter(
      (rel: { step_id: string; tag_id: string }) => rel.step_id === step.id
    );
    if (links.length === 0) return true;
    return links.some(
      (rel: { tag_id: string }) => tagMap.get(rel.tag_id)?.toLowerCase() === userType
    );
  });

  return (phases ?? []).map((phase: { id: string }) => ({
    ...phase,
    steps: filteredSteps.filter((step: { phase_id: string }) => step.phase_id === phase.id),
  }));
}

// ── Feature Flags ────────────────────────────────────────

export async function getFeatureFlags() {
  const supabase = await guardAdmin();
  const { data } = await supabase.from("feature_flags").select("*").order("key");
  return data ?? [];
}

export async function toggleFeatureFlag(id: string, enabled: boolean) {
  const supabase = await guardAdmin();
  await supabase.from("feature_flags").update({ enabled }).eq("id", id);
  revalidatePath("/admin/settings");
}

export async function upsertFeatureFlag(formData: FormData) {
  const supabase = await guardAdmin();
  const id = formData.get("id") as string | null;
  const payload = {
    key: formData.get("key") as string,
    label: formData.get("label") as string,
    enabled: formData.get("enabled") === "on",
  };

  if (id) {
    await supabase.from("feature_flags").update(payload).eq("id", id);
  } else {
    await supabase.from("feature_flags").insert(payload);
  }
  revalidatePath("/admin/settings");
}

// ── Email Templates ──────────────────────────────────────

export async function getEmailTemplates() {
  const supabase = await guardAdmin();
  const { data } = await supabase.from("email_templates").select("*").order("slug");
  return data ?? [];
}

export async function upsertEmailTemplate(formData: FormData) {
  const supabase = await guardAdmin();
  const id = formData.get("id") as string | null;
  const payload = {
    slug: formData.get("slug") as string,
    subject: formData.get("subject") as string,
    body: formData.get("body") as string,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    await supabase.from("email_templates").update(payload).eq("id", id);
  } else {
    await supabase.from("email_templates").insert(payload);
  }
  revalidatePath("/admin/settings");
}

// ── Subscription Plans ───────────────────────────────────

export async function getSubscriptionPlans() {
  const supabase = await guardAdmin();
  const { data } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("price_cents");
  return data ?? [];
}

export async function upsertSubscriptionPlan(formData: FormData) {
  const supabase = await guardAdmin();
  const id = formData.get("id") as string | null;
  const featuresRaw = formData.get("features") as string;
  const payload = {
    name: formData.get("name") as string,
    features: featuresRaw ? featuresRaw.split("\n").filter(Boolean) : [],
    price_cents: Number(formData.get("price_cents") ?? 0),
    active: formData.get("active") === "on",
  };

  if (id) {
    await supabase.from("subscription_plans").update(payload).eq("id", id);
  } else {
    await supabase.from("subscription_plans").insert(payload);
  }
  revalidatePath("/admin/settings");
}

// ── Announcements ────────────────────────────────────────

export async function getAnnouncements() {
  const supabase = await guardAdmin();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function upsertAnnouncement(formData: FormData) {
  const supabase = await guardAdmin();
  const id = formData.get("id") as string | null;
  const payload = {
    title: formData.get("title") as string,
    body: formData.get("body") as string,
    audience: (formData.get("audience") as string) || "all",
    published: formData.get("published") === "on",
  };

  if (id) {
    await supabase.from("announcements").update(payload).eq("id", id);
  } else {
    await supabase.from("announcements").insert(payload);
  }
  revalidatePath("/admin/comms");
}

export async function deleteAnnouncement(id: string) {
  const supabase = await guardAdmin();
  await supabase.from("announcements").delete().eq("id", id);
  revalidatePath("/admin/comms");
}

// ── Notifications ────────────────────────────────────────

export async function sendNotification(formData: FormData) {
  const supabase = await guardAdmin();
  const audience = (formData.get("audience") as string) || "all";
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;

  // Get target user IDs based on audience
  let query = supabase.from("profiles").select("id");
  if (audience === "free" || audience === "pro") {
    query = query.eq("plan", audience);
  } else if (["freelancer", "agency", "enterprise"].includes(audience)) {
    query = query.eq("user_type", audience);
  }

  const { data: users } = await query;
  if (!users?.length) return;

  const notifications = users.map((u: { id: string }) => ({
    user_id: u.id,
    title,
    body,
  }));

  await supabase.from("notifications").insert(notifications);
  revalidatePath("/admin/comms");
}

// ── Analytics / Stats ────────────────────────────────────

export async function getAdminStats() {
  const supabase = await guardAdmin();

  const [profilesRes, businessesRes, stepsRes] = await Promise.all([
    supabase.from("profiles").select("id, plan, user_type, last_active, created_at:last_active"),
    supabase.from("businesses").select("id, user_id, completed_tasks, status, created_at"),
    supabase.from("roadmap_steps").select("id, status"),
  ]);

  const profiles = profilesRes.data ?? [];
  const businesses = businessesRes.data ?? [];
  const steps = stepsRes.data ?? [];

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const activeUsers = profiles.filter(
    (p: { last_active: string }) => new Date(p.last_active) > sevenDaysAgo
  ).length;

  const planBreakdown = {
    free: profiles.filter((p: { plan: string }) => p.plan === "free").length,
    pro: profiles.filter((p: { plan: string }) => p.plan === "pro").length,
  };

  const typeBreakdown = {
    freelancer: profiles.filter((p: { user_type: string }) => p.user_type === "freelancer").length,
    agency: profiles.filter((p: { user_type: string }) => p.user_type === "agency").length,
    enterprise: profiles.filter((p: { user_type: string }) => p.user_type === "enterprise").length,
  };

  const recentSignups = profiles.filter(
    (p: { last_active: string }) => new Date(p.last_active) > thirtyDaysAgo
  ).length;

  // Completion rates
  const businessCompletions = businesses.map((b: { completed_tasks: string[] | null }) => {
    const tasks = b.completed_tasks ?? [];
    return tasks.length;
  });
  const avgTasksCompleted = businessCompletions.length
    ? Math.round(businessCompletions.reduce((a: number, b: number) => a + b, 0) / businessCompletions.length)
    : 0;

  return {
    totalUsers: profiles.length,
    activeUsers,
    totalBusinesses: businesses.length,
    planBreakdown,
    typeBreakdown,
    recentSignups,
    avgTasksCompleted,
    dropOffPoints: {
      started: businesses.filter(
        (b: { completed_tasks: string[] | null }) => (b.completed_tasks ?? []).length > 0
      ).length,
      engaged: businesses.filter(
        (b: { completed_tasks: string[] | null }) => (b.completed_tasks ?? []).length >= 3
      ).length,
      nearFinish: businesses.filter(
        (b: { completed_tasks: string[] | null }) => (b.completed_tasks ?? []).length >= 8
      ).length,
      complete: businesses.filter(
        (b: { completed_tasks: string[] | null }) => (b.completed_tasks ?? []).length >= 12
      ).length,
    },
    publishedSteps: steps.filter((s: { status: string }) => s.status === "published").length,
    draftSteps: steps.filter((s: { status: string }) => s.status === "draft").length,
  };
}
