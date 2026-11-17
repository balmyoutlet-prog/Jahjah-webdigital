import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "./admin-guard.server";
import { audit, getAdmin } from "./platform.server";

export const getEnabledMilestones = createServerFn({ method: "GET" }).handler(async () => {
  const admin = await getAdmin();
  const { data, error } = await admin
    .from("trust_milestones")
    .select("key, label, value")
    .eq("enabled", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getAllMilestonesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const { data, error } = await admin
      .from("trust_milestones")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertMilestone = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        key: z.string().trim().min(2).max(60),
        label: z.string().trim().min(2).max(120),
        value: z.string().trim().min(1).max(60),
        enabled: z.boolean().default(false),
        sort_order: z.coerce.number().int().default(0),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const { data: row, error } = data.id
      ? await admin.from("trust_milestones").update(data).eq("id", data.id).select().single()
      : await admin.from("trust_milestones").insert(data).select().single();
    if (error) throw new Error(error.message);
    await audit(admin, context.userId, null, "milestone.upserted", {
      key: data.key,
      enabled: data.enabled,
    });
    return row;
  });
