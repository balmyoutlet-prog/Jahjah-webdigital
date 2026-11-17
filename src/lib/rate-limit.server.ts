import type { Admin } from "./platform.server";

/**
 * Zero-cost, DB-backed rate limit for unauthenticated server functions.
 * Backed by a single atomic Postgres UPSERT (`check_rate_limit`) — safe
 * under concurrent requests, no external service, no paid dependency.
 *
 * Fails OPEN on a DB error: a transient Supabase hiccup should not take
 * down the contact form or lead capture, and every caller of this also
 * has honeypot/timing spam checks that don't depend on it.
 */
export async function checkRateLimit(
  admin: Admin,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await admin.rpc("check_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("rate limit check failed:", error.message);
    return true;
  }
  return Boolean(data);
}

export function rateLimitKey(scope: string, ip: string): string {
  return `${scope}:${ip}`;
}
