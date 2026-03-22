import { redirect } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import type { Profile } from "@/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getSupabaseSession = async (): Promise<Session | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Failed to fetch session", error.message);
    return null;
  }

  return session;
};

export const requireSession = async (): Promise<Session> => {
  const session = await getSupabaseSession();
  if (!session) redirect("/login");
  return session;
};

export const requireUser = async (): Promise<User> => {
  const session = await requireSession();
  if (!session.user) redirect("/login");
  return session.user;
};

export const getProfile = async (): Promise<Profile | null> => {
  const session = await getSupabaseSession();
  if (!session?.user) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, plan, role, user_type, last_active, suspended")
    .eq("id", session.user.id)
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
