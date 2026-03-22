import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getUserById,
  getBusinessesByUser,
  getUsers,
  reassignBusiness,
  mergeUsers,
  getImpersonationPath,
} from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";

type UserDetailPageProps = {
  params: Promise<{ userId: string }>;
};

export default async function AdminUserDetailPage({ params }: UserDetailPageProps) {
  const { userId } = await params;
  const [user, businesses, allUsers] = await Promise.all([
    getUserById(userId),
    getBusinessesByUser(userId),
    getUsers(),
  ]);

  if (!user) notFound();

  const mergeTargets = allUsers.filter((u: { id: string }) => u.id !== user.id);
  const impersonationPath = await getImpersonationPath(user.id);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-electric">Admin</p>
        <h1 className="text-3xl font-semibold">User Detail</h1>
        <p className="text-sm text-slate-400">Manage account-level support actions.</p>
      </div>

      <section className="glass-panel p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">{user.email}</h2>
            <p className="text-sm text-slate-400">
              Role: <span className="capitalize">{user.role}</span> · Plan: <span className="capitalize">{user.plan}</span> · Type: <span className="capitalize">{user.user_type}</span>
            </p>
          </div>
          <a
            href={impersonationPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-lg border border-electric/40 px-4 py-2 text-sm font-semibold text-electric transition hover:border-electric hover:text-white"
          >
            Impersonate user ↗
          </a>
        </div>
      </section>

      <section className="glass-panel p-6 space-y-4">
        <h2 className="text-lg font-semibold">Assign Businesses</h2>
        {businesses.length === 0 ? (
          <p className="text-sm text-slate-500">No businesses owned by this user.</p>
        ) : (
          <div className="space-y-3">
            {businesses.map((business: { id: string; name: string }) => (
              <form key={business.id} action={reassignBusiness} className="flex flex-wrap items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                <input type="hidden" name="business_id" value={business.id} />
                <span className="min-w-44 text-sm text-white">{business.name}</span>
                <select
                  name="target_user_id"
                  required
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
                >
                  <option value="">Assign to user...</option>
                  {mergeTargets.map((target: { id: string; email: string }) => (
                    <option key={target.id} value={target.id}>
                      {target.email}
                    </option>
                  ))}
                </select>
                <Button type="submit" size="sm" variant="outline">
                  Reassign
                </Button>
              </form>
            ))}
          </div>
        )}
      </section>

      <section className="glass-panel p-6 space-y-4">
        <h2 className="text-lg font-semibold text-amber-300">Merge Duplicate Account</h2>
        <p className="text-sm text-slate-400">
          This moves businesses from this user to another user and removes this source account.
        </p>

        <form action={mergeUsers} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="source_user_id" value={user.id} />
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Merge into</label>
            <select
              name="target_user_id"
              required
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
            >
              <option value="">Select target account...</option>
              {mergeTargets.map((target: { id: string; email: string }) => (
                <option key={target.id} value={target.id}>
                  {target.email}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="outline" className="border-amber-500/40 text-amber-300 hover:text-amber-200">
            Merge + delete source
          </Button>
        </form>
      </section>

      <Link href="/admin/users" className="inline-flex text-sm text-slate-500 hover:text-electric transition">
        ← Back to users
      </Link>
    </div>
  );
}
