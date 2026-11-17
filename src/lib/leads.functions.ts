import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "./admin-guard.server";
import { getAdmin } from "./platform.server";
import {
  changeStage,
  createProspect,
  extendPreview,
  generateOwnerDailyReport,
  generatePrivateConcept,
  getEngagementScoringConfig,
  getFunnelAndRevenue,
  getHotLeadsToday,
  getPrivatePreview,
  getProspectDetail,
  getTodayFunnelCounts,
  listProspects,
  logActivity,
  requestPreviewEdit,
  runAndStoreAudit,
  scheduleFollowUp,
  selectPreviewDirection,
  submitBusinessSnapshot,
  trackPreviewMilestone,
  updateEngagementScoringConfig,
  updateProspect,
} from "./leads.server";
import { DISCOVERY_ADAPTERS } from "./leads/adapters";
import { STAGE_ORDER } from "./leads/stages";
import {
  buildFollowUp1,
  buildFollowUp2,
  buildFollowUp3,
  buildOutreachMessage,
  buildStrongOutreachMessage,
  buildWhatsAppLink,
  outreachAngleLabel,
} from "./leads/whatsapp";
import { PRIMARY_GOAL_OPTIONS } from "./leads/advisory";

const DEFAULT_SITE_ORIGIN = "https://jahjahwebdigital.com";

export { STAGE_ORDER };

const stageSchema = z.enum(STAGE_ORDER as unknown as [string, ...string[]]);
const websiteStatusSchema = z.enum(["no_website", "weak_website", "good_website", "unknown"]);

const prospectFields = {
  business_name: z.string().trim().min(2).max(160),
  category: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  country: z.string().trim().max(80).optional(),
  instagram_url: z.string().trim().url().max(300).optional().or(z.literal("")),
  instagram_followers: z.coerce.number().int().min(0).max(100_000_000).optional(),
  google_maps_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  google_rating: z.coerce.number().min(0).max(5).optional(),
  google_reviews_count: z.coerce.number().int().min(0).optional(),
  website_url: z.string().trim().url().max(300).optional().or(z.literal("")),
  website_status: websiteStatusSchema.optional(),
  phone: z.string().trim().max(40).optional(),
  whatsapp: z.string().trim().max(40).optional(),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional(),
  lead_source: z.string().trim().max(60).optional(),
  logo_url: z.string().trim().url().max(400).optional().or(z.literal("")),
  brand_verified: z.coerce.boolean().optional(),
};

async function adminContext(context: { supabase: any; userId: string }) {
  await requireAdmin(context.supabase, context.userId);
  return getAdmin();
}

export const listDiscoveryAdapters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    return DISCOVERY_ADAPTERS.map((a) => ({
      key: a.key,
      label: a.label,
      configured: a.configured(),
      inactiveReason: a.inactiveReason(),
    }));
  });

export const getLeads = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        stage: z.string().optional(),
        category: z.string().optional(),
        country: z.string().optional(),
        city: z.string().optional(),
        websiteStatus: z.string().optional(),
        minScore: z.coerce.number().optional(),
        search: z.string().optional(),
      })
      .parse(input ?? {}),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const admin = await adminContext(context);
    return listProspects(admin, data);
  });

export const getLeadDetail = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), origin: z.string().trim().max(200).optional() }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const admin = await adminContext(context);
    const detail = await getProspectDetail(admin, data.id);
    const prospect = detail.prospect;
    const score = prospect.opportunity_score ?? 0;
    const hasWebsite =
      prospect.website_status !== "no_website" && prospect.website_status !== "unknown";
    const publicUrl = `${data.origin || DEFAULT_SITE_ORIGIN}/for/${prospect.public_token}`;

    const message = buildOutreachMessage(prospect, score, publicUrl);
    const strongMessage = buildStrongOutreachMessage(prospect, publicUrl);
    const followUp1 = buildFollowUp1(
      prospect,
      publicUrl,
      prospect.google_rating
        ? `your strong Google rating and review count`
        : "your existing customer presence",
    );
    const followUp2 = buildFollowUp2(prospect, publicUrl);
    const followUp3 = buildFollowUp3(prospect, publicUrl);
    const angleLabel = outreachAngleLabel(score, hasWebsite);
    const whatsappLink = buildWhatsAppLink(prospect.whatsapp || prospect.phone, message);

    return {
      ...detail,
      publicUrl,
      angleLabel,
      outreachMessage: message,
      strongOutreachMessage: strongMessage,
      followUpMessages: [followUp1, followUp2, followUp3],
      whatsappLink,
    };
  });

export const createLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object(prospectFields).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const admin = await adminContext(context);
    const cleaned = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === "" ? undefined : v]),
    );
    return createProspect(admin, context.userId, cleaned as any);
  });

export const updateLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), patch: z.object(prospectFields).partial() }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const admin = await adminContext(context);
    const cleaned = Object.fromEntries(
      Object.entries(data.patch).map(([k, v]) => [k, v === "" ? null : v]),
    );
    return updateProspect(admin, context.userId, data.id, cleaned as any);
  });

export const setLeadStage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({ id: z.string().uuid(), stage: stageSchema, note: z.string().max(500).optional() })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const admin = await adminContext(context);
    await changeStage(admin, context.userId, data.id, data.stage as any, data.note);
    return { ok: true };
  });

export const addLeadNote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), note: z.string().trim().min(1).max(2000) }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const admin = await adminContext(context);
    await logActivity(admin, data.id, context.userId, "note", data.note);
    return { ok: true };
  });

export const scheduleLeadFollowUp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), date: z.string().min(4).max(20) }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const admin = await adminContext(context);
    await scheduleFollowUp(admin, context.userId, data.id, data.date);
    return { ok: true };
  });

export const markLeadContacted = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const admin = await adminContext(context);
    await changeStage(
      admin,
      context.userId,
      data.id,
      "contacted",
      "Marked contacted from the outreach panel.",
    );
    await logActivity(
      admin,
      data.id,
      context.userId,
      "outreach_sent",
      "WhatsApp outreach message sent.",
    );
    return { ok: true };
  });

export const runLeadAudit = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const admin = await adminContext(context);
    return runAndStoreAudit(admin, context.userId, data.id);
  });

export const getCrmOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await adminContext(context);
    return getFunnelAndRevenue(admin);
  });

// ---- Private website concept engine (admin) ----
export const generateLeadConcept = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const admin = await adminContext(context);
    return generatePrivateConcept(admin, context.userId, data.id);
  });

export const extendLeadPreview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        hours: z.coerce
          .number()
          .min(1)
          .max(24 * 30)
          .default(24),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const admin = await adminContext(context);
    await extendPreview(admin, context.userId, data.id, data.hours);
    return { ok: true };
  });

// ---- CEO dashboard (admin) ----
export const getHotLeadsTodayFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await adminContext(context);
    return getHotLeadsToday(admin);
  });

export const getTodayFunnelCountsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await adminContext(context);
    return getTodayFunnelCounts(admin);
  });

export const getOwnerDailyReportFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await adminContext(context);
    return generateOwnerDailyReport(admin);
  });

export const getEngagementConfigFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await adminContext(context);
    return getEngagementScoringConfig(admin);
  });

export const updateEngagementConfigFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        preview_opened_pts: z.coerce.number().int().min(0).max(100),
        return_visit_pts: z.coerce.number().int().min(0).max(100),
        viewed_both_directions_pts: z.coerce.number().int().min(0).max(100),
        viewed_pricing_pts: z.coerce.number().int().min(0).max(100),
        growth_study_completed_pts: z.coerce.number().int().min(0).max(100),
        direction_selected_pts: z.coerce.number().int().min(0).max(100),
        payment_started_pts: z.coerce.number().int().min(0).max(100),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const admin = await adminContext(context);
    await updateEngagementScoringConfig(admin, data);
    return { ok: true };
  });

// ---- Public, token-based private preview (no auth) ----
export const getPublicProspectPage = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ token: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const admin = await getAdmin();
    const study = await getPrivatePreview(admin, data.token);
    return { study };
  });

export const chooseDirection = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().uuid(), direction: z.enum(["a", "b"]) }).parse(input),
  )
  .handler(async ({ data }) => {
    const admin = await getAdmin();
    return selectPreviewDirection(admin, data.token, data.direction);
  });

export const submitPreviewEdit = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        token: z.string().uuid(),
        types: z
          .array(z.enum(["colors", "images", "text", "sections", "other"]))
          .max(5)
          .optional(),
        note: z.string().trim().max(500).optional(),
        special: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const admin = await getAdmin();
    const { token, ...rest } = data;
    return requestPreviewEdit(admin, token, rest);
  });

const milestoneSchema = z.enum(["viewed_both_directions", "viewed_pricing", "payment_started"]);
export const trackPreviewMilestoneFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().uuid(), milestone: milestoneSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const admin = await getAdmin();
    return trackPreviewMilestone(admin, data.token, data.milestone);
  });

const salesRangeSchema = z.enum([
  "under_5k",
  "5k_10k",
  "10k_25k",
  "25k_50k",
  "50k_100k",
  "100k_plus",
  "exact",
  "undisclosed",
]);

export const submitStudySnapshot = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        token: z.string().uuid(),
        salesRange: salesRangeSchema,
        salesExact: z.coerce.number().min(0).max(100_000_000).optional(),
        avgOrderValue: z.coerce.number().min(0).max(1_000_000).optional(),
        monthlyVolume: z.coerce.number().min(0).max(10_000_000).optional(),
        grossMarginPct: z.coerce.number().min(0).max(100).optional(),
        primaryGoal: z.enum(PRIMARY_GOAL_OPTIONS).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const admin = await getAdmin();
    const { token, ...rest } = data;
    return submitBusinessSnapshot(admin, token, rest);
  });
