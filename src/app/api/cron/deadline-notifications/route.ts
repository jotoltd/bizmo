import { emitDeadlineNotifications } from "@/lib/notifications/deadlines";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const JOB_NAME = "deadline-notifications";

const logCronRun = async ({
  status,
  details,
  errorMessage,
  startedAt,
}: {
  status: "success" | "failure" | "unauthorized";
  details?: Record<string, unknown>;
  errorMessage?: string;
  startedAt: string;
}) => {
  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("cron_job_runs").insert({
      job_name: JOB_NAME,
      status,
      details: details ?? {},
      error_message: errorMessage ?? null,
      started_at: startedAt,
      finished_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to log cron run", error.message);
    }
  } catch (error) {
    console.error("Unexpected error logging cron run", error);
  }
};

const authorized = (request: Request) => {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return process.env.NODE_ENV !== "production";
  }

  const token =
    request.headers.get("x-cron-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  return token === cronSecret;
};

export async function GET(request: Request) {
  const startedAt = new Date().toISOString();

  if (!authorized(request)) {
    await logCronRun({
      status: "unauthorized",
      details: {
        hasCronSecret: Boolean(process.env.CRON_SECRET),
      },
      errorMessage: "Unauthorized request",
      startedAt,
    });
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await emitDeadlineNotifications();
    await logCronRun({
      status: "success",
      details: result,
      startedAt,
    });
    return Response.json({ ok: true, ...result });
  } catch (error) {
    console.error("Deadline notification cron failed", error);
    await logCronRun({
      status: "failure",
      errorMessage: error instanceof Error ? error.message : "Unknown cron error",
      startedAt,
    });
    return Response.json({ error: "Cron execution failed" }, { status: 500 });
  }
}
