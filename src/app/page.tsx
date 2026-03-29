import { getSupabaseUser } from "@/lib/auth";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
      <Card variant="gradient" hover="lift" padding="lg" className="relative overflow-hidden animate-fade-up">
        <div className="absolute -right-20 top-8 h-64 w-64 rounded-full bg-[var(--electric)]/10 blur-3xl glow-pulse" aria-hidden />
        <div className="absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-[var(--purple)]/10 blur-3xl glow-pulse" aria-hidden />
        <div className="grid-mask absolute inset-0 opacity-40" aria-hidden />
        <div className="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <Badge variant="default" className="uppercase tracking-widest animate-fade-up">Launch without chaos</Badge>
            <div className="space-y-5 animate-fade-up delay-100">
              <h1 className="font-display max-w-2xl text-4xl font-semibold leading-tight text-[var(--text-primary)] sm:text-6xl sm:leading-[1.02]">
                From idea to launched,
                <br />
                <span className="text-gradient">without the overwhelm.</span>
              </h1>
              <p className="max-w-2xl text-base text-[var(--text-secondary)] sm:text-lg">
                Stop drowning in todos and scattered notes. Get a proven roadmap, 
                step-by-step guidance, and exclusive deals on the tools you need — completely free.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 animate-fade-up delay-200">
              <Link href={primaryHref}>
                <Button size="lg">
                  {signedIn ? "Go to dashboard" : "Launch your business — Free"}
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg">See how it works</Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-5 text-xs text-[var(--text-tertiary)] sm:text-sm animate-fade-up delay-300">
              <span className="flex items-center gap-1"><span className="text-[var(--success)]">✓</span> Proven 12-step roadmap</span>
              <span className="flex items-center gap-1"><span className="text-[var(--success)]">✓</span> Exclusive tool discounts</span>
              <span className="flex items-center gap-1"><span className="text-[var(--success)]">✓</span> Team collaboration</span>
            </div>
          </div>

          <Card variant="elevated" className="relative overflow-hidden p-6 sm:p-7 animate-fade-up delay-200">
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-[var(--electric)]/10 blur-2xl" aria-hidden />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="uppercase tracking-widest text-[10px]">Launch Progress</Badge>
                <Badge variant="success" size="sm">On track</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[var(--electric-muted)] flex items-center justify-center">
                    <svg className="h-5 w-5 text-[var(--electric)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)]">Business registered</p>
                    <Progress value={100} variant="success" className="h-1.5 mt-1" />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[var(--electric-muted)] flex items-center justify-center">
                    <svg className="h-5 w-5 text-[var(--electric)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)]">Website setup</p>
                    <Progress value={65} className="h-1.5 mt-1" />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[var(--dark-1)] flex items-center justify-center">
                    <svg className="h-5 w-5 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-secondary)]">Legal compliance</p>
                    <div className="h-1.5 rounded-full bg-[var(--dark-1)] mt-1" />
                  </div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-[var(--divider)]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Overall readiness</span>
                  <span className="font-semibold text-[var(--electric)]">65%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      {/* Feature cards */}
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
          <Card
            key={card.title}
            variant="default"
            hover="lift"
            padding="default"
            className="animate-fade-up"
          >
            <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">{card.title}</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{card.body}</p>
          </Card>
        ))}
      </section>

      {/* Testimonials */}
      <section className="mt-20">
        <Badge variant="default" className="uppercase tracking-widest mx-auto block w-fit mb-8">Loved by founders</Badge>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Card key={i} variant="default" padding="default" className="animate-fade-up">
              <p className="text-sm text-[var(--text-secondary)] italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{t.author}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{t.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <Card variant="solid" padding="lg" className="mt-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { stat: "£500+", label: "average savings on tools" },
            { stat: "4 phases", label: "from foundation to launch" },
            { stat: "100%", label: "free. No credit card needed" },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center animate-fade-up"
            >
              <p className="font-display text-3xl font-semibold text-[var(--electric)]">{item.stat}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Partner logos */}
      <section className="mt-16 text-center">
        <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-6">Exclusive deals with</p>
        <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
          {["Shopify", "QuickBooks", "Canva", "Namecheap", "Google Workspace", "Superscript"].map((partner) => (
            <span key={partner} className="text-sm text-[var(--text-secondary)] font-medium">{partner}</span>
          ))}
        </div>
      </section>

      <MarketingCta />
    </MarketingPageShell>
  );
}
