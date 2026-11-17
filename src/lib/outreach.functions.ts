import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "./admin-guard.server";
import { getAdmin } from "./platform.server";
import { portfolioProjects } from "./portfolio-projects";
import {
  computeMetrics,
  DEFAULT_CTA,
  findDuplicates,
  FOLLOW_UP_DAYS,
  OUTREACH_STATUSES,
  transitionError,
  type OutreachRecord,
  type OutreachStatus,
} from "./outreach-rules";

// All outreach data is private: admin role verified first, then service-role access.
async function admin(context: { supabase: any; userId: string }) {
  await requireAdmin(context.supabase, context.userId);
  return getAdmin() as any;
}

const PROOF_SLUGS = portfolioProjects.map((p) => p.slug) as [string, ...string[]];
const opt = (max: number) => z.string().trim().max(max).optional().nullable();

async function ensureRecord(db: any, prospectId: string) {
  const { data } = await db.from("outreach_records").select("*").eq("prospect_id", prospectId).maybeSingle();
  if (data) return data;
  const { data: created, error } = await db
    .from("outreach_records")
    .insert({ prospect_id: prospectId, cta: DEFAULT_CTA })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return created;
}

export const getOutreachBoard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin(context);
    const [{ data: prospects, error: pErr }, { data: records }, { data: events }, { data: settings }, inq, apps] =
      await Promise.all([
        db
          .from("prospects")
          .select("id,business_name,category,city,country,website_url,email,phone,whatsapp,instagram_url,google_maps_url,lead_source,created_at")
          .order("created_at", { ascending: false })
          .limit(500),
        db.from("outreach_records").select("*"),
        db
          .from("outreach_events")
          .select("id,prospect_id,event_type,channel,from_status,to_status,note,created_at")
          .order("created_at", { ascending: false })
          .limit(2000),
        db.from("outreach_settings").select("*").maybeSingle(),
        db.from("inquiries").select("id", { count: "exact", head: true }),
        db.from("restaurant_applications").select("id", { count: "exact", head: true }),
      ]);
    if (pErr) throw new Error(pErr.message);
    const recByProspect = new Map((records ?? []).map((r: any) => [r.prospect_id, r]));
    const evByProspect = new Map<string, any[]>();
    for (const e of events ?? []) {
      const l = evByProspect.get(e.prospect_id) ?? [];
      l.push(e);
      evByProspect.set(e.prospect_id, l);
    }
    const dups = findDuplicates(prospects ?? []);
    const today = new Date().toISOString().slice(0, 10);
    const rows = (prospects ?? []).map((p: any) => {
      const rec: any = recByProspect.get(p.id) ?? null;
      const history = evByProspect.get(p.id) ?? [];
      const followUpDue =
        rec && rec.status === "sent" && rec.follow_up_eligible_at && rec.follow_up_eligible_at <= today && !rec.replied_at;
      return { prospect: p, record: rec, history, duplicates: dups[p.id] ?? [], followUpDue: !!followUpDue };
    });
    const metricRows = rows
      .filter((r: any) => r.record)
      .map((r: any) => ({
        ...r.record,
        reached_meeting: r.history.some((e: any) => e.to_status === "meeting"),
        reached_proposal: r.history.some((e: any) => e.to_status === "proposal"),
      }));
    return {
      rows: rows as any[],
      settings: settings ?? null,
      inbound: { inquiries: inq.count ?? 0, restaurantApplications: apps.count ?? 0 },
      proofs: portfolioProjects.map((p) => ({ slug: p.slug, name: p.name, category: p.category, url: p.url })),
      metricRows: metricRows.map((r: any) => ({
        status: r.status,
        replied_at: r.replied_at,
        reply_classification: r.reply_classification,
        last_contacted_at: r.last_contacted_at,
        reached_meeting: r.reached_meeting,
        reached_proposal: r.reached_proposal,
        country: rows.find((x: any) => x.prospect.id === r.prospect_id)?.prospect.country ?? null,
        signal_type: r.signal_type,
        channel: r.last_channel ?? r.preferred_channel,
      })),
      overall: computeMetrics(metricRows),
    };
  });

const recordInput = z.object({
  prospectId: z.string().uuid(),
  signal_type: opt(60),
  signal_summary: opt(600),
  signal_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable().or(z.literal("")),
  observation: opt(800),
  observation_verified: z.boolean().optional(),
  consequence: opt(600),
  solution_angle: opt(600),
  cta: opt(240),
  contact_route: opt(240),
  contact_route_type: z.enum(["email", "phone", "whatsapp_verified", "instagram_dm", "contact_form", "other"]).optional().nullable(),
  contact_verified: z.boolean().optional(),
  contact_role: opt(160),
  source_urls: z.array(z.string().trim().url().max(500)).max(10).optional(),
  proof_slug: z.enum(PROOF_SLUGS).optional().nullable().or(z.literal("")),
  opted_in: z.boolean().optional(),
  preferred_channel: z.enum(["email", "whatsapp", "instagram_dm"]).optional().nullable(),
  reply_classification: z.enum(["positive", "neutral", "negative", "not_now"]).optional().nullable(),
  email_first: opt(4000),
  email_follow_up: opt(4000),
  dm_first: opt(1000),
  dm_follow_up: opt(1000),
});

export const saveOutreachRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => recordInput.parse(i))
  .handler(async ({ data, context }) => {
    const db = await admin(context);
    const rec = await ensureRecord(db, data.prospectId);
    if (rec.status === "do_not_contact") throw new Error("Do Not Contact is permanent; record is locked.");
    const { prospectId, ...patch } = data;
    const clean: any = {};
    for (const [k, v] of Object.entries(patch)) if (v !== undefined) clean[k] = v === "" ? null : v;
    // Editing content after approval sends it back for re-approval.
    const contentKeys = ["observation", "consequence", "solution_angle", "cta", "email_first", "email_follow_up", "dm_first", "dm_follow_up", "contact_route", "contact_route_type"];
    if (rec.status === "approved" && contentKeys.some((k) => k in clean && clean[k] !== rec[k])) {
      clean.status = "needs_approval";
      clean.approved_at = null;
      clean.approved_by = null;
    }
    const { error } = await db.from("outreach_records").update(clean).eq("id", rec.id);
    if (error) throw new Error(error.message);
    await db.from("outreach_events").insert({
      prospect_id: prospectId,
      actor_id: context.userId,
      event_type: clean.status ? "edited_reapproval_required" : "edited",
      from_status: rec.status,
      to_status: (clean.status as string) ?? rec.status,
    });
    return { ok: true };
  });

export const setOutreachStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        prospectId: z.string().uuid(),
        to: z.enum(OUTREACH_STATUSES),
        channel: z.enum(["email", "whatsapp", "instagram_dm"]).optional(),
        note: z.string().trim().max(300).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const db = await admin(context);
    const rec = await ensureRecord(db, data.prospectId);
    const err = transitionError(rec as OutreachRecord, data.to as OutreachStatus);
    if (err) throw new Error(err);
    const patch: any = { status: data.to };
    const now = new Date();
    if (data.to === "approved") {
      patch.approved_by = context.userId;
      patch.approved_at = now.toISOString();
    }
    if (data.to === "sent") {
      // Records a message the admin sent manually outside this app. Nothing is sent from here.
      if (!data.channel) throw new Error("Choose the channel you used.");
      if (data.channel === "whatsapp" && rec.contact_route_type !== "whatsapp_verified" && !rec.opted_in)
        throw new Error("WhatsApp is only allowed for a source-verified WhatsApp number or an opted-in contact.");
      const wasFollowUp = rec.status === "follow_up_due";
      patch.last_contacted_at = now.toISOString();
      patch.last_channel = data.channel;
      if (wasFollowUp) {
        patch.follow_up_count = (rec.follow_up_count ?? 0) + 1;
        patch.follow_up_eligible_at = null; // one follow-up, then stop
      } else {
        const d = new Date(now.getTime() + FOLLOW_UP_DAYS * 86_400_000);
        patch.follow_up_eligible_at = d.toISOString().slice(0, 10);
      }
    }
    if (data.to === "follow_up_due") {
      const today = now.toISOString().slice(0, 10);
      if (!rec.follow_up_eligible_at || rec.follow_up_eligible_at > today)
        throw new Error(`Follow-up opens ${FOLLOW_UP_DAYS} days after the first message${rec.follow_up_eligible_at ? ` (${rec.follow_up_eligible_at})` : ""}.`);
    }
    if (data.to === "replied") patch.replied_at = now.toISOString();
    const { error } = await db.from("outreach_records").update(patch).eq("id", rec.id);
    if (error) throw new Error(error.message);
    await db.from("outreach_events").insert({
      prospect_id: data.prospectId,
      actor_id: context.userId,
      event_type: data.to === "sent" ? "manual_send_recorded" : "status_change",
      channel: data.channel ?? null,
      from_status: rec.status,
      to_status: data.to,
      note: data.note ?? null,
    });
    return { ok: true };
  });

export const saveOutreachSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        sending_domain: opt(120),
        domain_verified: z.boolean(),
        sender_address: z.string().trim().email().max(200).optional().nullable().or(z.literal("")),
        reply_to: z.string().trim().email().max(200).optional().nullable().or(z.literal("")),
        reply_to_configured: z.boolean(),
        inbound_tested: z.boolean(),
        last_test_result: opt(300),
        last_test_at: z.string().optional().nullable().or(z.literal("")),
        spf_status: z.enum(["unknown", "pending", "pass", "fail"]),
        dkim_status: z.enum(["unknown", "pending", "pass", "fail"]),
        dmarc_status: z.enum(["unknown", "pending", "pass", "fail"]),
        readiness_confirmed: z.boolean(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const db = await admin(context);
    const allPass =
      data.domain_verified &&
      data.reply_to_configured &&
      data.inbound_tested &&
      !!data.sender_address &&
      data.spf_status === "pass" &&
      data.dkim_status === "pass" &&
      data.dmarc_status === "pass";
    if (data.readiness_confirmed && !allPass)
      throw new Error("Readiness can only be confirmed once every check is marked complete and passing.");
    const row: Record<string, unknown> = { id: true, updated_by: context.userId, updated_at: new Date().toISOString() };
    for (const [k, v] of Object.entries(data)) row[k] = v === "" ? null : v;
    const { error } = await db.from("outreach_settings").upsert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
