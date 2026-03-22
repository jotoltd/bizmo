import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { MarketingCta } from "@/components/marketing/marketing-cta";

const features = [
  {
    title: "Clear roadmap",
    description: "See exactly what to do first, next, and later.",
  },
  {
    title: "Step-by-step guidance",
    description: "Each task comes with plain-language help, not jargon.",
  },
  {
    title: "Right content for each team",
    description: "Show different roadmap steps to freelancers, agencies, or enterprise.",
  },
  {
    title: "Easy publishing",
    description: "Draft, schedule, and publish updates when you're ready.",
  },
  {
    title: "Progress you can trust",
    description: "Know what’s done and spot where people get stuck.",
  },
  {
    title: "Built-in updates",
    description: "Send announcements and reminders without extra tools.",
  },
];

export default function FeaturesPage() {
  return (
    <MarketingPageShell ctaHref="/login" ctaLabel="Start free">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-10 shadow-[0_24px_70px_rgba(3,7,18,0.55)] sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute -right-12 top-4 h-48 w-48 rounded-full bg-electric/20 blur-3xl glow-pulse"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-sky-400/15 blur-3xl glow-pulse"
          aria-hidden
        />
        <div className="grid-mask absolute inset-0 opacity-35" aria-hidden />

        <div className="relative space-y-5">
          <p className="fade-up text-xs uppercase tracking-[0.45em] text-electric">Features</p>
          <h1 className="font-display fade-up fade-up-delay-1 text-4xl font-semibold text-white sm:text-6xl sm:leading-[1.02]">
            Everything you need to launch with confidence.
          </h1>
          <p className="fade-up fade-up-delay-2 max-w-2xl text-base text-slate-300 sm:text-lg">
            Bizno gives your team one clear plan, practical guidance, and progress you can see.
          </p>
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="glass-panel fade-up p-5 transition-transform duration-200 hover:-translate-y-1"
          >
            <h2 className="font-display text-base font-semibold text-white">{feature.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{feature.description}</p>
          </article>
        ))}
      </section>

      <MarketingCta />
    </MarketingPageShell>
  );
}
