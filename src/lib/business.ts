import type { Business } from "@/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getBusinesses = async (userId: string): Promise<Business[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch businesses", error.message);
    return [];
  }

  return (data ?? []) as Business[];
};

export const getBusiness = async (
  userId: string,
  businessId: string
): Promise<Business | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.error("Failed to fetch business", error?.message);
    return null;
  }

  return data as Business;
};
