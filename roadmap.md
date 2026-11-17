# Restaurant landing visual upgrade

## Client-acquisition audit & fixes (2026-10-07)
- [x] P0: fix "$999 Advanced" care note (real price $1,299); label company vs restaurant pricing on homepage
- [x] P0: correct portfolio copy against live sites (Wholesome Craft, Afandi Chicken, The Sweet Spot)
- [x] P0: remove email contact options — jahjahwebdigital.com has no MX records, so mail bounces
- [x] P1: contextual, SSR-safe pre-filled WhatsApp messages on every page; floating button no longer covers the homepage sticky CTA
- [x] P1: outcome-led homepage hero, live proof directly after hero, restaurant FAQs, mobile hero clipping fixed, invisible portfolio card titles fixed
- [x] P1: /work as case studies (problem, build, testable journey, owner value, WhatsApp CTA) with ItemList schema
- [x] P1: unique market pages (Lebanon, Dubai, KSA, Riyadh, Jeddah, Qatar, Doha, Kuwait) and service pages (QR, WhatsApp, online ordering)
- [x] P1: three buyer guides incl. commission calculator; sitewide Organization/OfferCatalog schema; llms.txt and sitemap
- [x] P1: demo form — country picker, full needs list, no email field; HOT/WARM/COLD lead temperature; owner email newline bug
- [ ] Owner: set up email forwarding (MX) for hello@jahjahwebdigital.com, then re-add email as a contact option
- [ ] Owner: merge to main (Vercel deploys automatically)

## Global discoverability and conversion (current request)
- [x] Align homepage and existing commercial page positioning, proof, and primary inquiry path
- [x] Connect existing restaurant tools, guide, work and demo with descriptive links
- [x] Add consistent non-sensitive conversion events and a private approval-only outreach draft UI
- [x] Audit metadata, crawler files, mobile usability, routes, typecheck and build; do not publish

## Restaurant relocation guide (current request)
- [x] Publish-ready public guide with phased checklist, FAQs, metadata and structured data
- [x] Update homepage wording and Google Menu Checker link
- [x] Add sitemap URL and verify generated route and automated build (do not deploy)

- [x] Integrate the two supplied restaurant visuals through the project asset pipeline
- [x] Upgrade the /restaurant hero while preserving its primary CTA and five-step application
- [x] Add the ordering journey diagram, benefit cards, image strip, and CTA
- [x] Verify typecheck/build, desktop/mobile layout, console, and existing application behavior

## Outreach pipeline safety
- [x] Qualification gate, drafts, proof, statuses, readiness, dedup, metrics, inbound separation
- [ ] Admin view check in preview — blocked: no admin account available to sign in
- [ ] Real sending — blocked: external email domain verification and reply handling

## Google discoverability & lead target (2026-11-10)
- [x] Service pages: /website-design, /google-business-profile, /google-ads, /google-merchant-center, /seo-services (data in `custom-systems.ts`)
- [x] Arabic landing page /ar with Arabic FAQ schema; sitemap, llms.txt, footer, homepage grid and Organization knowsAbout updated
- [x] Growth plan with daily-lead target: docs/GOOGLE_GROWTH_PLAN.md
- [ ] Owner: merge to main, submit sitemap + request indexing in Search Console
- [ ] Owner: Jahjah Google Business Profile, client reviews, "Website by" footer links on client sites
- [ ] Owner: send GA4 / Google Ads measurement ID so WhatsApp clicks are tracked as conversions

## Google Ads test — Lebanon, 4 days × $10 (2026-11-10)
- [x] Keyword research with real volume/CPC (Dubai CPC $16–21 → Lebanon first)
- [x] Campaign spec: docs/GOOGLE_ADS_CAMPAIGN_LEBANON.md (3 ad groups, exact/phrase only, negatives, RSAs, assets)
- [x] Optional Google Ads conversion tag wired to WhatsApp/form events (`src/lib/google-ads.ts`, empty = off)
- [ ] Owner: connect Google Ads (or build from the doc), send AW- ID + label, merge to main
