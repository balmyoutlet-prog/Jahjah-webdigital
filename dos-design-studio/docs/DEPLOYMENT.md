# Deployment — dos.jahjahwebdigital.com

**Nothing in this document has been executed.** It requires owner approval before any step that creates a project, changes DNS, or publishes.

## What was verified (read-only, 10 Nov 2026)

- `jahjahwebdigital.com` nameservers are **Name.com** (`ns1hwy/ns2fln/ns3fqs/ns4jnz.name.com`), so DNS changes are made in the Name.com dashboard.
- The root domain `jahjahwebdigital.com` has an `A` record → `185.158.133.1`. This is the main site and **must not be touched**.
- `dos.jahjahwebdigital.com` does not exist yet (NXDOMAIN), so adding it cannot conflict with existing records.
- A Vercel team **"jahjah"** already exists with other client projects (including `jahjah-webdigital` and `jahjahwebdigital`). DOS gets **its own new project**. Existing projects stay unchanged.

## Cost note (decide before go-live)

Vercel's **Hobby** plan is limited to non-commercial use. DOS is a commercial business site, so on Vercel it belongs on a **Pro** team. If the "jahjah" team is already Pro, adding a project normally adds no seat cost, but usage counts toward the team's included limits. If it is Hobby, upgrading has a monthly charge. **Do not upgrade without approval.**
The site is fully static and pre-optimizes its images (`images.unoptimized`), so it uses no Image Optimization quota and no serverless functions.

## 1. Create the separate Vercel project (after approval)

1. Vercel → team **jahjah** → **Add New → Project** → import GitHub repo `balmyoutlet-prog/jahjah-webdigital`.
2. **Project name:** `dos-design-studio`.
3. **Root Directory:** `dos-design-studio` (important: this isolates DOS from everything else in the repo).
4. Framework preset: Next.js (auto). Install: `npm ci`. Build: `npm run build`. Node.js 22.x or newer.
5. **Environment variables** (Production and Preview), copied from `.env.example`:
   - `NEXT_PUBLIC_SITE_URL=https://dos.jahjahwebdigital.com`
   - `NEXT_PUBLIC_WA_ARCHITECTURE` / `NEXT_PUBLIC_WA_INTERIORS` / `NEXT_PUBLIC_WA_GENERAL` (digits only, international format)
   - `NEXT_PUBLIC_PREVIEW_MODE=true` (until launch approval)
   - `NEXT_PUBLIC_GA4_ID`: a **new DOS-only** GA4 property (leave empty until created)
6. **Production branch:** keep it on a branch you control. Merging DOS code to the repo's default branch should only happen once approved.
7. Settings → Deployment Protection: keep **Vercel Authentication** on for previews.

> Note: if the existing `jahjah-webdigital` Vercel project is connected to this same GitHub repo, pushes to this branch may also start a *preview* build there. Previews never touch production. To avoid noise, set that project's "Ignored Build Step" to skip changes under `dos-design-studio/`.

## 2. Connect the subdomain (after approval)

1. In the **dos-design-studio** Vercel project → Settings → **Domains** → add `dos.jahjahwebdigital.com`.
2. Vercel then shows the exact DNS record to create. It is a **CNAME** for host `dos`. Use **the value Vercel displays** (it may be project-specific, e.g. `xxxx.vercel-dns-0xx.com`, or `cname.vercel-dns.com`).
3. **Name.com** → My Domains → `jahjahwebdigital.com` → **Manage DNS Records** → *Add record*:
   - Type: `CNAME`
   - Host: `dos`
   - Answer: *(value from Vercel)*
   - TTL: `300`
4. Do **not** edit or delete the existing `A @ 185.158.133.1` record or any other record.
5. Wait for Vercel to show **Valid Configuration**. Vercel issues the HTTPS certificate automatically.
6. Verify: `https://dos.jahjahwebdigital.com` loads with a valid certificate, and `https://jahjahwebdigital.com` is unchanged.

## 3. Launch checklist (after content sign-off)

- [ ] Original DOS logo installed (`BRAND.logoSrc`), and the typographic placeholder removed
- [ ] Second designer's full name, title and qualifications confirmed (`TEAM.architecture`)
- [ ] Services list approved
- [ ] WhatsApp numbers set and each tested from a phone (architecture, interiors, general)
- [ ] At least the first verified portfolio projects added, or the "in curation" state approved
- [ ] `NEXT_PUBLIC_PREVIEW_MODE=false`, then redeploy
- [ ] `https://dos.jahjahwebdigital.com/robots.txt` allows crawling and lists the sitemap
- [ ] Google Search Console: add **URL-prefix property** `https://dos.jahjahwebdigital.com/` (separate from the main domain), verify via `NEXT_PUBLIC_GSC_VERIFICATION`, submit `/sitemap.xml`
- [ ] GA4: DOS-only property, consent banner shows, events visible in DebugView (`whatsapp_click`, `inquiry_qualified`, `consultation_step`, `style_select`, `style_save`, `instagram_click`)

## Duplicate-content safeguards (already built in)

- Every page sets a canonical URL on `https://dos.jahjahwebdigital.com` plus `en`/`ar`/`x-default` hreflang.
- Any host other than `dos.jahjahwebdigital.com` (e.g. `*.vercel.app` previews) gets `X-Robots-Tag: noindex`.
- DOS content is not served from the main domain. Do not add DOS pages or redirects to the main site's project.
