# Project conventions

Public educational guides use standalone TanStack leaf routes with their own metadata and structured data, so each guide has a directly accessible, shareable URL.

The private Outreach Queue reuses the protected leads read API and links to existing draft messages; no send endpoint or unverified contact data is introduced.

Shared restaurant tool links live in one component so the restaurant hub and work portfolio point to the same existing tools and guide.

- Outbound outreach lives in admin-only `outreach_records`/`outreach_events`/`outreach_settings` (service role behind requireAdmin), with gating rules in `src/lib/outreach-rules.ts`; why: keeps inbound leads untouched and enforces approval/suppression server-side.
- Restaurant market pages (`/restaurants/*` except Abu Dhabi), the QR/WhatsApp/online-ordering service pages and `/guides/*` are data-driven (`src/lib/restaurant-markets.ts`, `src/lib/restaurant-services.ts`, `GuideLayout`); why: each page needs its own local content, proof and FAQs instead of city-swapped copies.
- WhatsApp links use `useContextualWhatsAppUrl()` (router location, not `window`) so the server-rendered href already carries the page-specific pre-filled message; portfolio claims in `site-data.ts` must match the client's live site.
