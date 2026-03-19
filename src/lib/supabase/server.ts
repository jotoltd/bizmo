import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { envClient } from "@/lib/env-client";

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(envClient.supabaseUrl, envClient.supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.delete({ name, ...options });
      },
    },
  });
};
