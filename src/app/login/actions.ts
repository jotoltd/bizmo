"use server";

import { envServer } from "@/lib/env-server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendVerificationEmail } from "@/lib/email/sendgrid";

export const signUpAction = async (input: {
  email: string;
  password: string;
}) => {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !password || password.length < 6) {
    return { error: "Please provide a valid email and password (min 6 characters)." };
  }

  if (!envServer.serviceRoleKey) {
    return { error: "Server configuration error. Please try again later." };
  }

  const adminClient = createSupabaseAdminClient();
  const redirectTo = `${envServer.siteUrl}/auth/callback?redirect=/dashboard`;

  const { data, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      redirectTo,
    },
  });

  if (linkError) {
    if (linkError.message?.toLowerCase().includes("already")) {
      return { error: "An account with this email already exists. Try signing in instead." };
    }
    console.error("Supabase verification link generation failed", linkError.message);
    return { error: "Could not create your account right now." };
  }

  const verifyUrl = data.properties?.action_link;
  if (!verifyUrl) {
    return { error: "Could not generate verification link." };
  }

  const emailResult = await sendVerificationEmail({
    to: email,
    verifyUrl,
  });

  if (emailResult.error) {
    return { error: emailResult.error };
  }

  return { success: true, verificationSent: true };
};
