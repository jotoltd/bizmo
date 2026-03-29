import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Bizno",
  description: "See how Bizno helps you launch your business in 4 simple phases with step-by-step guidance.",
};

const STEPS = [
  {
    number: "01",
    title: "Add your business",
    description: "Tell us your business name and type. We instantly generate a personalized roadmap based on your specific needs.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Follow the roadmap",
    description: "Work through 12 proven steps across 4 phases: Foundation, Branding, Digital Presence, and Launch. Each step tells you exactly what to do and why it matters.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Get exclusive deals",
    description: "Access discounts up to 50% on essential tools like Shopify, QuickBooks, Canva, and more — right when you need them in your journey.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Track & launch",
    description: "Watch your progress in real-time. Know exactly how launch-ready you are. Invite your team to collaborate and hit every deadline.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

const PHASES = [
  {
    name: "Foundation",
    description: "Business registration, legal structure, banking setup",
    steps: 3,
    color: "var(--electric)",
  },
  {
    name: "Branding",
    description: "Logo, colors, brand voice, messaging",
    steps: 3,
    color: "var(--purple)",
  },
  {
    name: "Digital Presence",
    description: "Website, social media, email setup",
    steps: 3,
    color: "var(--info)",
  },
  {
    name: "Launch",
    description: "Marketing, sales channels, go-to-market",
    steps: 3,
    color: "var(--success)",
  },
];

export default function HowItWorksPage() {
  return (
    <MarketingPageShell ctaHref="/login" ctaLabel="Get Started Free">
      {/* Hero */}
      <Card variant="gradient" hover="lift" padding="lg" className="relative overflow-hidden animate-fade-up">
        <div className="absolute -right-20 top-8 h-64 w-64 rounded-full bg-[var(--electric)]/10 blur-3xl" aria-hidden />
        <div className="absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-[var(--purple)]/10 blur-3xl" aria-hidden />
        <div className="grid-mask absolute inset-0 opacity-40" aria-hidden />
        
        <div className="relative text-center max-w-3xl mx-auto">
          <Badge variant="default" className="uppercase tracking-widest mb-6">Simple. Proven. Free.</Badge>
          <h1 className="font-display text-4xl font-semibold text-[var(--text-primary)] sm:text-5xl sm:leading-[1.1]">
            How Bizno works
          </h1>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            From idea to launched in 4 phases. No guesswork, no overwhelm — just a clear path to getting your business live.
          </p>
        </div>
      </Card>

      {/* Steps */}
      <section className="mt-16">
        <div className="grid gap-6 md:grid-cols-2">
          {STEPS.map((step, i) => (
            <Card
              key={step.number}
              variant="default"
              hover="lift"
              padding="default"
              className="relative animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--electric)] to-[var(--purple)] flex items-center justify-center text-white">
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[var(--electric)]">{step.number}</span>
                    <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">{step.title}</h3>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{step.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* The 4 Phases */}
      <section className="mt-20">
        <div className="text-center mb-10">
          <Badge variant="default" className="uppercase tracking-widest mb-3">The Roadmap</Badge>
          <h2 className="font-display text-3xl font-semibold text-[var(--text-primary)]">4 phases to launch</h2>
          <p className="mt-2 text-[var(--text-secondary)]">Each phase has 3 actionable steps. Complete them in order or jump around.</p>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PHASES.map((phase, i) => (
            <Card
              key={phase.name}
              variant="solid"
              hover="scale"
              padding="default"
              className="text-center animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className="h-2 w-full rounded-full mb-4"
                style={{ background: phase.color }}
              />
              <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">{phase.name}</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{phase.description}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-3">{phase.steps} steps</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <Card variant="elevated" padding="lg" className="mt-16 text-center animate-fade-up">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--electric)]/10 blur-3xl" aria-hidden />
        <div className="relative">
          <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)]">Ready to launch?</h2>
          <p className="mt-2 text-[var(--text-secondary)] max-w-lg mx-auto">
            Join thousands of founders who went from idea to launched with Bizno. Completely free, no credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link href="/login">
              <Button size="lg">Start your business — Free</Button>
            </Link>
          </div>
        </div>
      </Card>
    </MarketingPageShell>
  );
}
