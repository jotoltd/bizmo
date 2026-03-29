import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { envClient } from "@/lib/env-client";

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();
  if (!envClient.supabaseUrl || !envClient.supabaseAnonKey) {
    throw new Error("Missing Supabase configuration: SUPABASE_URL or SUPABASE_ANON_KEY");
  }
  return createServerClient(envClient.supabaseUrl, envClient.supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Ignore cookie errors in static generation
        }
      },
      remove(name: string, options: Record<string, unknown>) {
        try {
          cookieStore.delete({ name, ...options });
        } catch {
          // Ignore cookie errors in static generation
        }
      },
    },
  });
};
