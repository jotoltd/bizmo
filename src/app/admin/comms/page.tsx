import { getAnnouncements } from "@/lib/admin/actions";
import { CommsManager } from "./comms-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Communications | Admin | Bizno",
  description: "Send announcements and manage platform communications.",
};

export default async function AdminCommsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-electric">Admin</p>
        <h1 className="text-3xl font-semibold">Comms & Engagement</h1>
        <p className="text-sm text-slate-400">
          Send announcements, broadcast notifications, and manage user engagement.
        </p>
      </div>
      <CommsManager initialAnnouncements={announcements} />
    </div>
  );
}
