"use server";

import { randomUUID } from "crypto";
import { envServer } from "@/lib/env-server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendVerificationEmail } from "@/lib/email/resend";

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

export const resendConfirmationAction = async (input: { email: string }) => {
  const email = input.email.trim().toLowerCase();
  if (!email) {
    return { error: "Please provide a valid email." };
  }

  if (!envServer.serviceRoleKey) {
    return { error: "Server configuration error. Please try again later." };
  }

  const adminClient = createSupabaseAdminClient();
  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (!existingProfile) {
    return { success: true };
  }

  const redirectTo = `${envServer.siteUrl}/auth/callback?redirect=/dashboard`;

  const { data, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "signup",
    email,
    password: `${randomUUID()}Aa1!`,
    options: {
      redirectTo,
    },
  });

  if (linkError) {
    console.error("Supabase resend link generation failed", linkError.message);
    return { error: "Could not generate a confirmation link for this email." };
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

  return { success: true };
};
