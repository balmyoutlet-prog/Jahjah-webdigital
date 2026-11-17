// Cover screenshots for the live portfolio cards, served from /public so the
// site has no dependency on any third-party screenshot CDN.
// Keep this separate from project copy so covers can be refreshed without touching case-study data.
export const PORTFOLIO_COVERS: Record<string, string> = {
  "al-afandi-chicken-dubai": "/images/covers/al-afandi-chicken-dubai.webp",
  "wholesome-craft": "/images/covers/wholesome-craft.webp",
  "sweet-spot-lebanon": "/images/covers/sweet-spot-lebanon.webp",
  "al-afandi-chicken": "/images/covers/al-afandi-chicken.webp",
  "bloom-outlet": "/images/covers/bloom-outlet.webp",
};

export function portfolioCover(slug: string, fallback: string) {
  return PORTFOLIO_COVERS[slug] ?? fallback;
}
