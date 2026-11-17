import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  audit,
  getAdmin,
  loadWorkspace,
  paymentsConfigured,
  domainProviderConfigured,
  priceForOrder,
  requireOwnedProject,
  runGeneration,
} from "./platform.server";
import { requireAdmin } from "./admin-guard.server";
import { CUSTOM_FEATURE_PRICE_CENTS } from "./platform";
import { generateReferralCode } from "./referral";
import { suggestDomainCandidates } from "./leads/domains";
import { runWebsiteAudit } from "./leads/audit.server";

// A domain sitting anywhere in this list is a real, in-flight launch
// request the customer made — never proof the site is actually live.
const ACTIVE_DOMAIN_STATUSES = [
  "requested",
  "selected", // legacy value from before the state machine — treated the same
  "verified",
  "dns_pending",
  "dns_configured",
  "tls_active",
  "live",
] as const;

const tierSchema = z.enum(["basic", "medium", "high"]);

export const getWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await getAdmin();
    return loadWorkspace(admin, context.userId);
  });

export const registerCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        tier: tierSchema,
        name: z.string().trim().min(2).max(120),
        owner_name: z.string().trim().min(2).max(120),
        contact_email: z.string().trim().email(),
        phone: z.string().trim().min(5).max(40),
        country: z.string().trim().min(2).max(80),
        city: z.string().trim().max(80).optional().or(z.literal("")),
        category: z.string().trim().min(2).max(80),
        description: z.string().trim().min(20).max(2000),
        instagram_url: z.string().trim().url().max(300).optional().or(z.literal("")),
        maps_url: z.string().trim().url().max(500).optional().or(z.literal("")),
        existing_website: z.string().trim().url().max(300).optional().or(z.literal("")),
        preferred_language: z.enum(["english", "arabic", "french", "multi-language"]).optional(),
        requirements: z.array(z.string().trim().max(60)).max(30).optional(),
        logo_url: z.string().trim().max(400).optional().or(z.literal("")),
        photo_urls: z.array(z.string().trim().max(400)).max(20).optional(),
        terms_accepted: z.literal(true),
        // A CRM prospect's own public_token, carried through from their
        // private preview — links the resulting project back to the lead
        // that produced it. Never required; harmless if stale/invalid.
        source_prospect_token: z.string().uuid().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const admin = await getAdmin();
    const { data: existing } = await admin
      .from("companies")
      .select("id")
      .eq("owner_id", context.userId)
      .maybeSingle();
    if (existing) throw new Error("This account already has a company. One account = one company.");

    let sourceProspectId: string | null = null;
    let referredByCode: string | null = null;
    if (data.source_prospect_token) {
      const { data: sourceProspect } = await admin
        .from("prospects")
        .select("id, referred_by_code")
        .eq("public_token", data.source_prospect_token)
        .maybeSingle();
      sourceProspectId = sourceProspect?.id ?? null;
      referredByCode = sourceProspect?.referred_by_code ?? null;
    }

    const { data: company, error } = await admin
      .from("companies")
      .insert({
        owner_id: context.userId,
        name: data.name,
        owner_name: data.owner_name,
        contact_email: data.contact_email,
        phone: data.phone,
        country: data.country,
        city: data.city || null,
        category: data.category,
        description: data.description,
        instagram_url: data.instagram_url || null,
        maps_url: data.maps_url || null,
        existing_website: data.existing_website || null,
        preferred_language: data.preferred_language || null,
        requirements: data.requirements ?? [],
        logo_url: data.logo_url || null,
        photo_urls: data.photo_urls ?? [],
        referred_by_code: referredByCode,
        referral_code: generateReferralCode(),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const { data: project, error: pErr } = await admin
      .from("projects")
      .insert({
        owner_id: context.userId,
        company_id: company.id,
        tier: data.tier,
        status: "awaiting_payment",
        source_prospect_id: sourceProspectId,
      })
      .select()
      .single();
    if (pErr) throw new Error(pErr.message);

    await audit(admin, context.userId, project.id, "project.created", {
      tier: data.tier,
      company: company.name,
      terms_accepted: true,
    });
    return { companyId: company.id, projectId: project.id };
  });

export const saveIdentity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        logo_url: z.string().trim().max(400).optional().or(z.literal("")),
        visual_direction: z.string().trim().max(60).optional().or(z.literal("")),
        primary_color: z.string().trim().max(20).optional().or(z.literal("")),
        accent_color: z.string().trim().max(20).optional().or(z.literal("")),
        font_style: z.string().trim().max(40).optional().or(z.literal("")),
        whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
        address: z.string().trim().max(300).optional().or(z.literal("")),
        opening_hours: z.string().trim().max(500).optional().or(z.literal("")),
        instagram_url: z.string().trim().max(300).optional().or(z.literal("")),
        maps_url: z.string().trim().max(500).optional().or(z.literal("")),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const admin = await getAdmin();
    const { data: company } = await admin
      .from("companies")
      .select("id")
      .eq("owner_id", context.userId)
      .maybeSingle();
    if (!company) throw new Error("Register your company first.");

    const patch = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === "" ? null : v]),
    );
    const { error } = await admin
      .from("companies")
      .update({ ...patch, identity_completed: true })
      .eq("id", company.id);
    if (error) throw new Error(error.message);

    await audit(admin, context.userId, null, "identity.updated", {});
    return { ok: true };
  });

export const createGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ direction: z.string().min(2).max(40) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const admin = await getAdmin();
    const project = await requireOwnedProject(admin, context.userId);
    const { data: company } = await admin
      .from("companies")
      .select("*")
      .eq("id", project.company_id)
      .single();
    const generation = await runGeneration(admin, context.userId, project, company, data.direction);
    return { generationId: generation.id, trialNumber: generation.trial_number };
  });

export const selectGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ generationId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const admin = await getAdmin();
    const project = await requireOwnedProject(admin, context.userId);
    const { data: gen } = await admin
      .from("generations")
      .select("id")
      .eq("id", data.generationId)
      .eq("project_id", project.id)
      .maybeSingle();
    if (!gen) throw new Error("Design not found on your project.");
    await admin.from("projects").update({ selected_generation_id: gen.id }).eq("id", project.id);
    await audit(admin, context.userId, project.id, "generation.selected", {
      generation_id: gen.id,
    });
    return { ok: true };
  });

export const updateSelectedAddons = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ addonKeys: z.array(z.string().trim().min(1).max(60)).max(30) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const admin = await getAdmin();
    const project = await requireOwnedProject(admin, context.userId);
    if (project.paid)
      throw new Error(
        "This project is already paid — add-ons are locked. Use an upgrade order instead.",
      );

    const { data: addons, error: addonsErr } = await admin
      .from("addons")
      .select("key")
      .eq("active", true)
      .in("key", data.addonKeys);
    if (addonsErr) throw new Error(addonsErr.message);
    const validKeys = (addons ?? []).map((a: any) => a.key);

    const { error } = await admin
      .from("projects")
      .update({ selected_addons: validKeys })
      .eq("id", project.id);
    if (error) throw new Error(error.message);
    await audit(admin, context.userId, project.id, "addons.selected", { addonKeys: validKeys });
    return { addonKeys: validKeys };
  });

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        kind: z.enum(["package", "upgrade", "extra_trial"]),
        targetTier: tierSchema.optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const admin = await getAdmin();
    const project = await requireOwnedProject(admin, context.userId);

    if (data.kind === "package" && project.paid) throw new Error("This package is already paid.");
    if (data.kind !== "package" && !project.paid) throw new Error("Pay for your package first.");

    // Price is always computed server-side; never trusted from the browser.
    const { amount: baseAmount, description } = priceForOrder(data.kind, project, data.targetTier);

    // Add-ons only attach to the initial package order — upgrades and extra
    // trials are priced on their own.
    let addonRows: { key: string; name: string; price_cents: number }[] = [];
    if (data.kind === "package" && project.selected_addons?.length) {
      const { data: addons, error: addonsErr } = await admin
        .from("addons")
        .select("key, name, price_cents")
        .eq("active", true)
        .in("key", project.selected_addons);
      if (addonsErr) throw new Error(addonsErr.message);
      addonRows = (addons ?? []).map((addon) => ({
        ...addon,
        price_cents: CUSTOM_FEATURE_PRICE_CENTS,
      }));
    }
    const addonTotal = addonRows.reduce((sum, a) => sum + a.price_cents, 0);
    const amount = baseAmount + addonTotal;

    // Payments always work today via Whish Money manual verification. If an
    // automated provider (Stripe, etc.) is connected later, it can take over
    // this same order without any checkout rework.
    const stripeReady = paymentsConfigured();

    const { data: order, error } = await admin
      .from("orders")
      .insert({
        owner_id: context.userId,
        project_id: project.id,
        kind: data.kind,
        tier: data.kind === "upgrade" ? data.targetTier : project.tier,
        amount_cents: amount,
        description: addonRows.length
          ? `${description} + ${addonRows.length} add-on(s)`
          : description,
        status: "pending",
        provider: stripeReady ? "stripe" : "whish",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (addonRows.length) {
      const { error: lineErr } = await admin.from("order_addons").insert(
        addonRows.map((a) => ({
          order_id: order.id,
          addon_key: a.key,
          name: a.name,
          price_cents: a.price_cents,
        })),
      );
      if (lineErr) throw new Error(lineErr.message);
    }

    await audit(admin, context.userId, project.id, "order.created", {
      kind: data.kind,
      amount_cents: amount,
      addon_count: addonRows.length,
      provider: stripeReady ? "stripe" : "whish",
    });

    return {
      orderId: order.id,
      amountCents: amount,
      addons: addonRows,
      paymentsConfigured: stripeReady,
      provider: stripeReady ? "stripe" : "whish",
      checkoutUrl: null as string | null,
      message: stripeReady
        ? "Order created. Automated checkout is connected — complete payment there."
        : "Order created. Pay via Whish Money and submit your payment details below for verification.",
    };
  });

/** Domain concierge — auto-suggests 3 candidate names from the company's
 *  own name once the project is at the domain stage. Candidate NAMES are
 *  generated locally (pure string logic); actual availability can only
 *  ever come from a connected registrar API, so without one this honestly
 *  reports "not verified" rather than guessing — same gate `checkDomain`
 *  already uses. */
export const getDomainSuggestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await getAdmin();
    const project = await requireOwnedProject(admin, context.userId);
    const { data: company } = await admin
      .from("companies")
      .select("name")
      .eq("id", project.company_id)
      .maybeSingle();

    const configured = domainProviderConfigured();
    const candidates = suggestDomainCandidates(company?.name ?? "");
    return {
      candidates,
      providerConnected: configured,
      note: configured
        ? "Availability will be verified against the connected registrar when you select one."
        : "Domain integration prepared — a registrar API credential is required to verify real availability. An admin can manually confirm and enter a verified domain.",
    };
  });

export const checkDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        domain: z
          .string()
          .trim()
          .toLowerCase()
          .min(4)
          .max(253)
          .regex(
            /^[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)+$/,
            "Enter a valid domain, e.g. yourcompany.com",
          ),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const admin = await getAdmin();
    const project = await requireOwnedProject(admin, context.userId);
    const configured = domainProviderConfigured();

    const { data: row, error } = await admin
      .from("domain_requests")
      .insert({
        project_id: project.id,
        owner_id: context.userId,
        domain: data.domain,
        // Availability is never guessed. Without a connected registrar the
        // status stays explicitly unknown.
        status: configured ? "unchecked" : "provider_not_connected",
        provider: configured ? (process.env["DOMAIN_PROVIDER_NAME"] ?? "registrar") : null,
        checked_at: null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await audit(admin, context.userId, project.id, "domain.requested", { domain: data.domain });
    return { request: row, providerConnected: configured };
  });

export const selectDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ requestId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const admin = await getAdmin();
    const project = await requireOwnedProject(admin, context.userId);
    const { data: row } = await admin
      .from("domain_requests")
      .select("*")
      .eq("id", data.requestId)
      .eq("project_id", project.id)
      .maybeSingle();
    if (!row) throw new Error("Domain request not found.");
    // "requested" starts the real state machine — it is the customer's
    // request to launch on this domain, nothing more. It only advances to
    // verified/dns_*/tls_active/live via admin-confirmed, real checks below.
    await admin.from("domain_requests").update({ status: "requested" }).eq("id", row.id);
    await audit(admin, context.userId, project.id, "domain.requested_for_launch", {
      domain: row.domain,
    });
    return { ok: true };
  });

/**
 * Customer-facing "Request Launch". Deliberately never marks a project
 * published — with no registrar/DNS/deploy automation connected, going
 * live is real work an admin has to actually do (see
 * `adminVerifyDomainOwnership`, `adminUpdateDomainStage` and
 * `adminVerifyAndGoLive` below). This only records the request.
 */
export const requestPublish = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await getAdmin();
    const project = await requireOwnedProject(admin, context.userId);
    if (!project.paid) throw new Error("Payment is required before requesting launch.");
    if (!project.selected_generation_id) throw new Error("Generate and select a design first.");
    const { data: domain } = await admin
      .from("domain_requests")
      .select("domain")
      .eq("project_id", project.id)
      .in("status", ACTIVE_DOMAIN_STATUSES)
      .order("created_at", { ascending: false })
      .maybeSingle();
    if (!domain) throw new Error("Select a domain before requesting launch.");

    await admin.from("projects").update({ status: "launch_requested" }).eq("id", project.id);
    await audit(admin, context.userId, project.id, "project.launch_requested", {
      domain: domain.domain,
    });
    return { ok: true, domain: domain.domain };
  });

// ===== Admin: real domain verification + go-live =====
// Nothing here ever fabricates a result. Ownership verification is a human
// admin decision (no registrar API is connected); DNS/TLS stage updates are
// admin-confirmed facts about work done outside this app; and go-live is
// gated on an actual outbound HTTPS request succeeding against the domain.

export const adminVerifyDomainOwnership = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ requestId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const { data: row, error } = await admin
      .from("domain_requests")
      .update({
        status: "verified",
        verified_at: new Date().toISOString(),
        verified_by: context.userId,
        failure_reason: null,
      })
      .eq("id", data.requestId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await audit(admin, context.userId, row.project_id, "domain.verified_by_admin", {
      domain: row.domain,
    });
    return row;
  });

export const adminUpdateDomainStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        requestId: z.string().uuid(),
        stage: z.enum(["dns_pending", "dns_configured", "tls_active"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const patch: Record<string, unknown> = { status: data.stage, failure_reason: null };
    if (data.stage === "dns_configured") patch["dns_checked_at"] = new Date().toISOString();
    if (data.stage === "tls_active") patch["tls_checked_at"] = new Date().toISOString();

    const { data: row, error } = await admin
      .from("domain_requests")
      .update(patch)
      .eq("id", data.requestId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await audit(admin, context.userId, row.project_id, "domain.stage_updated", {
      domain: row.domain,
      stage: data.stage,
    });
    return row;
  });

export const adminMarkDomainFailed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ requestId: z.string().uuid(), reason: z.string().trim().min(3).max(500) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const { data: row, error } = await admin
      .from("domain_requests")
      .update({ status: "failed", failure_reason: data.reason })
      .eq("id", data.requestId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await audit(admin, context.userId, row.project_id, "domain.marked_failed", {
      domain: row.domain,
      reason: data.reason,
    });
    return row;
  });

/**
 * The only path that can ever set a project to `published`. Runs the same
 * SSRF-hardened fetch used for competitor audits against the customer's
 * own domain and requires a real, successful HTTPS response before
 * touching `published`/`published_at`/`published_domain`. On any failure
 * the domain is marked `failed` with the real reason — never silently
 * retried, never faked.
 */
export const adminVerifyAndGoLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ requestId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const { data: row, error } = await admin
      .from("domain_requests")
      .select("*")
      .eq("id", data.requestId)
      .single();
    if (error) throw new Error(error.message);

    const result = await runWebsiteAudit(row.domain);
    const isLive = result.reachable === true && result.https === true;

    await admin
      .from("domain_requests")
      .update({
        status: isLive ? "live" : "failed",
        live_checked_at: new Date().toISOString(),
        last_check_result: result,
        failure_reason: isLive
          ? null
          : (result.error ?? `Site responded with HTTP ${result.httpStatus ?? "unknown"}.`),
      })
      .eq("id", row.id);

    if (!isLive) {
      throw new Error(
        `Not live yet — ${result.error ?? `HTTP ${result.httpStatus ?? "no response"}`}. Nothing was published.`,
      );
    }

    await admin
      .from("projects")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        published_domain: row.domain,
      })
      .eq("id", row.project_id);

    await audit(admin, context.userId, row.project_id, "project.published", {
      domain: row.domain,
    });
    return { ok: true, domain: row.domain, result };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const admin = await getAdmin();
    const [companies, projects, orders, generations, domains, logs] = await Promise.all([
      admin.from("companies").select("*").order("created_at", { ascending: false }),
      admin.from("projects").select("*").order("created_at", { ascending: false }),
      admin.from("orders").select("*").order("created_at", { ascending: false }),
      admin.from("generations").select("id, project_id, trial_number, billable, tier, created_at"),
      admin.from("domain_requests").select("*").order("created_at", { ascending: false }),
      admin.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100),
    ]);

    const paidOrders = (orders.data ?? []).filter((o) => o.status === "paid");
    const revenueCents = paidOrders.reduce((sum, o) => sum + o.amount_cents, 0);
    const now = new Date();
    const monthCents = paidOrders
      .filter(
        (o) =>
          o.paid_at &&
          new Date(o.paid_at).getMonth() === now.getMonth() &&
          new Date(o.paid_at).getFullYear() === now.getFullYear(),
      )
      .reduce((sum, o) => sum + o.amount_cents, 0);

    return {
      companies: companies.data ?? [],
      projects: projects.data ?? [],
      orders: orders.data ?? [],
      generations: generations.data ?? [],
      domains: domains.data ?? [],
      logs: logs.data ?? [],
      kpis: {
        revenueCents,
        monthRevenueCents: monthCents,
        paidOrders: paidOrders.length,
        paymentsConfigured: paymentsConfigured(),
      },
    };
  });

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { admin: Boolean(data) };
  });
