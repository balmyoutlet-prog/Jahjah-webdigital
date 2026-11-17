// Pure, browser-safe outreach rules shared by the server functions and the admin UI.

export const OUTREACH_STATUSES = [
  "research_needed",
  "qualified",
  "drafted",
  "needs_approval",
  "approved",
  "sent",
  "follow_up_due",
  "replied",
  "meeting",
  "proposal",
  "won",
  "lost",
  "do_not_contact",
] as const;
export type OutreachStatus = (typeof OUTREACH_STATUSES)[number];

export const STATUS_LABEL: Record<OutreachStatus, string> = {
  research_needed: "Research Needed",
  qualified: "Qualified",
  drafted: "Drafted",
  needs_approval: "Needs Approval",
  approved: "Approved",
  sent: "Sent",
  follow_up_due: "Follow-up Due",
  replied: "Replied",
  meeting: "Meeting",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
  do_not_contact: "Do Not Contact",
};

export const DEFAULT_CTA = "Would you like me to send the 3 findings?";
export const FOLLOW_UP_DAYS = 3;
export const MAX_FOLLOW_UPS = 1;
export const DM_MAX_CHARS = 400;

export type OutreachRecord = {
  status: OutreachStatus;
  signal_type: string | null;
  signal_summary: string | null;
  signal_date: string | null;
  observation: string | null;
  observation_verified: boolean;
  consequence: string | null;
  solution_angle: string | null;
  cta: string;
  contact_route: string | null;
  contact_route_type: string | null;
  contact_verified: boolean;
  contact_role: string | null;
  source_urls: string[];
  proof_slug: string | null;
  opted_in: boolean;
  email_first: string | null;
  email_follow_up: string | null;
  dm_first: string | null;
  dm_follow_up: string | null;
  follow_up_count: number;
  replied_at: string | null;
};

const filled = (v: string | null | undefined) => !!v && v.trim().length > 0;

/** Signals older than this are not "fresh". */
export const SIGNAL_MAX_AGE_DAYS = 90;

export function qualificationGaps(r: OutreachRecord, today = new Date()): string[] {
  const gaps: string[] = [];
  if (!filled(r.signal_summary)) gaps.push("Buying signal");
  if (!r.signal_date) gaps.push("Signal date");
  else {
    const age = (today.getTime() - new Date(r.signal_date).getTime()) / 86_400_000;
    if (age > SIGNAL_MAX_AGE_DAYS) gaps.push(`Fresh signal (older than ${SIGNAL_MAX_AGE_DAYS} days)`);
    if (age < -1) gaps.push("Signal date is in the future");
  }
  if (!filled(r.observation) || !r.observation_verified) gaps.push("Verified observation");
  if (!filled(r.contact_route) || !r.contact_verified) gaps.push("Verified public contact route");
  if (!r.source_urls.some((u) => /^https?:\/\//.test(u))) gaps.push("Source URL");
  if (!filled(r.solution_angle)) gaps.push("Jahjah solution/demo angle");
  if (!filled(r.contact_role)) gaps.push("Contact suitability / role (write 'Unknown — general business contact' if not public)");
  return gaps;
}

export function draftGaps(r: OutreachRecord): string[] {
  const gaps: string[] = [];
  if (!filled(r.email_first) && !filled(r.dm_first)) gaps.push("At least one first-message draft");
  if (filled(r.dm_first) && r.dm_first!.length > DM_MAX_CHARS) gaps.push(`WhatsApp/DM first message over ${DM_MAX_CHARS} characters`);
  if (filled(r.dm_follow_up) && r.dm_follow_up!.length > DM_MAX_CHARS) gaps.push(`WhatsApp/DM follow-up over ${DM_MAX_CHARS} characters`);
  if (filled(r.dm_first) && r.contact_route_type !== "whatsapp_verified" && r.contact_route_type !== "instagram_dm" && !r.opted_in)
    gaps.push("DM draft needs a source-verified WhatsApp or Instagram route, or an opted-in contact");
  return gaps;
}

const ALLOWED: Record<OutreachStatus, OutreachStatus[]> = {
  research_needed: ["qualified"],
  qualified: ["drafted", "research_needed"],
  drafted: ["needs_approval", "research_needed"],
  needs_approval: ["approved", "drafted", "research_needed"],
  approved: ["sent", "drafted"],
  sent: ["follow_up_due", "replied", "lost"],
  follow_up_due: ["sent", "replied", "lost"],
  replied: ["meeting", "proposal", "won", "lost"],
  meeting: ["proposal", "won", "lost"],
  proposal: ["won", "lost"],
  won: [],
  lost: [],
  do_not_contact: [],
};

export function allowedNext(r: OutreachRecord): OutreachStatus[] {
  const base = ALLOWED[r.status] ?? [];
  const next = base.filter((s) => {
    if (s === "follow_up_due") return !r.replied_at && r.follow_up_count < MAX_FOLLOW_UPS;
    return true;
  });
  return r.status === "do_not_contact" ? [] : [...next, "do_not_contact"];
}

/** Returns an error message, or null if the transition is allowed. */
export function transitionError(r: OutreachRecord, to: OutreachStatus): string | null {
  if (r.status === "do_not_contact") return "Do Not Contact is permanent.";
  if (!allowedNext(r).includes(to)) return `Cannot move from ${STATUS_LABEL[r.status]} to ${STATUS_LABEL[to]}.`;
  const needsQual: OutreachStatus[] = ["qualified", "drafted", "needs_approval", "approved"];
  if (needsQual.includes(to)) {
    const g = qualificationGaps(r);
    if (g.length) return `Still missing: ${g.join(", ")}.`;
  }
  if (to === "drafted" || to === "needs_approval" || to === "approved") {
    const g = draftGaps(r);
    if (g.length) return `Draft issues: ${g.join(", ")}.`;
  }
  return null;
}

/** Observation → Consequence → Jahjah Idea → CTA. Uses only stored fields. */
export function composeDrafts(
  r: Pick<OutreachRecord, "observation" | "consequence" | "solution_angle" | "cta">,
  business: string,
  proof?: { name: string; url: string } | null,
) {
  const obs = (r.observation ?? "").trim();
  const cons = (r.consequence ?? "").trim();
  const idea = (r.solution_angle ?? "").trim();
  const cta = (r.cta || DEFAULT_CTA).trim();
  const proofLine = proof ? `For reference, here is live work we built: ${proof.name} — ${proof.url}` : "";
  const email_first = [
    `Hi ${business} team,`,
    "",
    obs && `I noticed ${obs.replace(/^i noticed\s*/i, "")}`,
    cons && `That may mean ${cons.replace(/^that may mean\s*/i, "")}`,
    idea && `One idea: ${idea}`,
    proofLine,
    "",
    cta,
    "",
    "— Jahjah WebDigital · https://jahjahwebdigital.com",
  ]
    .filter((l): l is string => typeof l === "string")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
  const email_follow_up = [
    `Hi ${business} team, a short follow-up with one useful detail:`,
    idea && `${idea}`,
    proofLine,
    "",
    "If it is not relevant, no reply is needed and I will not follow up again.",
  ]
    .filter(Boolean)
    .join("\n");
  const dm_first = `Hi ${business} — ${obs ? `I noticed ${obs.replace(/^i noticed\s*/i, "")}`.slice(0, 200) : "quick note from Jahjah WebDigital."} ${cta}`.slice(0, DM_MAX_CHARS);
  const dm_follow_up = `Hi again — happy to share the findings for ${business} if useful. If not, no worries, I won't message again.`.slice(0, DM_MAX_CHARS);
  return { email_first, email_follow_up, dm_first, dm_follow_up };
}

// ---------- dedup ----------
export function normName(s: string | null | undefined) {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, "").trim();
}
export function normDomain(url: string | null | undefined) {
  if (!url) return "";
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}
export function normPhone(p: string | null | undefined) {
  const d = (p ?? "").replace(/\D/g, "");
  return d.length >= 7 ? d.slice(-9) : "";
}

export type DedupInput = { id: string; business_name: string; website_url: string | null; email: string | null; phone: string | null; whatsapp: string | null };

/** Map of prospect id → ids of other prospects sharing a stable identity key. Non-destructive. */
export function findDuplicates(rows: DedupInput[]): Record<string, string[]> {
  const buckets = new Map<string, string[]>();
  const add = (k: string, id: string) => {
    if (!k) return;
    const list = buckets.get(k) ?? [];
    list.push(id);
    buckets.set(k, list);
  };
  for (const r of rows) {
    add(`n:${normName(r.business_name)}`, r.id);
    add(`d:${normDomain(r.website_url)}`, r.id);
    add(`e:${(r.email ?? "").trim().toLowerCase()}`, r.id);
    add(`p:${normPhone(r.phone)}`, r.id);
    add(`p:${normPhone(r.whatsapp)}`, r.id);
  }
  const out: Record<string, string[]> = {};
  for (const [k, ids] of buckets) {
    if (k.endsWith(":") || ids.length < 2) continue;
    for (const id of ids) out[id] = [...new Set([...(out[id] ?? []), ...ids.filter((x) => x !== id)])];
  }
  return out;
}

// ---------- metrics ----------
export type Rate = { value: number; label: string } | { value: null; label: "Not enough data" };
export function rate(num: number, den: number, minDen = 1): Rate {
  if (den < minDen) return { value: null, label: "Not enough data" };
  const v = num / den;
  return { value: v, label: `${Math.round(v * 100)}% (${num}/${den})` };
}

const REACHED: OutreachStatus[] = ["sent", "follow_up_due", "replied", "meeting", "proposal", "won", "lost"];
const REPLIED: OutreachStatus[] = ["replied", "meeting", "proposal", "won"];

export function computeMetrics(
  rows: {
    status: OutreachStatus;
    replied_at: string | null;
    reply_classification: string | null;
    last_contacted_at: string | null;
    reached_meeting?: boolean;
    reached_proposal?: boolean;
  }[],
) {
  const count = (pred: (r: (typeof rows)[number]) => boolean) => rows.filter(pred).length;
  const qualifiedPlus = count((r) => r.status !== "research_needed" && r.status !== "do_not_contact");
  const sent = count((r) => !!r.last_contacted_at || REACHED.includes(r.status));
  const replied = count((r) => !!r.replied_at || REPLIED.includes(r.status));
  const positive = count((r) => r.reply_classification === "positive");
  const meetings = count((r) => r.status === "meeting" || !!r.reached_meeting);
  return {
    total: rows.length,
    qualified: qualifiedPlus,
    approved: count((r) => r.status === "approved"),
    sent,
    replied,
    positive,
    classified: count((r) => !!r.reply_classification),
    meetings,
    proposals: count((r) => r.status === "proposal" || !!r.reached_proposal),
    won: count((r) => r.status === "won"),
    lost: count((r) => r.status === "lost"),
    doNotContact: count((r) => r.status === "do_not_contact"),
    replyRate: rate(replied, sent),
    meetingRate: rate(meetings, replied),
    qualifiedLeadRate: rate(qualifiedPlus, rows.length),
  };
}
