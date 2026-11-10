# Content workflow

## Logo (needed first)
Instagram could not be accessed automatically (login wall / rate limit), so the site uses a **typographic placeholder** "DOS / Design Studio".
Send the original logo as **SVG** (preferred) or a transparent PNG at 1000px+, in dark and light versions. Then:
1. Put it in `public/brand/` (e.g. `dos-logo.svg`).
2. Set `logoSrc: "/brand/dos-logo.svg"` in `src/lib/site.ts`.
3. Also replace `public/brand/favicon.svg` and regenerate `public/og/dos-og-*.jpg`.

## WhatsApp numbers
Set in the Vercel project's environment variables (no code edit), digits only, country code first:
`NEXT_PUBLIC_WA_ARCHITECTURE` (Shinaz), `NEXT_PUBLIC_WA_INTERIORS` (Dima Jahjah), `NEXT_PUBLIC_WA_GENERAL` (optional; falls back to interiors). Redeploy after changing.

Routing (`src/lib/whatsapp.ts`):
- Architecture: Architectural Design, Floor Plans, Villa Architecture, Exterior / Facade Design → **Shinaz**
- Interiors: Interior Architecture, Residential Interior, Commercial Interior → **Dima Jahjah**
- Full Design Consultation, Project Supervision → visitor **chooses** who to contact first
- Other Inquiry → general number

## Portfolio projects
`src/content/projects.json` is intentionally empty: no project is shown until it is verified. Planned entry shape:

```json
{
  "slug": "example-villa",
  "published": false,
  "category": "Villas",
  "title": { "en": "", "ar": "" },
  "location": { "en": "", "ar": "" },
  "year": "",
  "summary": { "en": "", "ar": "" },
  "approach": { "en": "", "ar": "" },
  "materials": { "en": [], "ar": [] },
  "images": ["/projects/example-villa/01.jpg"],
  "beforeAfter": null,
  "video": null
}
```

Only include fields the studio has confirmed (location, year, materials). Images: studio-owned or properly licensed only, exported at 2400px long edge (JPEG q80, or WebP).

**No-code admin (next phase):** the content files above are structured so a Git-backed CMS (e.g. Decap CMS or TinaCMS on this repo) can give the studio an upload form for projects, photos, reels and descriptions, with no hosting cost. This will be set up once the portfolio format is approved.

## Instagram
Linked from the Work section and footer. A live Instagram media wall needs the account owner to authorize Meta's official embed / Instagram API. No scraping, and nothing is presented as "real-time" until that is connected.

## Style explorer imagery
The 24 styles currently use generated material studies, labelled "Inspiration palettes — not completed DOS projects". To use photographs, add licensed images at `public/styles/<id>.jpg` and set `image` on the style in `src/content/styles.ts`.
