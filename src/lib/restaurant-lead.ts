// Shared by the public demo form and its server handler so both validate the
// same options. Plain constants — safe to import on client and server.

export const RESTAURANT_LEAD_NEEDS = [
  "Online Ordering",
  "WhatsApp Ordering",
  "Digital Menu",
  "Website",
  "Reservations",
  "Table Ordering / Split Tables",
  "Upselling & Cross-selling",
  "Full Restaurant System",
] as const;

export type RestaurantLeadNeed = (typeof RESTAURANT_LEAD_NEEDS)[number];

/** Target markets first; anything else is still accepted as free text. */
export const RESTAURANT_LEAD_COUNTRIES = [
  "Lebanon",
  "UAE",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Other",
] as const;

export type LeadTemperature = "HOT" | "WARM" | "COLD";

/** Needs that put a sales system (orders, upsells, table flows) in front of
 *  customers — the larger packages and the clearest purchase intent. */
const ORDERING_NEEDS: readonly string[] = [
  "Online Ordering",
  "WhatsApp Ordering",
  "Table Ordering / Split Tables",
  "Upselling & Cross-selling",
  "Full Restaurant System",
];

const TARGET_MARKETS: readonly string[] = [
  "lebanon",
  "uae",
  "united arab emirates",
  "dubai",
  "abu dhabi",
  "saudi arabia",
  "ksa",
  "riyadh",
  "jeddah",
  "qatar",
  "doha",
  "kuwait",
];

const HIGH_INTENT_PAGES = [
  "/restaurant",
  "/qr-menu",
  "/whatsapp-ordering",
  "/free-restaurant-demo",
  "/work",
];

/**
 * HOT = ordering-type need in a target market with a verifiable business link
 * (or arriving from a service/demo page): reply first, same day.
 * WARM = some intent signals: reply within a day with a relevant live example.
 * COLD = little to go on: one helpful follow-up, then nurture.
 */
export function classifyRestaurantLead(input: {
  need: string;
  country: string;
  instagram?: string | undefined;
  landingPage?: string | undefined;
}): { temperature: LeadTemperature; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  if (ORDERING_NEEDS.includes(input.need)) {
    score += 2;
    reasons.push("ordering/sales-system need");
  } else {
    score += 1;
    reasons.push("menu/website need");
  }
  if (TARGET_MARKETS.includes(input.country.trim().toLowerCase())) {
    score += 1;
    reasons.push("target market");
  }
  if (input.instagram?.trim()) {
    score += 1;
    reasons.push("business link provided");
  }
  if (input.landingPage && HIGH_INTENT_PAGES.some((p) => input.landingPage!.startsWith(p))) {
    score += 1;
    reasons.push("landed on a service/demo page");
  }
  const temperature: LeadTemperature = score >= 4 ? "HOT" : score >= 2 ? "WARM" : "COLD";
  return { temperature, reasons };
}
