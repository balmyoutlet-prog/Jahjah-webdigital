# Migration from Lovable to Claude-managed repo

**Date:** 2026-11-17

## What moved

| Item | Before (Lovable) | Now |
|---|---|---|
| Source code | Lovable project `6079c1fa-…` ("Jahjah webdigital"), synced to `balmyoutlet-prog/jahjah-global-vision` | This repo, `balmyoutlet-prog/Jahjah-webdigital` |
| Code snapshot | Lovable HEAD `d90f8a6` = GitHub `jahjah-global-vision@0968240` + Lovable-only files | Imported byte-for-byte (248 files verified with `cmp`), then de-Lovabled |
| Build config | `@lovable.dev/vite-tanstack-config` (Cloudflare target) | Plain `vite.config.ts`, Nitro auto-detects Vercel |
| Images | 2 restaurant images on Lovable asset store, 5 portfolio covers on `screenshot2.lovable.dev` | Local WebP files in `public/images/restaurant/` and `public/images/covers/` |
| Auth | `@lovable.dev/cloud-auth-js` (unused) + Lovable preview auth broker | Native Supabase Auth only (email/password + Google OAuth) |
| Error telemetry | Lovable editor hooks (`__lovableEvents`) | Removed (console only) |

## Code changes made during the move

- Removed: `.lovable/`, `src/integrations/lovable/`, `src/lib/lovable-error-reporting.ts`,
  `src/integrations/supabase/previewAuthStorage.ts`, unused `cron-auth.ts`, `bunfig.toml`,
  `src/assets/*.asset.json`.
- `package.json`: dropped `@lovable.dev/cloud-auth-js` and `@lovable.dev/vite-tanstack-config`.
- `drizzle.config.ts`: `LOVABLE_DB_MIGRATION_URL` → `DATABASE_URL`.
- `leads.functions.ts`: fallback origin `jahjah-global-vision.lovable.app` → `jahjahwebdigital.com`.
- **Bug fix:** `leads.functions.ts` re-exported `STAGE_ORDER` from `leads.server.ts` into the
  client bundle, which TanStack Start's import protection rejects — the production build failed.
  This is very likely why the Vercel deployments of `jahjah-global-vision` were in `ERROR`.
  `STAGE_ORDER` now lives in `src/lib/leads/stages.ts`.
- `.env` is now git-ignored; `.env.example` documents every variable.

Verified: `bun run typecheck` clean, `bun run build` passes (default + `VERCEL=1`),
SSR smoke test of `/`, `/packages`, `/work`, `/restaurant`, `/ar`, `/contact`, `/auth`,
`/sitemap.xml` all 200 with no browser console errors.

## Progress log

- 2026-11-17: TanStack Start bumped 1.168.32 → 1.168.61 — Vercel blocks the old version
  (CVE-2026-102989, XSS).
- 2026-11-17: First successful Vercel **preview** build of this repo in project `jahjahwebdigital`
  (`dpl_6APmKXULFDowqBGiUBok4VRmZ7tE`): homepage SSR and local images return 200. Project build
  settings are now framework `tanstack-start`, install `bun install`, build `bun run build`.
  The domain was not touched.
- 2026-11-17: Creating a Supabase project failed (free plan, 2-active-project limit). The owner
  chose to upgrade the Supabase org to Pro.

## Still on Lovable (infrastructure cutover — pending owner decisions)

1. **Database + auth users** — still the Lovable Cloud Supabase project `kmighupzxdtulaqzcgqn`
   (owned by Lovable, not by the Jahjah Supabase org). Plan: create a Supabase project in the
   Jahjah org, apply `supabase/migrations/*` in order, copy data table by table, re-create
   admin role, configure Google OAuth + redirect URLs, then swap env vars in Vercel.
2. **Hosting** — `jahjahwebdigital.com` A record → `185.158.133.1` (Lovable hosting).
   Vercel project `jahjahwebdigital` (team `jahjah`) already has the domain attached but is
   linked to `jahjah-global-vision`. Plan: relink it to this repo, set env vars, deploy,
   verify on the `.vercel.app` URL, then point DNS at Vercel.
3. **Lovable GitHub sync** — disconnect in Lovable (Project Settings → GitHub) so nothing
   writes to `jahjah-global-vision` again; archive that repo once cutover is done.
4. **Lovable project** — unpublish / delete after DNS has moved and the new site is verified.
