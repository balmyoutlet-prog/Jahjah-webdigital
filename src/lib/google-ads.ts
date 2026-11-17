// Google Ads conversion tracking. Paste the values from Google Ads →
// Goals → Conversions → (your conversion action) → "Use Google tag".
// Example: GOOGLE_ADS_ID = "AW-123456789", LEAD_LABEL = "AbCdEfGhIj".
// While GOOGLE_ADS_ID is empty nothing is loaded and nothing is sent.
export const GOOGLE_ADS_ID = "";
export const GOOGLE_ADS_LEAD_LABEL = "";

/** First-party events that count as a real enquiry for ad optimisation. */
export const ADS_CONVERSION_EVENTS = new Set([
  "whatsapp_click",
  "lead_form_submitted",
  "questionnaire_submitted",
  "restaurant_application_submitted",
  "contact_form_submit",
]);

type Gtag = (...args: unknown[]) => void;

/** Reports one lead conversion to Google Ads. Never throws. */
export function reportAdsConversion(eventName: string): void {
  if (!GOOGLE_ADS_ID || !GOOGLE_ADS_LEAD_LABEL || !ADS_CONVERSION_EVENTS.has(eventName)) return;
  try {
    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    gtag?.("event", "conversion", { send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_LEAD_LABEL}` });
  } catch {
    // never let ad tracking break the page
  }
}

/** Head scripts for the Google tag; empty until GOOGLE_ADS_ID is set. */
export function googleAdsHeadScripts(): { src?: string; async?: boolean; children?: string }[] {
  if (!GOOGLE_ADS_ID) return [];
  return [
    { src: `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`, async: true },
    {
      children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GOOGLE_ADS_ID}');`,
    },
  ];
}
