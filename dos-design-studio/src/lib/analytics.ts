/** DOS-only analytics. Events are dropped unless a DOS GA4 ID is configured AND the visitor consented. */
type Params = Record<string, string | number | boolean | undefined>;

export const CONSENT_KEY = "dos:consent";

export function hasConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "granted";
  } catch {
    return false;
  }
}

export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  const w = window as Window & { gtag?: (...a: unknown[]) => void };
  if (!w.gtag || !hasConsent()) return;
  w.gtag("event", event, params);
}
