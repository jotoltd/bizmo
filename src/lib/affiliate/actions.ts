"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { z } from "zod";

const trackClickSchema = z.object({
  stepId: z.string(),
  affiliateUrl: z.string(),
  affiliateName: z.string().optional(),
  businessId: z.string().uuid(),
});

export async function trackAffiliateClickAction(
  input: z.infer<typeof trackClickSchema>
) {
  const parsed = trackClickSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid tracking data" };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  try {
    await supabase.from("affiliate_clicks").insert({
      user_id: user.id,
      business_id: parsed.data.businessId,
      step_id: parsed.data.stepId,
      affiliate_url: parsed.data.affiliateUrl,
      affiliate_name: parsed.data.affiliateName || null,
      clicked_at: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to track affiliate click", error);
    return { error: "Failed to track click" };
  }
}
