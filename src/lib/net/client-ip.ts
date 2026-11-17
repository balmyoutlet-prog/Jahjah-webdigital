// Best-effort client IP for rate-limit keys. Cloudflare (the production
// target) sets `cf-connecting-ip`; behind other proxies `x-forwarded-for`
// is the fallback. Never trusted for authorization — only used to bucket
// abuse on public, unauthenticated endpoints.
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";

const header = getRequestHeader as unknown as (name: string) => string | undefined;

export function getClientIp(): string {
  const cf = header("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = header("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return getRequestIP({ xForwardedFor: true }) ?? "unknown";
}
