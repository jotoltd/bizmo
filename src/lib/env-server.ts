if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.warn("SUPABASE_SERVICE_ROLE_KEY missing: server actions limited");

if (!process.env.SENDGRID_API_KEY)
  console.warn("SENDGRID_API_KEY missing: verification emails will fail");

if (!process.env.SENDGRID_FROM_EMAIL)
  console.warn("SENDGRID_FROM_EMAIL missing: verification emails will fail");

if (!process.env.NEXT_PUBLIC_SITE_URL)
  console.warn("NEXT_PUBLIC_SITE_URL missing: falling back to localhost links");

export const envServer = {
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};
