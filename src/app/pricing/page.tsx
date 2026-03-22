import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";

const plans = [
  {
    name: "Free",
    price: "£0",
    subtitle: "Great for your first launch",
    features: ["1 business", "Core roadmap", "Checklist + wizard views"],
    cta: "Start free",
    href: "/login",
  },
  {
    name: "Pro",
    price: "£19/mo",
    subtitle: "For teams running more than one launch",
    features: [
      "Unlimited businesses",
      "Advanced admin controls",
      "Audience-tagged roadmap content",
      "Announcements + reporting",
    ],
    cta: "Upgrade now",
    href: "/upgrade",
  },
];

export default function PricingPage() {
  return (
    <MarketingPageShell ctaHref="/upgrade" ctaLabel="Upgrade">
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

        <div className="relative space-y-5">
          <p className="fade-up text-xs uppercase tracking-[0.45em] text-electric">Pricing</p>
          <h1 className="font-display fade-up fade-up-delay-1 text-4xl font-semibold text-white sm:text-6xl sm:leading-[1.02]">
            Pick a plan and get moving.
          </h1>
          <p className="fade-up fade-up-delay-2 max-w-2xl text-base text-slate-300 sm:text-lg">
            Start free, then upgrade when your team needs more businesses and deeper control.
          </p>
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className="glass-panel fade-up p-6 transition-transform duration-200 hover:-translate-y-1"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{plan.name}</p>
            <h2 className="font-display mt-2 text-3xl font-semibold text-white">{plan.price}</h2>
            <p className="mt-1 text-sm text-slate-400">{plan.subtitle}</p>
            <ul className="mt-5 space-y-2 text-sm text-slate-300">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="mt-1 text-electric">●</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className="mt-6 inline-flex rounded-lg bg-electric px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
            >
              {plan.cta}
            </Link>
          </article>
        ))}
      </section>
    </MarketingPageShell>
  );
}
