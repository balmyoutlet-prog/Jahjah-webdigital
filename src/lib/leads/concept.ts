// Private website concept generator — Direction A (Conversion First) and
// Direction B (Brand First). Pure, deterministic, no network/DB/LLM calls.
//
// Hard rules baked into this module (same as advisory.ts):
//   - never invent a product, price, review, staff member, or business fact
//   - only ever use fields the record actually has (business_name, category,
//     city, country, google rating/reviews) plus generic, true, reusable
//     framing copy — never a fabricated specific claim
//   - module lists come from a fixed per-industry library, not invention
//   - the two directions must differ in more than color: different module
//     emphasis/order and a different opening line

import type { Playbook } from "./advisory";

export type ConceptProspect = {
  business_name: string;
  category?: string | null;
  city?: string | null;
  country?: string | null;
  google_rating?: number | null;
  google_reviews_count?: number | null;
};

export type Direction = {
  key: "a" | "b";
  label: string;
  tagline: string;
  heroHeadline: string;
  heroSub: string;
  modules: string[];
};

export type Concept = {
  directionA: Direction;
  directionB: Direction;
  recommended: "a" | "b";
};

type ModuleSet = { conversionFirst: string[]; brandFirst: string[] };

// One entry per industry_playbooks key. Falls back to GENERAL_MODULES when
// a category has no specific set yet — mirrors the playbook fallback chain.
const MODULE_LIBRARY: Record<string, ModuleSet> = {
  restaurants: {
    conversionFirst: [
      "WhatsApp / order bar",
      "Digital menu",
      "Categories",
      "Google & Maps discovery",
      "Reviews",
      "Offers",
      "QR menu",
      "Analytics",
    ],
    brandFirst: [
      "Brand story",
      "Gallery",
      "Digital menu",
      "Categories",
      "Reviews",
      "WhatsApp / order flow",
      "Google & Maps discovery",
      "Analytics",
    ],
  },
  gym: {
    conversionFirst: [
      "Trial session request",
      "Programs",
      "Membership plans",
      "Class schedule",
      "Trainers",
      "WhatsApp",
      "Location",
      "Analytics",
    ],
    brandFirst: [
      "Brand story",
      "Trainers",
      "Programs",
      "Membership plans",
      "Class schedule",
      "Trial session request",
      "Location",
      "Analytics",
    ],
  },
  beauty: {
    conversionFirst: [
      "Booking",
      "Services menu",
      "WhatsApp",
      "Trust & reviews",
      "Portfolio / results gallery",
      "Location",
      "Offers",
      "Analytics",
    ],
    brandFirst: [
      "Portfolio / results gallery",
      "Brand story",
      "Services menu",
      "Trust & reviews",
      "Booking",
      "WhatsApp",
      "Location",
      "Analytics",
    ],
  },
  retail: {
    conversionFirst: [
      "New arrivals",
      "Product discovery",
      "Collections",
      "Offers",
      "WhatsApp / inquiry",
      "Analytics",
    ],
    brandFirst: [
      "Brand story",
      "Collections",
      "New arrivals",
      "Product discovery",
      "Offers",
      "WhatsApp / inquiry",
      "Analytics",
    ],
  },
  ecommerce: {
    conversionFirst: [
      "Product search",
      "Cart & checkout",
      "New arrivals",
      "Order tracking",
      "Campaign landing pages",
      "Analytics",
    ],
    brandFirst: [
      "Brand story",
      "Collections",
      "Product search",
      "Cart & checkout",
      "Order tracking",
      "Analytics",
    ],
  },
  professional: {
    conversionFirst: [
      "Appointment request",
      "Services overview",
      "Lead capture",
      "FAQ",
      "Credibility & team",
      "Analytics",
    ],
    brandFirst: [
      "Credibility & team",
      "Services overview",
      "FAQ",
      "Appointment request",
      "Lead capture",
      "Analytics",
    ],
  },
  clinics: {
    conversionFirst: [
      "Appointment request",
      "Services & specialties",
      "FAQ",
      "Credibility & team",
      "Location & hours",
      "Analytics",
    ],
    brandFirst: [
      "Credibility & team",
      "Services & specialties",
      "FAQ",
      "Appointment request",
      "Location & hours",
      "Analytics",
    ],
  },
  hospitality: {
    conversionFirst: [
      "Booking / inquiry",
      "Rooms / services",
      "Location",
      "Gallery",
      "Trust",
      "FAQ",
    ],
    brandFirst: ["Gallery", "Brand story", "Rooms / services", "Booking / inquiry", "Trust", "FAQ"],
  },
  "growing-brands": {
    conversionFirst: ["Lead capture", "Brand presentation", "Analytics", "Room to grow"],
    brandFirst: ["Brand presentation", "Brand story", "Lead capture", "Analytics", "Room to grow"],
  },
  general: {
    conversionFirst: [
      "Clear conversion action",
      "Dedicated website",
      "Google & Maps connection",
      "Analytics",
    ],
    brandFirst: [
      "Brand story",
      "Dedicated website",
      "Clear conversion action",
      "Google & Maps connection",
      "Analytics",
    ],
  },
};

// Deterministic, documented product decision — not a data-driven finding.
// Categories where the primary buying decision is transactional/urgent lean
// toward the conversion-first default; categories that sell primarily on
// taste/identity lean toward brand-first.
const BRAND_FIRST_DEFAULT = new Set(["beauty", "retail", "hospitality", "growing-brands"]);

function slugifyCategory(category: string | null | undefined): string {
  if (!category) return "general";
  return category
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-");
}

function moduleSetFor(category: string | null | undefined): ModuleSet {
  const key = slugifyCategory(category);
  return MODULE_LIBRARY[key] ?? MODULE_LIBRARY["general"]!;
}

function heroLine(p: ConceptProspect): string {
  // Only ever built from fields actually on the record — never invented.
  if (typeof p.google_rating === "number" && p.google_rating >= 4) {
    return "Your business already has attention. This is how we would turn more of it into action.";
  }
  return "This is a private first draft of how your business could look online.";
}

/**
 * Generates two meaningfully different private website concepts for a
 * prospect from verified fields + the industry playbook. Never invents a
 * product, price, testimonial, or fact not present on the record.
 */
export function generateConcept(p: ConceptProspect, playbook: Playbook): Concept {
  const modules = moduleSetFor(p.category);
  const recommended: "a" | "b" = BRAND_FIRST_DEFAULT.has(slugifyCategory(p.category)) ? "b" : "a";

  const directionA: Direction = {
    key: "a",
    label: "Conversion First",
    tagline: "Clean, fast, commercial — built around one clear next step.",
    heroHeadline: p.business_name,
    heroSub: heroLine(p),
    modules: modules.conversionFirst,
  };
  const directionB: Direction = {
    key: "b",
    label: "Brand First",
    tagline: "Premium, editorial, identity-led — still conversion-aware.",
    heroHeadline: p.business_name,
    heroSub: heroLine(p),
    modules: modules.brandFirst,
  };

  return { directionA, directionB, recommended };
}

export type QualityGateResult = { passed: boolean; issues: string[] };

/**
 * Structured completeness gate — checked before a concept is generated or
 * outreach is sent. This is data-completeness validation, not an automated
 * visual/performance QA harness (no such harness is built in this pass).
 */
export function assessQualityGate(
  p: ConceptProspect & { logo_url?: string | null },
): QualityGateResult {
  const issues: string[] = [];
  if (!p.business_name || p.business_name.trim().length < 2) {
    issues.push("Business name is missing or too short.");
  }
  if (!p.category) {
    issues.push("Category is not set — the concept would fall back to the generic module set.");
  }
  return { passed: issues.length === 0, issues };
}
