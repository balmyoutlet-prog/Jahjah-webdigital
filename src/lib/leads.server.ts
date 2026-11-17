import type { Admin } from "./platform.server";
import { audit } from "./platform.server";
import { opportunityScore } from "./leads/scoring";
import { runWebsiteAudit } from "./leads/audit.server";
import {
  buildDiagnosis,
  buildWhatWeWouldDoFirst,
  computeOpportunityScenarios,
  GENERAL_PLAYBOOK,
  recommendPackage,
  type Playbook,
  type SalesRangeKey,
} from "./leads/advisory";
import { assessQualityGate, generateConcept as buildConceptDirections } from "./leads/concept";
import { generateReferralCode } from "./referral";

// Owner reporting number for the daily WhatsApp report (see
// generateOwnerDailyReport). No WhatsApp Business Platform credentials are
// connected in this environment, so this stays a manually-clicked wa.me
// deep link — never an automated/claimed "send".
export const OWNER_WHATSAPP_NUMBER = "+961 71 46 65 16";

const PREVIEW_WINDOW_HOURS = 24;
const HOT_ENGAGEMENT_THRESHOLD = 60;

export type ProspectInput = {
  business_name: string;
  category?: string | null;
  city?: string | null;
  country?: string | null;
  instagram_url?: string | null;
  instagram_followers?: number | null;
  google_maps_url?: string | null;
  google_rating?: number | null;
  google_reviews_count?: number | null;
  website_url?: string | null;
  website_status?: "no_website" | "weak_website" | "good_website" | "unknown";
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  description?: string | null;
  lead_source?: string;
  referred_by_code?: string | null;
  logo_url?: string | null;
  brand_verified?: boolean;
};

function scoreFields(input: {
  google_rating?: number | null;
  google_reviews_count?: number | null;
  instagram_url?: string | null;
  instagram_followers?: number | null;
  website_status?: string | null;
  category?: string | null;
  audit_result?: any;
}) {
  const { score, breakdown } = opportunityScore({
    google_rating: input.google_rating,
    google_reviews_count: input.google_reviews_count,
    instagram_url: input.instagram_url,
    instagram_followers: input.instagram_followers,
    website_status: (input.website_status as any) ?? "unknown",
    category: input.category,
    audit_result: input.audit_result,
  });
  return { score, breakdown };
}

export async function createProspect(admin: Admin, actorId: string | null, input: ProspectInput) {
  const { score, breakdown } = scoreFields(input);
  const { data, error } = await admin
    .from("prospects")
    .insert({
      business_name: input.business_name,
      category: input.category || null,
      city: input.city || null,
      country: input.country || "Lebanon",
      instagram_url: input.instagram_url || null,
      instagram_followers: input.instagram_followers ?? null,
      google_maps_url: input.google_maps_url || null,
      google_rating: input.google_rating ?? null,
      google_reviews_count: input.google_reviews_count ?? null,
      website_url: input.website_url || null,
      website_status: input.website_status ?? (input.website_url ? "unknown" : "no_website"),
      phone: input.phone || null,
      whatsapp: input.whatsapp || null,
      email: input.email || null,
      description: input.description || null,
      lead_source: input.lead_source ?? "manual",
      referred_by_code: input.referred_by_code || null,
      referral_code: generateReferralCode(),
      opportunity_score: score,
      score_breakdown: breakdown,
      created_by: actorId,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logActivity(admin, data.id, actorId, "created", `Prospect added via ${data.lead_source}.`);
  return data;
}

export async function updateProspect(
  admin: Admin,
  actorId: string,
  id: string,
  patch: Partial<ProspectInput>,
) {
  const { data: existing, error: fetchErr } = await admin
    .from("prospects")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);

  const merged = { ...existing, ...patch };
  const { score, breakdown } = scoreFields(merged);

  const { data, error } = await admin
    .from("prospects")
    .update({ ...patch, opportunity_score: score, score_breakdown: breakdown })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logActivity(admin, id, actorId, "updated", "Prospect details updated.");
  return data;
}

import { STAGE_ORDER, type ProspectStage } from "./leads/stages";
export { STAGE_ORDER };
export type { ProspectStage } from "./leads/stages";

export async function changeStage(
  admin: Admin,
  actorId: string,
  id: string,
  stage: ProspectStage,
  note?: string,
) {
  const { error } = await admin.from("prospects").update({ stage }).eq("id", id);
  if (error) throw new Error(error.message);
  await logActivity(
    admin,
    id,
    actorId,
    "stage_change",
    note ?? `Stage moved to ${stage.replace(/_/g, " ")}.`,
    { stage },
  );
  await audit(admin, actorId, null, "prospect.stage_changed", { prospect_id: id, stage });
}

export async function logActivity(
  admin: Admin,
  prospectId: string,
  actorId: string | null,
  activityType: string,
  message?: string,
  metadata: Record<string, unknown> = {},
) {
  const { error } = await admin.from("prospect_activities").insert({
    prospect_id: prospectId,
    actor_id: actorId,
    activity_type: activityType,
    message: message ?? null,
    metadata,
  });
  if (error) throw new Error(error.message);
}

export async function scheduleFollowUp(
  admin: Admin,
  actorId: string,
  id: string,
  date: string,
  note?: string,
) {
  const { error } = await admin
    .from("prospects")
    .update({ next_follow_up_date: date })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await logActivity(
    admin,
    id,
    actorId,
    "follow_up_scheduled",
    note ?? `Follow-up scheduled for ${date}.`,
    { date },
  );
}

export async function runAndStoreAudit(admin: Admin, actorId: string, id: string) {
  const { data: prospect, error } = await admin.from("prospects").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  if (!prospect.website_url) throw new Error("This prospect has no website URL to audit.");

  const result = await runWebsiteAudit(prospect.website_url);
  const { score, breakdown } = scoreFields({ ...prospect, audit_result: result });

  const { data, error: updErr } = await admin
    .from("prospects")
    .update({
      audit_result: result,
      audited_at: new Date().toISOString(),
      opportunity_score: score,
      score_breakdown: breakdown,
    })
    .eq("id", id)
    .select()
    .single();
  if (updErr) throw new Error(updErr.message);

  await logActivity(
    admin,
    id,
    actorId,
    "audit_run",
    result.reachable
      ? "Website audit completed."
      : `Website audit could not verify the site: ${result.error}`,
    {
      result,
    },
  );
  return data;
}

export async function listProspects(
  admin: Admin,
  filters: {
    stage?: string | undefined;
    category?: string | undefined;
    country?: string | undefined;
    city?: string | undefined;
    websiteStatus?: string | undefined;
    minScore?: number | undefined;
    search?: string | undefined;
  } = {},
) {
  let query = admin
    .from("prospects")
    .select("*, prospect_activities(count)")
    .order("opportunity_score", { ascending: false });
  if (filters.stage) query = query.eq("stage", filters.stage);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.country) query = query.eq("country", filters.country);
  if (filters.city) query = query.eq("city", filters.city);
  if (filters.websiteStatus) query = query.eq("website_status", filters.websiteStatus);
  if (typeof filters.minScore === "number")
    query = query.gte("opportunity_score", filters.minScore);
  if (filters.search) query = query.ilike("business_name", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProspectDetail(admin: Admin, id: string) {
  const [prospect, activities] = await Promise.all([
    admin.from("prospects").select("*").eq("id", id).single(),
    admin
      .from("prospect_activities")
      .select("*")
      .eq("prospect_id", id)
      .order("created_at", { ascending: false }),
  ]);
  if (prospect.error) throw new Error(prospect.error.message);
  return { prospect: prospect.data, activities: activities.data ?? [] };
}

async function getPlaybook(admin: Admin, category: string | null | undefined): Promise<Playbook> {
  const candidates = category
    ? [
        category
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-"),
        "general",
      ]
    : ["general"];
  for (const key of candidates) {
    const { data } = await admin
      .from("industry_playbooks")
      .select("*")
      .eq("key", key)
      .maybeSingle();
    if (data) return data as Playbook;
  }
  return GENERAL_PLAYBOOK;
}

export type BusinessSnapshotInput = {
  salesRange: SalesRangeKey;
  salesExact?: number | undefined;
  avgOrderValue?: number | undefined;
  monthlyVolume?: number | undefined;
  grossMarginPct?: number | undefined;
  primaryGoal?: string | undefined;
};

/** Token-scoped write: the prospect supplies their own private business
 *  numbers on their own study link. Never exposes another prospect's
 *  data, never echoes raw inputs back beyond what's needed to render the
 *  derived scenario in this same response. */
export async function submitBusinessSnapshot(
  admin: Admin,
  token: string,
  input: BusinessSnapshotInput,
) {
  const { data: prospect, error } = await admin
    .from("prospects")
    .select("*")
    .eq("public_token", token)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!prospect) throw new Error("This study link is no longer valid.");

  const playbook = await getPlaybook(admin, prospect.category);
  const scenario = computeOpportunityScenarios(
    { salesRange: input.salesRange, salesExact: input.salesExact },
    playbook,
  );
  const recommendation = recommendPackage(
    { category: prospect.category, primaryGoal: input.primaryGoal, scenario },
    playbook,
  );
  const diagnosis = buildDiagnosis(prospect);

  const { error: updErr } = await admin
    .from("prospects")
    .update({
      monthly_sales_range: input.salesRange,
      monthly_sales_exact: input.salesExact ?? null,
      avg_order_value: input.avgOrderValue ?? null,
      monthly_volume: input.monthlyVolume ?? null,
      gross_margin_pct: input.grossMarginPct ?? null,
      primary_goal: input.primaryGoal ?? null,
      identified_gap: diagnosis.gapStatement,
      recommended_tier: recommendation.tier,
      recommended_reasoning: recommendation.reasoning,
      recommended_features: recommendation.features,
      scenario_conservative_monthly: scenario.conservativeMonthly,
      scenario_expected_monthly: scenario.expectedMonthly,
      scenario_high_monthly: scenario.highMonthly,
      scenario_is_range: scenario.isRange,
      scenario_assumptions: {
        playbook_key: playbook.key,
        conservative_pct: playbook.conservative_pct,
        expected_pct: playbook.expected_pct,
        high_pct: playbook.high_pct,
      },
      snapshot_submitted_at: new Date().toISOString(),
      stage:
        prospect.stage === "new_lead" || prospect.stage === "qualified"
          ? "interested"
          : prospect.stage,
    })
    .eq("id", prospect.id);
  if (updErr) throw new Error(updErr.message);

  await logActivity(
    admin,
    prospect.id,
    null,
    "snapshot_submitted",
    "Prospect submitted business snapshot for opportunity modeling.",
    {
      sales_range: input.salesRange,
      primary_goal: input.primaryGoal,
    },
  );
  await bumpEngagement(admin, prospect.id, "growth_study_completed_pts");

  const whatWeWouldDoFirst = buildWhatWeWouldDoFirst(playbook);
  return {
    scenario: {
      conservativeMonthly: scenario.conservativeMonthly,
      expectedMonthly: scenario.expectedMonthly,
      highMonthly: scenario.highMonthly,
      conservativeAnnual: scenario.conservativeAnnual,
      expectedAnnual: scenario.expectedAnnual,
      highAnnual: scenario.highAnnual,
      isRange: scenario.isRange,
      conservativeLow: scenario.conservativeLow,
      conservativeHigh: scenario.conservativeHigh,
      expectedLow: scenario.expectedLow,
      expectedHigh: scenario.expectedHigh,
      highLow: scenario.highLow,
      highHigh: scenario.highHigh,
    },
    recommendation,
    diagnosis,
    whatWeWouldDoFirst,
  };
}

export async function getFunnelAndRevenue(admin: Admin) {
  const [prospects, orders, addonOrders, projects] = await Promise.all([
    admin.from("prospects").select("stage, opportunity_score"),
    admin.from("orders").select("amount_cents, status, tier, kind, paid_at, created_at"),
    admin.from("order_addons").select("price_cents, order_id"),
    admin.from("projects").select("tier, paid, status"),
  ]);
  if (prospects.error) throw new Error(prospects.error.message);
  if (orders.error) throw new Error(orders.error.message);

  const allProspects = prospects.data ?? [];
  const stageCounts: Record<string, number> = {};
  for (const p of allProspects) stageCounts[p.stage] = (stageCounts[p.stage] ?? 0) + 1;

  const funnelStageGroups: { label: string; stages: string[] }[] = [
    { label: "Discovered", stages: STAGE_ORDER.filter((s) => s !== "lost") },
    { label: "Qualified", stages: STAGE_ORDER.filter((s) => !["new_lead", "lost"].includes(s)) },
    {
      label: "Contacted",
      stages: STAGE_ORDER.slice(STAGE_ORDER.indexOf("contacted")).filter((s) => s !== "lost"),
    },
    {
      label: "Replied",
      stages: STAGE_ORDER.slice(STAGE_ORDER.indexOf("replied")).filter((s) => s !== "lost"),
    },
    {
      label: "Form Submitted",
      stages: STAGE_ORDER.slice(STAGE_ORDER.indexOf("form_submitted")).filter((s) => s !== "lost"),
    },
    {
      label: "Package Selected",
      stages: STAGE_ORDER.slice(STAGE_ORDER.indexOf("package_selected")).filter(
        (s) => s !== "lost",
      ),
    },
    {
      label: "Paid",
      stages: STAGE_ORDER.slice(STAGE_ORDER.indexOf("payment_verified")).filter(
        (s) => s !== "lost",
      ),
    },
    { label: "Published", stages: ["published"] },
  ];
  const funnel = funnelStageGroups.map((g) => ({
    label: g.label,
    count: allProspects.filter((p) => g.stages.includes(p.stage)).length,
  }));

  const paidOrders = (orders.data ?? []).filter((o) => o.status === "paid");
  const revenueByTier: Record<string, number> = { basic: 0, medium: 0, high: 0 };
  for (const o of paidOrders) {
    if (o.tier && revenueByTier[o.tier] !== undefined) revenueByTier[o.tier] += o.amount_cents;
  }
  const addonRevenue = (addonOrders.data ?? []).reduce((sum, a) => sum + a.price_cents, 0);
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount_cents, 0);
  const avgOrderValue = paidOrders.length ? Math.round(totalRevenue / paidOrders.length) : 0;

  return {
    stageCounts,
    funnel,
    revenueByTier,
    addonRevenue,
    totalRevenue,
    avgOrderValue,
    paidOrdersCount: paidOrders.length,
    websitesInProduction: (projects.data ?? []).filter((p) => p.status === "active" && p.paid)
      .length,
    websitesLaunched: (projects.data ?? []).filter((p) => p.status === "published").length,
  };
}

// =====================================================================
// Private website concept engine
// =====================================================================

/** Admin-triggered: builds the two-direction private concept for a
 *  prospect from verified fields + the industry playbook, and opens a
 *  fresh 24-hour preview window. Refuses on an incomplete record rather
 *  than generating a concept off a blank/fallback category silently. */
export async function generatePrivateConcept(admin: Admin, actorId: string, id: string) {
  const { data: prospect, error } = await admin.from("prospects").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);

  const gate = assessQualityGate(prospect);
  if (!gate.passed) {
    throw new Error(`Cannot generate a concept yet: ${gate.issues.join(" ")}`);
  }

  const playbook = await getPlaybook(admin, prospect.category);
  const concept = buildConceptDirections(prospect, playbook);
  const expiresAt = new Date(Date.now() + PREVIEW_WINDOW_HOURS * 60 * 60 * 1000).toISOString();

  const { data, error: updErr } = await admin
    .from("prospects")
    .update({
      concept_data: concept,
      concept_generated_at: new Date().toISOString(),
      preview_expires_at: expiresAt,
      preview_auto_extended: false,
    })
    .eq("id", id)
    .select()
    .single();
  if (updErr) throw new Error(updErr.message);

  await logActivity(admin, id, actorId, "concept_generated", "Private website concept prepared.", {
    recommended: concept.recommended,
  });
  return data;
}

/** Admin-only: extends/reopens a preview window. */
export async function extendPreview(admin: Admin, actorId: string, id: string, hours = 24) {
  const { data: existing, error: fetchErr } = await admin
    .from("prospects")
    .select("preview_extended_count")
    .eq("id", id)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);

  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  const { error } = await admin
    .from("prospects")
    .update({
      preview_expires_at: expiresAt,
      preview_extended_count: (existing.preview_extended_count ?? 0) + 1,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await logActivity(admin, id, actorId, "preview_extended", `Preview extended by ${hours}h.`, {
    hours,
  });
}

async function bumpEngagement(admin: Admin, id: string, pointsKey: keyof EngagementWeights) {
  const config = await getEngagementConfig(admin);
  const points = config[pointsKey];
  const { data: prospect } = await admin
    .from("prospects")
    .select("engagement_score")
    .eq("id", id)
    .maybeSingle();
  const next = Math.min(100, (prospect?.engagement_score ?? 0) + points);
  await admin.from("prospects").update({ engagement_score: next }).eq("id", id);
}

type EngagementWeights = {
  preview_opened_pts: number;
  return_visit_pts: number;
  viewed_both_directions_pts: number;
  viewed_pricing_pts: number;
  growth_study_completed_pts: number;
  direction_selected_pts: number;
  payment_started_pts: number;
};

async function getEngagementConfig(admin: Admin): Promise<EngagementWeights> {
  const { data } = await admin.from("engagement_scoring_config").select("*").limit(1).maybeSingle();
  return (
    data ?? {
      preview_opened_pts: 10,
      return_visit_pts: 15,
      viewed_both_directions_pts: 15,
      viewed_pricing_pts: 15,
      growth_study_completed_pts: 20,
      direction_selected_pts: 30,
      payment_started_pts: 25,
    }
  );
}

export async function getEngagementScoringConfig(admin: Admin) {
  return getEngagementConfig(admin);
}

export async function updateEngagementScoringConfig(
  admin: Admin,
  patch: Partial<EngagementWeights>,
) {
  const { data: existing } = await admin
    .from("engagement_scoring_config")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (!existing) throw new Error("Engagement scoring config row is missing.");
  const { error } = await admin
    .from("engagement_scoring_config")
    .update(patch)
    .eq("id", existing.id);
  if (error) throw new Error(error.message);
}

/** Public, token-scoped: the private preview (concept + growth study
 *  fused into one flow). Handles first-open vs. return-visit tracking,
 *  24h expiry with a bounded one-time auto-extend for hot leads, and
 *  never exposes a logo/brand color that hasn't been admin-verified. */
export async function getPrivatePreview(admin: Admin, token: string) {
  const { data: prospect, error } = await admin
    .from("prospects")
    .select("*")
    .eq("public_token", token)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!prospect) return null;

  const firstOpen = !prospect.study_opened_at;
  const now = new Date();
  let expired = false;
  let autoExtended = false;

  if (prospect.preview_expires_at) {
    const expiresAt = new Date(prospect.preview_expires_at);
    if (now > expiresAt) {
      if (
        prospect.engagement_score >= HOT_ENGAGEMENT_THRESHOLD &&
        !prospect.preview_auto_extended
      ) {
        const newExpiry = new Date(now.getTime() + PREVIEW_WINDOW_HOURS * 60 * 60 * 1000);
        await admin
          .from("prospects")
          .update({ preview_expires_at: newExpiry.toISOString(), preview_auto_extended: true })
          .eq("id", prospect.id);
        prospect.preview_expires_at = newExpiry.toISOString();
        autoExtended = true;
        await logActivity(
          admin,
          prospect.id,
          null,
          "preview_auto_extended",
          "Hot lead — preview auto-extended 24h under configured policy.",
        );
      } else {
        expired = true;
      }
    }
  }

  if (firstOpen) {
    await admin
      .from("prospects")
      .update({ study_opened_at: new Date().toISOString() })
      .eq("id", prospect.id);
    await logActivity(admin, prospect.id, null, "preview_opened", "Private preview opened.");
    await bumpEngagement(admin, prospect.id, "preview_opened_pts");
  } else if (!expired) {
    await logActivity(
      admin,
      prospect.id,
      null,
      "preview_return_visit",
      "Prospect returned to preview.",
    );
    await bumpEngagement(admin, prospect.id, "return_visit_pts");
  }

  const playbook = await getPlaybook(admin, prospect.category);
  const diagnosis = buildDiagnosis(prospect);
  const whatWeWouldDoFirst = buildWhatWeWouldDoFirst(playbook);

  return {
    businessName: prospect.business_name,
    category: prospect.category,
    city: prospect.city,
    country: prospect.country,
    publicToken: prospect.public_token as string,
    logoUrl: prospect.brand_verified ? prospect.logo_url : null,
    diagnosis,
    whatWeWouldDoFirst,
    concept: prospect.concept_data ?? null,
    directionSelected: prospect.direction_selected,
    expired,
    autoExtended,
    previewExpiresAt: prospect.preview_expires_at,
    ownerAttentionRequired: prospect.owner_attention_required,
    hasSnapshot: Boolean(prospect.snapshot_submitted_at),
    scenario: prospect.snapshot_submitted_at
      ? {
          conservativeMonthly: prospect.scenario_conservative_monthly,
          expectedMonthly: prospect.scenario_expected_monthly,
          highMonthly: prospect.scenario_high_monthly,
          isRange: prospect.scenario_is_range,
        }
      : null,
    recommendation: prospect.recommended_tier
      ? {
          tier: prospect.recommended_tier,
          reasoning: prospect.recommended_reasoning,
          features: prospect.recommended_features,
        }
      : null,
  };
}

/** Public, token-scoped: prospect picks Direction A or B. */
export async function selectPreviewDirection(admin: Admin, token: string, direction: "a" | "b") {
  const { data: prospect, error } = await admin
    .from("prospects")
    .select("id, stage")
    .eq("public_token", token)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!prospect) throw new Error("This preview link is no longer valid.");

  await admin.from("prospects").update({ direction_selected: direction }).eq("id", prospect.id);
  await logActivity(
    admin,
    prospect.id,
    null,
    "direction_selected",
    `Selected direction ${direction.toUpperCase()}.`,
    {
      direction,
    },
  );
  await bumpEngagement(admin, prospect.id, "direction_selected_pts");
  return { ok: true };
}

const MILESTONE_KEYS = {
  viewed_both_directions: "viewed_both_directions_pts",
  viewed_pricing: "viewed_pricing_pts",
  payment_started: "payment_started_pts",
} as const;
export type PreviewMilestone = keyof typeof MILESTONE_KEYS;

/** Public, token-scoped: fire-and-forget engagement milestones the study
 *  page observes client-side (both directions opened, pricing viewed,
 *  the "Continue With My Recommendation" click). Idempotent-ish in spirit
 *  but not de-duplicated server-side — a few extra points from a re-view
 *  is an acceptable trade-off for keeping this stateless and simple. */
export async function trackPreviewMilestone(
  admin: Admin,
  token: string,
  milestone: PreviewMilestone,
) {
  const { data: prospect } = await admin
    .from("prospects")
    .select("id")
    .eq("public_token", token)
    .maybeSingle();
  if (!prospect) return { ok: false };
  await bumpEngagement(admin, prospect.id, MILESTONE_KEYS[milestone]);
  await logActivity(admin, prospect.id, null, milestone);
  return { ok: true };
}

const EDIT_TYPES = ["colors", "images", "text", "sections", "other"] as const;
export type EditRequestType = (typeof EDIT_TYPES)[number];

/** Public, token-scoped: the minimal edit flow. `special` routes to
 *  "Owner Attention Required" instead of a self-service edit list. */
export async function requestPreviewEdit(
  admin: Admin,
  token: string,
  input: {
    types?: EditRequestType[] | undefined;
    note?: string | undefined;
    special?: boolean | undefined;
  },
) {
  const { data: prospect, error } = await admin
    .from("prospects")
    .select("id")
    .eq("public_token", token)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!prospect) throw new Error("This preview link is no longer valid.");

  if (input.special) {
    await admin
      .from("prospects")
      .update({
        owner_attention_required: true,
        owner_attention_reason: input.note || "Prospect requested something special.",
      })
      .eq("id", prospect.id);
    await logActivity(
      admin,
      prospect.id,
      null,
      "owner_attention_requested",
      input.note || "Prospect requested something special.",
    );
    return { ok: true, routedToOwner: true };
  }

  await admin
    .from("prospects")
    .update({
      edit_request_types: input.types ?? [],
      edit_request_note: input.note || null,
    })
    .eq("id", prospect.id);
  await logActivity(
    admin,
    prospect.id,
    null,
    "edit_requested",
    input.note || "Minor changes requested.",
    {
      types: input.types ?? [],
    },
  );
  return { ok: true, routedToOwner: false };
}

// =====================================================================
// CEO dashboard — hot leads, today's counters, owner report
// =====================================================================

export async function getHotLeadsToday(admin: Admin) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data: activities } = await admin
    .from("prospect_activities")
    .select("prospect_id, activity_type, created_at")
    .gte("created_at", startOfDay.toISOString())
    .order("created_at", { ascending: false });

  const lastActionByProspect = new Map<string, string>();
  for (const a of activities ?? []) {
    if (!lastActionByProspect.has(a.prospect_id))
      lastActionByProspect.set(a.prospect_id, a.activity_type);
  }
  const activeIds = Array.from(lastActionByProspect.keys());
  if (activeIds.length === 0) return [];

  const { data: prospects } = await admin
    .from("prospects")
    .select("id, business_name, category, country, stage, engagement_score, opportunity_score")
    .in("id", activeIds)
    .order("engagement_score", { ascending: false })
    .limit(10);

  return (prospects ?? []).map((p) => ({
    ...p,
    lastAction: lastActionByProspect.get(p.id) ?? null,
  }));
}

export async function getTodayFunnelCounts(admin: Admin) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const iso = startOfDay.toISOString();

  const [discovered, activityRows, orders, launches] = await Promise.all([
    admin.from("prospects").select("id", { count: "exact", head: true }).gte("created_at", iso),
    admin.from("prospect_activities").select("prospect_id, activity_type").gte("created_at", iso),
    admin
      .from("orders")
      .select("amount_cents, status, paid_at")
      .gte("paid_at", iso)
      .eq("status", "paid"),
    admin.from("projects").select("id", { count: "exact", head: true }).gte("published_at", iso),
  ]);

  const countDistinctByType = (type: string) =>
    new Set(
      (activityRows.data ?? []).filter((r) => r.activity_type === type).map((r) => r.prospect_id),
    ).size;

  const payments = orders.data ?? [];
  return {
    discovered: discovered.count ?? 0,
    conceptsGenerated: countDistinctByType("concept_generated"),
    messagesSent: countDistinctByType("outreach_sent"),
    previewsOpened: countDistinctByType("preview_opened"),
    directionsSelected: countDistinctByType("direction_selected"),
    paymentsCount: payments.length,
    paymentsRevenueCents: payments.reduce((sum, o) => sum + o.amount_cents, 0),
    launchesToday: launches.count ?? 0,
  };
}

/** Composes the owner's daily report text + a wa.me deep link to
 *  OWNER_WHATSAPP_NUMBER. This is a manually-clicked link, never an
 *  automated send — no WhatsApp Business Platform credentials are
 *  connected in this environment. */
export async function generateOwnerDailyReport(admin: Admin) {
  const [counts, hotLeads, attentionNeeded] = await Promise.all([
    getTodayFunnelCounts(admin),
    getHotLeadsToday(admin),
    admin
      .from("prospects")
      .select("id", { count: "exact", head: true })
      .eq("owner_attention_required", true),
  ]);

  const lines = [
    "Jahjah Daily Growth Report",
    "",
    `Prospects discovered today: ${counts.discovered}`,
    `Private concepts generated: ${counts.conceptsGenerated}`,
    `Outreach sent: ${counts.messagesSent}`,
    `Previews opened: ${counts.previewsOpened}`,
    `Directions selected: ${counts.directionsSelected}`,
    `Payments: ${counts.paymentsCount} — $${(counts.paymentsRevenueCents / 100).toLocaleString()}`,
    `Websites launched today: ${counts.launchesToday}`,
    "",
  ];
  if (hotLeads.length > 0) {
    lines.push("Hot leads:");
    for (const l of hotLeads.slice(0, 5)) lines.push(`${l.business_name} — ${l.engagement_score}`);
    lines.push("");
  }
  lines.push(`Owner attention needed: ${attentionNeeded.count ?? 0}`);

  return { text: lines.join("\n"), phone: OWNER_WHATSAPP_NUMBER };
}
