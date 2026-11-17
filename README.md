# Jahjah WebDigital

Website and client platform for [jahjahwebdigital.com](https://jahjahwebdigital.com):
business websites, restaurant digital menus / online ordering, custom systems,
plus a private admin (leads CRM, outreach, payments, analytics).

Managed with Claude Code. See `CLAUDE.md` for working rules and `AGENTS.md`
for architecture notes.

## Local development

```sh
bun install
cp .env.example .env   # fill in Supabase URL + keys
bun run dev            # http://localhost:8080
```

## Build & deploy

```sh
bun run typecheck
bun run build
```

Deployment target is Vercel: pushes to `main` deploy to production
automatically once the Vercel project is linked to this repository. Nitro
detects Vercel during the build and outputs `.vercel/output`.

## Database

Supabase. All schema changes are SQL files in `supabase/migrations/`
(apply in filename order to a fresh project). Generated types:
`src/integrations/supabase/types.ts`.

## Docs

- `docs/MIGRATION_FROM_LOVABLE.md` — how the site left Lovable, cutover checklist
- `docs/AUDIT.md`, `docs/ROADMAP.md`, `roadmap.md` — audits and plans
- `docs/INTEGRATIONS.md` — optional integrations and their env vars
