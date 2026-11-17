import type { SupabaseClient } from "@supabase/supabase-js";
import { generateSpec } from "./generator";
import {
  DIRECTIONS,
  EXTRA_TRIAL_PRICE_CENTS,
  INCLUDED_TRIALS,
  TIER_PRICE_CENTS,
  type DirectionKey,
  type Tier,
  tierRank,
  upgradePriceCents,
} from "./platform";

export type Admin = SupabaseClient<any, "public", any>;

export async function getAdmin(): Promise<Admin> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as Admin;
}

export function paymentsConfigured() {
  return Boolean(process.env["STRIPE_SECRET_KEY"] || process.env["PADDLE_API_KEY"]);
}

export function domainProviderConfigured() {
  return Boolean(process.env["DOMAIN_PROVIDER_API_KEY"]);
}

export async function audit(
  admin: Admin,
  actorId: string | null,
  projectId: string | null,
  event: string,
  metadata: Record<string, unknown> = {},
) {
  await admin.from("audit_logs").insert({
    actor_id: actorId,
    project_id: projectId,
    event,
    metadata,
  });
}

export async function requireOwnedProject(admin: Admin, userId: string) {
  const { data, error } = await admin
    .from("projects")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("No project found for this account.");
  return data;
}

export async function loadWorkspace(admin: Admin, userId: string) {
  const [company, project] = await Promise.all([
    admin.from("companies").select("*").eq("owner_id", userId).maybeSingle(),
    admin.from("projects").select("*").eq("owner_id", userId).maybeSingle(),
  ]);

  const projectId = project.data?.id ?? null;
  const [generations, orders, domains, addons, paymentSubmissions] = await Promise.all([
    projectId
      ? admin
          .from("generations")
          .select("*")
          .eq("project_id", projectId)
          .order("trial_number", { ascending: true })
      : Promise.resolve({ data: [] as any[] }),
    admin
      .from("orders")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false }),
    projectId
      ? admin
          .from("domain_requests")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as any[] }),
    admin.from("addons").select("*").eq("active", true).order("sort_order", { ascending: true }),
    admin
      .from("payment_submissions")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  return {
    company: company.data ?? null,
    project: project.data ?? null,
    generations: generations.data ?? [],
    orders: orders.data ?? [],
    domains: domains.data ?? [],
    addons: addons.data ?? [],
    paymentSubmissions: paymentSubmissions.data ?? [],
    paymentsConfigured: paymentsConfigured(),
    domainProviderConfigured: domainProviderConfigured(),
  };
}

export function trialAllowance(project: { trials_used: number; extra_trials_purchased: number }) {
  const allowed = INCLUDED_TRIALS + project.extra_trials_purchased;
  return {
    allowed,
    used: project.trials_used,
    remaining: Math.max(0, allowed - project.trials_used),
    includedRemaining: Math.max(0, INCLUDED_TRIALS - project.trials_used),
  };
}

export function assertDirectionAllowed(direction: string, tier: Tier): DirectionKey {
  const found = DIRECTIONS.find((d) => d.key === direction && d.tiers.includes(tier));
  if (!found) throw new Error("This visual direction is not available on your package.");
  return found.key;
}

export async function runGeneration(
  admin: Admin,
  userId: string,
  project: any,
  company: any,
  direction: string,
) {
  if (!project.paid) throw new Error("Payment is required before generating your website.");
  if (!company?.identity_completed) throw new Error("Complete your business identity first.");

  const tier = project.tier as Tier;
  const dir = assertDirectionAllowed(direction, tier);
  const allowance = trialAllowance(project);
  if (allowance.remaining <= 0) {
    throw new Error("No trials remaining. Purchase an additional trial to continue.");
  }

  // Rate limit: max one generation per 20 seconds per project.
  const { data: last } = await admin
    .from("generations")
    .select("created_at")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (last && Date.now() - new Date(last.created_at).getTime() < 20_000) {
    throw new Error("Please wait a few seconds before generating again.");
  }

  const trialNumber = project.trials_used + 1;
  const spec = generateSpec(
    {
      name: company.name,
      category: company.category,
      description: company.description,
      country: company.country,
      primaryColor: company.primary_color,
      accentColor: company.accent_color,
      fontStyle: company.font_style,
    },
    tier,
    dir,
  );

  const { data: generation, error } = await admin
    .from("generations")
    .insert({
      project_id: project.id,
      owner_id: userId,
      trial_number: trialNumber,
      tier,
      direction_key: dir,
      status: "completed",
      spec,
      billable: trialNumber > INCLUDED_TRIALS,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await admin
    .from("projects")
    .update({ trials_used: trialNumber, selected_generation_id: generation.id, status: "active" })
    .eq("id", project.id);

  await audit(admin, userId, project.id, "generation.created", {
    trial_number: trialNumber,
    direction: dir,
    tier,
  });
  return generation;
}

export function priceForOrder(kind: string, project: any, targetTier?: Tier) {
  if (kind === "package") {
    return {
      amount: TIER_PRICE_CENTS[project.tier as Tier],
      description: `Website package — ${project.tier}`,
    };
  }
  if (kind === "upgrade") {
    if (!targetTier) throw new Error("Target package required.");
    if (tierRank(targetTier) <= tierRank(project.tier as Tier))
      throw new Error("You can only upgrade to a higher package.");
    return {
      amount: upgradePriceCents(project.tier as Tier, targetTier),
      description: `Upgrade ${project.tier} → ${targetTier} (price difference)`,
    };
  }
  if (kind === "extra_trial") {
    return { amount: EXTRA_TRIAL_PRICE_CENTS, description: "Additional design trial" };
  }
  throw new Error("Unknown order type.");
}
