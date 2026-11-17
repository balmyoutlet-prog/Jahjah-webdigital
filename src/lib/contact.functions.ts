import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "./admin-guard.server";
import { audit, getAdmin } from "./platform.server";
import { checkRateLimit, rateLimitKey } from "./rate-limit.server";
import { getClientIp } from "./net/client-ip";
import { needOptions } from "./site-data";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(80).optional().or(z.literal("")),
  country: z.string().trim().min(2).max(80),
  website: z.string().trim().max(300).optional().or(z.literal("")),
  industry: z.string().trim().min(2).max(120),
  need: z.enum(needOptions as [string, ...string[]]),
  budgetRange: z.string().trim().max(120).optional().or(z.literal("")),
  launchTiming: z.string().trim().max(120).optional().or(z.literal("")),
  details: z.string().trim().min(10).max(4000),
  heardAbout: z.string().trim().max(160).optional().or(z.literal("")),
  consent: z.literal(true),
  sessionId: z.string().trim().max(64).optional().or(z.literal("")),
  referrer: z.string().trim().max(300).optional().or(z.literal("")),
  landingPage: z.string().trim().max(300).optional().or(z.literal("")),
  utmSource: z.string().trim().max(80).optional().or(z.literal("")),
  utmMedium: z.string().trim().max(80).optional().or(z.literal("")),
  utmCampaign: z.string().trim().max(80).optional().or(z.literal("")),
  company_website: z.string().max(200).optional().or(z.literal("")),
  elapsedMs: z.coerce.number().min(0).max(1_000_000).optional(),
});

export const submitContactInquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    const admin = await getAdmin();

    if (data.company_website || (typeof data.elapsedMs === "number" && data.elapsedMs < 1200)) {
      return { ok: true as const };
    }

    const ip = getClientIp();
    const allowed = await checkRateLimit(admin, rateLimitKey("contact_inquiry", ip), 5, 600);
    if (!allowed) {
      throw new Error(
        "Too many submissions from this connection. Please try again in a few minutes.",
      );
    }

    const { error } = await admin.from("inquiries").insert({
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone || null,
      country: data.country,
      current_website: data.website || null,
      industry: data.industry,
      need: data.need,
      budget_range: data.budgetRange || null,
      launch_timing: data.launchTiming || null,
      details: data.details,
      heard_about: data.heardAbout || null,
      source: "contact_form",
      session_id: data.sessionId || null,
      referrer: data.referrer || null,
      landing_page: data.landingPage || null,
      utm_source: data.utmSource || null,
      utm_medium: data.utmMedium || null,
      utm_campaign: data.utmCampaign || null,
    });
    if (error) throw new Error(error.message);

    await audit(admin, null, null, "inquiry.submitted", { email: data.email, need: data.need });
    return { ok: true as const };
  });

export const getInquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const { data, error } = await admin
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => {
      const match = row.admin_notes?.match(/^\[pipeline:(meeting_booked|quotation_sent)\]\n?/);
      return { ...row, crm_status: match?.[1] ?? row.status, admin_notes: row.admin_notes?.replace(/^\[pipeline:(meeting_booked|quotation_sent)\]\n?/, "") ?? null };
    });
  });

export const updateInquiryStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "contacted", "meeting_booked", "quotation_sent", "qualified", "won", "lost", "archived"]),
        adminNotes: z.string().trim().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const databaseStatus = data.status === "meeting_booked" || data.status === "quotation_sent" ? "qualified" : data.status;
    const marker = data.status === "meeting_booked" || data.status === "quotation_sent" ? `[pipeline:${data.status}]\\n` : "";
    const { error } = await admin
      .from("inquiries")
      .update({ status: databaseStatus, admin_notes: `${marker}${data.adminNotes ?? ""}` || null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(admin, context.userId, null, "inquiry.status_updated", {
      inquiry_id: data.id,
      status: data.status,
    });
    return { ok: true };
  });
