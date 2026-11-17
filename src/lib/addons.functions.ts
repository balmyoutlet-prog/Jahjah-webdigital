import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "./admin-guard.server";
import { audit, getAdmin } from "./platform.server";
import { CUSTOM_FEATURE_PRICE_CENTS } from "./platform";

export const getAddons = createServerFn({ method: "GET" }).handler(async () => {
  const admin = await getAdmin();
  const { data, error } = await admin
    .from("addons")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getAllAddonsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const { data, error } = await admin
      .from("addons")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertAddon = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        key: z.string().trim().min(2).max(60),
        name: z.string().trim().min(2).max(120),
        description: z.string().trim().max(500).optional().or(z.literal("")),
        price_cents: z.coerce.number().int().min(0).max(10_000_00),
        active: z.boolean().default(true),
        sort_order: z.coerce.number().int().default(0),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const payload = { ...data, description: data.description || null };
    const { data: row, error } = data.id
      ? await admin.from("addons").update(payload).eq("id", data.id).select().single()
      : await admin.from("addons").insert(payload).select().single();
    if (error) throw new Error(error.message);
    await audit(admin, context.userId, null, "addon.upserted", {
      key: data.key,
      price_cents: data.price_cents,
    });
    return row;
  });

export const setAddonActive = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), active: z.boolean() }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const { error } = await admin.from("addons").update({ active: data.active }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(admin, context.userId, null, "addon.active_toggled", {
      id: data.id,
      active: data.active,
    });
    return { ok: true };
  });
