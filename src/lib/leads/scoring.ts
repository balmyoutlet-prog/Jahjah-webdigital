// Pure, deterministic Jahjah Opportunity Score (0-100).
// No network calls, no fabrication — every point traces back to a field
// that is actually present on the prospect record.

export type WebsiteStatus = "no_website" | "weak_website" | "good_website" | "unknown";

export type ScorableProspect = {
  google_rating?: number | null | undefined;
  google_reviews_count?: number | null | undefined;
  instagram_url?: string | null | undefined;
  instagram_followers?: number | null | undefined;
  website_url?: string | null | undefined;
  website_status?: WebsiteStatus | null | undefined;
  category?: string | null | undefined;
  audit_result?: AuditSignals | null | undefined;
};

export type AuditSignals = {
  https?: boolean;
  mobileViewport?: boolean;
  hasWhatsappCta?: boolean;
  hasOnlineOrderingOrBooking?: boolean;
  hasSeoBasics?: boolean; // title + meta description present
  responded?: boolean;
};

export type ScoreBreakdown = { label: string; points: number }[];

export function opportunityScore(p: ScorableProspect): {
  score: number;
  breakdown: ScoreBreakdown;
} {
  const breakdown: ScoreBreakdown = [];
  const add = (label: string, points: number) => {
    if (points !== 0) breakdown.push({ label, points });
  };

  // Google presence & trust signals
  const rating = p.google_rating ?? null;
  if (rating !== null) {
    if (rating >= 4.5) add("Excellent Google rating (4.5+)", 15);
    else if (rating >= 4.0) add("Strong Google rating (4.0+)", 10);
    else if (rating >= 3.5) add("Decent Google rating (3.5+)", 5);
  }

  const reviews = p.google_reviews_count ?? null;
  if (reviews !== null) {
    if (reviews >= 200) add("High review volume (200+)", 15);
    else if (reviews >= 50) add("Solid review volume (50+)", 10);
    else if (reviews >= 10) add("Some review volume (10+)", 5);
  }

  // Instagram presence
  if (p.instagram_url) {
    const followers = p.instagram_followers ?? null;
    if (followers !== null) {
      if (followers >= 10000) add("Large Instagram following (10k+)", 15);
      else if (followers >= 2000) add("Active Instagram following (2k+)", 10);
      else if (followers >= 500) add("Growing Instagram following (500+)", 5);
      else add("Has an Instagram presence", 3);
    } else {
      add("Has an Instagram presence", 3);
    }
  }

  // Website opportunity — the core of the business model
  const status = p.website_status ?? "unknown";
  if (status === "no_website") add("No website detected — very strong opportunity", 25);
  else if (status === "weak_website") add("Weak/outdated website — strong opportunity", 15);
  else if (status === "unknown") add("Website status not yet verified", 5);

  // Commercial category bonus — the studio's focus list converts well
  if (p.category) add("Commercial, marketing-ready category", 5);

  // Verified audit signals only ever apply when an audit actually ran
  const audit = p.audit_result;
  if (audit) {
    if (audit.https === false) add("Site is not served over HTTPS", 5);
    if (audit.mobileViewport === false) add("No mobile viewport / responsive tag found", 5);
    if (audit.hasWhatsappCta === false) add("No WhatsApp conversion path found", 5);
    if (audit.hasOnlineOrderingOrBooking === false) add("No online ordering/booking found", 5);
    if (audit.hasSeoBasics === false) add("Missing basic SEO metadata", 5);
  }

  const raw = breakdown.reduce((sum, b) => sum + b.points, 0);
  const score = Math.max(0, Math.min(100, raw));
  return { score, breakdown };
}

export type PriorityLabel = "HOT LEAD" | "HIGH PRIORITY" | "GOOD PROSPECT" | "LOW PRIORITY";

export function priorityLabel(score: number): PriorityLabel {
  if (score >= 90) return "HOT LEAD";
  if (score >= 75) return "HIGH PRIORITY";
  if (score >= 60) return "GOOD PROSPECT";
  return "LOW PRIORITY";
}

export function priorityTone(label: PriorityLabel): string {
  switch (label) {
    case "HOT LEAD":
      return "text-red-400 border-red-400/40";
    case "HIGH PRIORITY":
      return "text-champagne border-champagne/40";
    case "GOOD PROSPECT":
      return "text-emerald-400 border-emerald-400/40";
    default:
      return "text-muted-foreground border-border";
  }
}
