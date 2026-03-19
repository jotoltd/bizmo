if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.warn("SUPABASE_SERVICE_ROLE_KEY missing: server actions limited");

export const envServer = {
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};
