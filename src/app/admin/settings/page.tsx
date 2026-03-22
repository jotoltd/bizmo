import {
  getFeatureFlags,
  getEmailTemplates,
  getSubscriptionPlans,
} from "@/lib/admin/actions";
import { SettingsManager } from "./settings-manager";

export default async function AdminSettingsPage() {
  const [flags, templates, plans] = await Promise.all([
    getFeatureFlags(),
    getEmailTemplates(),
    getSubscriptionPlans(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-electric">Admin</p>
        <h1 className="text-3xl font-semibold">Platform Settings</h1>
        <p className="text-sm text-slate-400">
          Feature flags, email templates, and subscription plans.
        </p>
      </div>
      <SettingsManager
        initialFlags={flags}
        initialTemplates={templates}
        initialPlans={plans}
      />
    </div>
  );
}
