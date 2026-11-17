import { useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { trackEvent, type TRACKED_EVENTS } from "@/lib/analytics.functions";
import { reportAdsConversion } from "@/lib/google-ads";

type EventName = (typeof TRACKED_EVENTS)[number];

const SESSION_KEY = "jwd_session_id";
const UTM_KEY = "jwd_utm";
const LANDING_PAGE_KEY = "jwd_landing_page";
const INTERNAL_TRAFFIC_KEY = "jwd_internal_traffic";

/** Stable per-tab session id — the single source of truth every event and
 *  the contact questionnaire's own attribution both read from, so a
 *  visitor's page views and their eventual inquiry share one id. */
export function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

type Utm = {
  utmSource?: string | undefined;
  utmMedium?: string | undefined;
  utmCampaign?: string | undefined;
};

export function getUtm(): Utm {
  try {
    const cached = sessionStorage.getItem(UTM_KEY);
    if (cached) return JSON.parse(cached);
    const params = new URLSearchParams(window.location.search);
    const utm: Utm = {
      utmSource: params.get("utm_source") || undefined,
      utmMedium: params.get("utm_medium") || undefined,
      utmCampaign: params.get("utm_campaign") || undefined,
    };
    sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
    return utm;
  } catch {
    return {};
  }
}

/** The first page this session landed on — captured once, kept for the
 *  life of the tab, distinct from `document.referrer` (the page before
 *  this site) and from the current `path` (where they are now). */
export function getLandingPage(): string {
  if (typeof window === "undefined") return "";
  try {
    let lp = sessionStorage.getItem(LANDING_PAGE_KEY);
    if (!lp) {
      lp = window.location.pathname;
      sessionStorage.setItem(LANDING_PAGE_KEY, lp);
    }
    return lp;
  } catch {
    return window.location.pathname;
  }
}

/** Coarse, non-invasive device category from viewport width only — no
 *  fingerprinting, no user-agent parsing. */
export function getDeviceCategory(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

/** Classifies analytics traffic without fingerprinting. Production visitors are
 * reportable; previews, automated browser checks and explicitly marked
 * internal QA sessions are stored but excluded from owner KPIs. */
export function getTrafficType():
  | "production-human"
  | "internal-test"
  | "preview"
  | "automated-check" {
  if (typeof window === "undefined") return "internal-test";

  try {
    if (navigator.webdriver) return "automated-check";

    const params = new URLSearchParams(window.location.search);
    if (params.get("jwd_internal") === "1") {
      sessionStorage.setItem(INTERNAL_TRAFFIC_KEY, "1");
    } else if (params.get("jwd_internal") === "0") {
      sessionStorage.removeItem(INTERNAL_TRAFFIC_KEY);
    }

    if (sessionStorage.getItem(INTERNAL_TRAFFIC_KEY) === "1") return "internal-test";

    const hostname = window.location.hostname.toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
      return "internal-test";
    }

    if (hostname === "jahjahwebdigital.com" || hostname === "www.jahjahwebdigital.com") {
      return "production-human";
    }

    return "preview";
  } catch {
    return "production-human";
  }
}

/** Fire-and-forget first-party funnel tracking. Never throws, never blocks the UI. */
export function useTrackEvent() {
  const send = useServerFn(trackEvent);

  return useCallback(
    (eventName: EventName, properties?: Record<string, string | number | boolean>) => {
      try {
        if (getTrafficType() === "production-human") reportAdsConversion(eventName);
        const utm = getUtm();
        void send({
          data: {
            eventName,
            sessionId: getSessionId(),
            path: window.location.pathname,
            referrer: document.referrer || undefined,
            ...utm,
            properties: { ...properties, traffic_type: getTrafficType() },
          },
        }).catch(() => {});
      } catch {
        // never let analytics break the page
      }
    },
    [send],
  );
}
