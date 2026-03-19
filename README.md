This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase email confirmation

By default Supabase requires users to confirm their email address before a session is issued. To disable confirmations and let users sign in immediately after signup:

1. Open your project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Go to **Authentication → Providers → Email**.
3. Under **Confirm email**, disable the toggle labelled **Require email confirmation** (a.k.a. enable "Allow unconfirmed sign ups").
4. Save the provider configuration.

No application code changes are necessary—Supabase will now return an authenticated session right after `signUp` without waiting for a confirmation link. Remember to re‑enable confirmations before going to production if you need verified identities.

## Troubleshooting: "Email rate limit exceeded"

Supabase throttles how many transactional auth emails (confirmations, magic links, OTPs) can be sent per IP/email within a time window. If signups start failing with `email rate limit exceeded`:

1. In the Supabase dashboard, open **Authentication → Rate limits**.
2. Review the **Email** section. On paid plans you can raise the per-hour/per-minute caps; on the free tier you must stay within the defaults.
3. Consider enabling a [custom SMTP provider](https://supabase.com/docs/guides/auth/auth-smtp) under **Authentication → SMTP**; most providers offer higher throughput than the shared Supabase mailer.
4. If you’re just testing locally, wait a few minutes for the window to reset or use unique email addresses so the per-address quota isn’t exhausted.

These limits are enforced server-side by Supabase, so there’s no code change in this repo that can override them.

## Using SendGrid for Supabase Auth email

1. **Add a verified sender/domain in SendGrid**
   - In the SendGrid dashboard go to **Settings → Sender Authentication**.
   - Either verify a full domain (recommended for production) or add a single sender address for testing. Complete the DNS or email verification flow.
2. **Create an SMTP API key**
   - Go to **Settings → API Keys → Create API Key**.
   - Choose "Restricted" with **Mail Send** permission (Full Access or at least Send via SMTP).
   - Copy the generated key; you will not be able to view it again.
3. **Configure Supabase to use SendGrid**
   - In Supabase, open **Authentication → SMTP** and switch Provider to **Custom**.
   - Fill the fields as follows:
     - **Sender name / email**: match the verified SendGrid sender.
     - **SMTP host**: `smtp.sendgrid.net`
     - **Port**: `587` (or `465` if you prefer SSL; 587 with STARTTLS is standard).
     - **Username**: `apikey` (literally this string—SendGrid’s SMTP username is always `apikey`).
     - **Password**: the API key you created in step 2.
     - **Encryption**: `TLS` (STARTTLS).
   - Click **Save** and use the built-in **Send test email** button to verify delivery.
4. **Update environment tracking (optional)**
   - Record the API key securely (1Password, Doppler, etc.). It is not stored in this repository.

Once saved, Supabase will relay all auth emails through SendGrid, lifting the previous shared-pool limits.

## Monitoring & testing

- **Supabase Auth logs:** Use *Authentication → Logs* to confirm every signup/login/reset succeeds. Set alerts for repeated failures after switching SMTP providers.
- **SendGrid activity:** In SendGrid’s Activity tab, create an alert (Settings → Alerts) for bounce/blocked events so deliverability issues surface quickly. You can also enable the Event Webhook to forward events to your backend.
- **Playwright auth smoke test:** `npm run test:e2e` spins up the dev server, signs up a disposable user, follows the `/auth/callback` flow, and asserts the dashboard renders the onboarding hero + “Add business” CTA. The test deletes the temporary Supabase user via the service-role key.
- **CI guardrail:** `.github/workflows/e2e.yml` runs the same test on every push/PR. Provide the following GitHub secrets: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
- **Playwright browsers:** The repo installs browsers automatically via `npm install` (which runs `scripts/install-playwright.cjs`). Vercel deploys skip the download via the `VERCEL` env, so no extra build steps are required. To skip locally, set `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` before installing dependencies.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
