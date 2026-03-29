import { getUsers } from "@/lib/admin/actions";
import { UsersManager } from "./users-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users | Admin | Bizno",
  description: "Manage Bizno users, view profiles, and handle user-related tasks.",
};

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-electric">Admin</p>
        <h1 className="text-3xl font-semibold">Users & Accounts</h1>
        <p className="text-sm text-slate-400">
          View, filter, create, suspend, or delete user accounts.
        </p>
      </div>
      <UsersManager initialUsers={users} />
    </div>
  );
}
