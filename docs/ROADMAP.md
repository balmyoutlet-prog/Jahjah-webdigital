# Jahjah WebDigital — Master Growth Roadmap

Companion to `docs/AUDIT.md`. Read that first — this roadmap only makes sense against the actual state it describes.

This is a plan, not an implementation. Nothing here has been built yet. Each item below should become its own small branch → PR, tested and reviewed on its own, per the standing process. Effort estimates assume the current TanStack/Supabase stack and no new vendors beyond what's named.

---

## Priority key

- **P0** — revenue-blocking or a real defect. Nothing else matters until these are done.
- **P1** — high-value conversion/revenue work, sequenced right after P0.
- **P2** — growth, once the platform can actually take money.
- **P3** — nice to have, not scheduled.

## P0 — Unblock revenue

| # | Item | Why | Rough effort |
|---|---|---|---|
| 0.1 | **Connect Lovable ↔ GitHub sync** to this repo | Without this, code changes here and the live product stay disconnected. Human, one-time action in Lovable project settings. | 5 min (you) |
| 0.2 | **Connect a payment provider** (Stripe recommended — better docs, webhook tooling, and Lovable has first-class support) | Every checkout currently dead-ends. This is the actual blocker to $1 of revenue. | 1–2 days incl. webhook verification |
| 0.3 | **Give the contact form a real backend**: insert into a new `leads` table, show up in `/admin`, send a notification (email via Resend, or at minimum a webhook to yourself) | Every homepage/contact inquiry today is invisible to the business. This is arguably more urgent than payments — you can't sell to a lead you never see. | 0.5–1 day |
| 0.4 | **Install analytics** (GA4 + a conversion event for: CTA clicks, form submit, checkout start, checkout complete) | You cannot run a funnel you can't measure. Minimal footprint, no dark patterns. | 0.5 day |

## P1 — Conversion & trust, once P0 is live

| # | Item | Why |
|---|---|---|
| 1.1 | Fix `sitemap.xml` (absolute URLs, add `/packages` and `/terms`) | Cheap, currently broken. |
| 1.2 | Decide the recurring-revenue question (see §Revenue model below) and, if adopted, add a `subscriptions` table + a maintenance/SEO/hosting add-on to `/packages` | This is the difference between re-earning $20k every month forever and building a base that compounds. Worth a deliberate decision, not a default. |
| 1.3 | Build the **Free Website Opportunity Audit** as a lead magnet: prospect submits a URL/Instagram/Google Business link → we show a short, honest, non-fabricated checklist (mobile check, has-a-website check, has-WhatsApp-CTA check, etc.) → CTA into `/contact` | This is the brief's proposed top-of-funnel engine, and it fits the platform's existing "trials" mental model. Start simple (rule-based checklist, not AI-scored) to keep it honest and cheap to run. |
| 1.4 | Add WhatsApp click-to-chat as a persistent CTA alongside the Instagram one | Brief explicitly calls this out; currently the only outbound channel is Instagram. |
| 1.5 | Add a lightweight lead pipeline to `/admin`: New → Contacted → Responded → Meeting → Proposal → Won/Lost, backed by the new `leads` table from 0.3 | Turns the admin console from "post-sale bookkeeping" into an actual sales tool. |

## P2 — Growth, once the funnel converts

| # | Item |
|---|---|
| 2.1 | Industry landing pages: `/restaurants`, `/salons`, `/clinics`, `/real-estate`, `/hotels`, `/cafes`, `/boutiques`, `/contractors` — each reusing the existing `services`/`comparison`/`process` data with industry-specific copy and, where they exist, a relevant portfolio piece surfaced first. |
| 2.2 | Case-study depth on the 4 existing portfolio pieces (Wholesome Craft, Sweet Spot, Al Afandi, Bloom Outlet): what was the brief, what changed, any *verifiable* metric (e.g. actual PageSpeed score) — never a fabricated sales number. |
| 2.3 | Referral program: simple, one param (`?ref=`) attribution on lead capture, tracked in the same `leads`/`orders` tables. |
| 2.4 | Rate-limit and spam-check the new lead-capture endpoint (honeypot field + per-IP throttle) now that it's a real write path. |

## P3 — Not scheduled

CRM integration, multi-language, PWA, mobile app, AI chatbot, automated drip email. None of these are revenue-blocking at current scale; revisit once P0–P2 are live and there's real usage data to justify them.

---

## Revenue model — assumptions shown, not assumed as fact

The current platform is **one-time pricing only** ($299 / $499 / $699). The admin dashboard already targets $20,000/month against this model and shows the math: **~41 Medium ($499) packages/month**, or a blend (~20 Medium + ~17 High-End). That number is *not* invented here — it's already in the shipped `/admin` code (`MONTHLY_TARGET_CENTS = 2_000_000`).

Two honest ways to reach $20k/month, with assumptions stated plainly:

**Model A — one-time only (current model, no changes needed)**
- Needs ~35–45 new paid builds *every single month*, indefinitely, with no compounding — the 41st sale in July does nothing for August.
- Requires a lead-gen engine capable of consistently producing that volume (P1.3–P1.5 above exist to build toward this). No claim is made here about what conversion rate is achievable — that has to be measured (P0.4) before any lead-volume target can be set.

**Model B — one-time + recurring (requires 1.2 above)**
- Example combination, shown as *math*, not a promise: 15 new one-time builds/month (~$6–7k) + a maintenance/SEO retainer sold to a growing base of past clients at, say, $150–250/month. Reaching $13–14k/month recurring would need roughly 60–90 retained clients at that price band, built up over time rather than in one month — meaning this model only outperforms Model A after enough months of retention to accumulate that base.
- This is a real strategic choice (subscription pricing contradicts the current Terms of Service's "no monthly fees" promise to buyers of the one-time packages), not a code change — worth deciding with you before 1.2 is built.

Neither number is a forecast. Both are arithmetic on stated assumptions, exactly as the brief asked for — actual achievable lead volume and conversion rate are unknown until P0.3/P0.4 are live and produce real data.

## Suggested sequence

1. Ship P0 in full (payments, lead capture, analytics) — nothing else compounds without this.
2. Run for 2–4 weeks with real traffic. Use the new analytics + lead pipeline to see actual conversion rates.
3. Revisit the recurring-vs-one-time question (1.2) with real numbers instead of assumptions.
4. Build the free-audit lead magnet (1.3) once there's a payment/lead path for it to feed into — building a lead magnet before you can capture or bill a lead is wasted effort.
5. P2 growth work after that, prioritized by whatever the P0 data shows is the actual bottleneck (traffic, conversion, or close rate) — not guessed in advance.
