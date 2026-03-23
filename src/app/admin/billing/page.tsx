import { BillingManager } from "./billing-manager";

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-electric">Admin</p>
        <h1 className="text-3xl font-semibold">Billing & Payments</h1>
        <p className="text-sm text-slate-400">
          Manage subscriptions, invoices, and payment settings.
        </p>
      </div>
      <BillingManager />
    </div>
  );
}
