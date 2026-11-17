import type { DirectionKey, Tier } from "./platform";

export type SectionKey =
  | "hero"
  | "intro"
  | "highlights"
  | "gallery"
  | "menu"
  | "services"
  | "about"
  | "testimonial-space"
  | "hours"
  | "location"
  | "editorial"
  | "cta"
  | "contact"
  | "footer";

export type GeneratedSpec = {
  version: 1;
  tier: Tier;
  direction: DirectionKey;
  palette: { background: string; surface: string; text: string; muted: string; accent: string };
  typography: { display: string; body: string; scale: "compact" | "regular" | "grand" };
  layout: { density: "airy" | "regular" | "editorial"; corners: "sharp" | "soft"; motion: "subtle" | "rich" };
  pages: string[];
  sections: SectionKey[];
  headline: string;
  subline: string;
  cta: string;
};

const PALETTES: Record<DirectionKey, GeneratedSpec["palette"]> = {
  clean: { background: "#ffffff", surface: "#f5f6f7", text: "#111418", muted: "#5c6672", accent: "#1c6cf0" },
  warm: { background: "#fbf7f1", surface: "#f2e9dc", text: "#2b2119", muted: "#77685a", accent: "#b8763a" },
  editorial: { background: "#faf9f7", surface: "#eceae5", text: "#141414", muted: "#6a6a6a", accent: "#8a1c2b" },
  monochrome: { background: "#f4f4f4", surface: "#e6e6e6", text: "#0d0d0d", muted: "#5f5f5f", accent: "#0d0d0d" },
  cinematic: { background: "#0d0c0b", surface: "#181613", text: "#f5f1e8", muted: "#a49a8a", accent: "#d9b877" },
  bold: { background: "#101010", surface: "#1b1b1b", text: "#fdfdfd", muted: "#9b9b9b", accent: "#ff4d2e" },
};

const TYPE: Record<DirectionKey, { display: string; body: string }> = {
  clean: { display: "Geist", body: "Geist" },
  warm: { display: "Instrument Serif", body: "Geist" },
  editorial: { display: "Instrument Serif", body: "Geist" },
  monochrome: { display: "Geist", body: "Geist" },
  cinematic: { display: "Instrument Serif", body: "Geist" },
  bold: { display: "Geist", body: "Geist" },
};

const BASE_SECTIONS: SectionKey[] = ["hero", "intro", "highlights", "hours", "location", "contact", "footer"];
const MEDIUM_EXTRA: SectionKey[] = ["services", "gallery", "about", "cta", "menu"];
const HIGH_EXTRA: SectionKey[] = ["editorial", "testimonial-space", "menu", "gallery", "about", "cta", "services"];

const PAGES: Record<Tier, string[]> = {
  basic: ["Home", "About", "Contact"],
  medium: ["Home", "About", "Services", "Gallery", "Location", "Contact"],
  high: ["Home", "About", "Services", "Collection", "Gallery", "Story", "Press", "Location", "Contact", "Enquire"],
};

export type IdentityInput = {
  name: string;
  category: string;
  description: string;
  country: string;
  primaryColor?: string | null;
  accentColor?: string | null;
  fontStyle?: string | null;
};

/**
 * Deterministic design generator. Same identity + tier + direction always
 * produces the same approved design spec from the controlled template library.
 */
export function generateSpec(
  identity: IdentityInput,
  tier: Tier,
  direction: DirectionKey,
): GeneratedSpec {
  const palette = { ...PALETTES[direction] };
  if (identity.primaryColor) palette.text = tier === "basic" ? palette.text : palette.text;
  if (identity.accentColor) palette.accent = identity.accentColor;

  const sections =
    tier === "basic"
      ? BASE_SECTIONS.slice(0, 7)
      : tier === "medium"
        ? dedupe([...BASE_SECTIONS, ...MEDIUM_EXTRA]).slice(0, 12)
        : dedupe([...BASE_SECTIONS, ...MEDIUM_EXTRA, ...HIGH_EXTRA]).slice(0, 18);

  const typography = TYPE[direction];

  return {
    version: 1,
    tier,
    direction,
    palette,
    typography: {
      display: identity.fontStyle === "modern-sans" ? "Geist" : typography.display,
      body: typography.body,
      scale: tier === "high" ? "grand" : tier === "medium" ? "regular" : "compact",
    },
    layout: {
      density: tier === "high" ? "editorial" : tier === "medium" ? "regular" : "airy",
      corners: direction === "warm" || direction === "clean" ? "soft" : "sharp",
      motion: tier === "high" ? "rich" : "subtle",
    },
    pages: PAGES[tier],
    sections,
    headline: headlineFor(identity, direction),
    subline: identity.description.slice(0, 160),
    cta: ctaFor(identity.category),
  };
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function headlineFor(identity: IdentityInput, direction: DirectionKey) {
  switch (direction) {
    case "cinematic":
      return `${identity.name}. Crafted with intent.`;
    case "editorial":
      return `${identity.name} — a considered ${identity.category.split(" ")[0]?.toLowerCase()} experience.`;
    case "bold":
      return `${identity.name.toUpperCase()}`;
    case "warm":
      return `Welcome to ${identity.name}.`;
    case "monochrome":
      return `${identity.name}`;
    default:
      return `${identity.name} — ${identity.category}`;
  }
}

function ctaFor(category: string) {
  if (category.toLowerCase().includes("restaurant") || category.toLowerCase().includes("hospitality"))
    return "Order on WhatsApp";
  if (category.toLowerCase().includes("commerce") || category.toLowerCase().includes("retail")) return "Shop now";
  if (category.toLowerCase().includes("real estate")) return "Book a viewing";
  return "Get in touch";
}
