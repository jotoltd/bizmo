"use server";

import { createClient } from "@supabase/supabase-js";

const getAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "signUpAction: missing env vars —",
      url ? "URL ok" : "URL missing",
      key ? "KEY ok" : "KEY missing"
    );
    return null;
  }
  return createClient(url, key);
};

export const signUpAction = async (input: {
  email: string;
  password: string;
}) => {
  const { email, password } = input;

  if (!email || !password || password.length < 6) {
    return { error: "Please provide a valid email and password (min 6 characters)." };
  }

  const adminClient = getAdminClient();
  if (!adminClient) {
    return { error: "Server configuration error. Please try again later." };
  }

  // Create user via admin API — auto-confirmed, no SMTP email sent
  const { error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    if (createError.message?.toLowerCase().includes("already")) {
      return { error: "An account with this email already exists. Try signing in instead." };
    }
    console.error("Admin createUser failed:", createError.message);
    return { error: createError.message };
  }

  // User created and auto-confirmed — client will sign in from the browser
  return { success: true };
};
