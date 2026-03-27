import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendAPNSNotification } from "@/lib/push/apns";

type MobileDeviceTokenRow = {
  id: string;
  device_token: string;
  environment: "sandbox" | "production";
};

export const dispatchPushToUser = async ({
  userId,
  title,
  body,
  data,
}: {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) => {
  try {
    const admin = createSupabaseAdminClient();
    const { data: tokens, error } = await admin
      .from("mobile_device_tokens")
      .select("id, device_token, environment")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (error) {
      console.error("Failed to load mobile device tokens", error.message);
      return;
    }

    const rows = (tokens ?? []) as MobileDeviceTokenRow[];
    for (const row of rows) {
      const result = await sendAPNSNotification(row.device_token, {
        title,
        body,
        data,
        sandbox: row.environment === "sandbox",
      });

      if (!result.ok && result.reason && result.reason !== "APNS_NOT_CONFIGURED") {
        console.error("Failed to send APNs notification", result.reason, result.status);
      }

      if (result.shouldDeactivateToken) {
        const { error: deactivateError } = await admin
          .from("mobile_device_tokens")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("id", row.id);

        if (deactivateError) {
          console.error("Failed to deactivate stale device token", deactivateError.message);
        }
      }
    }
  } catch (error) {
    console.error("Unexpected push dispatch error", error);
  }
};
