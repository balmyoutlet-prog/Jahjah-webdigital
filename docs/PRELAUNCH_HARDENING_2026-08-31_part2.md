# Jahjah WebDigital — Continued hardening session, part 2

Date: 2026-08-31 (continued). All work done via GitHub + local build/QA tooling only. No Lovable AI/chat/generation credits used, no money spent, no domain purchased.

## What I completed this session

1. **Merged `claude/jahjah-prelaunch-hardening-yv499g` → `main`.** Verified first that `main` had zero new commits since the branch point — a clean fast-forward, nothing overwritten. Pushed.
2. **Client-site attribution — Bloom Outlet and Afandi Chicken.** Added `src/lib/jahjah-attribution.ts` to both repos (`balmyoutlet-prog/bloom-couture-collective`, `balmyoutlet-prog/afandi-kitchen-hub`), exporting one `JAHJAH_WEBDIGITAL_URL` constant, overridable via `VITE_JAHJAH_WEBDIGITAL_URL` without touching any component — this is the "one config value" you asked for.
   - **Bloom Outlet**: fixed a footer link that was already there but **dead** — it pointed at `https://jahjahwebdigital.com`, which does not resolve (confirmed: DNS does not resolve that name at all — not a live domain yet). Replaced with the centralized constant, wording changed to "Website by Jahjah WebDigital".
   - **Afandi Chicken**: the existing "Developed by Jahjah WebDigital" credit was **plain text, not a link at all**. Made it a real `<a target="_blank" rel="noopener noreferrer">` using the same centralized constant, wording changed to "Website by Jahjah WebDigital".
   - Both currently point at the studio's live temporary URL (`https://jahjah-global-vision.lovable.app`) until you confirm the final domain — then it's a one-line env var change per site, not a code edit.
   - Committed and pushed to each repo's `main` (rebased Bloom's commit on top of unrelated commits that landed on its `main` mid-session — nothing was overwritten there either).
   - No client business info, checkout, catalogue/menu, or visual branding was touched.
3. **Portfolio cross-linking** — confirmed already correct: `/work` lists Bloom Outlet and Afandi Chicken with real URLs and truthful, non-fabricated outcome copy (verified against the source: no ratings, no invented numbers, no testimonials).
4. **Full local QA sweep** (since the public URL is not yet serving this code — see blocker below): ran the actual built app under a local server and drove it with a real headless browser (Chromium via Playwright), not just static code reading. **33/33 automated checks passed**:
   - All 7 public routes load with correct titles: `/`, `/work`, `/process`, `/packages`, `/contact`, `/terms`, `/privacy`.
   - "See how we work" → `/process` (confirmed via actual DOM `href`, not just source).
   - WhatsApp and Instagram links present with correct `target`/`rel`.
   - Footer Terms + Privacy links present.
   - Packages page: exactly 3 "Start with X" CTAs, each linking to `/auth`.
   - Portfolio page: all 4 client project links present and pointing at the real domains (already independently confirmed reachable — see part 1).
   - Contact form: honeypot field present; submitting always resolves to a definite success or error state, never silently nothing (confirmed by inspecting the actual rendered `role="alert"` / success view — it correctly showed an error locally, because this sandbox has no Supabase service-role key, which is expected and is not a code defect).
   - No horizontal overflow at 320px, 375px, 390px, 768px (tablet), 1440px (desktop).
   - Mobile menu opens and closes correctly at 320/375/390px.
   - Keyboard `Tab` moves focus at tablet/desktop widths.
   - The `LeadLightbox` modal fix from part 1 is confirmed working live: opens, moves initial focus to its close button, and **closes on Escape**.
   - One transient `networkidle` timeout on the very first cold page load (Vite dev-server dependency pre-bundling) was investigated and confirmed to be a dev-server artifact, not a real bug — the same page loaded in 60ms immediately after.

## Blockers — need your input before I can go further

Both of these are hard access walls, not something I can route around, and I don't want to guess or force either:

### 1. Supabase migration still not applied
This session's Supabase connector only has access to **one** project: `zmrivcvykmldqvoetzsd` ("jihanjahjah1990-collab's Project" — empty, unrelated schema). Calling `get_project` on `kmighupzxdtulaqzcgqn` returns "You do not have permission to perform this action." There is no service-role key or DB password available to me either (correctly not committed to the repo). So the migration (`inquiries`, `rate_limits`, `check_rate_limit`, the new domain/project enum values) is written and correct, but **not applied to the real database.**

To unblock, pick one:
- Reconnect this session's Supabase integration to the account/project that owns `kmighupzxdtulaqzcgqn` (Settings → Connectors on claude.ai), and tell me to retry, **or**
- Run `supabase/migrations/20260831120000_prelaunch_hardening.sql` yourself in the Supabase SQL Editor for that project (it's idempotent — `ADD VALUE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS` — safe to run once), **or**
- Give me another way to reach it.

### 2. Production deploy does not appear to happen automatically on `git push`
I pushed the hardened code to `main` on `jahjah-global-vision` over 30 minutes ago. The live site (`https://jahjah-global-vision.lovable.app`) still 404s on `/privacy` and is still serving the pre-hardening build. I checked the same pattern on the two client-site pushes (Bloom, Afandi) — their live sites also still show the old footer text. This is consistent, not a one-off delay.

I don't have a way to push a new deployment myself: the Cloudflare tooling available to me is read-only for Workers (list/inspect, no deploy/upload), there's no `wrangler.toml`/API token in this repo, and no GitHub Actions deploy workflow exists. Whatever builds and publishes these sites appears to be a separate, manually-triggered step outside what's available to me here.

To unblock:
- If that's Lovable's own "Publish" action in their UI — clicking it is a hosting/deploy action, not an AI generation request, so it should be fine under your "no Lovable credits" constraint, but you should confirm and trigger it yourself since I can't tell for certain from here, **or**
- If there's a different deploy mechanism (a Cloudflare API token I could use with `wrangler deploy`, a webhook, a CI system elsewhere), point me to it and I'll use it directly.

## What's still blocked because of the above
- Real contact-form test against production (needs both the migration and a live deploy of the new code).
- Auth → onboarding → Whish → admin verification → Request Launch E2E test (same).
- Confirming the attribution links and `/privacy` etc. are actually live for real visitors.
- The final go-live gate.

## Not yet applicable
- Domain/DNS/TLS finalization — waiting on you to confirm the final domain, as planned.

## Release-gate matrix (this session)

| CHECK | PASS/FAIL | EVIDENCE | REMAINING ACTION |
|---|---|---|---|
| Merge to main | PASS | Fast-forward `13d3a58..d09f2c6`, pushed | None |
| Build | PASS | `tsc --noEmit` + `vite build` clean on `main` | None |
| Route/link/button QA | PASS | 33/33 automated Playwright checks against the real built app | None |
| Mobile QA (320/375/390/tablet/desktop) | PASS | Screenshots + no-overflow + mobile-menu + focus checks, all green | None |
| Accessibility (modal Escape/focus) | PASS | Live-verified: LeadLightbox opens with focus on its close button, closes on Escape | None |
| Portfolio cross-linking | PASS | `/work` lists Bloom Outlet + Afandi Chicken, truthful copy, live URLs | None |
| Client attribution — Bloom Outlet | PASS | Dead link fixed, centralized, pushed to `main` | Live site still shows old footer — needs the same deploy trigger as above |
| Client attribution — Afandi Chicken | PASS | Plain text made into a real link, centralized, pushed to `main` | Same — needs deploy |
| Supabase migration applied | **FAIL** | Access to `kmighupzxdtulaqzcgqn` denied to this session | You need to grant access or run it yourself (see Blocker 1) |
| Production deploy | **FAIL** | `/privacy` still 404 on the live URL 30+ min after push | You need to trigger the actual publish/deploy (see Blocker 2) |
| Real contact-form test | BLOCKED | Depends on both of the above | — |
| Auth/Whish/Launch E2E | BLOCKED | Depends on both of the above | — |
| Domain/DNS/TLS | NOT APPLICABLE YET | No domain confirmed | Waiting on you |

**Still NO-GO.** Code-side, everything requested this session is done, tested, and pushed. What's left needs your hand on two things only you can do from here: Supabase access, and triggering an actual deploy. Once either happens, tell me and I'll pick the corresponding item back up immediately.
