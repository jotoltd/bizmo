import { getSupportTickets } from "@/lib/admin/extended-actions";
import { SupportTicketsManager } from "./support-manager";

export default async function SupportTicketsPage() {
  const tickets = await getSupportTickets();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-electric">Admin</p>
        <h1 className="text-3xl font-semibold">Support Tickets</h1>
        <p className="text-sm text-slate-400">
          Manage user support requests and assign to staff.
        </p>
      </div>
      <SupportTicketsManager 
        initialTickets={tickets} 
        adminUsers={[]} // Will be populated from admin profiles
      />
    </div>
  );
}
