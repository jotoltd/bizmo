import { getSupabaseSession } from "@/lib/auth";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import Link from "next/link";

export default async function LandingPage() {
  const session = await getSupabaseSession();
  const signedIn = Boolean(session);
  const primaryHref = signedIn ? "/dashboard" : "/login";
  const primaryLabel = signedIn ? "Go to dashboard" : "Get started";

  return (
    <MarketingPageShell
      ctaHref={primaryHref}
      ctaLabel={signedIn ? "Open dashboard" : "Start free"}
    >
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-10 shadow-[0_24px_70px_rgba(3,7,18,0.55)] sm:px-10 sm:py-14">
        <div
          className="pointer-events-none absolute -right-14 top-0 h-52 w-52 rounded-full bg-electric/20 blur-3xl glow-pulse"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-sky-400/15 blur-3xl glow-pulse"
          aria-hidden
        />
        <div className="grid-mask absolute inset-0 opacity-35" aria-hidden />

        <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <p className="fade-up text-xs uppercase tracking-[0.5em] text-electric">Ready to launch</p>
            <div className="fade-up fade-up-delay-1 space-y-5">
              <h1 className="font-display max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-6xl sm:leading-[1.02]">
                Take your launch
                <br />
                from messy to clear.
              </h1>
              <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                Get one focused plan, simple next steps, and a team that stays on the
                same page.
              </p>
            </div>

            <div className="fade-up fade-up-delay-2 flex flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="inline-flex rounded-lg bg-electric px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110"
              >
                {primaryLabel}
              </Link>
              <Link
                href="/features"
                className="inline-flex rounded-lg border border-white/10 px-6 py-3 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                Explore features
              </Link>
            </div>
          </div>

          <div className="glass-panel fade-up fade-up-delay-2 p-6 sm:p-7">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">In one view</p>
            <div className="mt-4 space-y-3">
              {[
                "What’s done",
                "What’s next",
                "What’s blocking progress",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-electric/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-electric">Tip</p>
              <p className="mt-1 text-sm text-slate-100">
                Start with one business, then scale once your process is smooth.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Clear plan",
            body: "Know exactly what to do first, next, and later.",
          },
          {
            title: "Simple guidance",
            body: "Every step is written in plain language your team can follow.",
          },
          {
            title: "Real momentum",
            body: "Track progress live and keep launch energy high.",
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

      <MarketingCta />
    </MarketingPageShell>
  );
}
