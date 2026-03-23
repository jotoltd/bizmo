import { getLoginHistory, getRateLimitConfigs } from "@/lib/admin/extended-actions";
import { SecurityManager } from "./security-manager";

export default async function SecurityPage() {
  const [logins, rateLimits] = await Promise.all([
    getLoginHistory({ limit: 50 }),
    getRateLimitConfigs(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-electric">Admin</p>
        <h1 className="text-3xl font-semibold">Security & Access</h1>
        <p className="text-sm text-slate-400">
          Login history, failed attempts, and rate limiting controls.
        </p>
      </div>
      <SecurityManager initialLogins={logins} initialRateLimits={rateLimits} />
    </div>
  );
}
