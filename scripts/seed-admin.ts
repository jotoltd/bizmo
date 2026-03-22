/**
 * Seed the admin user via Supabase Admin API.
 * Run: npx tsx scripts/seed-admin.ts
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const email = "hello@bizno.co.uk";
  const password = "lalala14";

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);

  let userId: string;

  if (existing) {
    console.log(`User ${email} already exists (${existing.id}), updating password...`);
    await supabase.auth.admin.updateUserById(existing.id, { password });
    userId = existing.id;
  } else {
    console.log(`Creating user ${email}...`);
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      console.error("Failed to create user:", error.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`Created user ${userId}`);
  }

  // Set profile to admin role
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", userId);

  if (profileError) {
    console.error("Failed to update profile:", profileError.message);
    process.exit(1);
  }

  console.log(`✓ Admin user ready: ${email} (${userId})`);
}

main();
