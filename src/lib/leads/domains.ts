// Domain candidate name generation — pure string logic only. This never
// claims availability: availability can only ever come from a connected
// registrar API (see domainProviderConfigured() in platform.server.ts,
// unchanged by this module), and the existing domain_requests flow already
// refuses to guess when that provider isn't connected.
export type DomainCandidate = { label: string; domain: string };

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Generates candidate domain names to check against a registrar — never
 *  availability itself. Recommended / Alternative 1 / Alternative 2. */
export function suggestDomainCandidates(businessName: string): DomainCandidate[] {
  const slug = slugify(businessName);
  const compact = slug.replace(/-/g, "");
  if (!slug) return [];
  return [
    { label: "Recommended", domain: `${compact}.com` },
    { label: "Alternative 1", domain: `${slug}.com` },
    { label: "Alternative 2", domain: `${compact}.co` },
  ];
}
