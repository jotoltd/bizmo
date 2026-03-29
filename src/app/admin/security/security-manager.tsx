"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { upsertRateLimitConfig } from "@/lib/admin/extended-actions";

type LoginEvent = {
  id: string;
  email: string;
  event_type: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  created_at: string;
};

type RateLimitConfig = {
  id: string;
  endpoint_pattern: string;
  requests_per_minute: number;
  requests_per_hour: number;
  burst_limit: number;
  enabled: boolean;
};

export function SecurityManager({
  initialLogins,
  initialRateLimits,
}: {
  initialLogins: LoginEvent[];
  initialRateLimits: RateLimitConfig[];
}) {
  const router = useRouter();
  const [logins] = useState(initialLogins);
  const [rateLimits, setRateLimits] = useState(initialRateLimits);
  const [eventFilter, setEventFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"logins" | "ratelimits">("logins");
  const [isPending, startTransition] = useTransition();

  const filteredLogins = logins.filter((login) => {
    if (eventFilter && login.event_type !== eventFilter) return false;
    return true;
  });

  const handleRateLimitUpdate = (config: RateLimitConfig) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", config.id);
      formData.set("endpoint_pattern", config.endpoint_pattern);
      formData.set("requests_per_minute", config.requests_per_minute.toString());
      formData.set("requests_per_hour", config.requests_per_hour.toString());
      formData.set("burst_limit", config.burst_limit.toString());
      formData.set("enabled", config.enabled ? "on" : "");
      await upsertRateLimitConfig(formData);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <Button
          variant={activeTab === "logins" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("logins")}
        >
          Login History
        </Button>
        <Button
          variant={activeTab === "ratelimits" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("ratelimits")}
        >
          Rate Limits
        </Button>
      </div>

      {activeTab === "logins" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Event Type</label>
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
              >
                <option value="">All</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="failed_login">Failed Login</option>
                <option value="password_reset">Password Reset</option>
              </select>
            </div>
          </div>

          <div className="glass-panel overflow-x-auto">
            <table className="min-w-[700px] w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Event</th>
                  <th className="px-5 py-3">IP Address</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogins.map((login) => (
                  <tr key={login.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-slate-400">
                      {new Date(login.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-white">{login.email}</td>
                    <td className="px-5 py-3 text-slate-300">{login.event_type}</td>
                    <td className="px-5 py-3 text-slate-400">{login.ip_address || "N/A"}</td>
                    <td className="px-5 py-3">
                      {login.success ? (
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-green-400">
                          Success
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-red-400">
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLogins.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-slate-500">
                No login events found.
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === "ratelimits" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Rate Limit Configuration</h3>
          <div className="grid gap-4">
            {rateLimits.map((config) => (
              <div key={config.id} className="glass-panel p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{config.endpoint_pattern}</span>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) => {
                        const updated = rateLimits.map((rl) =>
                          rl.id === config.id ? { ...rl, enabled: e.target.checked } : rl
                        );
                        setRateLimits(updated);
                        handleRateLimitUpdate({ ...config, enabled: e.target.checked });
                      }}
                      disabled={isPending}
                      className="accent-electric"
                    />
                    Enabled
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Req/min</label>
                    <input
                      type="number"
                      value={config.requests_per_minute}
                      onChange={(e) => {
                        const updated = rateLimits.map((rl) =>
                          rl.id === config.id
                            ? { ...rl, requests_per_minute: parseInt(e.target.value) }
                            : rl
                        );
                        setRateLimits(updated);
                      }}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Req/hour</label>
                    <input
                      type="number"
                      value={config.requests_per_hour}
                      onChange={(e) => {
                        const updated = rateLimits.map((rl) =>
                          rl.id === config.id
                            ? { ...rl, requests_per_hour: parseInt(e.target.value) }
                            : rl
                        );
                        setRateLimits(updated);
                      }}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Burst</label>
                    <input
                      type="number"
                      value={config.burst_limit}
                      onChange={(e) => {
                        const updated = rateLimits.map((rl) =>
                          rl.id === config.id
                            ? { ...rl, burst_limit: parseInt(e.target.value) }
                            : rl
                        );
                        setRateLimits(updated);
                      }}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
