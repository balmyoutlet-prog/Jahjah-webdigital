/**
 * DOS Design Studio — single source of truth for brand, origin and contact routing.
 * Everything business-specific that is not yet verified is flagged `confirmed: false`
 * so the preview can label it and nothing unverified ships silently.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://dos.jahjahwebdigital.com").replace(/\/$/, "");

export const PREVIEW_MODE = process.env.NEXT_PUBLIC_PREVIEW_MODE !== "false";

export const BRAND = {
  name: "DOS Design Studio",
  short: "DOS",
  instagram: "https://www.instagram.com/dos.designstudio",
  instagramHandle: "@dos.designstudio",
  /** Set to the path of the original logo (e.g. "/brand/dos-logo.svg") once the owner supplies it. */
  logoSrc: null as string | null,
} as const;

/** Digits only, international format, no leading "+" or "00". */
export function normalizePhone(raw: string | undefined | null): string {
  if (!raw) return "";
  let d = String(raw).replace(/[^\d]/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  return d;
}

export const WHATSAPP = {
  architecture: normalizePhone(process.env.NEXT_PUBLIC_WA_ARCHITECTURE),
  interiors: normalizePhone(process.env.NEXT_PUBLIC_WA_INTERIORS),
  general: normalizePhone(process.env.NEXT_PUBLIC_WA_GENERAL),
};

export const TEAM = {
  architecture: {
    key: "architecture" as const,
    name: "Shinaz",
    confirmed: false, // full name, title and qualifications to be confirmed by the studio
    photo: "/team/architect-portrait.jpg",
  },
  interiors: {
    key: "interiors" as const,
    name: "Dima Jahjah",
    confirmed: true,
    photo: "/team/dima-jahjah.jpg",
  },
};

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || "";
export const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION || "";
