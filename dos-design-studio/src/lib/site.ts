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
  tagline: "Architecture & Interior Studio",
  /** Original DOS logo supplied by the owner (transparent PNGs cut from the official artwork). */
  logoMark: "/brand/dos-mark.png", // "DOS" letterforms only — nav
  logoFull: "/brand/dos-logo.png", // with "ARCHITECTURE & INTERIOR STUDIO" — intro, footer
} as const;

/** Digits only, international format, no leading "+" or "00". */
export function normalizePhone(raw: string | undefined | null): string {
  if (!raw) return "";
  let d = String(raw).replace(/[^\d]/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  return d;
}

// Public studio WhatsApp numbers supplied by the owner. Environment variables override them without a code change.
export const WHATSAPP = {
  architecture: normalizePhone(process.env.NEXT_PUBLIC_WA_ARCHITECTURE || "+961 70 684 195"), // Shahinaz Jahjah
  interiors: normalizePhone(process.env.NEXT_PUBLIC_WA_INTERIORS || "+961 81 405 269"), // Dima Jahjah
  general: normalizePhone(process.env.NEXT_PUBLIC_WA_GENERAL),
};

export const TEAM = {
  architecture: {
    key: "architecture" as const,
    name: "Shahinaz Jahjah",
    nameAr: "شاهيناز جحجاح",
    confirmed: true, // name and discipline confirmed by the owner; qualifications not yet supplied, so none are stated
    photo: "/team/shahinaz-jahjah.jpg",
  },
  interiors: {
    key: "interiors" as const,
    name: "Dima Jahjah",
    nameAr: "ديما جحجاح",
    confirmed: true,
    photo: "/team/dima-jahjah.jpg",
  },
};

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || "";
export const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION || "";
