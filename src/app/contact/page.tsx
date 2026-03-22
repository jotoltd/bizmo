import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";

export default function ContactPage() {
  return (
    <MarketingPageShell ctaHref="/login" ctaLabel="Open app">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-10 shadow-[0_24px_70px_rgba(3,7,18,0.55)] sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute -right-8 top-4 h-40 w-40 rounded-full bg-electric/20 blur-3xl glow-pulse"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-sky-400/15 blur-3xl glow-pulse"
          aria-hidden
        />
        <div className="grid-mask absolute inset-0 opacity-35" aria-hidden />

        <div className="relative space-y-5">
          <p className="fade-up text-xs uppercase tracking-[0.45em] text-electric">Contact</p>
          <h1 className="font-display fade-up fade-up-delay-1 mt-3 text-4xl font-semibold text-white sm:text-6xl sm:leading-[1.02]">
            Need a hand? We&apos;re here.
          </h1>
          <p className="fade-up fade-up-delay-2 mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
            For demos, support, or partnership chats, send us a message and we&apos;ll get back to you fast.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="glass-panel fade-up p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Email</p>
            <a
              href="mailto:hello@bizno.co.uk"
              className="mt-2 inline-flex text-lg font-semibold text-electric transition hover:text-white"
            >
              hello@bizno.co.uk
            </a>
            <p className="mt-2 text-sm text-slate-400">Best for sales and support queries.</p>
          </div>

          <div className="glass-panel fade-up p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Response time</p>
            <p className="mt-2 text-lg font-semibold text-white">Within 24 hours</p>
            <p className="mt-2 text-sm text-slate-400">Mon–Fri, UK business hours.</p>
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
