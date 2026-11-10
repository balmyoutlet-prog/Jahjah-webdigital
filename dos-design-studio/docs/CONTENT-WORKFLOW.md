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

## Instagram feed (Work section)
`src/content/instagram.ts` lists the 12 posts shown in the reel and post wall. They were cropped from the owner's screenshot of the profile grid, so they are about 390px source images upscaled for display. **Replace each `public/instagram/post-XX.jpg` with the original export (1600px+)**, keeping the same file names, and the reel sharpens automatically. Captions describe only what is visible. Verified project details belong in `projects.json`.

The reel's GPU transitions (`src/components/ReelGL.tsx`) cycle through: Liquid glass, Light sweep, AI render, Sketch to render, Zoom through. To add or reorder posts, edit the `FEED` array. A live, auto-updating Instagram feed needs the account owner to connect Meta's official Instagram API. Until then the feed is curated by hand and is not presented as live.

## Style explorer imagery
The 24 styles currently use generated material studies, labelled "Inspiration palettes — not completed DOS projects". To use photographs, add licensed images at `public/styles/<id>.jpg` and set `image` on the style in `src/content/styles.ts`.
