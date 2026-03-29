import { getAllBusinesses } from "@/lib/admin/actions";
import { BusinessesManager } from "./businesses-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Businesses | Admin | Bizno",
  description: "Manage businesses on the Bizno platform.",
};

export default async function AdminBusinessesPage() {
  const businesses = await getAllBusinesses();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-electric">Admin</p>
        <h1 className="text-3xl font-semibold">Business Oversight</h1>
        <p className="text-sm text-slate-400">
          View, edit, approve, or flag any business profile.
        </p>
      </div>
      <BusinessesManager initialBusinesses={businesses} />
    </div>
  );
}
