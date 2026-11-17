// ===== Restaurant Special Offer =====
// Fixed one-time restaurant pricing, deliberately separate from the normal
// company packages in `platform.ts`. Restaurant offers use package-specific
// Website Care & Hosting pricing so the Advanced plan can carry premium care.
// These constants are the single source of truth for BOTH the public UI
// and the server-side one-time build price computation — never trust client-side totals.

export type RestaurantPackageKey = "basic" | "moderate" | "advanced";

export const RESTAURANT_EXTRA_PRICE_CENTS = 5000;

export const RESTAURANT_PACKAGES: {
  key: RestaurantPackageKey;
  name: string;
  focus: string;
  priceCents: number;
  careCents: number;
  popular?: boolean;
  pitch: string;
  features: string[];
}[] = [
  {
    key: "basic",
    name: "Basic",
    focus: "Landing Page",
    priceCents: 29900,
    careCents: 9900,
    pitch:
      "A polished one-page presence that makes your restaurant easy to find, easy to call and easy to message.",
    features: [
      "One-page landing website",
      "Mobile-first design",
      "Menu preview section",
      "Location & opening hours",
      "Click-to-call button",
      "WhatsApp contact button",
    ],
  },
  {
    key: "moderate",
    name: "Moderate",
    focus: "Menu & Ordering System",
    priceCents: 69900,
    careCents: 9900,
    popular: true,
    pitch:
      "A full digital menu your customers can browse, customise and order from — built to convert.",
    features: [
      "Full digital menu with ordering",
      "Categories, items & options",
      "Cart & order summary",
      "Dine-in, takeaway & delivery modes",
      "WhatsApp or direct order submission",
      "Mobile-first, thumb-friendly flow",
    ],
  },
  {
    key: "advanced",
    name: "Advanced",
    focus: "Marketing & SEO",
    priceCents: 129900,
    careCents: 14900,
    pitch:
      "Everything in Moderate, plus the structure to be found on Google and win more direct orders.",
    features: [
      "Everything in Moderate",
      "Conversion-focused marketing structure",
      "On-page & local SEO foundations",
      "Google Maps & reviews integration",
      "Analytics foundation",
      "Campaign landing sections",
      "Premium motion & interactions",
    ],
  },
];

export const RESTAURANT_EXTRAS: { key: string; label: string; note: string }[] = [
  {
    key: "additional_language",
    label: "Additional language",
    note: "Serve your menu and pages in a second language.",
  },
  {
    key: "reservation_system",
    label: "Reservation system",
    note: "Table booking requests straight from the website.",
  },
  {
    key: "loyalty_rewards",
    label: "Loyalty / rewards",
    note: "Reward repeat customers and bring them back.",
  },
  {
    key: "promo_codes",
    label: "Promo codes",
    note: "Run discounts and limited-time offers.",
  },
  {
    key: "extra_branch",
    label: "Extra branch",
    note: "A second location with its own hours and map.",
  },
  {
    key: "advanced_analytics",
    label: "Advanced analytics",
    note: "Deeper insight into visits, clicks and orders.",
  },
  {
    key: "email_sms_connection",
    label: "Email / SMS connection",
    note: "Send order alerts to your email or phone.",
  },
  {
    key: "additional_custom_page",
    label: "Additional custom page",
    note: "One more fully designed page of your choice.",
  },
];

export const RESTAURANT_EXTRA_KEYS = RESTAURANT_EXTRAS.map((e) => e.key);

export function restaurantPackage(key: RestaurantPackageKey) {
  return RESTAURANT_PACKAGES.find((p) => p.key === key)!;
}

/** Server-authoritative one-time build totals. Unknown extra keys are dropped,
 *  duplicates collapse, and every extra costs exactly RESTAURANT_EXTRA_PRICE_CENTS.
 *  Monthly care is package-specific and billed separately after launch. */
export function computeRestaurantTotals(packageKey: RestaurantPackageKey, extraKeys: string[]) {
  const pkg = restaurantPackage(packageKey);
  const extras = [...new Set(extraKeys)].filter((k) => RESTAURANT_EXTRA_KEYS.includes(k));
  const extrasTotalCents = extras.length * RESTAURANT_EXTRA_PRICE_CENTS;
  return {
    packagePriceCents: pkg.priceCents,
    carePriceCents: pkg.careCents,
    extras,
    extrasTotalCents,
    totalCents: pkg.priceCents + extrasTotalCents,
  };
}
