import type {
  Business,
  BusinessActivityLog,
  BusinessInvitation,
  BusinessTeamMember,
  RoadmapPhase,
  RoadmapStep,
  UserEmailPreferences,
  UserNotification,
} from "@/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type BusinessRow = Omit<Business, "completed_tasks" | "view_preference"> & {
  completed_tasks: string[] | null;
  view_preference: Business["view_preference"] | null;
};

const normalizeBusiness = (business: BusinessRow): Business => ({
  ...business,
  completed_tasks: business.completed_tasks ?? [],
  view_preference: business.view_preference ?? "checklist",
});

export const getBusinesses = async (userId: string): Promise<Business[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("*, business_memberships!inner(user_id)")
    .eq("business_memberships.user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch businesses", error.message);
    return [];
  }

  return ((data ?? []) as BusinessRow[]).map(normalizeBusiness);
};

export const getBusiness = async (
  userId: string,
  businessId: string
): Promise<Business | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("*, business_memberships!inner(user_id)")
    .eq("id", businessId)
    .eq("business_memberships.user_id", userId)
    .single();

  if (error || !data) {
    console.error("Failed to fetch business", error?.message);
    return null;
  }

  return normalizeBusiness(data as BusinessRow);
};

export const getBusinessTeam = async (
  userId: string,
  businessId: string
): Promise<BusinessTeamMember[]> => {
  const supabase = await createSupabaseServerClient();
  const { data: accessRow } = await supabase
    .from("businesses")
    .select("id, user_id, business_memberships!inner(user_id)")
    .eq("id", businessId)
    .eq("business_memberships.user_id", userId)
    .maybeSingle();

  if (!accessRow) {
    return [];
  }

  let data:
    | {
        user_id: string;
        role: "owner" | "admin" | "member";
        created_at: string;
      }[]
    | null = null;
  let error: { message?: string } | null = null;

  try {
    const admin = createSupabaseAdminClient();
    const result = await admin
      .from("business_memberships")
      .select("user_id, role, created_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: true });

    data = result.data;
    error = result.error;
  } catch (adminError) {
    console.error("Failed to create admin client for business team", adminError);
    return [];
  }

  if (error) {
    console.error("Failed to fetch business team", error.message);
    return [];
  }

  type MembershipRow = {
    user_id: string;
    role: "owner" | "admin" | "member";
    created_at: string;
  };

  const membershipRows = (data ?? []) as MembershipRow[];
  const userIds = membershipRows.map((row) => row.user_id);

  if (!userIds.length) {
    return [];
  }

  let profiles: { id: string; email: string | null }[] | null = null;

  try {
    const admin = createSupabaseAdminClient();
    const profileResult = await admin
      .from("profiles")
      .select("id, email")
      .in("id", userIds);

    profiles = profileResult.data;
  } catch (adminError) {
    console.error("Failed to fetch profile emails for business team", adminError);
  }

  const emailById = new Map((profiles ?? []).map((profile) => [profile.id, profile.email]));

  return membershipRows.map((row) => ({
    user_id: row.user_id,
    email: emailById.get(row.user_id) ?? "",
    role: row.role,
    created_at: row.created_at,
  }));
};

export const getPublishedRoadmap = async (): Promise<{
  phases: RoadmapPhase[];
  steps: RoadmapStep[];
}> => {
  const supabase = await createSupabaseServerClient();
  const nowIso = new Date().toISOString();

  try {
    const [{ data: phases }, { data: steps }] = await Promise.all([
      supabase.from("roadmap_phases").select("*").order("sort_order"),
      supabase
        .from("roadmap_steps")
        .select("*")
        .or(`status.eq.published,and(status.eq.scheduled,publish_at.lte.${nowIso})`)
        .order("sort_order"),
    ]);

    return {
      phases: phases ?? [],
      steps: steps ?? [],
    };
  } catch (error) {
    console.error("Failed to fetch roadmap", error);
    return { phases: [], steps: [] };
  }
};

export const getPendingBusinessInvitations = async (
  userId: string
): Promise<BusinessInvitation[]> => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("business_invitations")
    .select("id, business_id, invited_user_id, invited_email, invited_by, role, status, responded_at, created_at, businesses(name)")
    .eq("invited_user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch business invitations", error.message);
    return [];
  }

  return (data ?? []).map(
    (invitation: BusinessInvitation & { businesses?: { name?: string | null }[] | null }) => ({
      id: invitation.id,
      business_id: invitation.business_id,
      invited_user_id: invitation.invited_user_id,
      invited_email: invitation.invited_email,
      invited_by: invitation.invited_by,
      role: invitation.role,
      status: invitation.status,
      responded_at: invitation.responded_at,
      created_at: invitation.created_at,
      business_name: invitation.businesses?.[0]?.name ?? undefined,
    })
  );
};

export const getBusinessPendingInvitations = async (
  userId: string,
  businessId: string
): Promise<BusinessInvitation[]> => {
  const supabase = await createSupabaseServerClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("id, user_id")
    .eq("id", businessId)
    .maybeSingle();

  if (!business || business.user_id !== userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("business_invitations")
    .select("id, business_id, invited_user_id, invited_email, invited_by, role, status, responded_at, created_at")
    .eq("business_id", businessId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch pending business invitations", error.message);
    return [];
  }

  return (data ?? []) as BusinessInvitation[];
};

export const getBusinessActivityLog = async (
  userId: string,
  businessId: string
): Promise<BusinessActivityLog[]> => {
  const supabase = await createSupabaseServerClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, user_id")
    .eq("id", businessId)
    .maybeSingle();

  if (!business) {
    return [];
  }

  const isMember = await supabase
    .from("business_memberships")
    .select("id")
    .eq("business_id", businessId)
    .eq("user_id", userId)
    .maybeSingle();

  if (business.user_id !== userId && !isMember.data) {
    return [];
  }

  const { data, error } = await supabase
    .from("business_activity_log")
    .select("id, business_id, user_id, action, target_user_id, metadata, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to fetch activity log", error.message);
    return [];
  }

  return (data ?? []) as BusinessActivityLog[];
};

export const getUserNotifications = async (userId: string): Promise<UserNotification[]> => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_notifications")
    .select("id, user_id, type, title, body, data, read, read_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to fetch notifications", error.message);
    return [];
  }

  return (data ?? []) as UserNotification[];
};

export const getUnreadNotificationsCount = async (userId: string): Promise<number> => {
  const supabase = await createSupabaseServerClient();

  const { count, error } = await supabase
    .from("user_notifications")
    .select("id", { count: "exact" })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    console.error("Failed to fetch unread count", error.message);
    return 0;
  }

  return count ?? 0;
};

export const getUserEmailPreferences = async (userId: string): Promise<UserEmailPreferences | null> => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_email_preferences")
    .select("user_id, invitation_emails, invitation_response_emails, activity_emails, announcement_emails, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch email preferences", error.message);
    return null;
  }

  return data as UserEmailPreferences | null;
};

export const markNotificationsAsRead = async (userId: string): Promise<void> => {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("user_notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    console.error("Failed to mark notifications as read", error.message);
  }
};
