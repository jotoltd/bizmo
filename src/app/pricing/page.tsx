import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Free Forever — Bizno",
  description: "Bizno is completely free. No limits, no credit card required. We earn through affiliate partnerships with the tools we recommend.",
};

const FEATURES = [
  "Unlimited business roadmaps",
  "Full access to all 12 launch steps",
  "Team collaboration",
  "Progress tracking",
  "Exclusive tool deals",
  "Email support",
];

const PARTNERS = [
  { name: "Shopify", discount: "20% off first year" },
  { name: "QuickBooks", discount: "50% off first 3 months" },
  { name: "Canva", discount: "Free Pro for 45 days" },
  { name: "Namecheap", discount: "30% off domains" },
  { name: "Google Workspace", discount: "20% off first year" },
  { name: "Superscript", discount: "15% off business insurance" },
];

export default function PricingPage() {
  return (
    <MarketingPageShell ctaHref="/login" ctaLabel="Get Started Free">
      <Card variant="gradient" hover="lift" padding="lg" className="relative overflow-hidden animate-fade-up">
        <div className="absolute -right-20 top-8 h-64 w-64 rounded-full bg-[var(--electric)]/10 blur-3xl" aria-hidden />
        <div className="absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-[var(--purple)]/10 blur-3xl" aria-hidden />
        <div className="grid-mask absolute inset-0 opacity-40" aria-hidden />

        <div className="relative text-center max-w-3xl mx-auto">
          <Badge variant="default" className="uppercase tracking-widest mb-6">Pricing</Badge>
          <h1 className="font-display text-4xl font-semibold text-[var(--text-primary)] sm:text-6xl sm:leading-[1.02]">
            Completely Free.
          </h1>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            All features included. No limits. No credit card required. 
            We believe every business deserves the tools to succeed.
          </p>
        </div>
      </Card>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Card variant="elevated" padding="lg" className="animate-fade-up">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--electric)]">Free Forever</p>
            <h2 className="font-display mt-2 text-5xl font-semibold text-[var(--text-primary)]">£0</h2>
            <p className="mt-2 text-lg text-[var(--text-secondary)]">No hidden fees. No trials. Just free.</p>
          </div>
          
          <ul className="mt-6 space-y-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-[var(--text-secondary)]">
                <span className="mt-1 text-[var(--success)]">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <Link
            href="/login"
            className="mt-8 block w-full text-center rounded-lg bg-[var(--electric)] px-8 py-3 text-sm font-semibold text-[var(--text-inverse)] transition hover:brightness-110"
          >
            Get Started Free
          </Link>
        </Card>

        <Card variant="default" padding="lg" className="animate-fade-up delay-100">
          <h3 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-4">
            How we make money
          </h3>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
            We partner with the best tools for launching businesses. When you use our exclusive 
            deals, we earn a small commission from our partners — at no extra cost to you.
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
            This lets us keep Bizno completely free while ensuring you get the best deals 
            on the tools you actually need.
          </p>
          
          <div className="space-y-2">
            {PARTNERS.map((partner) => (
              <div 
                key={partner.name}
                className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
              >
                <span className="font-medium text-[var(--text-primary)]">{partner.name}</span>
                <span className="text-sm text-[var(--electric)]">{partner.discount}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card variant="solid" padding="lg" className="mt-10 text-center animate-fade-up">
        <h3 className="font-display text-2xl font-semibold text-[var(--text-primary)] mb-2">
          Still have questions?
        </h3>
        <p className="text-[var(--text-secondary)] mb-4">
          Check out our FAQ or reach out to us directly.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link 
            href="/faq"
            className="px-6 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--electric)] transition"
          >
            View FAQ
          </Link>
          <a 
            href="mailto:hello@bizno.co.uk"
            className="px-6 py-2.5 rounded-lg bg-[var(--electric)] text-[var(--text-inverse)] font-semibold hover:brightness-110 transition"
          >
            Contact us
          </a>
        </div>
      </Card>
    </MarketingPageShell>
  );
}
