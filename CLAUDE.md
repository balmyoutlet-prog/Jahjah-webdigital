# Jahjah WebDigital — working rules for Claude

This repository is the **single source of truth** for jahjahwebdigital.com.
It is managed by Claude (Claude Code). It is **not** connected to Lovable or any
other hosted AI builder — do not add `@lovable.dev/*` packages, Lovable
preview/auth brokers, or Lovable asset URLs back into the code.

Read `AGENTS.md` for architecture conventions and `docs/MIGRATION_FROM_LOVABLE.md`
for how the site was moved here and what is still pending on the infrastructure side.

## Stack
- TanStack Start (React 19, file routes in `src/routes`) + Tailwind v4 + shadcn/ui
- Supabase (Postgres, Auth, RLS). Schema lives in `supabase/migrations/` — add
  new migrations there, never edit applied ones.
- Build: Vite 8 + Nitro. Nitro auto-detects Vercel (`VERCEL=1`) and emits
  `.vercel/output`. Package manager: **bun** (`bun.lock` is authoritative).

## Commands
- `bun install` — install exact locked versions
- `bun run dev` — local dev server on :8080 (needs `.env`, see `.env.example`)
- `bun run build` — production build (must pass before every push)
- `bun run typecheck` — `tsc --noEmit` (must pass before every push)

## Rules
- Files named `*.server.ts` are server-only. Client-imported modules
  (`*.functions.ts`, routes, components) must not re-export values from them —
  move shared constants into a plain module (see `src/lib/leads/stages.ts`).
- Secrets only via environment variables; never commit `.env`.
- Static images belong in `public/images/` (WebP preferred), never on a
  third-party CDN we don't control.
- No fabricated testimonials, stats, or client claims — portfolio copy in
  `src/lib/site-data.ts` must match the client's live site.
