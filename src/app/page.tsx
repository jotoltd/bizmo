import { getSupabaseSession } from "@/lib/auth";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import Link from "next/link";

export default async function Home() {
  const session = await getSupabaseSession();
  const signedIn = Boolean(session);
  const primaryHref = signedIn ? "/dashboard" : "/login";
  const primaryLabel = signedIn ? "Open dashboard" : "Start free";

  return (
    <MarketingPageShell ctaHref={primaryHref} ctaLabel={primaryLabel}>
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-10 shadow-[0_28px_80px_rgba(3,7,18,0.6)] sm:px-10 sm:py-14">
        <div
          className="pointer-events-none absolute -right-20 top-8 h-64 w-64 rounded-full bg-electric/20 blur-3xl glow-pulse"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-sky-400/15 blur-3xl glow-pulse"
          aria-hidden
        />
        <div className="grid-mask absolute inset-0 opacity-40" aria-hidden />
        <div className="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <p className="fade-up text-xs uppercase tracking-[0.55em] text-electric">Launch without chaos</p>
            <div className="fade-up fade-up-delay-1 space-y-5">
              <h1 className="font-display max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-6xl sm:leading-[1.02]">
                Your launch plan,
                <br />
                finally in one place.
              </h1>
              <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                Stop chasing tasks in chat, docs, and sticky notes.
                Bizno gives you a clear roadmap, easy next steps, and progress you can trust.
              </p>
            </div>
            <div className="fade-up fade-up-delay-2 flex flex-wrap items-center gap-3">
              <Link
                href={primaryHref}
                className="inline-flex rounded-lg bg-electric px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110"
              >
                {signedIn ? "Go to dashboard" : "Start free"}
              </Link>
              <Link
                href="/pricing"
                className="inline-flex rounded-lg border border-white/10 px-6 py-3 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                View pricing
              </Link>
            </div>
            <div className="fade-up fade-up-delay-3 flex flex-wrap gap-5 text-xs text-slate-400 sm:text-sm">
              <span>✓ Easy to follow roadmap</span>
              <span>✓ Step-by-step wizard</span>
              <span>✓ Live progress tracking</span>
            </div>
          </div>

          <div className="glass-panel fade-up fade-up-delay-2 relative overflow-hidden p-6 sm:p-7">
            <div
              className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-sky-400/15 blur-2xl"
              aria-hidden
            />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Live progress</p>
                <span className="rounded-full bg-electric/20 px-2 py-0.5 text-[0.65rem] font-semibold text-electric">
                  72% done
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Brand setup", progress: 90 },
                  { label: "Launch prep", progress: 65 },
                  { label: "Growth plan", progress: 40 },
                ].map((row) => (
                  <div key={row.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>{row.label}</span>
                      <span className="text-xs text-slate-500">{row.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-electric"
                        style={{ width: `${row.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Next step</p>
                <p className="mt-2 text-sm text-slate-200">
                  Connect your domain and publish your first landing page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Know what to do now",
            body: "Every launch is split into clear phases, so your team always knows what comes next.",
          },
          {
            title: "Less confusion, more progress",
            body: "Each task has simple instructions your team can act on right away.",
          },
          {
            title: "Stay on track",
            body: "Spot slowdowns early and keep launch momentum strong.",
          },
        ].map((card) => (
          <article
            key={card.title}
            className="glass-panel fade-up p-5 transition-transform duration-200 hover:-translate-y-1"
          >
            <h2 className="font-display text-base font-semibold text-white">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{card.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-16 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { stat: "3x", label: "faster launch planning" },
            { stat: "1", label: "shared place for your team" },
            { stat: "0", label: "guesswork on what to do next" },
          ].map((item) => (
            <div
              key={item.label}
              className="fade-up rounded-2xl border border-white/5 bg-black/20 p-5 transition-transform duration-200 hover:-translate-y-1"
            >
              <p className="font-display text-3xl font-semibold text-electric">{item.stat}</p>
              <p className="mt-2 text-sm text-slate-300">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <MarketingCta />
    </MarketingPageShell>
  );
}
