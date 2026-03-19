const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const NEXT_PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

if (!NEXT_PUBLIC_SUPABASE_URL)
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");

if (!NEXT_PUBLIC_SUPABASE_ANON_KEY)
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");

export const envClient = {
  supabaseUrl: NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: NEXT_PUBLIC_SUPABASE_ANON_KEY,
  siteUrl: NEXT_PUBLIC_SITE_URL,
};
