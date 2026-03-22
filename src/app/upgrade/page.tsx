import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";

export default function UpgradePage() {
  return (
    <MarketingPageShell ctaHref="/login" ctaLabel="Go to app">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-10 shadow-[0_24px_70px_rgba(3,7,18,0.55)] sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute -left-10 top-2 h-40 w-40 rounded-full bg-electric/20 blur-3xl glow-pulse"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-sky-400/15 blur-3xl glow-pulse"
          aria-hidden
        />
        <div className="grid-mask absolute inset-0 opacity-35" aria-hidden />

        <div className="relative space-y-5">
          <p className="fade-up text-xs uppercase tracking-[0.45em] text-electric">Upgrade</p>
          <h1 className="font-display fade-up fade-up-delay-1 mt-3 text-4xl font-semibold text-white sm:text-6xl sm:leading-[1.02]">
            Upgrade when you&apos;re ready for more.
          </h1>
          <p className="fade-up fade-up-delay-2 mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
            Start simple, then move to Pro when you need to run multiple businesses and
            manage bigger launch workflows.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="glass-panel fade-up p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Free</p>
            <p className="font-display mt-2 text-3xl font-semibold text-white">£0</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>• 1 business</li>
              <li>• Core roadmap flow</li>
              <li>• Basic progress tracking</li>
            </ul>
          </div>
          <div className="glass-panel fade-up border-electric/40 bg-electric/10 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-electric">Pro</p>
            <p className="font-display mt-2 text-3xl font-semibold text-white">£19/mo</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              <li>• Unlimited businesses</li>
              <li>• Admin publishing + audience targeting</li>
              <li>• Advanced analytics and comms</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex rounded-lg bg-electric px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Upgrade in app
          </Link>
          <Link
            href="/pricing"
            className="inline-flex rounded-lg border border-white/10 px-5 py-2.5 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            Compare plans
          </Link>
        </div>
      </section>
    </MarketingPageShell>
  );
}
