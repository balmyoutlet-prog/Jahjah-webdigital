// SSRF defence utilities shared by every server-side function that fetches a
// user-supplied URL (currently: the website audit). Framework-agnostic on
// purpose — this runs both in local/Node preview and in the Cloudflare
// Workers production build, where `node:dns`/`node:net` are not available.
// Everything here is pure string/number logic plus `fetch`, so it works in
// both runtimes identically.
//
// Design: resolve the hostname via DNS-over-HTTPS (free, no API key, no
// paid service) and reject the request if ANY resolved address falls in a
// private/loopback/link-local/multicast/reserved/cloud-metadata range. This
// is deliberately fail-closed: if resolution cannot be completed, the URL is
// treated as unsafe rather than silently allowed through.
//
// Known limitation: on Cloudflare Workers, `fetch()` performs its own DNS
// resolution internally and there is no public API to pin that fetch to a
// specific, pre-validated IP address (no raw TCP `connect()` to an arbitrary
// host is exposed for this). That leaves a narrow DNS-rebinding window
// between our resolve-and-check step and the platform's own connect — an
// attacker whose DNS answer changes within that gap could bypass the check.
// This defends against the realistic case (typo/careless SSRF targeting
// literal private IPs, localhost, link-local/metadata addresses, and
// deliberately-crafted-but-static malicious hosts); running the audit in a
// bare Node process with `node:dns` + IP-pinned sockets would close the
// rebinding gap completely if that guarantee is ever required.

export type UrlSafetyResult =
  { ok: true; url: URL; resolvedIp: string } | { ok: false; reason: string };

const DOH_PROVIDERS = [
  "https://cloudflare-dns.com/dns-query",
  "https://dns.google/resolve",
] as const;

const DOH_TIMEOUT_MS = 2_500;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return promise.finally(() => clearTimeout(timeout)) as Promise<T>;
}

async function dohQuery(provider: string, hostname: string, type: "A" | "AAAA"): Promise<string[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DOH_TIMEOUT_MS);
  try {
    const res = await fetch(`${provider}?name=${encodeURIComponent(hostname)}&type=${type}`, {
      headers: { accept: "application/dns-json" },
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { Answer?: { type: number; data: string }[] };
    const wantType = type === "A" ? 1 : 28;
    return (body.Answer ?? [])
      .filter((a) => a.type === wantType)
      .map((a) => a.data)
      .filter(Boolean);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/** Resolves a hostname to its A + AAAA records via public DNS-over-HTTPS. */
export async function resolveHostname(hostname: string): Promise<string[]> {
  for (const provider of DOH_PROVIDERS) {
    const [a, aaaa] = await Promise.all([
      dohQuery(provider, hostname, "A"),
      dohQuery(provider, hostname, "AAAA"),
    ]);
    const all = [...a, ...aaaa];
    if (all.length > 0) return all;
  }
  return [];
}

function parseIPv4(host: string): number | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return null;
  const [a, b, c, d] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
  if (a > 255 || b > 255 || c > 255 || d > 255) return null;
  return ((a << 24) | (b << 16) | (c << 8) | d) >>> 0;
}

const IPV4_BLOCKED_RANGES: [string, number][] = [
  ["0.0.0.0", 8], // "this" network
  ["10.0.0.0", 8], // private
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local / cloud metadata (169.254.169.254)
  ["172.16.0.0", 12], // private
  ["192.0.0.0", 24], // IETF protocol assignments
  ["192.0.2.0", 24], // TEST-NET-1
  ["192.168.0.0", 16], // private
  ["198.18.0.0", 15], // benchmarking
  ["198.51.100.0", 24], // TEST-NET-2
  ["203.0.113.0", 24], // TEST-NET-3
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved
  ["255.255.255.255", 32], // broadcast
];

function ipv4InCidr(ip: number, base: string, prefixLen: number): boolean {
  const baseNum = parseIPv4(base);
  if (baseNum === null) return false;
  if (prefixLen === 0) return true;
  const mask = prefixLen === 32 ? 0xffffffff : (~0 << (32 - prefixLen)) >>> 0;
  return (ip & mask) === (baseNum & mask);
}

function isBlockedIPv4(host: string): boolean {
  const ip = parseIPv4(host);
  if (ip === null) return true; // unparsable "IPv4-looking" host — fail closed
  return IPV4_BLOCKED_RANGES.some(([base, len]) => ipv4InCidr(ip, base, len));
}

/** Expands an IPv6 address (with optional `::` compression) to 8 hextets. */
function expandIPv6(host: string): number[] | null {
  let addr = host;
  // Embedded IPv4 tail, e.g. ::ffff:192.168.1.1
  const v4Tail = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.exec(addr);
  if (v4Tail) {
    const v4TailStr = v4Tail[1]!;
    const ipv4 = parseIPv4(v4TailStr);
    if (ipv4 === null) return null;
    const hi = (ipv4 >>> 16) & 0xffff;
    const lo = ipv4 & 0xffff;
    addr = addr.slice(0, addr.length - v4TailStr.length) + hi.toString(16) + ":" + lo.toString(16);
  }

  const parts = addr.split("::");
  if (parts.length > 2) return null;
  const head = parts[0] ? parts[0].split(":").filter(Boolean) : [];
  const tail = parts.length === 2 && parts[1] ? parts[1].split(":").filter(Boolean) : [];
  const missing = 8 - (head.length + tail.length);
  if (parts.length === 1 && head.length !== 8) return null;
  if (parts.length === 2 && missing < 0) return null;

  const hextets = [...head, ...(parts.length === 2 ? Array(missing).fill("0") : []), ...tail];
  if (hextets.length !== 8) return null;
  const nums = hextets.map((h) => parseInt(h, 16));
  if (nums.some((n) => Number.isNaN(n) || n < 0 || n > 0xffff)) return null;
  return nums;
}

function isBlockedIPv6(host: string): boolean {
  const stripped = host.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : host;

  // IPv4-mapped / translated addresses — check the embedded IPv4 too.
  const v4Tail = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.exec(stripped);
  if (v4Tail && isBlockedIPv4(v4Tail[1]!)) return true;

  const hextets = expandIPv6(stripped);
  if (!hextets) return true; // unparsable — fail closed

  const big = hextets.reduce((acc, h) => (acc << 16n) | BigInt(h), 0n);

  const ranges: [bigint, number][] = [
    [0n, 128], // ::  unspecified
    [1n, 128], // ::1 loopback
    [0xffffn << 32n, 96], // ::ffff:0:0/96 IPv4-mapped (embedded v4 already checked above)
    [0x64ff9bn << 96n, 96], // 64:ff9b::/96 NAT64
    [0x0100n << 112n, 64], // 100::/64 discard-only
    [0xfc00n << 112n, 7], // fc00::/7 unique local (includes fd00::/8 used by some cloud metadata)
    [0xfe80n << 112n, 10], // fe80::/10 link-local
    [0xff00n << 112n, 8], // ff00::/8 multicast
    [0x20010db8n << 96n, 32], // 2001:db8::/32 documentation
  ];

  return ranges.some(([base, prefixLen]) => {
    if (prefixLen === 0) return true;
    const shift = 128n - BigInt(prefixLen);
    const mask = shift === 0n ? (1n << 128n) - 1n : ((1n << BigInt(prefixLen)) - 1n) << shift;
    return (big & mask) === (base & mask);
  });
}

const HOSTNAME_DENYLIST = [/^localhost$/i, /\.local$/i, /\.internal$/i, /\.localdomain$/i];

/**
 * Validates a URL against SSRF risk: scheme allowlist, no embedded
 * credentials, and every DNS-resolved (or literal) IP address checked
 * against private/loopback/link-local/multicast/reserved/metadata ranges.
 * Resolves the hostname itself — callers must call this again for every
 * redirect hop, never trust `redirect: "follow"`.
 */
export async function assertUrlIsSafeToFetch(rawUrl: string): Promise<UrlSafetyResult> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false, reason: "Invalid URL." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, reason: "Only http/https URLs are permitted." };
  }
  if (url.username || url.password) {
    return { ok: false, reason: "URLs with embedded credentials are not permitted." };
  }

  const hostname = url.hostname.toLowerCase();
  if (HOSTNAME_DENYLIST.some((re) => re.test(hostname))) {
    return { ok: false, reason: "This host is not eligible for automated fetching." };
  }

  const looksIPv4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
  const looksIPv6 = hostname.includes(":") || (hostname.startsWith("[") && hostname.endsWith("]"));

  if (looksIPv4) {
    if (isBlockedIPv4(hostname)) {
      return { ok: false, reason: "This IP address is not eligible for automated fetching." };
    }
    return { ok: true, url, resolvedIp: hostname };
  }

  if (looksIPv6) {
    if (isBlockedIPv6(hostname)) {
      return { ok: false, reason: "This IP address is not eligible for automated fetching." };
    }
    return { ok: true, url, resolvedIp: hostname };
  }

  let resolved: string[];
  try {
    resolved = await withTimeout(resolveHostname(hostname), DOH_TIMEOUT_MS * 2 + 500);
  } catch {
    resolved = [];
  }

  if (resolved.length === 0) {
    return { ok: false, reason: "Could not resolve this host's DNS records." };
  }

  for (const ip of resolved) {
    const blocked = ip.includes(":") ? isBlockedIPv6(ip) : isBlockedIPv4(ip);
    if (blocked) {
      return {
        ok: false,
        reason: "This host resolves to a private or reserved address and cannot be fetched.",
      };
    }
  }

  return { ok: true, url, resolvedIp: resolved[0]! };
}
