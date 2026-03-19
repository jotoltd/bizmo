export const affiliateLinks = {
  domains: {
    label: "Get a domain on Namecheap",
    url: "AFFILIATE_LINK:Namecheap:https://placeholder-domain.com",
  },
  hosting: {
    label: "Spin up hosting on Render",
    url: "AFFILIATE_LINK:Render:https://placeholder-hosting.com",
  },
  branding: {
    label: "Create assets with Looka",
    url: "AFFILIATE_LINK:Looka:https://placeholder-branding.com",
  },
  websiteBuilder: {
    label: "Launch on Framer",
    url: "AFFILIATE_LINK:Framer:https://placeholder-builder.com",
  },
  emailSuite: {
    label: "Set up Google Workspace",
    url: "AFFILIATE_LINK:GoogleWorkspace:https://placeholder-workspace.com",
  },
  socialScheduler: {
    label: "Automate posts with Buffer",
    url: "AFFILIATE_LINK:Buffer:https://placeholder-social.com",
  },
  googleBusiness: {
    label: "Verify on Google Business",
    url: "AFFILIATE_LINK:GoogleBusiness:https://placeholder-gbp.com",
  },
  seo: {
    label: "Audit with Ahrefs",
    url: "AFFILIATE_LINK:Ahrefs:https://placeholder-seo.com",
  },
  payments: {
    label: "Activate Stripe",
    url: "AFFILIATE_LINK:Stripe:https://placeholder-payments.com",
  },
  legal: {
    label: "Generate policies via Termly",
    url: "AFFILIATE_LINK:Termly:https://placeholder-legal.com",
  },
  analytics: {
    label: "Deploy Plausible",
    url: "AFFILIATE_LINK:Plausible:https://placeholder-analytics.com",
  },
  emailMarketing: {
    label: "Launch campaigns with Brevo",
    url: "AFFILIATE_LINK:Brevo:https://placeholder-email.com",
  },
  ads: {
    label: "Run ads via Google Ads",
    url: "AFFILIATE_LINK:GoogleAds:https://placeholder-ads.com",
  },
  reputation: {
    label: "Collect reviews on Trustpilot",
    url: "AFFILIATE_LINK:Trustpilot:https://placeholder-reviews.com",
  },
} as const;

export type AffiliateKey = keyof typeof affiliateLinks;
