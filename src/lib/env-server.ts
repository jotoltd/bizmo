if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.warn("SUPABASE_SERVICE_ROLE_KEY missing: server actions limited");

if (!process.env.RESEND_API_KEY)
  console.warn("RESEND_API_KEY missing: verification emails will fail");

if (!process.env.RESEND_FROM_EMAIL && !process.env.SENDGRID_FROM_EMAIL)
  console.warn("RESEND_FROM_EMAIL missing: verification emails will fail");

if (!process.env.NEXT_PUBLIC_SITE_URL)
  console.warn("NEXT_PUBLIC_SITE_URL missing: falling back to localhost links");

const canonicalProductionSiteUrl = "https://bizno.co.uk";
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const isLocalhostSiteUrl = configuredSiteUrl
  ? /localhost|127\.0\.0\.1/i.test(configuredSiteUrl)
  : false;
const siteUrl =
  process.env.NODE_ENV === "production"
    ? !configuredSiteUrl || isLocalhostSiteUrl
      ? canonicalProductionSiteUrl
      : configuredSiteUrl
    : configuredSiteUrl ?? "http://localhost:3000";

export const envServer = {
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? process.env.SENDGRID_FROM_EMAIL,
  siteUrl,
};
