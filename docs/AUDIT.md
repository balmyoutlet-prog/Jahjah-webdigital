# Jahjah WebDigital — Platform Audit

**Date:** 2026-08-23
**Scope:** Full audit of the existing system before any production changes, per the standing engineering process (audit → plan → branch → implement → test → review → PR → verify → deploy).
**Status:** Audit complete. No production code changed in this pass.

**2026-08-23 update — GitHub connection re-verified, P0 blocked:** Before starting P0 implementation, re-checked whether `jahjah-global-vision` is connected to this repo. It is **not**. `git ls-remote origin` shows this repo contains only the audit commit added in this session — none of the Lovable project's commits (latest known commit `d04d4b76...`) have ever landed here. The Lovable MCP tool surface available to this session has no GitHub-repo-sync action — `list_connectors`/`add_connector` cover third-party service integrations used *by* the app (Stripe, Supabase, etc.), not the project-level GitHub sync, which Lovable only exposes as a human action in the editor (Project → Settings → GitHub). Per explicit instruction, P0 implementation is **paused** until a human connects the project to `balmyoutlet-prog/Jahjah-webdigital` from the Lovable editor. See the reply in this session for the exact steps.

---

## 1. What actually exists today (ground truth)

This GitHub repository (`balmyoutlet-prog/Jahjah-webdigital`) was **empty** at the start of this session — no commits, no branches, no history. It is not yet connected to the real build.

The real build lives in a Lovable project in the connected workspace:

| | |
|---|---|
| Project | `jahjah-global-vision` ("Global Digital Craft") |
| Editor | `https://lovable.dev/projects/6079c1fa-48ed-492c-b66b-7046e7858007` |
| Preview | `https://id-preview--6079c1fa-48ed-492c-b66b-7046e7858007.lovable.app` |
| Stack | TanStack Start (TS/React 19) + Tailwind v4 + shadcn/ui + Supabase (Postgres/Auth) |
| Created | 2026-08-23, same day — this is a brand-new build, not a legacy system |
| GitHub sync | **Not connected.** This is why the repo is empty. |
| Payments | **Not connected** (Stripe/Paddle env vars absent — checked in code, not assumed) |
| Domain registrar | **Not connected** |
| Visibility | Private, unpublished |

**Action needed from you:** in the Lovable project → Settings → GitHub, connect it to `balmyoutlet-prog/Jahjah-webdigital`. Until that's done, this repo and the live product are two disconnected things, and any code-level work I do here won't reach the real site. I did **not** force a connection myself — that's a one-time account-level action Lovable expects a human to authorize.

The logo you attached matches the brand already in use across the built site (dark/near-black, champagne/rose-gold accent, serif display type) — it has **not** been altered, and nothing below proposes changing it.

## 2. What's actually already built

This is more mature than a landing page. It's a working productized-service platform:

**Public marketing site**
- `/` — hero, trust strip, "your website is your first meeting" problem framing, services, template-vs-studio comparison, portfolio (4 real live links: Wholesome Craft, Sweet Spot Lebanon, Al Afandi Chicken, Bloom Outlet), industries, 6-step process, "why us", international positioning, CTA, contact form. JSON-LD `ProfessionalService` schema present.
- `/packages` — 3 tiers, $299 / $499 / $699, one-time.
- `/work`, `/contact`, `/terms`.

**Self-serve customer platform** (this is the differentiator worth protecting)
- `/auth` — email+password and Google OAuth (via Lovable Cloud Auth), terms acceptance gate.
- `/onboarding` — company registration form, enforces **one company per account** at both UI and DB level.
- `/dashboard` — 8 tabs: Overview (build-path checklist), Company identity, Website builder (generates a design "trial" from a deterministic template spec, not fabricated AI claims), Trials & revisions, Domain request, Package upgrade (pay-the-difference), Billing, Publish.
- `/admin` — real KPI dashboard: month/lifetime revenue, paid orders, active projects, a **$20,000/month progress bar** (already wired to the same number this directive targets), companies/projects table, orders table, domain requests, activity/audit log.

**Backend (Supabase/Postgres)**
- Tables: `profiles`, `user_roles`, `packages`, `companies`, `projects`, `orders`, `generations`, `domain_requests`, `audit_logs`.
- RLS is correctly scoped everywhere I checked: users see only their own rows; admin bypass goes through a `SECURITY DEFINER has_role()` function rather than a trusted client flag; `user_roles` has no client-side INSERT policy, so no self-escalation path to admin exists.
- All prices are computed **server-side** (`priceForOrder`) — nothing trusts a browser-submitted amount.
- Rate limiting on design generation (20s cooldown).
- An `audit_logs` table is written on every state-changing action (company created, identity updated, generation created/selected, order created, domain requested/selected, publish requested).
- Payment and domain-registrar integration are explicitly gated behind env vars and the UI is honest about it ("No payment provider is connected yet") rather than pretending checkout works.

**Trust/legal**
- Terms of Service already encode several of the fraud-prevention rules this directive asks for: one account = one company, no resale/sublicensing, no source-code export, non-refundable after first design trial, server-validated pricing.

This is a genuinely solid foundation. The rest of this audit is about what's missing or inconsistent relative to the business goal, not a rebuild.

## 3. Findings, in priority order

### P0 — blocks revenue or is a real defect

1. **No payment provider connected.** Every checkout path (`createOrder`) ends in "Payment integration required." Nothing can be sold until Stripe (or Paddle) is connected and webhook-verified server-side. This is the single largest blocker to the $20k/month goal — everything else is optimization on top of zero.
2. **The public contact form does not create a lead record.** `ContactForm.tsx` copies a text summary to the clipboard and opens Instagram — it never hits the database. That means: no lead shows up in `/admin`, no email/notification fires, nothing is measurable, and the flow silently fails for anyone whose browser blocks clipboard access or who doesn't use Instagram. Every top-of-funnel inquiry from the homepage and `/contact` is currently invisible to the business. This directly undermines Phase 12/16/17 of the brief (onboarding, free-audit lead gen, admin visibility) — there is no `leads` table at all today, only `companies`, which requires a full account signup to exist.
3. **No analytics.** No GA4, no Meta Pixel, no event tracking of any kind in `__root.tsx` or elsewhere. There is currently no way to measure traffic, CTA clicks, or funnel drop-off — which means the admin dashboard's revenue KPIs exist in isolation from any acquisition data.

### P1 — high-value, should be next after P0

4. **Business model is 100% one-time, $299–$699.** Terms explicitly state "no monthly fees." That's a legitimate, easy-to-sell positioning, but it means the $20k/month target must be *re-earned from zero every month* — there is no compounding base. The admin dashboard's own math ("~41 Medium packages" per month) confirms this. Recurring revenue (maintenance, hosting, SEO, content updates) is not represented anywhere in the schema, pricing, or UI. This is the biggest strategic gap versus the brief's Phase 11 goal, not a code bug — a deliberate decision worth revisiting with you before building anything.
5. **`sitemap.xml` is malformed and incomplete.** URLs are relative (`<loc>/</loc>`) instead of absolute, which most crawlers will reject; `/packages` and `/terms` are missing from it entirely.
6. **No industry-specific landing pages** (`/restaurants`, `/salons`, `/clinics`, etc.) — Phase 19 of the brief. Currently one generic page serves every vertical.
7. **No "Free Website Opportunity Audit" tool** — the brief's proposed primary lead-generation engine (Phase 16) doesn't exist yet.
8. **Publishing is a status flag, not a pipeline.** `requestPublish` just marks the project row `published` — there's no actual deployment automation behind it yet. Fine for a manual, low-volume ops process today; worth documenting as a runbook so it doesn't silently become a bottleneck as volume grows.

### P2 — growth, once P0/P1 are live

9. No WhatsApp click-to-chat CTA anywhere on the marketing site (Instagram is the only outbound channel used).
10. No case studies / before-after / performance-metric evidence sections beyond the 4 portfolio links (which is honest — no fabricated stats — but thin as trust-building evidence).
11. No referral or partner program.
12. Admin dashboard has no lead pipeline (contacted/responded/meeting/proposal stages) — only post-signup company/project state.

### P3 — nice to have

13. No PWA/offline support, no multi-language, no CRM integration, no automated follow-up sequencing. None of these block revenue at current scale.

## 4. Security review (Phase 24)

No critical vulnerabilities found in what's built:

- **Auth:** Bearer-JWT-only server functions, JWT structurally validated (`token.split('.').length !== 3` check) before hitting Supabase; every mutating server function requires `requireSupabaseAuth`.
- **Authorization:** RLS on every table; admin check goes through a `SECURITY DEFINER` function rather than a client-supplied role; no INSERT policy on `user_roles`, so there's no self-service path to admin.
- **Pricing/fraud:** amounts are always server-computed from the `platform.ts` price table, never trusted from the client; one-company-per-account is enforced at the DB layer (`UNIQUE (owner_id)` on both `companies` and `projects`), not just in the UI copy.
- **Secrets:** `.env` is git-ignored; server functions read payment/domain keys from `process.env` and degrade honestly (no fake success states) when absent.
- **Rate limiting:** present on design generation; **not yet present** on the contact form (moot right now since the form doesn't hit the server at all) or on auth sign-up — worth adding once the lead-capture endpoint exists, to prevent spam/bot submissions per the brief's Phase 13 concerns.

Nothing here needs emergency remediation. The main "security" gap is really a **product** gap (leads not captured), not a vulnerability.

## 5. SEO review (Phase 25)

- Root metadata, Open Graph, Twitter card, and `ProfessionalService` JSON-LD are present on the homepage. `/packages` and `/contact` have their own metadata too.
- `robots.txt` is a correct, minimal allow-all.
- `sitemap.xml` needs a real base URL and the missing routes (see P1 #5).
- No `LocalBusiness` schema (only `ProfessionalService`) — reasonable given the "worldwide, not local" positioning; would matter more if/when local-SEO landing pages (Phase 19) are added.

## 6. What I did *not* do in this pass

Per the brief's own Phase 27/30 instructions, I did not touch the Lovable project, did not connect payments, did not build the free-audit tool, industry pages, or a leads table. This audit is the gate before any of that. See `docs/ROADMAP.md` for the prioritized plan and the revenue-model assumptions behind it.
