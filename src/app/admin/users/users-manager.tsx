"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  updateUser,
  createUser,
  suspendUser,
  deleteUser,
} from "@/lib/admin/actions";
import type { Profile } from "@/types";

// ── Create User Form ─────────────────────────────────────

function CreateUserForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="glass-panel space-y-4 p-5"
      action={(fd) => {
        startTransition(async () => {
          try {
            await createUser(fd);
            onClose();
            router.refresh();
          } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to create user.");
          }
        });
      }}
    >
      <h3 className="text-sm font-semibold">Create New User</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
            placeholder="user@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">User Type</label>
          <select
            name="user_type"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            <option value="freelancer">Freelancer</option>
            <option value="agency">Agency</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          Create User
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Edit User Form ───────────────────────────────────────

function EditUserForm({
  user,
  onClose,
}: {
  user: Profile;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="glass-panel space-y-4 p-5"
      action={(fd) => {
        startTransition(async () => {
          try {
            await updateUser(fd);
            onClose();
            router.refresh();
          } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to update user.");
          }
        });
      }}
    >
      <input type="hidden" name="id" value={user.id} />
      <h3 className="text-sm font-semibold">
        Edit: <span className="text-electric">{user.email}</span>
      </h3>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Role</label>
          <select
            name="role"
            defaultValue={user.role}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Plan</label>
          <select
            name="plan"
            defaultValue={user.plan}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">User Type</label>
          <select
            name="user_type"
            defaultValue={user.user_type}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            <option value="freelancer">Freelancer</option>
            <option value="agency">Agency</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              name="suspended"
              defaultChecked={user.suspended}
              className="accent-electric"
            />
            Suspended
          </label>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          Save Changes
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Main Manager ─────────────────────────────────────────

export function UsersManager({
  initialUsers,
}: {
  initialUsers: Profile[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [, startTransition] = useTransition();

  const users = initialUsers.filter((u) => {
    if (search && !u.email.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (planFilter && u.plan !== planFilter) return false;
    if (typeFilter && u.user_type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Search</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
            placeholder="Search by email..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Plan</label>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            <option value="">All</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            <option value="">All</option>
            <option value="freelancer">Freelancer</option>
            <option value="agency">Agency</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm">
          + Create User
        </Button>
      </div>

      {showCreate && (
        <CreateUserForm onClose={() => setShowCreate(false)} />
      )}

      {editingUser && (
        <EditUserForm
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {/* User table */}
      <div className="glass-panel overflow-x-auto">
        <table className="min-w-[860px] w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Plan</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Last Active</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-white">{user.email}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-semibold uppercase ${
                      user.role === "admin" ? "text-electric" : "text-slate-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3 capitalize text-slate-300">
                  {user.plan}
                </td>
                <td className="px-5 py-3 capitalize text-slate-300">
                  {user.user_type}
                </td>
                <td className="px-5 py-3 text-slate-400">
                  {user.last_active
                    ? new Date(user.last_active).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-5 py-3">
                  {user.suspended ? (
                    <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-red-400">
                      Suspended
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-green-400">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        startTransition(async () => {
                          try {
                            await suspendUser(user.id, !user.suspended);
                            router.refresh();
                          } catch (error) {
                            alert(error instanceof Error ? error.message : "Failed to update suspension.");
                          }
                        });
                      }}
                    >
                      {user.suspended ? "Unsuspend" : "Suspend"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete user ${user.email}?`)) {
                          startTransition(async () => {
                            try {
                              await deleteUser(user.id);
                              router.refresh();
                            } catch (error) {
                              alert(error instanceof Error ? error.message : "Failed to delete user.");
                            }
                          });
                        }
                      }}
                    >
                      Delete
                    </Button>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="inline-flex items-center rounded-md px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
                    >
                      Details
                    </Link>
                    <a
                      href={`/dashboard?impersonate=${user.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-md px-3 py-1.5 text-xs text-slate-400 hover:text-electric transition"
                    >
                      Impersonate
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            No users match the current filters.
          </p>
        )}
      </div>
    </div>
  );
}
