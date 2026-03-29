# Bizno Pre-Launch Deployment Checklist

## 1. Environment Variables Configuration

### Required Environment Variables (Vercel/Production)

Add these to your Vercel project settings:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site
NEXT_PUBLIC_SITE_URL=https://bizno.co.uk

# Email (Resend)
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@bizno.co.uk

# Security
CRON_SECRET=your-cron-secret-key

# Optional: Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# Optional: APNS (iOS Push Notifications)
APNS_TEAM_ID=YOUR_TEAM_ID
APNS_KEY_ID=YOUR_KEY_ID
APNS_BUNDLE_ID=com.bizno.app
APNS_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----"
```

### Steps:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → Settings → Environment Variables
3. Add each variable above
4. Redeploy the application

---

## 2. Database Migrations

### Run Migrations on Production Database:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations to production
supabase db push

# Or apply specific migrations
supabase migration up
```

### Verify Migrations:
```bash
# Check migration status
supabase migration list

# Verify tables exist in Supabase dashboard
```

---

## 3. SSL Certificates

### For Vercel (Automatic):
✅ Vercel automatically provisions and renews SSL certificates via Let's Encrypt

### Verify SSL:
```bash
# Check SSL certificate
curl -vI https://bizno.co.uk 2>&1 | grep -E "SSL|TLS|certificate"

# Or use SSL Labs test
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=bizno.co.uk
```

### Expected Results:
- Grade A+ rating
- TLS 1.3 enabled
- Certificate valid for 90 days (auto-renewed)

---

## 4. Domain DNS Configuration

### Configure DNS Records:

**For Vercel hosting:**

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.21.21 | Auto |
| CNAME | www | cname.vercel-dns.com | Auto |

**Steps:**
1. Buy domain: `bizno.co.uk` (if not already owned)
2. Go to Vercel Dashboard → Project → Domains
3. Add custom domain: `bizno.co.uk`
4. Add `www` as redirect to root domain
5. Update DNS at your domain registrar with records above
6. Wait for propagation (usually 5-60 minutes)

### Verify DNS:
```bash
# Check DNS propagation
dig bizno.co.uk

# Check A record
dig bizno.co.uk A +short

# Check CNAME
dig www.bizno.co.uk CNAME +short
```

---

## 5. Final Pre-Launch Verification

### Smoke Test Checklist:
- [ ] Homepage loads without errors
- [ ] Sign up flow works (create test account)
- [ ] Email verification sent
- [ ] Sign in works
- [ ] Create business works
- [ ] Complete a task works
- [ ] Team invitation works
- [ ] Real-time sync works (test web + iOS)
- [ ] All API endpoints return 200
- [ ] SSL certificate valid
- [ ] Mobile responsive (test on phone)

### Performance Test:
```bash
# Run Lighthouse test
npx lighthouse https://bizno.co.uk --output html --output-path ./lighthouse-report.html
```

---

## Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# Check build locally
npm run build && npm start

# Test production build
vercel --prod --no-clipboard

# View logs
vercel logs bizno.co.uk --json
```

---

## Support Contacts

- **Vercel Support:** https://vercel.com/support
- **Supabase Support:** https://supabase.com/support
- **Domain Issues:** Contact your domain registrar
