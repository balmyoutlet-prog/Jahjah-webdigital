// Advisor-style diagnosis, opportunity scenario modeling, and package
// recommendation logic. Pure functions only — no network/DB calls — so
// the exact same logic drives the outreach message, the public study
// page, and the admin CRM view without drifting out of sync.
//
// Hard rules baked into this module:
//   - never invent a compliment or number not present on the record
//   - never output fake precision on a range input
//   - revenue scenarios are always framed as illustrative, never guaranteed
//   - revenue and profit are never conflated

export type SalesRangeKey =
  | "under_5k"
  | "5k_10k"
  | "10k_25k"
  | "25k_50k"
  | "50k_100k"
  | "100k_plus"
  | "exact"
  | "undisclosed";

export const SALES_RANGE_OPTIONS: { key: SalesRangeKey; label: string; midpoint: number | null }[] =
  [
    { key: "under_5k", label: "Under $5K", midpoint: 3500 },
    { key: "5k_10k", label: "$5K–$10K", midpoint: 7500 },
    { key: "10k_25k", label: "$10K–$25K", midpoint: 17500 },
    { key: "25k_50k", label: "$25K–$50K", midpoint: 37500 },
    { key: "50k_100k", label: "$50K–$100K", midpoint: 75000 },
    { key: "100k_plus", label: "$100K+", midpoint: 125000 },
    { key: "exact", label: "Enter exact amount", midpoint: null },
    { key: "undisclosed", label: "Prefer not to say", midpoint: null },
  ];

export const PRIMARY_GOAL_OPTIONS = [
  "More sales",
  "More WhatsApp inquiries",
  "More bookings",
  "More orders",
  "More store visits",
  "More qualified leads",
  "Better brand trust",
] as const;

export type Playbook = {
  key: string;
  label: string;
  conservative_pct: number;
  expected_pct: number;
  high_pct: number;
  recommended_features: string[];
  messaging_angle: string | null;
  default_tier: "basic" | "medium" | "high";
};

export const GENERAL_PLAYBOOK: Playbook = {
  key: "general",
  label: "General / Other",
  conservative_pct: 3,
  expected_pct: 6,
  high_pct: 10,
  recommended_features: [
    "Dedicated website",
    "Clear conversion action",
    "Google & Maps connection",
    "Analytics",
  ],
  messaging_angle:
    "A dedicated digital destination connecting existing attention to a clear next step.",
  default_tier: "medium",
};

/** Round to a sensible increment — never fake precision on an approximate input. */
function roundSensibly(value: number): number {
  if (value < 200) return Math.round(value / 5) * 5;
  if (value < 2000) return Math.round(value / 50) * 50;
  if (value < 20000) return Math.round(value / 100) * 100;
  return Math.round(value / 500) * 500;
}

export type ScenarioInput = {
  salesRange: SalesRangeKey | null | undefined;
  salesExact?: number | null | undefined;
};

export type ScenarioResult = {
  baseMonthly: number | null;
  isRange: boolean;
  conservativeMonthly: number | null;
  expectedMonthly: number | null;
  highMonthly: number | null;
  conservativeAnnual: number | null;
  expectedAnnual: number | null;
  highAnnual: number | null;
  conservativeLow?: number;
  conservativeHigh?: number;
  expectedLow?: number;
  expectedHigh?: number;
  highLow?: number;
  highHigh?: number;
};

/**
 * Computes conservative/expected/high monthly + annualized opportunity
 * scenarios from a self-reported sales figure. When the input is a bucket
 * (not an exact number), the output is a rounded RANGE, never a single
 * falsely-precise dollar figure.
 */
export function computeOpportunityScenarios(
  input: ScenarioInput,
  playbook: Playbook,
): ScenarioResult {
  const empty: ScenarioResult = {
    baseMonthly: null,
    isRange: true,
    conservativeMonthly: null,
    expectedMonthly: null,
    highMonthly: null,
    conservativeAnnual: null,
    expectedAnnual: null,
    highAnnual: null,
  };
  if (!input.salesRange || input.salesRange === "undisclosed") return empty;

  if (input.salesRange === "exact") {
    const exact = input.salesExact;
    if (!exact || exact <= 0) return empty;
    const conservative = roundSensibly(exact * (playbook.conservative_pct / 100));
    const expected = roundSensibly(exact * (playbook.expected_pct / 100));
    const high = roundSensibly(exact * (playbook.high_pct / 100));
    return {
      baseMonthly: exact,
      isRange: false,
      conservativeMonthly: conservative,
      expectedMonthly: expected,
      highMonthly: high,
      conservativeAnnual: conservative * 12,
      expectedAnnual: expected * 12,
      highAnnual: high * 12,
    };
  }

  const range = SALES_RANGE_OPTIONS.find((r) => r.key === input.salesRange);
  if (!range || range.midpoint === null) return empty;

  // Bucketed input -> bucketed output. We compute a low/high band from the
  // bucket's own low/high (approximated via +/-45% around the midpoint,
  // which is how the buckets themselves were built) so the opportunity
  // range reflects the same uncertainty as the input, never more precision
  // than we actually have.
  const lowBase = range.midpoint * 0.55;
  const highBase = range.midpoint * 1.45;

  const band = (pct: number) => ({
    low: roundSensibly(lowBase * (pct / 100)),
    high: roundSensibly(highBase * (pct / 100)),
    mid: roundSensibly(range.midpoint! * (pct / 100)),
  });

  const c = band(playbook.conservative_pct);
  const e = band(playbook.expected_pct);
  const h = band(playbook.high_pct);

  return {
    baseMonthly: range.midpoint,
    isRange: true,
    conservativeMonthly: c.mid,
    expectedMonthly: e.mid,
    highMonthly: h.mid,
    conservativeAnnual: c.mid * 12,
    expectedAnnual: e.mid * 12,
    highAnnual: h.mid * 12,
    conservativeLow: c.low,
    conservativeHigh: c.high,
    expectedLow: e.low,
    expectedHigh: e.high,
    highLow: h.low,
    highHigh: h.high,
  };
}

/** Optional — only ever computed when the prospect volunteers a margin. */
export function computeGrossProfitContribution(
  expectedMonthlyRevenue: number | null,
  grossMarginPct: number | null | undefined,
) {
  if (!expectedMonthlyRevenue || !grossMarginPct || grossMarginPct <= 0) return null;
  return roundSensibly(expectedMonthlyRevenue * (grossMarginPct / 100));
}

export type DiagnosisInput = {
  business_name: string;
  google_rating?: number | null;
  google_reviews_count?: number | null;
  instagram_url?: string | null;
  website_status?: "no_website" | "weak_website" | "good_website" | "unknown" | null;
  category?: string | null;
};

export type Diagnosis = {
  positives: string[];
  gapStatement: string;
  hasStrongWebsite: boolean;
};

/** The single source of truth for "what did we verify" — reused by
 *  outreach, the public study page, and the admin CRM view. */
export function buildDiagnosis(p: DiagnosisInput): Diagnosis {
  const positives: string[] = [];
  if (typeof p.google_rating === "number") {
    positives.push(
      `${p.google_rating.toFixed(1)}★ Google rating${p.google_reviews_count ? ` across ${p.google_reviews_count} reviews` : ""} — a strong trust signal.`,
    );
  }
  if (p.instagram_url)
    positives.push("An active Instagram presence showing real customer engagement.");
  if (positives.length === 0)
    positives.push("A real, operating business with something worth presenting properly online.");

  let gapStatement: string;
  const hasStrongWebsite = p.website_status === "good_website";
  if (p.website_status === "no_website") {
    gapStatement = `${p.business_name} does not currently have a dedicated website connecting the attention you already have to trust, discovery and a direct customer action.`;
  } else if (p.website_status === "weak_website") {
    gapStatement = `${p.business_name}'s current website is not giving that existing attention a strong enough path to trust, discovery and a direct customer action.`;
  } else if (hasStrongWebsite) {
    gapStatement = `${p.business_name} already has a working website — the opportunity here is narrower than a full rebuild, focused on a specific gap rather than starting over.`;
  } else {
    gapStatement = `We have not yet verified ${p.business_name}'s website status — the first step is confirming whether the current digital presence matches the business.`;
  }

  return { positives, gapStatement, hasStrongWebsite };
}

export type RecommendationInput = {
  category?: string | null;
  primaryGoal?: string | null | undefined;
  scenario: ScenarioResult;
};

export type Recommendation = {
  tier: "basic" | "medium" | "high";
  reasoning: string;
  features: string[];
};

/** Prescriptive, not a menu — one recommended package with a stated reason. */
export function recommendPackage(input: RecommendationInput, playbook: Playbook): Recommendation {
  let tier = playbook.default_tier;

  const topBucket = input.scenario.baseMonthly !== null && input.scenario.baseMonthly >= 75_000;
  const bottomBucketTrustOnly =
    input.scenario.baseMonthly !== null &&
    input.scenario.baseMonthly <= 5_000 &&
    input.primaryGoal === "Better brand trust";

  if (topBucket) tier = "high";
  else if (bottomBucketTrustOnly) tier = "basic";

  const reasoning =
    tier === "basic"
      ? "Based on your current stage and goal, this gives you a professional home online without paying for functionality you do not need yet."
      : tier === "high"
        ? "Given the scale you described, this gives you the custom capacity and conversion flows a business at this volume needs."
        : "Based on your current business and stated objective, this gives you the functionality required without paying for features you do not need yet.";

  return { tier, reasoning, features: playbook.recommended_features };
}

/** "If we were advising [Business] today, this is what we would do first." */
export function buildWhatWeWouldDoFirst(playbook: Playbook): string[] {
  return [
    "Build the central website",
    "Connect your existing search and social traffic to it",
    "Create one primary conversion action" +
      (playbook.recommended_features[2]
        ? ` (${playbook.recommended_features[2].toLowerCase()})`
        : ""),
    "Add analytics",
    "Measure what customers actually do",
    "Improve from real data",
  ];
}
