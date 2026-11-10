# Content workflow

## Logo
Installed from the owner's artwork: `public/brand/dos-logo.png` (with "ARCHITECTURE & INTERIOR STUDIO") and `public/brand/dos-mark.png` (letters only), both with transparent backgrounds, plus `favicon.png` / `apple-touch-icon.png`. The brand green `--dos-green: #1b5e34` was sampled from the logo strokes. An original **SVG** of the logo would make it perfectly sharp at every size; drop it in `public/brand/` and point `BRAND.logoMark` / `BRAND.logoFull` in `src/lib/site.ts` to it.

## WhatsApp numbers
Configured: architecture → **Shahinaz Jahjah +961 70 684 195**, interiors → **Dima Jahjah +961 81 405 269** (defaults in `src/lib/site.ts`). To change them without a code edit, set `NEXT_PUBLIC_WA_ARCHITECTURE`, `NEXT_PUBLIC_WA_INTERIORS` or `NEXT_PUBLIC_WA_GENERAL` (optional; falls back to interiors) in the Vercel project and redeploy.

Routing (`src/lib/whatsapp.ts`):
- Architecture: Architectural Design, Floor Plans, Villa Architecture, Exterior / Facade Design → **Shahinaz Jahjah**
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

The reel's GPU transitions (`src/components/ReelGL.tsx`) cycle through: Liquid glass, Light sweep, AI render, Sketch to render, Zoom through. To add or reorder posts, edit the `FEED` array. Reels are listed by ID in `REELS` (same file) and play through Instagram's official embed only after the visitor presses play. A live, auto-updating Instagram feed needs the account owner to connect Meta's official Instagram API. Until then the feed is curated by hand and is not presented as live.

## Style explorer imagery
The 24 styles currently use generated material studies, labelled "Inspiration palettes — not completed DOS projects". To use photographs, add licensed images at `public/styles/<id>.jpg` and set `image` on the style in `src/content/styles.ts`.

## Studio film (motion)
`public/film/dos-studio-film-{1080,720}.{mp4,webm}` is a 32s 1:1 film made in **Picsart Media Studio** (renders are free of credits) from the opening and closing cards in `public/film/` and the 12 feed posts. Each shot has a slow camera move, and the cuts use shape reveals (circle and arc shapes drawn from the DOS logo), an iris, blur dissolves and zoom-throughs. No AI-generated footage is involved, so nothing in the spaces is invented.
To remake it with full-resolution originals: replace the post images, redeploy, then re-export the same scene in Picsart and re-encode with ffmpeg (H.264 CRF 25 plus VP9 WebM, `+faststart`, no audio).
**Higgsfield** (AI image-to-video) is set up but needs credits: about 7.5 credits per 5s Kling 3.0 clip, and the account currently has 0.5.
