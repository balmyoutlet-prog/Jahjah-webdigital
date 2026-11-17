import type { AuditResult } from "./audit.server";

/**
 * Turns a (possibly absent) website audit into a short, honest list of
 * "here's what we could help you improve" bullets for the visitor who just
 * submitted the mini lead form. Every line traces back to a verified
 * signal — nothing is inferred or guessed when the audit couldn't confirm it.
 */
export function buildOpportunitySummary(audit: AuditResult | null, hasWebsite: boolean): string[] {
  if (!hasWebsite) {
    return [
      "No website on file yet — a clear, professional home online for your business.",
      "A direct way for people who find you on Instagram or Google Maps to actually contact or order.",
      "A place to show your products, menu or services properly.",
    ];
  }

  if (!audit || !audit.reachable) {
    return [
      "We couldn't confirm your current site loads reliably — worth a second look together.",
      "A clear, fast experience for visitors arriving on their phone.",
      "A direct way for visitors to contact, order or book.",
    ];
  }

  const bullets: string[] = [];
  if (audit.mobileViewport === false)
    bullets.push("A properly responsive layout for mobile visitors.");
  if (audit.hasWhatsappCta === false)
    bullets.push("A direct WhatsApp path from your site to a real conversation.");
  if (audit.hasOnlineOrderingOrBooking === false)
    bullets.push("A clear ordering, booking or inquiry path — not just information.");
  if (audit.hasSeoBasics === false)
    bullets.push("Basic search visibility so people can actually find you online.");
  if (audit.https === false)
    bullets.push("A secure (HTTPS) connection, which browsers flag when missing.");

  if (bullets.length === 0) {
    bullets.push(
      "Your site already covers the basics — the opportunity is a stronger design and conversion path built specifically around your business.",
    );
  }
  return bullets.slice(0, 4);
}
