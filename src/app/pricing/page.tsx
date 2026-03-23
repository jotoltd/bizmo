import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";

export default function PricingPage() {
  return (
    <MarketingPageShell ctaHref="/login" ctaLabel="Get Started Free">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-10 shadow-[0_24px_70px_rgba(3,7,18,0.55)] sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute -left-10 top-6 h-44 w-44 rounded-full bg-electric/20 blur-3xl glow-pulse"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-10 bottom-0 h-36 w-36 rounded-full bg-sky-400/15 blur-3xl glow-pulse"
          aria-hidden
        />
        <div className="grid-mask absolute inset-0 opacity-35" aria-hidden />

        <div className="relative space-y-5 text-center">
          <p className="fade-up text-xs uppercase tracking-[0.45em] text-electric">Pricing</p>
          <h1 className="font-display fade-up fade-up-delay-1 text-4xl font-semibold text-white sm:text-6xl sm:leading-[1.02]">
            Completely Free.
          </h1>
          <p className="fade-up fade-up-delay-2 max-w-2xl mx-auto text-base text-slate-300 sm:text-lg">
            All features included. No limits. No credit card required. 
            We believe every business deserves the tools to succeed.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <article className="glass-panel fade-up p-8 text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.35em] text-electric">Free Forever</p>
          <h2 className="font-display mt-2 text-5xl font-semibold text-white">£0</h2>
          <p className="mt-2 text-lg text-slate-400">No hidden fees. No trials. Just free.</p>
          <ul className="mt-6 space-y-3 text-left max-w-md mx-auto">
            {[
              "Unlimited businesses",
              "Full roadmap access",
              "All checklist features",
              "Team collaboration",
              "Progress tracking",
              "Priority support",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-slate-300">
                <span className="mt-1 text-electric">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/login"
            className="mt-8 inline-flex rounded-lg bg-electric px-8 py-3 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Get Started Free
          </Link>
        </article>
      </section>
    </MarketingPageShell>
  );
}
