# Optional integrations

The platform is fully functional without any of these — each one only
switches on once its credential is added as an environment variable in
Vercel (Project → Settings → Environment Variables; see `.env.example`). Nothing below is
required for lead discovery, CRM, WhatsApp outreach, onboarding, Whish
payments, or the admin dashboard to work today.

| Variable | Unlocks | Where it's read |
| --- | --- | --- |
| `GOOGLE_PLACES_API_KEY` | Automated prospect discovery from Google Places (name, rating, review count, website, Maps link) instead of manual/admin entry. | `src/lib/leads/adapters.ts` |
| `INSTAGRAM_GRAPH_ACCESS_TOKEN` | Reading a **business's own connected** Instagram account (Instagram has no compliant public search API — this can never power third-party discovery). | `src/lib/leads/adapters.ts` |
| `STRIPE_SECRET_KEY` or `PADDLE_API_KEY` | Automated card checkout. Until set, all payments go through the built-in Whish Money manual-verification flow. | `src/lib/platform.server.ts` (`paymentsConfigured`) |
| `DOMAIN_PROVIDER_API_KEY` / `DOMAIN_PROVIDER_NAME` | Live domain availability checks. Until set, domain requests are recorded and confirmed manually. | `src/lib/platform.server.ts` (`domainProviderConfigured`) |

Every adapter/provider is called from one place behind a small interface —
swapping providers later (e.g. a different Places-style API, a different
payment processor) means editing one file, not the rest of the app.
