import type { AffiliateKey } from "@/data/affiliates";

export type PlanTier = "free" | "pro";

export type ChecklistTask = {
  id: string;
  title: string;
  why: string;
  how: string[];
  affiliate: AffiliateKey;
  priority?: boolean;
  availableIn: PlanTier | "all";
};

export type ChecklistCategory = {
  id: string;
  label: string;
  description: string;
  availableIn: PlanTier | "all";
  tasks: ChecklistTask[];
};

export const checklistCategories: ChecklistCategory[] = [
  {
    id: "domain-hosting",
    label: "Domain & Hosting",
    description: "Own a memorable URL and reliable infrastructure before launching anything else.",
    availableIn: "all",
    tasks: [
      {
        id: "domain-register",
        title: "Secure your primary domain",
        why: "Your domain is your digital address. Securing it early prevents copycats and keeps brand consistency across platforms.",
        how: [
          "Brainstorm a short, pronounceable domain that matches your brand",
          "Search availability and purchase the .com or relevant TLD",
          "Enable auto-renew so you never lose ownership",
        ],
        affiliate: "domains",
        availableIn: "all",
      },
      {
        id: "hosting-setup",
        title: "Provision fast, scalable hosting",
        why: "Hosting impacts uptime and perceived trust. A slow or unstable site kills conversion and search rankings.",
        how: [
          "Choose a provider with autoscaling and HTTPS included",
          "Create staging and production environments",
          "Connect your domain via DNS and verify SSL",
        ],
        affiliate: "hosting",
        availableIn: "all",
        priority: true,
      },
    ],
  },
  {
    id: "branding",
    label: "Logo & Branding",
    description: "Build a visual system so every touchpoint feels intentional.",
    availableIn: "all",
    tasks: [
      {
        id: "logo-design",
        title: "Design a versatile logo",
        why: "Logos act as instant recall. A flexible design scales from favicons to billboards without losing clarity.",
        how: [
          "Define personality keywords (bold, premium, playful, etc.)",
          "Create multiple lockups (horizontal, stacked, icon)",
          "Export in SVG + PNG with transparent background",
        ],
        affiliate: "branding",
        availableIn: "all",
      },
      {
        id: "brand-system",
        title: "Document your brand system",
        why: "Color, typography, and tone rules keep freelancers and future hires aligned so campaigns don't drift.",
        how: [
          "Select primary + accent colors with accessible contrasts",
          "Pick headline + body fonts and specify usage",
          "Write tone-of-voice guardrails and sample copy",
        ],
        affiliate: "branding",
        availableIn: "all",
      },
    ],
  },
  {
    id: "website",
    label: "Website Experience",
    description: "Launch a high-converting site that communicates value and captures leads.",
    availableIn: "all",
    tasks: [
      {
        id: "cms-selection",
        title: "Choose your builder or CMS",
        why: "Picking the wrong platform slows iteration. Choose a tool that matches your team's skill and release cadence.",
        how: [
          "List must-have features (blog, ecomm, multi-language)",
          "Assess customization vs. speed trade-offs",
          "Set up environments and version control",
        ],
        affiliate: "websiteBuilder",
        availableIn: "all",
      },
      {
        id: "conversion-pages",
        title: "Ship a conversion-ready landing page",
        why: "A focused hero, proof, and CTA combo drives signups even before the full product ships.",
        how: [
          "Write a sharp value prop above the fold",
          "Add social proof (logos, testimonials) and FAQs",
          "Integrate lead capture or waitlist form",
        ],
        affiliate: "websiteBuilder",
        availableIn: "all",
        priority: true,
      },
    ],
  },
  {
    id: "email",
    label: "Professional Email",
    description: "Communicate from your domain to boost trust and deliverability.",
    availableIn: "all",
    tasks: [
      {
        id: "workspace-setup",
        title: "Create domain-based inboxes",
        why: "Sending from @gmail.com screams hobby project. Domain email keeps you out of spam and signals legitimacy.",
        how: [
          "Provision accounts for founders, support, and billing",
          "Configure DNS records: MX, SPF, DKIM, DMARC",
          "Set up signatures with links + brand assets",
        ],
        affiliate: "emailSuite",
        availableIn: "all",
      },
      {
        id: "shared-inboxes",
        title: "Build shared workflows",
        why: "Shared inboxes or routing rules prevent leads from slipping when volume rises.",
        how: [
          "Create support@ and sales@ shared mailboxes",
          "Set routing/labels for priority messages",
          "Automate vacation responders + SLAs",
        ],
        affiliate: "emailSuite",
        availableIn: "all",
      },
    ],
  },
  {
    id: "social",
    label: "Social Media Presence",
    description: "Own your handles and schedule consistent updates.",
    availableIn: "all",
    tasks: [
      {
        id: "handle-claim",
        title: "Claim priority handles",
        why: "Consistency across platforms makes you easier to find and blocks impersonators.",
        how: [
          "List platforms where your buyers hang out",
          "Register matching handles and bios",
          "Link back to your primary domain",
        ],
        affiliate: "socialScheduler",
        availableIn: "all",
      },
      {
        id: "content-calendar",
        title: "Create a 30-day content calendar",
        why: "Planning beats chasing trends. A calendar keeps output steady and measurable.",
        how: [
          "Map pillars (education, product, culture, proof)",
          "Batch create assets and captions",
          "Schedule with a buffer for reactive posts",
        ],
        affiliate: "socialScheduler",
        availableIn: "all",
      },
    ],
  },
  {
    id: "google",
    label: "Google Business & Local SEO",
    description: "Be the default answer when people search nearby.",
    availableIn: "all",
    tasks: [
      {
        id: "gbp-verify",
        title: "Verify Google Business Profile",
        why: "Verified listings show on Maps and Search, adding trust, hours, and reviews in one card.",
        how: [
          "Create or claim your profile at google.com/business",
          "Verify via postcard, phone, or video",
          "Add photos, opening hours, and services",
        ],
        affiliate: "googleBusiness",
        availableIn: "all",
      },
      {
        id: "local-seo",
        title: "Optimize for local keywords",
        why: "Local SEO drives high-intent foot traffic. Structured citations and consistent NAP data matter.",
        how: [
          "Embed a map + schema markup on your site",
          "List on top directories with consistent info",
          "Collect and respond to reviews weekly",
        ],
        affiliate: "googleBusiness",
        availableIn: "all",
        priority: true,
      },
    ],
  },
  {
    id: "seo",
    label: "SEO Fundamentals",
    description: "Make your content discoverable with clean tech foundations.",
    availableIn: "pro",
    tasks: [
      {
        id: "keyword-map",
        title: "Build a keyword map",
        why: "Mapping intent to pages stops cannibalization and clarifies your content backlog.",
        how: [
          "Research core queries across awareness, consideration, decision",
          "Assign one primary keyword per page",
          "Document supporting FAQs and internal links",
        ],
        affiliate: "seo",
        availableIn: "pro",
      },
      {
        id: "technical-seo",
        title: "Cover technical SEO basics",
        why: "Search engines reward fast, crawlable, structured sites. Fixing issues early prevents painful refactors.",
        how: [
          "Generate an XML sitemap + submit to Search Console",
          "Set up performance budgets and Core Web Vitals tracking",
          "Add schema for products, FAQs, or articles",
        ],
        affiliate: "seo",
        availableIn: "pro",
      },
    ],
  },
  {
    id: "payments",
    label: "Payment Processing",
    description: "Let customers pay securely across channels.",
    availableIn: "pro",
    tasks: [
      {
        id: "payments-activate",
        title: "Activate a payment processor",
        why: "Getting verified early avoids delays when you finally launch pricing or POS.",
        how: [
          "Submit KYC/KYB docs and verify bank accounts",
          "Configure products, prices, and taxes",
          "Test webhook flows in staging",
        ],
        affiliate: "payments",
        availableIn: "pro",
      },
      {
        id: "checkout-flow",
        title: "Design a frictionless checkout",
        why: "Drop-off at checkout kills revenue. Transparent fees and mobile-first flows convert better.",
        how: [
          "Offer wallets (Apple Pay, Google Pay) plus cards",
          "Display trust signals and refund policy",
          "Trigger confirmation emails + CRM updates",
        ],
        affiliate: "payments",
        availableIn: "pro",
        priority: true,
      },
    ],
  },
  {
    id: "legal",
    label: "Legal & Compliance",
    description: "Cover policies before you run campaigns or collect data.",
    availableIn: "pro",
    tasks: [
      {
        id: "privacy-policy",
        title: "Publish privacy + cookie policies",
        why: "Transparent data practices build trust and keep ads/accounts from being suspended.",
        how: [
          "Generate policies tailored to your jurisdiction",
          "Link them in your footer and signup flows",
          "Implement a consent banner storing preferences",
        ],
        affiliate: "legal",
        availableIn: "pro",
      },
      {
        id: "terms-service",
        title: "Draft Terms & Conditions",
        why: "Clear T&Cs clarify refunds, ownership, and acceptable use—protecting you from disputes.",
        how: [
          "Define services, payment schedules, liabilities",
          "Add governing law + dispute resolution",
          "Version control updates and notify customers",
        ],
        affiliate: "legal",
        availableIn: "pro",
      },
    ],
  },
  {
    id: "analytics",
    label: "Analytics & Tracking",
    description: "Measure every critical action from day one.",
    availableIn: "pro",
    tasks: [
      {
        id: "analytics-stack",
        title: "Deploy privacy-friendly analytics",
        why: "Without baseline metrics you can't defend strategy or find leaks.",
        how: [
          "Install tracker snippets via tag manager",
          "Define events for signups, demo requests, purchases",
          "Create dashboards for weekly review",
        ],
        affiliate: "analytics",
        availableIn: "pro",
      },
      {
        id: "conversion-tracking",
        title: "Set up conversion APIs",
        why: "Server-side conversions keep ads platforms learning even with browser restrictions.",
        how: [
          "Connect Meta + Google server-side APIs",
          "Map CRM fields to conversion payloads",
          "Test events end-to-end with debugger tools",
        ],
        affiliate: "analytics",
        availableIn: "pro",
        priority: true,
      },
    ],
  },
  {
    id: "email-marketing",
    label: "Email Marketing",
    description: "Nurture leads with automated flows and campaigns.",
    availableIn: "pro",
    tasks: [
      {
        id: "esp-setup",
        title: "Pick and connect an ESP",
        why: "Centralizing subscribers unlocks segmentation and compliance management.",
        how: [
          "Import existing contacts with consent fields",
          "Create basic segments (trial, customer, churn risk)",
          "Authenticate sending domains with DKIM + SPF",
        ],
        affiliate: "emailMarketing",
        availableIn: "pro",
      },
      {
        id: "automations",
        title: "Build lifecycle automations",
        why: "Automations nurture leads 24/7—welcome, onboarding, win-back—all without extra headcount.",
        how: [
          "Design a welcome series with 3-4 value emails",
          "Add trigger-based workflows (abandoned cart, trial expiring)",
          "Review metrics monthly and A/B test subject lines",
        ],
        affiliate: "emailMarketing",
        availableIn: "pro",
      },
    ],
  },
  {
    id: "ads",
    label: "Online Advertising",
    description: "Layer paid acquisition once attribution and funnels are ready.",
    availableIn: "pro",
    tasks: [
      {
        id: "ads-foundation",
        title: "Set up ad accounts + pixels",
        why: "Configuring pixels and permissions early prevents launch delays and unlocks audience building.",
        how: [
          "Create Google Ads + Meta Business Manager",
          "Install pixels/purchase events on key pages",
          "Set up shared libraries (audiences, placements)",
        ],
        affiliate: "ads",
        availableIn: "pro",
      },
      {
        id: "testing-framework",
        title: "Define a testing framework",
        why: "Structured experiments stop random ad spend and ensure learnings compound.",
        how: [
          "Document hypotheses and KPIs",
          "Run A/B campaigns with capped budgets",
          "Log insights in a living experimentation doc",
        ],
        affiliate: "ads",
        availableIn: "pro",
        priority: true,
      },
    ],
  },
  {
    id: "reputation",
    label: "Reputation & Reviews",
    description: "Turn delighted customers into social proof across channels.",
    availableIn: "pro",
    tasks: [
      {
        id: "review-engine",
        title: "Launch a review capture engine",
        why: "Automated review requests keep a steady drumbeat of proof for ads, SEO, and sales.",
        how: [
          "Map post-purchase triggers (email/SMS)",
          "Offer simple rating flows with escalation for low scores",
          "Repurpose top quotes on site + decks",
        ],
        affiliate: "reputation",
        availableIn: "pro",
      },
      {
        id: "community-monitoring",
        title: "Monitor mentions & respond fast",
        why: "Fast responses defuse negatives and show prospects you're attentive.",
        how: [
          "Track keywords + brand mentions",
          "Standardize response templates by sentiment",
          "Escalate complex issues to support or legal",
        ],
        affiliate: "reputation",
        availableIn: "pro",
      },
    ],
  },
];

export const allTasks = checklistCategories.flatMap((category) =>
  category.tasks.map((task) => ({ ...task, category: category.id }))
);
