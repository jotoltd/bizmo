import { getEmailCampaigns } from "@/lib/admin/extended-actions";
import { CampaignsManager } from "./campaigns-manager";

export default async function CampaignsPage() {
  const campaigns = await getEmailCampaigns();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-electric">Admin</p>
        <h1 className="text-3xl font-semibold">Email Campaigns</h1>
        <p className="text-sm text-slate-400">
          Create, schedule, and track email campaigns to your users.
        </p>
      </div>
      <CampaignsManager initialCampaigns={campaigns} />
    </div>
  );
}
