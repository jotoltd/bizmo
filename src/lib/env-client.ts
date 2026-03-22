const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const NEXT_PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function getSupabaseUrl(): string {
  if (!NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }
  return NEXT_PUBLIC_SUPABASE_URL;
}

function getSupabaseAnonKey(): string {
  if (!NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
  }
  return NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export const envClient = {
  get supabaseUrl() {
    return getSupabaseUrl();
  },
  get supabaseAnonKey() {
    return getSupabaseAnonKey();
  },
  siteUrl: NEXT_PUBLIC_SITE_URL,
};
