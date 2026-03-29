import { getRecentActivity } from "@/lib/admin/extended-actions";
import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity Log | Admin | Bizno",
  description: "View all platform activity including user signups, business creations, and support tickets.",
  robots: "noindex",
};

export default async function ActivityPage() {
  const activity = await getRecentActivity(50);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-electric">Admin</p>
        <h1 className="text-3xl font-semibold">Activity Log</h1>
        <p className="text-sm text-slate-400">View all platform activity.</p>
      </div>

      <div className="glass-panel p-6">
        <div className="space-y-3">
          {activity.length === 0 ? (
            <p className="text-slate-500 text-sm">No activity recorded yet.</p>
          ) : (
            activity.map((item) => (
              <Link
                key={item.id}
                href={item.link || "#"}
                className="flex items-center gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer"
              >
                <span className="text-2xl">
                  {item.type === "user_signup" && "👤"}
                  {item.type === "business_created" && "🏢"}
                  {item.type === "support_ticket" && "🎫"}
                  {item.type === "invitation_sent" && "📧"}
                  {item.type === "login" && "🔑"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-xs text-slate-400 truncate">{item.description}</p>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
