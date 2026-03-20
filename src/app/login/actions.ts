"use server";

import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const adminClient = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
})();

export const signUpAction = async (input: {
  email: string;
  password: string;
}) => {
  const { email, password } = input;

  if (!email || !password || password.length < 6) {
    return { error: "Please provide a valid email and password (min 6 characters)." };
  }

  if (!adminClient) {
    return { error: "Server configuration error. Please try again later." };
  }

  // Create user via admin API — auto-confirmed, no SMTP email sent
  const { data: newUser, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError) {
    // Supabase returns "A user with this email address has already been registered"
    if (createError.message?.toLowerCase().includes("already")) {
      return { error: "An account with this email already exists. Try signing in instead." };
    }
    console.error("Admin createUser failed:", createError.message);
    return { error: createError.message };
  }

  // Now sign the user in so the session cookie is set
  const supabase = await createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error("Post-signup signIn failed:", signInError.message);
    return { error: "Account created but sign-in failed. Please sign in manually." };
  }

  return { success: true };
};
