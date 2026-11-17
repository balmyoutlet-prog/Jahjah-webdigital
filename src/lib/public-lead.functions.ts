import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { audit, getAdmin } from "./platform.server";
import { createProspect } from "./leads.server";
import { checkRateLimit, rateLimitKey } from "./rate-limit.server";
import { getClientIp } from "./net/client-ip";
import { RESTAURANT_LEAD_NEEDS, classifyRestaurantLead } from "./restaurant-lead";

const OWNER_LEAD_EMAIL = process.env?.["LEAD_NOTIFICATION_EMAIL"] || "";

const submitSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(80),
  businessName: z.string().trim().min(2).max(160),
  instagram: z.string().trim().max(300).optional().or(z.literal("")),
  country: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  need: z.enum(RESTAURANT_LEAD_NEEDS),
  company_website: z.string().max(200).optional().or(z.literal("")),
  elapsedMs: z.coerce.number().min(0).max(1_000_000).optional(),
  ref: z.string().trim().max(20).optional(),
  sessionId: z.string().trim().max(64).optional().or(z.literal("")),
  landingPage: z.string().trim().max(300).optional().or(z.literal("")),
  referrer: z.string().trim().max(300).optional().or(z.literal("")),
  utmSource: z.string().trim().max(80).optional().or(z.literal("")),
  utmMedium: z.string().trim().max(80).optional().or(z.literal("")),
  utmCampaign: z.string().trim().max(80).optional().or(z.literal("")),
});

function normalizeInstagram(raw: string) {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const username = raw.replace(/^@/, "").trim();
  return username ? `https://instagram.com/${username}` : null;
}

export const submitBusinessLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => submitSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.company_website || (typeof data.elapsedMs === "number" && data.elapsedMs < 1200)) {
      return { publicToken: null };
    }

    const admin = await getAdmin();
    const ip = getClientIp();
    const allowed = await checkRateLimit(admin, rateLimitKey("restaurant_lead", ip), 8, 600);
    if (!allowed) throw new Error("Too many submissions. Please try again in a few minutes.");

    const instagramUrl = normalizeInstagram(data.instagram || "");
    const lead = classifyRestaurantLead({
      need: data.need,
      country: data.country,
      instagram: data.instagram,
      landingPage: data.landingPage,
    });
    const prospect = await createProspect(admin, null, {
      business_name: data.businessName,
      phone: data.phone,
      whatsapp: data.phone,
      instagram_url: instagramUrl,
      country: data.country,
      category: "restaurant",
      description: `${lead.temperature} restaurant inbound lead · Interest: ${data.need} · Contact: ${data.name}`,
      lead_source: data.utmSource || "website_restaurant_demo",
      referred_by_code: data.ref || null,
    });

    const details = [
      `Lead temperature: ${lead.temperature} (${lead.reasons.join(", ")})`,
      "Restaurant owner demo request",
      `Interest: ${data.need}`,
      instagramUrl ? `Instagram: ${instagramUrl}` : "",
      `Landing page: ${data.landingPage || "/"}`,
      `First visit/session: ${data.sessionId || "unavailable"}`,
      `CRM prospect: ${prospect.id}`,
    ].filter(Boolean).join("\n");

    const { error } = await admin.from("inquiries").insert({
      name: data.name,
      company: data.businessName,
      email: data.email || "",
      phone: data.phone,
      country: data.country,
      current_website: instagramUrl,
      industry: "Restaurant",
      need: data.need,
      details,
      source: data.utmSource || "restaurant_demo_popup",
      status: "new",
      session_id: data.sessionId || null,
      referrer: data.referrer || null,
      landing_page: data.landingPage || null,
      utm_source: data.utmSource || null,
      utm_medium: data.utmMedium || null,
      utm_campaign: data.utmCampaign || null,
    });
    if (error) throw new Error(error.message);

    // Optional instant owner notification. Configure LEAD_NOTIFICATION_EMAIL and RESEND_API_KEY in production.
    // Failure is deliberately non-blocking: the lead is already safely stored in CRM/inquiries.
    if (OWNER_LEAD_EMAIL && process.env?.["RESEND_API_KEY"]) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env["RESEND_API_KEY"]}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env?.["LEAD_FROM_EMAIL"] || "Jahjah WebDigital Leads <leads@jahjahwebdigital.com>",
            to: [OWNER_LEAD_EMAIL],
            subject: `[${lead.temperature}] New restaurant lead — ${data.businessName} (${data.country})`,
            text: [
              `Name: ${data.name}`,
              `Restaurant: ${data.businessName}`,
              `WhatsApp/Phone: ${data.phone}`,
              `Country: ${data.country}`,
              data.email ? `Email: ${data.email}` : "Email: not provided",
              `Need: ${data.need}`,
              instagramUrl ? `Instagram: ${instagramUrl}` : "Instagram: not provided",
              `Source: ${data.utmSource || "website_restaurant_demo"}`,
              `Landing page: ${data.landingPage || "/"}`,
              `Lead temperature: ${lead.temperature} (${lead.reasons.join(", ")})`,
            ].join("\n"),
          }),
        });
      } catch (notificationError) {
        console.error("Lead notification email failed", notificationError);
      }
    }

    await audit(admin, null, null, "restaurant_lead.submitted", {
      prospect_id: prospect.id,
      service: data.need,
      temperature: lead.temperature,
      landing_page: data.landingPage || "/",
      source: data.utmSource || "restaurant_demo_popup",
    });

    return { publicToken: prospect.public_token as string };
  });
