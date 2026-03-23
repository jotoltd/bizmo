"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BillingManager() {
  const [activeTab, setActiveTab] = useState<"subscriptions" | "invoices" | "settings">("subscriptions");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <Button
          variant={activeTab === "subscriptions" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("subscriptions")}
        >
          Subscriptions
        </Button>
        <Button
          variant={activeTab === "invoices" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("invoices")}
        >
          Invoices
        </Button>
        <Button
          variant={activeTab === "settings" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </Button>
      </div>

      {activeTab === "subscriptions" && (
        <div className="space-y-4">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-4">Subscription Overview</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Active Subscriptions" value="0" />
              <StatCard label="Monthly Revenue" value="£0" />
              <StatCard label="Trial Users" value="0" />
            </div>
          </div>
          <div className="glass-panel p-6">
            <p className="text-sm text-slate-400">
              Billing integration with Stripe is ready. Set your STRIPE_SECRET_KEY in environment
              variables to activate subscription management.
            </p>
          </div>
        </div>
      )}

      {activeTab === "invoices" && (
        <div className="glass-panel p-8 text-center">
          <p className="text-slate-400">No invoices yet. Billing data will appear here once Stripe is connected.</p>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-semibold">Stripe Configuration</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-sm text-slate-300">Stripe Connection</span>
              <span className="text-xs text-amber-400">Not Connected</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-sm text-slate-300">Webhook Endpoint</span>
              <span className="text-xs text-slate-400">https://bizno.co.uk/api/stripe/webhook</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-sm text-slate-300">Test Mode</span>
              <span className="text-xs text-slate-400">Enabled</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to your environment variables to activate.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel p-4">
      <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
