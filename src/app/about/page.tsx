import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";

export default function AboutPage() {
  return (
    <MarketingPageShell ctaHref="/login" ctaLabel="Start free">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-10 shadow-[0_24px_70px_rgba(3,7,18,0.55)] sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute -right-14 top-3 h-48 w-48 rounded-full bg-electric/20 blur-3xl glow-pulse"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-sky-400/15 blur-3xl glow-pulse"
          aria-hidden
        />
        <div className="grid-mask absolute inset-0 opacity-35" aria-hidden />

        <div className="relative space-y-5">
          <p className="fade-up text-xs uppercase tracking-[0.45em] text-electric">About</p>
          <h1 className="font-display fade-up fade-up-delay-1 text-4xl font-semibold text-white sm:text-6xl sm:leading-[1.02]">
            We built Bizno to make launch work easier.
          </h1>
          <p className="fade-up fade-up-delay-2 max-w-3xl text-base text-slate-300 sm:text-lg">
            We believe anyone with a great idea should be able to turn it into a real business. 
            Bizno is completely free because we partner with the tools you need, 
            earning a small commission when you use our exclusive deals — at no extra cost to you.
          </p>
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Clarity",
            body: "Everyone knows what to do next and why it matters.",
          },
          {
            title: "Consistency",
            body: "Reusable launch frameworks across every business journey.",
          },
          {
            title: "Momentum",
            body: "Progress visibility keeps the team moving and accountable.",
          },
        ].map((value) => (
          <article
            key={value.title}
            className="glass-panel fade-up p-5 transition-transform duration-200 hover:-translate-y-1"
          >
            <h2 className="font-display text-lg font-semibold text-white">{value.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{value.body}</p>
          </article>
        ))}
      </section>
    </MarketingPageShell>
  );
}
