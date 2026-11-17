export type Tier = "basic" | "medium" | "high";

export const TIER_PRICE_CENTS: Record<Tier, number> = {
  basic: 31900,
  medium: 51900,
  high: 71900,
};

export const TIER_LABEL: Record<Tier, string> = {
  basic: "Basic",
  medium: "Medium",
  high: "High-End / Luxury",
};

export const TIER_ORDER: Tier[] = ["basic", "medium", "high"];

export const INCLUDED_TRIALS = 2;
export const EXTRA_TRIAL_PRICE_CENTS = 5000;
export const MONTHLY_CARE_PRICE_CENTS = 9900;
export const CUSTOM_FEATURE_PRICE_CENTS = 5000;

export const MONTHLY_CARE_FEATURES = [
  "Managed hosting and SSL",
  "Security updates and backups",
  "Performance and uptime monitoring",
  "One small content or menu update per month",
  "Priority technical support",
] as const;

export const TIER_LIMITS: Record<
  Tier,
  { pages: number; sections: number; revisionsIncluded: number }
> = {
  basic: { pages: 3, sections: 7, revisionsIncluded: INCLUDED_TRIALS },
  medium: { pages: 6, sections: 12, revisionsIncluded: INCLUDED_TRIALS },
  high: { pages: 10, sections: 18, revisionsIncluded: INCLUDED_TRIALS },
};

export const BUSINESS_CATEGORIES = [
  "Hospitality & Restaurants",
  "Fashion & Retail",
  "E-commerce",
  "Beauty & Lifestyle",
  "Real Estate",
  "Professional Services",
  "Startups & Growing Brands",
  "Other",
];

export type DirectionKey = "editorial" | "warm" | "monochrome" | "cinematic" | "clean" | "bold";

export const DIRECTIONS: { key: DirectionKey; name: string; note: string; tiers: Tier[] }[] = [
  {
    key: "clean",
    name: "Clean Contemporary",
    note: "Bright, calm and trustworthy.",
    tiers: ["basic", "medium", "high"],
  },
  {
    key: "warm",
    name: "Warm Hospitality",
    note: "Inviting tones and appetite-led imagery.",
    tiers: ["basic", "medium", "high"],
  },
  {
    key: "editorial",
    name: "Editorial Retail",
    note: "Magazine structure with strong typography.",
    tiers: ["medium", "high"],
  },
  {
    key: "monochrome",
    name: "Modern Monochrome",
    note: "Restrained, precise and professional.",
    tiers: ["medium", "high"],
  },
  {
    key: "cinematic",
    name: "Cinematic Luxury",
    note: "Dark, atmospheric and premium.",
    tiers: ["high"],
  },
  {
    key: "bold",
    name: "Bold Statement",
    note: "Oversized type and high contrast.",
    tiers: ["high"],
  },
];

export const PREFERRED_LANGUAGES: { key: string; label: string }[] = [
  { key: "english", label: "English" },
  { key: "arabic", label: "Arabic" },
  { key: "french", label: "French" },
  { key: "multi-language", label: "Multi-language" },
];

export const REQUIREMENT_OPTIONS = [
  "WhatsApp ordering",
  "Product catalogue",
  "Restaurant digital menu",
  "Online store",
  "Booking system",
  "Reservation system",
  "Contact forms",
  "Google Maps",
  "Reviews integration",
  "Gallery",
  "Social media integration",
  "SEO setup",
  "Analytics",
  "Admin dashboard",
  "Multilingual website",
  "Custom forms",
  "Delivery information",
  "Promotions",
  "Upselling / cross-selling",
  "Customer database",
  "Other",
];

export function usd(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

// ===== Payments =====
// Whish Money is the platform's manual payment method: the customer sends
// funds directly to this number, then submits proof for admin verification.
// A future automated provider (Stripe, etc.) plugs in beside this — see
// `paymentsConfigured()` in platform.server.ts — without touching checkout.
export const WHISH_NUMBER = "+961 71 466 556";
export const WHISH_INSTRUCTIONS =
  "Send the total amount via Whish Money to the number below, then submit your payment details for verification. Your project moves forward once our team confirms the payment.";

export function upgradePriceCents(from: Tier, to: Tier) {
  return Math.max(0, TIER_PRICE_CENTS[to] - TIER_PRICE_CENTS[from]);
}

export function tierRank(t: Tier) {
  return TIER_ORDER.indexOf(t);
}
