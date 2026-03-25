import { getSupabaseUser } from "@/lib/auth";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bizno — Launch Your Business Without Chaos",
  description: "Free business launch roadmap. Step-by-step wizard, affiliate deals on tools you need, and team collaboration. Start your business today.",
  keywords: ["business launch", "startup roadmap", "entrepreneur tools", "business checklist", "free business plan"],
  openGraph: {
    title: "Bizno — Launch Your Business Without Chaos",
    description: "Free business launch roadmap with step-by-step wizard and exclusive tool deals.",
    type: "website",
  },
};

const TESTIMONIALS = [
  {
    quote: "Went from idea to launched in 3 weeks. The roadmap kept me focused when I wanted to procrastinate.",
    author: "Sarah K.",
    role: "SaaS Founder",
  },
  {
    quote: "Saved £200+ on my first year with the affiliate deals. The wizard view is actually motivating.",
    author: "James M.",
    role: "E-commerce Owner",
  },
  {
    quote: "Finally, a tool that doesn't overcomplicate things. Just clear steps and real progress.",
    author: "Priya R.",
    role: "Agency Owner",
  },
];

export default async function Home() {
  const user = await getSupabaseUser();
  const signedIn = Boolean(user);
  const primaryHref = signedIn ? "/dashboard" : "/login";
  const primaryLabel = signedIn ? "Open dashboard" : "Start free — no credit card";

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
                From idea to launched,
                <br />
                <span className="text-electric">without the overwhelm.</span>
              </h1>
              <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                Stop drowning in todos and scattered notes. Get a proven roadmap, 
                step-by-step guidance, and exclusive deals on the tools you need — completely free.
              </p>
            </div>
            <div className="fade-up fade-up-delay-2 flex flex-wrap items-center gap-3">
              <Link
                href={primaryHref}
                className="inline-flex rounded-lg bg-electric px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110"
              >
                {signedIn ? "Go to dashboard" : "Launch your business — Free"}
              </Link>
              <Link
                href="/pricing"
                className="inline-flex rounded-lg border border-white/10 px-6 py-3 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                See how it works
              </Link>
            </div>
            <div className="fade-up fade-up-delay-3 flex flex-wrap gap-5 text-xs text-slate-400 sm:text-sm">
              <span>✓ Proven 12-step roadmap</span>
              <span>✓ Exclusive tool discounts</span>
              <span>✓ Team collaboration</span>
            </div>
          </div>

          <div className="glass-panel fade-up fade-up-delay-2 relative overflow-hidden p-6 sm:p-7">
            <div
              className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-sky-400/15 blur-2xl"
              aria-hidden
            />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Launch Progress</p>
                <span className="rounded-full bg-electric/20 px-2 py-0.5 text-[0.65rem] font-semibold text-electric">
                  8 of 12 complete
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Foundation", progress: 100 },
                  { label: "Branding", progress: 100 },
                  { label: "Digital Presence", progress: 60 },
                  { label: "Launch", progress: 20 },
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
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Current step</p>
                <p className="mt-2 text-sm text-slate-200">
                  Set up your website with Shopify — Get 20% off your first year
                </p>
                <button className="mt-3 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  Claim deal ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Stop guessing, start doing",
            body: "Every step is mapped out. Know exactly what to do next and why it matters for your launch.",
          },
          {
            title: "Save on essential tools",
            body: "Exclusive discounts on Shopify, QuickBooks, Canva, Namecheap, and more — right when you need them.",
          },
          {
            title: "Track real progress",
            body: "Watch your business come to life with clear phases, progress bars, and team accountability.",
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

      {/* Testimonials */}
      <section className="mt-20">
        <p className="text-center text-xs uppercase tracking-[0.5em] text-electric mb-8">Loved by founders</p>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="glass-panel p-6 space-y-4">
              <p className="text-sm text-slate-300 italic">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="text-sm font-semibold text-white">{t.author}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section className="mt-16 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { stat: "£500+", label: "average savings on tools" },
            { stat: "4 phases", label: "from foundation to launch" },
            { stat: "100%", label: "free. No credit card needed" },
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

      {/* Partner logos */}
      <section className="mt-16 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500 mb-6">Exclusive deals with</p>
        <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
          {["Shopify", "QuickBooks", "Canva", "Namecheap", "Google Workspace", "Superscript"].map((partner) => (
            <span key={partner} className="text-sm text-slate-400 font-medium">{partner}</span>
          ))}
        </div>
      </section>

      <MarketingCta />
    </MarketingPageShell>
  );
}
