import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Throws unless the calling user has the 'admin' role. Every admin-only
 * server function must call this before touching the service-role client —
 * there are no publicly reachable admin APIs in this platform.
 */
export async function requireAdmin(supabase: SupabaseClient<any, "public", any>, userId: string) {
  const { data: isAdmin, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!isAdmin) throw new Error("Forbidden: admin access required.");
}
