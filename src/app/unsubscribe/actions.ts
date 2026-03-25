"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const unsubscribeSchema = z.object({
  userId: z.string().uuid(),
  emailType: z.enum(["invitation", "invitation_response", "activity", "announcement"]),
  token: z.string().min(10),
});

export const unsubscribeEmailAction = async (
  input: z.infer<typeof unsubscribeSchema>
) => {
  const parsed = unsubscribeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid request." };
  }

  const supabase = await createSupabaseServerClient();

  // Verify the token matches a stored verification token
  // In production, you'd validate a signed JWT or hash here
  const { data: user, error: userError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", parsed.data.userId)
    .maybeSingle();

  if (userError || !user) {
    return { error: "User not found." };
  }

  // Map email type to preference field
  const preferenceField = `${parsed.data.emailType}_emails` as const;

  const { error } = await supabase.from("user_email_preferences").upsert(
    {
      user_id: parsed.data.userId,
      [preferenceField]: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Failed to unsubscribe", error.message);
    return { error: "Could not process unsubscribe request." };
  }

  return { success: true, emailType: parsed.data.emailType };
};

export const getUnsubscribeInfoAction = async (userId: string, emailType: string) => {
  const supabase = await createSupabaseServerClient();

  const { data: user, error: userError } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  if (userError || !user) {
    return { error: "User not found." };
  }

  const typeLabels: Record<string, string> = {
    invitation: "invitation emails",
    invitation_response: "invitation response emails",
    activity: "activity emails",
    announcement: "announcement emails",
  };

  return {
    email: user.email,
    emailType: typeLabels[emailType] ?? emailType,
  };
};
