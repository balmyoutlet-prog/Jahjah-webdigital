# DOS Design Studio — website

Futuristic luxury architecture site for **DOS Design Studio**, to be served at **https://dos.jahjahwebdigital.com**.
Independent brand: no Jahjah Web Digital branding appears on the site.

Stack: Next.js 16 (App Router, fully static output) · TypeScript · Tailwind CSS 4 · Three.js (hero, lazy-loaded) · GSAP ScrollTrigger (plan-to-space sequence).

## Run locally

```bash
cd dos-design-studio
npm ci
cp .env.example .env.local   # add the WhatsApp numbers when supplied
npm run dev                  # http://localhost:3000  (Arabic: /ar)
npm test                     # WhatsApp routing + message tests
npm run build                # production build (all routes static)
```

## Where things live

| What | File |
| --- | --- |
| Brand, canonical origin, team, WhatsApp numbers | `src/lib/site.ts` (+ env vars in `.env.example`) |
| All English and Arabic copy | `src/content/dictionary.ts` |
| 24 design styles (explorer) | `src/content/styles.ts` |
| Portfolio entries | `src/content/projects.json` (empty until authorized files arrive) |
| Inquiry routing + WhatsApp message | `src/lib/whatsapp.ts` |
| SEO: metadata, hreflang, sitemap, robots | `src/app/metadata.ts`, `src/app/sitemap.ts`, `src/app/robots.ts` |
| Hosting headers (noindex off-domain, security) | `vercel.json` |

More detail:
- `docs/DEPLOYMENT.md`: separate Vercel project, Name.com DNS for `dos.jahjahwebdigital.com`, go-live checklist
- `docs/CONTENT-WORKFLOW.md`: adding the logo, projects, photos and numbers
- `docs/RESEARCH-AND-OPEN-ITEMS.md`: what is verified, what is proposed, what the studio must supply

## Preview mode

`NEXT_PUBLIC_PREVIEW_MODE` defaults to `true`, which:
- shows a "Preview — pending studio approval" ribbon,
- labels unconfirmed profiles and services,
- serves `noindex` + `robots.txt: Disallow: /`.

Set it to `false` only at approved launch.
