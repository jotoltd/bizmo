import { emitDeadlineNotifications } from "@/lib/notifications/deadlines";

export const dynamic = "force-dynamic";

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
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await emitDeadlineNotifications();
    return Response.json({ ok: true, ...result });
  } catch (error) {
    console.error("Deadline notification cron failed", error);
    return Response.json({ error: "Cron execution failed" }, { status: 500 });
  }
}
