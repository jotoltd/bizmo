import type { Business, BusinessTeamMember } from "@/types";
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

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("business_memberships")
    .select("user_id, role, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch business team", error.message);
    return [];
  }

  type MembershipRow = {
    user_id: string;
    role: "owner" | "member";
    created_at: string;
  };

  const membershipRows = (data ?? []) as MembershipRow[];
  const userIds = membershipRows.map((row) => row.user_id);

  if (!userIds.length) {
    return [];
  }

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email")
    .in("id", userIds);

  const emailById = new Map((profiles ?? []).map((profile) => [profile.id, profile.email]));

  return membershipRows.map((row) => ({
    user_id: row.user_id,
    email: emailById.get(row.user_id) ?? "",
    role: row.role,
    created_at: row.created_at,
  }));
};
