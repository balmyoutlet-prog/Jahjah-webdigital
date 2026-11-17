// Advisor-style outreach message generation.
//
// Hard rule: never fabricate a compliment or a number. Every sentence below
// is only included when the corresponding field is actually verified on the
// prospect record. Jahjah never asks "do you want a website?" — it reports
// what was found, names the gap, and points to the prepared study.
import { buildDiagnosis, type DiagnosisInput } from "./advisory";
import { priorityLabel } from "./scoring";

export type OutreachProspect = DiagnosisInput & {
  google_rating?: number | null;
  google_reviews_count?: number | null;
};

/** Which angle fits this lead — per the CRM's own opportunity score, never guessed. */
export function outreachAngle(
  score: number,
  hasWebsite: boolean,
): "trust_no_site" | "social_no_site" | "weak_site" | "deprioritize" {
  if (score >= 90 && !hasWebsite) return "trust_no_site";
  if (score >= 75) return hasWebsite ? "weak_site" : "social_no_site";
  return "deprioritize";
}

function angleLine(angle: ReturnType<typeof outreachAngle>): string {
  switch (angle) {
    case "trust_no_site":
      return "You already built the trust. The next step is capturing it.";
    case "social_no_site":
      return "You built the audience. The next step is owning the customer journey, not renting it from a feed.";
    case "weak_site":
      return "Your online experience no longer matches the quality of the business behind it.";
    default:
      return "";
  }
}

/**
 * publicUrl should be the prospect's personalized study link
 * (`/for/:token`), not a generic profile — the value is already prepared,
 * so the message points straight to it.
 */
export function buildOutreachMessage(
  p: OutreachProspect,
  score: number,
  publicUrl: string,
): string {
  const diagnosis = buildDiagnosis(p);
  // hasWebsite must match how the admin angle label (outreachAngleLabel) and
  // getLeadDetail compute it, or the label and the actual message body can
  // disagree for weak-website leads.
  const hasWebsite = p.website_status !== "no_website" && p.website_status !== "unknown";
  const angle = outreachAngle(score, hasWebsite);
  const lines: string[] = [];

  lines.push(`Hi ${p.business_name} 👋`);
  lines.push("");
  lines.push(
    `We came across ${p.business_name} while reviewing businesses in${p.category ? ` the ${p.category.toLowerCase()} space` : " your category"}.`,
  );
  lines.push("");
  lines.push(`You're already doing the difficult part well — ${diagnosis.positives.join(" ")}`);
  lines.push("");
  lines.push(`We noticed one gap in the customer journey: ${diagnosis.gapStatement}`);
  if (angleLine(angle)) {
    lines.push("");
    lines.push(angleLine(angle));
  }
  lines.push("");
  lines.push(`We prepared a short Digital Growth Study for ${p.business_name} showing:`);
  lines.push("• what we found");
  lines.push("• where the digital opportunity is");
  lines.push("• what we would implement first");
  lines.push("• a simple opportunity model based on your own business numbers");
  lines.push("");
  lines.push("Your study is ready here:");
  lines.push(publicUrl);
  lines.push(`See ${p.business_name}'s Growth Study`);

  return lines.join("\n");
}

/** Reserved for the highest-scoring leads — same structure, tighter copy. */
export function buildStrongOutreachMessage(p: OutreachProspect, publicUrl: string): string {
  const diagnosis = buildDiagnosis(p);
  const lines: string[] = [
    `Hi ${p.business_name} 👋`,
    "",
    `We reviewed ${p.business_name} because your existing customer presence stood out${p.category ? ` in ${p.category.toLowerCase()}` : ""}.`,
    "",
    `You already have the reputation and customer attention — ${diagnosis.positives.join(" ")}`,
    "",
    "The part we would change is what happens after someone searches for you.",
    "",
    `Right now, ${diagnosis.gapStatement.charAt(0).toLowerCase()}${diagnosis.gapStatement.slice(1)}`,
    "",
    "Based on what we found, our recommendation is a proper digital customer journey rather than relying only on social media and Maps.",
    "",
    "We prepared the business case for you here:",
    publicUrl,
    `View the recommendation for ${p.business_name}`,
  ];
  return lines.join("\n");
}

export function buildFollowUp1(
  p: OutreachProspect,
  publicUrl: string,
  verifiedReason: string,
): string {
  return [
    `Hi ${p.business_name} — leaving this here in case the first message got buried.`,
    "",
    `The reason we reached out specifically is ${verifiedReason}`,
    "",
    "Your Digital Growth Study is still available here:",
    publicUrl,
    "View the recommendation",
  ].join("\n");
}

export function buildFollowUp2(p: OutreachProspect, publicUrl: string): string {
  const diagnosis = buildDiagnosis(p);
  return [
    `One thing worth noting for ${p.business_name}:`,
    "",
    `You already have ${diagnosis.positives[0]?.toLowerCase() ?? "real customer attention"} so the first priority would not be "getting attention."`,
    "",
    "It would be turning more of the attention you already have into a measurable customer journey.",
    "",
    "That is what the recommendation focuses on:",
    publicUrl,
  ].join("\n");
}

export function buildFollowUp3(p: OutreachProspect, publicUrl: string): string {
  return [
    `Hi ${p.business_name},`,
    "",
    "Closing the loop on this from our side.",
    "",
    "We've kept the growth study available here:",
    publicUrl,
    "",
    "If improving the digital customer journey becomes a priority, this is the setup we would recommend starting with.",
    "",
    "Wishing the team continued success.",
  ].join("\n");
}

/** Human label for the admin panel — never shown to the prospect. */
export function outreachAngleLabel(score: number, hasWebsite: boolean): string {
  const angle = outreachAngle(score, hasWebsite);
  const tier = priorityLabel(score);
  const angleNames: Record<typeof angle, string> = {
    trust_no_site: 'Strong trust, no website — "you built the trust, now capture it"',
    social_no_site:
      'Large social presence, no website — "you built the audience, now own the journey"',
    weak_site: 'Weak/outdated website — "your site no longer matches the business"',
    deprioritize: "Below outreach threshold — verify a real gap before contacting, or deprioritize",
  };
  return `${tier} · ${angleNames[angle]}`;
}

/** Builds a wa.me deep link that opens WhatsApp with the draft pre-filled. */
export function buildWhatsAppLink(
  phone: string | null | undefined,
  message: string,
): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
