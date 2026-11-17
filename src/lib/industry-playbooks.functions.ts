import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "./admin-guard.server";
import { audit, getAdmin } from "./platform.server";

const tierSchema = z.enum(["basic", "medium", "high"]);

export const getAllPlaybooksAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const { data, error } = await admin
      .from("industry_playbooks")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertPlaybook = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        key: z.string().trim().min(2).max(60),
        label: z.string().trim().min(2).max(120),
        conservative_pct: z.coerce.number().min(0).max(100),
        expected_pct: z.coerce.number().min(0).max(100),
        high_pct: z.coerce.number().min(0).max(100),
        recommended_features: z.array(z.string().trim().max(60)).max(20),
        messaging_angle: z.string().trim().max(300).optional().or(z.literal("")),
        default_tier: tierSchema,
        sort_order: z.coerce.number().int().default(0),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const payload = { ...data, messaging_angle: data.messaging_angle || null };
    const { data: row, error } = data.id
      ? await admin.from("industry_playbooks").update(payload).eq("id", data.id).select().single()
      : await admin.from("industry_playbooks").insert(payload).select().single();
    if (error) throw new Error(error.message);
    await audit(admin, context.userId, null, "industry_playbook.upserted", { key: data.key });
    return row;
  });
