import { getRoadmapPreview } from "@/lib/admin/actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap Preview | Admin | Bizno",
  description: "Preview the product roadmap as users see it.",
};

const USER_TYPES = ["freelancer", "agency", "enterprise"] as const;

type PreviewPageProps = {
  searchParams: Promise<{ userType?: string }>;
};

type PreviewPhase = {
  id: string;
  title?: string | null;
  description?: string | null;
  steps: {
    id: string;
    title?: string | null;
    status: string;
    mandatory: boolean;
    publish_at?: string | null;
  }[];
};

export default async function RoadmapPreviewPage({ searchParams }: PreviewPageProps) {
  const params = await searchParams;
  const selectedType = USER_TYPES.includes((params.userType as typeof USER_TYPES[number]) ?? "freelancer")
    ? (params.userType as typeof USER_TYPES[number])
    : "freelancer";

  const phases = (await getRoadmapPreview(selectedType)) as PreviewPhase[];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-electric">Admin</p>
        <h1 className="text-3xl font-semibold">Roadmap Preview</h1>
        <p className="text-sm text-slate-400">
          See exactly what each user type can see after publish/schedule/tag filters.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {USER_TYPES.map((type) => (
          <a
            key={type}
            href={`/admin/roadmap/preview?userType=${type}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
              selectedType === type
                ? "bg-electric/20 text-electric"
                : "border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            {type}
          </a>
        ))}
      </div>

      <div className="space-y-4">
        {phases.map((phase) => (
          <section key={phase.id} className="glass-panel p-6 space-y-3">
            <div>
              <h2 className="text-xl font-semibold text-white">{phase.title}</h2>
              {phase.description ? (
                <p className="text-sm text-slate-400">{phase.description}</p>
              ) : null}
            </div>

            {phase.steps.length === 0 ? (
              <p className="text-sm text-slate-500">No visible steps for this audience.</p>
            ) : (
              <div className="space-y-2">
                {phase.steps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{step.title}</p>
                      {step.publish_at ? (
                        <p className="text-xs text-slate-500">
                          Publish at {new Date(step.publish_at).toLocaleString()}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase ${
                          step.status === "published"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {step.status}
                      </span>
                      {step.mandatory ? (
                        <span className="rounded-full bg-electric/20 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-electric">
                          Mandatory
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-slate-400">
                          Optional
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
