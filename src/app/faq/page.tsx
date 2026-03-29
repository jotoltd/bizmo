import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Bizno",
  description: "Frequently asked questions about Bizno's free business launch platform and features.",
};

const FAQS = [
  {
    question: "What is Bizno?",
    answer: "Bizno is a digital readiness platform that helps entrepreneurs launch their businesses with a proven 12-step roadmap. We provide step-by-step guidance, exclusive deals on essential tools, and team collaboration features to keep your launch on track.",
  },
  {
    question: "Is Bizno really free?",
    answer: "Yes! Bizno is completely free. You can create unlimited business roadmaps, access all 12 launch steps, claim exclusive deals on tools, and invite your entire team — all without paying anything. We make money through affiliate partnerships with the tools we recommend, so you get great deals and we keep the lights on.",
  },
  {
    question: "What kind of deals can I get through Bizno?",
    answer: "We partner with essential business tools like Shopify, QuickBooks, Canva, Namecheap, Google Workspace, and more to offer exclusive discounts ranging from 20% to 50% off. These deals are unlocked as you progress through your roadmap, right when you need them.",
  },
  {
    question: "How does the 12-step roadmap work?",
    answer: "Our roadmap is organized into 4 phases: Foundation (business registration, legal setup), Branding (logo, brand identity), Digital Presence (website, social media), and Launch (marketing, sales). Each phase has 3 actionable steps with clear instructions and tool recommendations.",
  },
  {
    question: "Can I invite my team to collaborate?",
    answer: "Absolutely! You can invite team members to your business roadmap and assign different roles (owner, admin, editor, viewer). Collaborate in real-time, track progress together, and keep everyone aligned on launch milestones.",
  },
  {
    question: "What if I get stuck on a step?",
    answer: "Each step includes detailed guidance explaining why it matters and how to complete it. We also provide tool recommendations with exclusive deals. If you need extra help, reach out to our team at hello@bizno.co.uk — we're here to support you.",
  },
  {
    question: "How is my data protected?",
    answer: "We take security seriously. Your data is stored securely using industry-standard encryption. We never share your business information with third parties without your consent. You can export or delete your data at any time.",
  },
  {
    question: "Can I use Bizno for multiple businesses?",
    answer: "Absolutely! You can create unlimited business roadmaps. Whether you're a serial entrepreneur, running an agency, or managing multiple ventures, Bizno supports you completely free.",
  },
  {
    question: "What happens after I complete all 12 steps?",
    answer: "Congratulations — your business is launch-ready! You'll have a fully registered business, complete brand identity, professional digital presence, and a go-to-market strategy. Your roadmap stays accessible for reference, and you can always add new milestones.",
  },
  {
    question: "How do I get started?",
    answer: "Simply sign up for a free account, add your business name and type, and your personalized roadmap is generated instantly. Start with Phase 1 (Foundation) and work through each step at your own pace.",
  },
];

export default function FAQPage() {
  return (
    <MarketingPageShell ctaHref="/login" ctaLabel="Get Started Free">
      <Card variant="gradient" hover="lift" padding="lg" className="relative overflow-hidden animate-fade-up">
        <div className="absolute -right-20 top-8 h-64 w-64 rounded-full bg-[var(--electric)]/10 blur-3xl" aria-hidden />
        <div className="absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-[var(--purple)]/10 blur-3xl" aria-hidden />
        
        <div className="relative text-center max-w-3xl mx-auto">
          <Badge variant="default" className="uppercase tracking-widest mb-6">FAQ</Badge>
          <h1 className="font-display text-4xl font-semibold text-[var(--text-primary)] sm:text-5xl">
            Common questions
          </h1>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            Everything you need to know about launching your business with Bizno.
          </p>
        </div>
      </Card>

      <Card variant="default" padding="lg" className="mt-10 animate-fade-up">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--electric)]">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-[var(--text-secondary)] leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      <Card variant="elevated" padding="lg" className="mt-10 text-center animate-fade-up">
        <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)]">Still have questions?</h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          Our team is here to help. Reach out and we&apos;ll get back to you within 24 hours.
        </p>
        <a 
          href="mailto:hello@bizno.co.uk" 
          className="inline-flex mt-4 text-[var(--electric)] hover:text-[var(--electric-light)] font-semibold"
        >
          hello@bizno.co.uk
        </a>
      </Card>
    </MarketingPageShell>
  );
}
