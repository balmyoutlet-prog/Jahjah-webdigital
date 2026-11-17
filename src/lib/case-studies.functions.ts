import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "./admin-guard.server";
import { audit, getAdmin } from "./platform.server";

// ---- Public: only rows that are BOTH published and verified ever surface ----
export const getPublishedCaseStudies = createServerFn({ method: "GET" }).handler(async () => {
  const admin = await getAdmin();
  const { data: studies, error } = await admin
    .from("case_studies")
    .select("*, case_study_metrics(*)")
    .eq("public", true)
    .eq("verified", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  // Metrics carry their own public/verified flags too — never leak a draft
  // metric just because its parent case study happens to be published.
  return (studies ?? []).map((s: any) => ({
    ...s,
    case_study_metrics: (s.case_study_metrics ?? []).filter((m: any) => m.public && m.verified),
  }));
});

// ---- Admin ----
export const getAllCaseStudiesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const { data, error } = await admin
      .from("case_studies")
      .select("*, case_study_metrics(*)")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertCaseStudy = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        public_slug: z.string().trim().min(2).max(80),
        title: z.string().trim().min(2).max(160),
        summary: z.string().trim().max(1000).optional().or(z.literal("")),
        live_url: z.string().trim().max(300).optional().or(z.literal("")),
        public: z.boolean().default(false),
        verified: z.boolean().default(false),
        sort_order: z.coerce.number().int().default(0),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const payload = { ...data, summary: data.summary || null, live_url: data.live_url || null };
    const { data: row, error } = data.id
      ? await admin.from("case_studies").update(payload).eq("id", data.id).select().single()
      : await admin.from("case_studies").insert(payload).select().single();
    if (error) throw new Error(error.message);
    await audit(admin, context.userId, null, "case_study.upserted", { slug: data.public_slug });
    return row;
  });

export const upsertCaseStudyMetric = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        case_study_id: z.string().uuid(),
        metric_name: z.string().trim().min(2).max(80),
        metric_value: z.coerce.number(),
        metric_unit: z.string().trim().max(20).optional().or(z.literal("")),
        comparison_value: z.coerce.number().optional(),
        period_start: z.string().trim().max(10).optional().or(z.literal("")),
        period_end: z.string().trim().max(10).optional().or(z.literal("")),
        source: z.string().trim().max(200).optional().or(z.literal("")),
        verified: z.boolean().default(false),
        public: z.boolean().default(false),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const payload = {
      ...data,
      metric_unit: data.metric_unit || null,
      period_start: data.period_start || null,
      period_end: data.period_end || null,
      source: data.source || null,
    };
    const { data: row, error } = data.id
      ? await admin.from("case_study_metrics").update(payload).eq("id", data.id).select().single()
      : await admin.from("case_study_metrics").insert(payload).select().single();
    if (error) throw new Error(error.message);
    await audit(admin, context.userId, null, "case_study_metric.upserted", {
      case_study_id: data.case_study_id,
      metric_name: data.metric_name,
    });
    return row;
  });
