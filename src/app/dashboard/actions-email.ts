"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserEmailPreferences } from "@/types";

const emailPreferencesSchema = z.object({
  invitation_emails: z.boolean(),
  invitation_response_emails: z.boolean(),
  activity_emails: z.boolean(),
  announcement_emails: z.boolean(),
});

export const getEmailPreferencesAction = async (): Promise<{
  preferences?: UserEmailPreferences;
  error?: string;
}> => {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_email_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to get email preferences", error.message);
    return { error: "Could not load email preferences." };
  }

  return { preferences: data ?? undefined };
};

export const updateEmailPreferencesAction = async (
  input: z.infer<typeof emailPreferencesSchema>
) => {
  const parsed = emailPreferencesSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid preferences." };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("user_email_preferences").upsert(
    {
      user_id: user.id,
      ...parsed.data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Failed to update email preferences", error.message);
    return { error: "Could not save preferences." };
  }

  revalidatePath("/settings");
  return { success: true };
};
