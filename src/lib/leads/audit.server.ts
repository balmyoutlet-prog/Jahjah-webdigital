// Lightweight, compliant website audit. No paid API, no headless browser —
// a single bounded fetch of the HTML plus a handful of verifiable checks.
// Every field is either `true`/`false` (verified) or `null` (could not be
// determined) — never a fabricated claim.
//
// SSRF hardening: every URL (the original target AND every redirect hop) is
// validated by `assertUrlIsSafeToFetch` before it is fetched — see
// `src/lib/net/ip-guard.ts` for the scheme/credential/DNS/IP-range checks.
// Redirects are never auto-followed; they are read manually and re-validated,
// capped at 3 hops.

import { assertUrlIsSafeToFetch } from "@/lib/net/ip-guard";

export type AuditResult = {
  checkedUrl: string;
  reachable: boolean;
  httpStatus: number | null;
  https: boolean | null;
  mobileViewport: boolean | null;
  hasTitle: boolean | null;
  hasMetaDescription: boolean | null;
  hasSeoBasics: boolean | null;
  hasWhatsappCta: boolean | null;
  hasOnlineOrderingOrBooking: boolean | null;
  hasSocialLinks: boolean | null;
  hasGoogleMapsEmbedOrLink: boolean | null;
  responseTimeMs: number | null;
  error: string | null;
  checkedAt: string;
};

const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 8_000;
const MAX_RESPONSE_BYTES = 400_000;

function emptyResult(checkedUrl: string, checkedAt: string, error: string): AuditResult {
  return {
    checkedUrl,
    reachable: false,
    httpStatus: null,
    https: null,
    mobileViewport: null,
    hasTitle: null,
    hasMetaDescription: null,
    hasSeoBasics: null,
    hasWhatsappCta: null,
    hasOnlineOrderingOrBooking: null,
    hasSocialLinks: null,
    hasGoogleMapsEmbedOrLink: null,
    responseTimeMs: null,
    error,
    checkedAt,
  };
}

/** Reads at most `maxBytes` from a fetch Response body as text. */
async function readBounded(res: Response, maxBytes = MAX_RESPONSE_BYTES): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return await res.text();
  const decoder = new TextDecoder();
  let received = 0;
  let out = "";
  while (received < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    out += decoder.decode(value, { stream: true });
  }
  try {
    await reader.cancel();
  } catch {
    // ignore
  }
  return out;
}

export async function runWebsiteAudit(rawUrl: string): Promise<AuditResult> {
  const checkedAt = new Date().toISOString();
  const initial = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

  let currentUrl = initial;
  let hop = 0;

  while (true) {
    const safety = await assertUrlIsSafeToFetch(currentUrl);
    if (!safety.ok) {
      return emptyResult(currentUrl, checkedAt, safety.reason);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const started = Date.now();

    let res: Response;
    try {
      res = await fetch(safety.url.toString(), {
        method: "GET",
        redirect: "manual", // never let the runtime auto-follow — we revalidate every hop
        signal: controller.signal,
        headers: {
          "User-Agent":
            "JahjahWebDigitalAuditBot/1.0 (+https://jahjahwebdigital.com; website opportunity audit)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
    } catch (err) {
      return emptyResult(
        safety.url.toString(),
        checkedAt,
        err instanceof Error
          ? err.name === "AbortError"
            ? `Timed out after ${FETCH_TIMEOUT_MS / 1000} seconds.`
            : err.message
          : "Could not reach this site.",
      );
    } finally {
      clearTimeout(timeout);
    }

    const isRedirect = res.status >= 300 && res.status < 400 && res.headers.has("location");
    if (isRedirect) {
      hop += 1;
      if (hop > MAX_REDIRECTS) {
        return emptyResult(safety.url.toString(), checkedAt, "Too many redirects.");
      }
      let nextUrl: string;
      try {
        nextUrl = new URL(res.headers.get("location")!, safety.url).toString();
      } catch {
        return emptyResult(
          safety.url.toString(),
          checkedAt,
          "Redirect target was not a valid URL.",
        );
      }
      currentUrl = nextUrl;
      continue; // loop re-validates `currentUrl` from the top before fetching it
    }

    const responseTimeMs = Date.now() - started;
    const html = await readBounded(res);
    const lower = html.toLowerCase();

    const mobileViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
    const hasTitle = /<title[^>]*>[^<]{2,}<\/title>/i.test(html);
    const hasMetaDescription =
      /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{10,}["']/i.test(html);
    const hasWhatsappCta = /wa\.me\/|api\.whatsapp\.com|whatsapp:\/\//i.test(html);
    const hasOnlineOrderingOrBooking =
      /(book\s*(a\s*)?table|reservation|order\s*online|book\s*now|add\s*to\s*cart|checkout|schedule\s*(an\s*)?appointment)/i.test(
        lower,
      );
    const hasSocialLinks = /(instagram\.com|facebook\.com|tiktok\.com)/i.test(html);
    const hasGoogleMapsEmbedOrLink = /(google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(
      html,
    );

    return {
      checkedUrl: safety.url.toString(),
      reachable: res.ok,
      httpStatus: res.status,
      https: safety.url.protocol === "https:",
      mobileViewport,
      hasTitle,
      hasMetaDescription,
      hasSeoBasics: hasTitle && hasMetaDescription,
      hasWhatsappCta,
      hasOnlineOrderingOrBooking,
      hasSocialLinks,
      hasGoogleMapsEmbedOrLink,
      responseTimeMs,
      error: res.ok ? null : `Site responded with HTTP ${res.status}.`,
      checkedAt,
    };
  }
}
