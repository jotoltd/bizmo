import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getSupabaseUser = async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (error.message.toLowerCase().includes("auth session missing")) {
      return null;
    }
    console.error("Failed to fetch authenticated user", error.message);
    return null;
  }

  return user ?? null;
};

export const requireUser = async (): Promise<User> => {
  const user = await getSupabaseUser();
  if (!user) redirect("/login");
  return user;
};

export const getProfile = async (): Promise<Profile | null> => {
  const user = await getSupabaseUser();
  if (!user) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, plan, role, user_type, last_active, suspended")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Failed to fetch profile", error.message);
    return null;
  }

  return data as Profile;
};

export const requireProfile = async (): Promise<Profile> => {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  return profile;
};

export const requireAdmin = async (): Promise<Profile> => {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
};
