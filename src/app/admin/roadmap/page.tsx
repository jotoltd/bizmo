import { getPhases, getSteps, getTags } from "@/lib/admin/actions";
import Link from "next/link";
import { RoadmapManager } from "./roadmap-manager";

export default async function AdminRoadmapPage() {
  const [phases, steps, tags] = await Promise.all([
    getPhases(),
    getSteps(),
    getTags(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-electric">Admin</p>
        <h1 className="text-3xl font-semibold">Roadmap & Content</h1>
        <p className="text-sm text-slate-400">
          Create, edit, reorder, and publish roadmap phases and steps.
        </p>
        <Link
          href="/admin/roadmap/preview"
          className="mt-2 inline-flex text-sm font-medium text-electric transition hover:text-white"
        >
          Open audience preview →
        </Link>
      </div>
      <RoadmapManager
        initialPhases={phases}
        initialSteps={steps}
        initialTags={tags}
      />
    </div>
  );
}
