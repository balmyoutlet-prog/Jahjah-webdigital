const rawSiteUrl: string =
  import.meta.env?.["VITE_SITE_URL"] ||
  (typeof process !== "undefined" ? process.env?.["SITE_URL"] : undefined) ||
  "https://jahjahwebdigital.com";

export const SITE_URL = String(rawSiteUrl).trim().replace(/\/+$/, "");

/** Absolute production URL for a route path. */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/** Canonical/og:url value for a route. */
export function canonicalFor(path: string): string {
  return absoluteUrl(path);
}
