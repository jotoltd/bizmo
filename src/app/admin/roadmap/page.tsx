import { getPhases, getSteps, getTags } from "@/lib/admin/actions";
import Link from "next/link";
import { RoadmapManager } from "./roadmap-manager";

export default async function AdminRoadmapPage() {
  const [phases, steps, tags] = await Promise.all([
    getPhases(),
    getSteps(),
    getTags(),
  ]);

  const publishedCount = steps.filter((s: { status: string }) => s.status === "published").length;
  const draftCount = steps.filter((s: { status: string }) => s.status === "draft").length;
  const affiliateCount = steps.filter((s: { affiliate_link: string | null }) => s.affiliate_link).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-electric">Admin</p>
        <h1 className="text-3xl font-semibold">Roadmap & Content</h1>
        <p className="text-sm text-slate-400">
          Create, edit, reorder, and publish roadmap phases and steps with affiliate links.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-semibold text-white">{phases.length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Phases</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-semibold text-green-400">{publishedCount}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Published</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-semibold text-amber-400">{draftCount}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Drafts</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-semibold text-electric">{affiliateCount}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Affiliate Links</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/roadmap/preview"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-electric hover:text-electric"
        >
          👁 Preview
        </Link>
        <span className="text-slate-600">|</span>
        <span className="text-xs text-slate-500 self-center">
          Sample data loaded! Edit any step to customize affiliate links.
        </span>
      </div>

      <RoadmapManager
        initialPhases={phases}
        initialSteps={steps}
        initialTags={tags}
      />
    </div>
  );
}
