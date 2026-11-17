import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "./admin-guard.server";
import { audit, getAdmin } from "./platform.server";
import { checkRateLimit, rateLimitKey } from "./rate-limit.server";
import { getClientIp } from "./net/client-ip";
import { computeRestaurantTotals, RESTAURANT_EXTRA_KEYS } from "./restaurant";

const applicationSchema = z.object({
  businessName: z.string().trim().min(2).max(160),
  contactName: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  currentWebsite: z.string().trim().max(300).optional().or(z.literal("")),
  instagramUrl: z.string().trim().max(300).optional().or(z.literal("")),
  googleMapsUrl: z.string().trim().max(500).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  packageKey: z.enum(["basic", "moderate", "advanced"]),
  extras: z
    .array(z.enum(RESTAURANT_EXTRA_KEYS as [string, ...string[]]))
    .max(RESTAURANT_EXTRA_KEYS.length),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
  consent: z.literal(true),
  sessionId: z.string().trim().max(64).optional().or(z.literal("")),
  referrer: z.string().trim().max(300).optional().or(z.literal("")),
  utmSource: z.string().trim().max(80).optional().or(z.literal("")),
  utmMedium: z.string().trim().max(80).optional().or(z.literal("")),
  utmCampaign: z.string().trim().max(80).optional().or(z.literal("")),
  // Honeypot + fill-time — same anti-bot pattern as the contact form.
  company_website: z.string().max(200).optional().or(z.literal("")),
  elapsedMs: z.coerce.number().min(0).max(1_000_000).optional(),
});

/** Human-friendly application reference, e.g. RW-7K4M2P. Unambiguous
 *  alphabet (no 0/O/1/I/L) so it survives being read over the phone. */
function makeReference() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length]!;
  return `RW-${out}`;
}

export const submitRestaurantApplication = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => applicationSchema.parse(input))
  .handler(async ({ data }) => {
    // Bots that filled the honeypot or submitted implausibly fast get a
    // convincing success response and nothing is stored.
    if (data.company_website || (typeof data.elapsedMs === "number" && data.elapsedMs < 1200)) {
      return { ok: true as const, reference: makeReference() };
    }

    const admin = await getAdmin();
    const ip = getClientIp();
    const allowed = await checkRateLimit(admin, rateLimitKey("restaurant_application", ip), 5, 600);
    if (!allowed) {
      throw new Error(
        "Too many submissions from this connection. Please try again in a few minutes.",
      );
    }

    // Prices are computed exclusively from server-side constants — the
    // browser never supplies an amount.
    const totals = computeRestaurantTotals(data.packageKey, data.extras);

    let reference = makeReference();
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error } = await admin.from("restaurant_applications").insert({
        reference,
        business_name: data.businessName,
        contact_name: data.contactName || data.businessName,
        phone: data.phone,
        email: data.email || "",
        current_website: data.currentWebsite || null,
        instagram_url: data.instagramUrl || null,
        google_maps_url: data.googleMapsUrl || null,
        country: data.country || "",
        city: data.city || null,
        package_key: data.packageKey,
        package_price_cents: totals.packagePriceCents,
        extras: totals.extras,
        extras_total_cents: totals.extrasTotalCents,
        total_cents: totals.totalCents,
        notes: data.notes || null,
        session_id: data.sessionId || null,
        referrer: data.referrer || null,
        utm_source: data.utmSource || null,
        utm_medium: data.utmMedium || null,
        utm_campaign: data.utmCampaign || null,
      });
      if (!error) {
        await audit(admin, null, null, "restaurant_application.submitted", {
          reference,
          package: data.packageKey,
          extras_count: totals.extras.length,
          total_cents: totals.totalCents,
        });
        return { ok: true as const, reference };
      }
      // Retry only on the (astronomically unlikely) reference collision.
      if (error.code === "23505") {
        reference = makeReference();
        continue;
      }
      throw new Error(error.message);
    }
    throw new Error("Could not save your application. Please try again.");
  });

export const getRestaurantApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const { data, error } = await admin
      .from("restaurant_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateRestaurantApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "contacted", "qualified", "won", "lost"]),
        adminNotes: z.string().trim().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const { error } = await admin
      .from("restaurant_applications")
      .update({ status: data.status, admin_notes: data.adminNotes ?? null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(admin, context.userId, null, "restaurant_application.status_updated", {
      application_id: data.id,
      status: data.status,
    });
    return { ok: true };
  });
