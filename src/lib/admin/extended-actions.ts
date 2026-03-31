"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// ── Audit Logs ────────────────────────────────────────────

export async function getAuditLogs(filters?: {
  action?: string;
  adminId?: string;
  targetType?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}) {
  const supabase = await createSupabaseServerClient();
  await requireAdmin();

  try {
    let query = supabase
      .from("admin_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(filters?.limit ?? 100);

    if (filters?.action) query = query.eq("action", filters.action);
    if (filters?.adminId) query = query.eq("admin_id", filters.adminId);
    if (filters?.targetType) query = query.eq("target_type", filters.targetType);
    if (filters?.dateFrom) query = query.gte("created_at", filters.dateFrom);
    if (filters?.dateTo) query = query.lte("created_at", filters.dateTo);

    const { data, error } = await query;
    if (error) {
      console.error("Audit logs query error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error("Audit logs error:", e);
    return [];
  }
}

export async function getAuditActions() {
  const supabase = await createSupabaseServerClient();
  await requireAdmin();

  const { data } = await supabase
    .from("admin_audit_logs")
    .select("action")
    .order("action");

  // Return unique actions
  const actions = new Set(data?.map((d) => d.action) ?? []);
  return Array.from(actions).sort();
}

// ── Login History ────────────────────────────────────────

export async function getLoginHistory(filters?: {
  userId?: string;
  eventType?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}) {
  const supabase = await createSupabaseServerClient();
  await requireAdmin();

  try {
    let query = supabase
      .from("login_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(filters?.limit ?? 100);

    if (filters?.userId) query = query.eq("user_id", filters.userId);
    if (filters?.eventType) query = query.eq("event_type", filters.eventType);
    if (filters?.dateFrom) query = query.gte("created_at", filters.dateFrom);
    if (filters?.dateTo) query = query.lte("created_at", filters.dateTo);

    const { data, error } = await query;
    if (error) {
      console.error("Login history query error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error("Login history error:", e);
    return [];
  }
}

export async function getFailedLoginsLast24h() {
  const supabase = await createSupabaseServerClient();
  await requireAdmin();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { data } = await supabase
    .from("login_history")
    .select("user_id, email, count")
    .eq("event_type", "failed_login")
    .eq("success", false)
    .gte("created_at", yesterday.toISOString())
    .order("count", { ascending: false })
    .limit(20);

  return data ?? [];
}

// ── Support Tickets ───────────────────────────────────────

export async function getSupportTickets(filters?: {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  limit?: number;
}) {
  const supabase = await createSupabaseServerClient();
  await requireAdmin();

  try {
    let query = supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(filters?.limit ?? 50);

    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.priority) query = query.eq("priority", filters.priority);
    if (filters?.category) query = query.eq("category", filters.category);
    if (filters?.assignedTo) query = query.eq("assigned_to", filters.assignedTo);

    const { data, error } = await query;
    if (error) {
      console.error("Support tickets query error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error("Support tickets error:", e);
    return [];
  }
}

export async function getSupportTicketById(ticketId: string) {
  const supabase = await createSupabaseServerClient();
  await requireAdmin();

  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  if (ticketError) throw new Error(ticketError.message);

  const { data: replies, error: repliesError } = await supabase
    .from("support_ticket_replies")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (repliesError) throw new Error(repliesError.message);

  return { ticket, replies: replies ?? [] };
}

export async function updateTicketStatus(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const admin = await requireAdmin();

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const priority = formData.get("priority") as string | null;
  const assignedTo = formData.get("assigned_to") as string | null;
  const resolutionNotes = formData.get("resolution_notes") as string | null;

  const updates: Record<string, unknown> = { status };
  if (priority) updates.priority = priority;
  if (assignedTo) updates.assigned_to = assignedTo || null;
  if (resolutionNotes) updates.resolution_notes = resolutionNotes;
  if (status === "resolved") updates.resolved_at = new Date().toISOString();

  const { error } = await supabase
    .from("support_tickets")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(error.message);

  // Log the action
  await supabase.rpc("log_admin_action", {
    p_admin_id: admin.id,
    p_admin_email: admin.email,
    p_action: "update_ticket",
    p_target_type: "ticket",
    p_target_id: id,
    p_details: { status, priority, assigned_to: assignedTo },
  });

  revalidatePath("/admin/support");
}

export async function replyToTicket(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const admin = await requireAdmin();

  const ticketId = formData.get("ticket_id") as string;
  const body = formData.get("body") as string;
  const internalNote = formData.get("internal_note") === "on";

  const { error } = await supabase.from("support_ticket_replies").insert({
    ticket_id: ticketId,
    author_id: admin.id,
    author_email: admin.email,
    is_staff: true,
    body,
    internal_note: internalNote,
  });

  if (error) throw new Error(error.message);

  // Update ticket status if not internal
  if (!internalNote) {
    await supabase
      .from("support_tickets")
      .update({ status: "waiting_user" })
      .eq("id", ticketId);
  }

  revalidatePath("/admin/support");
}

// ── System Health ──────────────────────────────────────────

export async function getSystemMetrics(timeRange: "1h" | "24h" | "7d" | "30d" = "24h") {
  const supabase = await createSupabaseServerClient();
  await requireAdmin();

  const hours = { "1h": 1, "24h": 24, "7d": 168, "30d": 720 }[timeRange];
  const since = new Date();
  since.setHours(since.getHours() - hours);

  const { data, error } = await supabase
    .from("system_health_metrics")
    .select("*")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCurrentSystemStats() {
  const supabase = await createSupabaseServerClient();
  await requireAdmin();

  try {
    const usersRes = await supabase.from("profiles").select("id, last_active", { count: "exact", head: true });
    const businessesRes = await supabase.from("businesses").select("id", { count: "exact", head: true });

    // These tables may not exist yet, so we wrap them safely
    let openTickets = 0;
    let logins24h = 0;
    let failedLogins24h = 0;

    try {
      const ticketsRes = await supabase
        .from("support_tickets")
        .select("id", { count: "exact", head: true })
        .eq("status", "open");
      openTickets = ticketsRes.count ?? 0;
    } catch (e) {
      console.error("Support tickets table not ready:", e);
    }

    try {
      const recentLoginsRes = await supabase
        .from("login_history")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      logins24h = recentLoginsRes.count ?? 0;
    } catch (e) {
      console.error("Login history table not ready:", e);
    }

    try {
      const failedLoginsRes = await supabase
        .from("login_history")
        .select("id", { count: "exact", head: true })
        .eq("event_type", "failed_login")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      failedLogins24h = failedLoginsRes.count ?? 0;
    } catch (e) {
      console.error("Failed logins query error:", e);
    }

    return {
      totalUsers: usersRes.count ?? 0,
      activeUsers24h: usersRes.count ?? 0,
      totalBusinesses: businessesRes.count ?? 0,
      openTickets,
      logins24h,
      failedLogins24h,
    };
  } catch (e) {
    console.error("System stats error:", e);
    return {
      totalUsers: 0,
      activeUsers24h: 0,
      totalBusinesses: 0,
      openTickets: 0,
      logins24h: 0,
      failedLogins24h: 0,
    };
  }
}

// ── Rate Limiting ─────────────────────────────────────────

export async function getRateLimitConfigs() {
  const supabase = await createSupabaseServerClient();
  await requireAdmin();

  try {
    const { data, error } = await supabase
      .from("rate_limit_config")
      .select("*")
      .order("endpoint_pattern");

    if (error) {
      console.error("Rate limit config query error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error("Rate limit config error:", e);
    return [];
  }
}

export async function upsertRateLimitConfig(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  await requireAdmin();

  const id = formData.get("id") as string | null;
  const pattern = formData.get("endpoint_pattern") as string;
  const rpm = Number(formData.get("requests_per_minute") ?? 60);
  const rph = Number(formData.get("requests_per_hour") ?? 1000);
  const burst = Number(formData.get("burst_limit") ?? 10);
  const enabled = formData.get("enabled") === "on";

  const payload = {
    endpoint_pattern: pattern,
    requests_per_minute: rpm,
    requests_per_hour: rph,
    burst_limit: burst,
    enabled,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await supabase
      .from("rate_limit_config")
      .update(payload)
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("rate_limit_config").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/security");
}

// ── Email Campaigns ──────────────────────────────────────

export async function getEmailCampaigns(status?: string) {
  const supabase = await createSupabaseServerClient();
  await requireAdmin();

  try {
    let query = supabase
      .from("email_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) {
      console.error("Email campaigns query error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error("Email campaigns error:", e);
    return [];
  }
}

export async function getEmailCampaignById(id: string) {
  const supabase = await createSupabaseServerClient();
  await requireAdmin();

  const { data, error } = await supabase
    .from("email_campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function upsertEmailCampaign(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const admin = await requireAdmin();

  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const subject = formData.get("subject") as string;
  const bodyHtml = formData.get("body_html") as string;
  const bodyText = formData.get("body_text") as string | null;
  const audience = formData.get("audience") as string;
  const scheduledAt = formData.get("scheduled_at") as string | null;
  const status = formData.get("status") as string;

  const payload: Record<string, unknown> = {
    name,
    subject,
    body_html: bodyHtml,
    body_text: bodyText,
    audience,
    status,
    created_by: admin.id,
    updated_at: new Date().toISOString(),
  };

  if (scheduledAt) {
    payload.scheduled_at = scheduledAt;
  }

  if (id) {
    const { error } = await supabase
      .from("email_campaigns")
      .update(payload)
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("email_campaigns").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/campaigns");
}

export async function sendCampaignNow(campaignId: string) {
  const supabase = await createSupabaseServerClient();
  const admin = await requireAdmin();

  // Get campaign details
  const { data: campaign, error: campaignError } = await supabase
    .from("email_campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (campaignError) throw new Error(campaignError.message);

  // Get target users based on audience
  let userQuery = supabase.from("profiles").select("id, email");

  if (["freelancer", "agency", "enterprise"].includes(campaign.audience)) {
    userQuery = userQuery.eq("user_type", campaign.audience);
  }

  const { data: users, error: usersError } = await userQuery;
  if (usersError) throw new Error(usersError.message);

  // In production, this would queue emails to a job queue
  // For now, just update the campaign status
  const { error: updateError } = await supabase
    .from("email_campaigns")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      sent_count: users?.length ?? 0,
    })
    .eq("id", campaignId);

  if (updateError) throw new Error(updateError.message);

  // Log the action
  await supabase.rpc("log_admin_action", {
    p_admin_id: admin.id,
    p_admin_email: admin.email,
    p_action: "send_campaign",
    p_target_type: "campaign",
    p_target_id: campaignId,
    p_details: { audience: campaign.audience, recipient_count: users?.length ?? 0 },
  });

  revalidatePath("/admin/campaigns");
}

export async function deleteCampaign(id: string) {
  const supabase = await createSupabaseServerClient();
  await requireAdmin();

  const { error } = await supabase.from("email_campaigns").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/campaigns");
}

// Recent Activity Feed
export type ActivityItem = {
  id: string;
  type: "user_signup" | "business_created" | "support_ticket" | "invitation_sent" | "login";
  title: string;
  description: string;
  userEmail?: string;
  createdAt: string;
  link?: string;
};

export async function getRecentActivity(limit = 10): Promise<ActivityItem[]> {
  const supabase = await createSupabaseServerClient();
  await requireAdmin();

  // Get recent users
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, email, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  // Get recent businesses
  const { data: recentBusinesses } = await supabase
    .from("businesses")
    .select("id, name, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(limit);

  // Get recent support tickets
  const { data: recentTickets } = await supabase
    .from("support_tickets")
    .select("id, subject, status, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(limit);

  const activity: ActivityItem[] = [];

  recentUsers?.forEach((user) => {
    activity.push({
      id: `user-${user.id}`,
      type: "user_signup",
      title: "New User Signup",
      description: user.email,
      userEmail: user.email,
      createdAt: user.created_at,
      link: `/admin/users`,
    });
  });

  recentBusinesses?.forEach((biz) => {
    activity.push({
      id: `biz-${biz.id}`,
      type: "business_created",
      title: "Business Created",
      description: biz.name,
      createdAt: biz.created_at,
      link: `/admin/businesses`,
    });
  });

  recentTickets?.forEach((ticket) => {
    activity.push({
      id: `ticket-${ticket.id}`,
      type: "support_ticket",
      title: "Support Ticket",
      description: `${ticket.subject} (${ticket.status})`,
      createdAt: ticket.created_at,
      link: `/admin/support`,
    });
  });

  // Sort by date and limit
  return activity
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

// System Status
export type SystemStatus = {
  database: "healthy" | "degraded" | "down";
  storage: "healthy" | "degraded" | "down";
  auth: "healthy" | "degraded" | "down";
  lastChecked: string;
  issues: string[];
};

export async function getSystemStatus(): Promise<SystemStatus> {
  const supabase = await createSupabaseServerClient();
  await requireAdmin();

  const issues: string[] = [];
  let database: "healthy" | "degraded" | "down" = "healthy";
  let storage: "healthy" | "degraded" | "down" = "healthy";
  let auth: "healthy" | "degraded" | "down" = "healthy";

  // Check database
  const { error: dbError } = await supabase.from("profiles").select("count").single();
  if (dbError) {
    database = "down";
    issues.push("Database connection failed");
  }

  const { error: profileSchemaError } = await supabase
    .from("profiles")
    .select("avatar_url, full_name")
    .limit(1);
  if (profileSchemaError) {
    database = database === "down" ? "down" : "degraded";
    issues.push("Profiles schema mismatch (avatar/full name columns missing).");
  }

  const { error: businessSchemaError } = await supabase
    .from("businesses")
    .select("logo_url")
    .limit(1);
  if (businessSchemaError) {
    database = database === "down" ? "down" : "degraded";
    issues.push("Businesses schema mismatch (logo column missing).");
  }

  // Check storage
  const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
  if (storageError) {
    storage = "degraded";
    issues.push("Storage API slow or unavailable");
  } else {
    const bucketNames = new Set((buckets ?? []).map((bucket) => bucket.name));
    if (!bucketNames.has("avatars") || !bucketNames.has("logos")) {
      storage = "degraded";
      issues.push("Required storage buckets are missing (avatars/logos).");
    }
  }

  try {
    const admin = createSupabaseAdminClient();
    const { error: authUsersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (authUsersError) {
      auth = "degraded";
      issues.push("Auth admin API check failed.");
    }
  } catch {
    auth = "degraded";
    issues.push("Auth admin client unavailable.");
  }

  return {
    database,
    storage,
    auth,
    lastChecked: new Date().toISOString(),
    issues,
  };
}

// Admin Search
export type SearchResult = {
  id: string;
  type: "user" | "business";
  title: string;
  subtitle: string;
  link: string;
};

export async function adminSearch(query: string): Promise<SearchResult[]> {
  const supabase = await createSupabaseServerClient();
  await requireAdmin();

  if (!query || query.length < 2) return [];

  const results: SearchResult[] = [];

  // Search users
  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(5);

  users?.forEach((user) => {
    results.push({
      id: user.id,
      type: "user",
      title: user.full_name || user.email,
      subtitle: user.email,
      link: `/admin/users`,
    });
  });

  // Search businesses
  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name, type")
    .ilike("name", `%${query}%`)
    .limit(5);

  businesses?.forEach((biz) => {
    results.push({
      id: biz.id,
      type: "business",
      title: biz.name,
      subtitle: biz.type || "Unknown type",
      link: `/admin/businesses`,
    });
  });

  return results;
}
