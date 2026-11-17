import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "./admin-guard.server";
import { getAdmin } from "./platform.server";

export const TRACKED_EVENTS = [
  // Generic — fired on every route change, gives real per-page visitor/view
  // counts (Homepage/Work/Packages/Process/Contact/Privacy/Terms) without
  // needing a bespoke event per page.
  "page_view",
  "homepage_view",
  // Portfolio outbound clicks (project name/location carried in `properties`).
  // This *is* "portfolio_click" — kept under its original name rather than
  // adding a synonymous duplicate event for the same action.
  "work_click",
  "show_business_click",
  // The homepage "Show us your business" mini-form only — NOT the full
  // /contact questionnaire (see questionnaire_started/submitted below).
  "lead_form_start",
  "lead_form_submitted",
  // The full project questionnaire on /contact.
  "questionnaire_started",
  "questionnaire_submitted",
  // "Start My Website" / "Start Your Project" CTAs that lead to /contact,
  // wherever they appear (header, footer, hero, work page, etc.) — carries
  // a `location` property. This *is* "contact_click"/"pricing_view"'s
  // sibling for the primary conversion path; kept as one event rather than
  // splitting the same click into two names.
  "start_project_click",
  "whatsapp_click",
  "instagram_click",
  // Package/pricing page — package_viewed fires once per page load and *is*
  // "pricing_view"; package_selected is the per-tier CTA click.
  "package_viewed",
  "package_selected",
  // Restaurant special-offer funnel: homepage CTA, first form interaction,
  // package choice, and completed application.
  "restaurant_offer_click",
  "restaurant_landing_view",
  "demo_view",
  "popup_opened",
  "restaurant_form_started",
  "restaurant_package_selected",
  "restaurant_application_submitted",
  "restaurant_readiness_started",
  "restaurant_readiness_completed",
  "restaurant_launch_readiness_started",
  "restaurant_launch_readiness_completed",
  "onboarding_started",
  "onboarding_completed",
  "whish_submitted",
  "study_opened",
  "snapshot_submitted",
  "scenario_viewed",
  "recommendation_viewed",
  "recommendation_continue_clicked",
  "service_view",
  "work_view",
  "free_tool_view",
  "free_tool_start",
  "free_tool_complete",
  "audit_cta_click",
  "demo_cta_click",
  "contact_form_start",
  "contact_form_submit",
  // Buyer guides and the commission calculator inside the WhatsApp guide.
  "guide_view",
  "calculator_used",
] as const;

export const trackEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        eventName: z.enum(TRACKED_EVENTS),
        sessionId: z.string().trim().max(64).optional(),
        path: z.string().trim().max(300).optional(),
        referrer: z.string().trim().max(300).optional(),
        utmSource: z.string().trim().max(80).optional(),
        utmMedium: z.string().trim().max(80).optional(),
        utmCampaign: z.string().trim().max(80).optional(),
        properties: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const admin = await getAdmin();
      await admin.from("analytics_events").insert({
        event_name: data.eventName,
        session_id: data.sessionId || null,
        path: data.path || null,
        referrer: data.referrer || null,
        utm_source: data.utmSource || null,
        utm_medium: data.utmMedium || null,
        utm_campaign: data.utmCampaign || null,
        properties: data.properties ?? {},
      });
    } catch {
      // Analytics must never break the public site.
    }
    return { ok: true };
  });

// ===== Admin analytics — real, first-party, no seeded/fake numbers =====
// Every number below is derived from `analytics_events` (public site
// activity) and `inquiries` (the CRM pipeline) as they actually are —
// nothing here is invented, and a metric with no underlying rows renders
// as "No data yet" rather than a guess.

const PUBLIC_PAGES = [
  { path: "/", label: "Homepage" },
  { path: "/work", label: "Work" },
  { path: "/packages", label: "Packages" },
  { path: "/process", label: "Process" },
  { path: "/contact", label: "Contact" },
  { path: "/restaurant", label: "Restaurant landing" },
  { path: "/restaurant-digital-menu", label: "Digital Menu" },
  { path: "/restaurant-online-ordering", label: "Direct Ordering" },
  { path: "/qr-menu", label: "QR Menu" },
  { path: "/whatsapp-ordering", label: "WhatsApp Ordering" },
  { path: "/free-restaurant-demo", label: "Free Restaurant Demo" },
  { path: "/restaurant-ordering-readiness-score", label: "Ordering Readiness Score" },
  { path: "/restaurant-contact", label: "Restaurant Contact" },
  { path: "/restaurants/dubai", label: "Dubai Restaurants" },
  { path: "/restaurants/saudi-arabia", label: "Saudi Restaurants" },
  { path: "/restaurants/qatar", label: "Qatar Restaurants" },
  { path: "/restaurants/kuwait", label: "Kuwait Restaurants" },
  { path: "/restaurants/lebanon", label: "Lebanon Restaurants" },
  { path: "/privacy", label: "Privacy" },
  { path: "/terms", label: "Terms" },
] as const;

// Clicks on the primary conversion/marketing CTAs — ranked by how many of
// the sessions that fired them went on to actually submit a questionnaire
// (matched by the shared session id — real correlation, not a guess).
const CTA_EVENTS = [
  "start_project_click",
  "whatsapp_click",
  "instagram_click",
  "work_click",
  "package_selected",
  "show_business_click",
  "restaurant_offer_click",
  "demo_view",
  "popup_opened",
  "restaurant_package_selected",
] as const;

export type DateRangeKey =
  "today" | "yesterday" | "7d" | "30d" | "thisMonth" | "prevMonth" | "custom";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function resolveDateRange(range: DateRangeKey, from?: string, to?: string) {
  const now = new Date();
  switch (range) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { start: startOfDay(y), end: endOfDay(y) };
    }
    case "7d": {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      return { start: startOfDay(s), end: endOfDay(now) };
    }
    case "30d": {
      const s = new Date(now);
      s.setDate(s.getDate() - 29);
      return { start: startOfDay(s), end: endOfDay(now) };
    }
    case "thisMonth":
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: endOfDay(now) };
    case "prevMonth": {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: s, end: endOfDay(e) };
    }
    case "custom":
      return {
        start: from ? startOfDay(new Date(from)) : startOfDay(now),
        end: to ? endOfDay(new Date(to)) : endOfDay(now),
      };
    default:
      return { start: startOfDay(now), end: endOfDay(now) };
  }
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** A page load, under either the current generic event or the retired
 *  page-specific one it replaced (see TRACKED_EVENTS) — never double
 *  counted, since only one of the two ever fires for a given page load. */
function isPageViewRow(r: { event_name: string }) {
  return r.event_name === "page_view" || r.event_name === "homepage_view";
}

/** Legacy events without a traffic_type remain reportable so historical data is
 * preserved. New preview/internal/automated events are retained for debugging
 * but excluded from owner-facing KPIs and funnels. */
function isReportableTraffic(properties: unknown) {
  if (!properties || typeof properties !== "object" || Array.isArray(properties)) return true;
  const trafficType = (properties as Record<string, unknown>)["traffic_type"];
  return !trafficType || trafficType === "production-human";
}

type EventRow = {
  event_name: string;
  session_id: string | null;
  path: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  properties: Record<string, unknown> | null;
  created_at: string;
};

type InquiryRow = {
  id: string;
  status: string;
  created_at: string;
  session_id: string | null;
  utm_source: string | null;
  source: string | null;
};

const STAGE_RANK: Record<string, number> = {
  new: 0,
  contacted: 1,
  qualified: 2,
  won: 3,
};

export const getAdminAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        range: z
          .enum(["today", "yesterday", "7d", "30d", "thisMonth", "prevMonth", "custom"])
          .default("30d"),
        from: z.string().trim().max(20).optional(),
        to: z.string().trim().max(20).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const { start, end } = resolveDateRange(data.range, data.from, data.to);

    const [{ data: eventRows, error: eventsErr }, { data: inquiryRows, error: inqErr }] =
      await Promise.all([
        admin
          .from("analytics_events")
          .select(
            "event_name, session_id, path, referrer, utm_source, utm_medium, utm_campaign, properties, created_at",
          )
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString())
          .order("created_at", { ascending: true })
          .limit(20000),
        admin
          .from("inquiries")
          .select("id, status, created_at, session_id, utm_source, source")
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString())
          .order("created_at", { ascending: false }),
      ]);
    if (eventsErr) throw new Error(eventsErr.message);
    if (inqErr) throw new Error(inqErr.message);

    const allEvents = (eventRows ?? []) as EventRow[];
    const events = allEvents.filter((event) => isReportableTraffic(event.properties));
    const inquiries = (inquiryRows ?? []) as InquiryRow[];

    // ----- Visitors / page views -----
    const visitorSessions = new Set<string>();
    for (const e of events) if (e.session_id) visitorSessions.add(e.session_id);
    const pageViewRows = events.filter(isPageViewRow);
    const pageViews = pageViewRows.length;

    // ----- Device breakdown (from page_view's `properties.device`) -----
    const deviceCounts: Record<string, number> = {};
    for (const e of pageViewRows) {
      const device = (e.properties?.["device"] as string | undefined) ?? null;
      if (device) deviceCounts[device] = (deviceCounts[device] ?? 0) + 1;
    }
    const deviceTotal = Object.values(deviceCounts).reduce((a, b) => a + b, 0);
    const deviceBreakdown = Object.entries(deviceCounts).map(([device, count]) => ({
      device,
      count,
      pct: deviceTotal > 0 ? Math.round((count / deviceTotal) * 1000) / 10 : 0,
    }));

    // ----- Traffic sources -----
    const sourceOf = (r: { utm_source: string | null; referrer: string | null }) =>
      r.utm_source || (r.referrer ? hostnameOf(r.referrer) : null) || "Direct";
    const sessionsBySource: Record<string, Set<string>> = {};
    for (const e of events) {
      if (!e.session_id) continue;
      const src = sourceOf(e);
      (sessionsBySource[src] ??= new Set()).add(e.session_id);
    }
    const inquiriesBySource: Record<string, number> = {};
    for (const i of inquiries) {
      const src = i.utm_source || i.source || "Direct";
      inquiriesBySource[src] = (inquiriesBySource[src] ?? 0) + 1;
    }
    const trafficSources = Object.entries(sessionsBySource)
      .map(([source, sessions]) => {
        const visitors = sessions.size;
        const leads = inquiriesBySource[source] ?? 0;
        return {
          source,
          visitors,
          leads,
          conversionRate: visitors > 0 ? Math.round((leads / visitors) * 1000) / 10 : 0,
        };
      })
      .sort((a, b) => b.visitors - a.visitors);

    // ----- Page analytics -----
    const pageAnalytics = PUBLIC_PAGES.map(({ path, label }) => {
      const rowsForPage = pageViewRows.filter((e) => e.path === path);
      const uniqueVisitors = new Set(rowsForPage.map((e) => e.session_id).filter(Boolean)).size;
      const started = events.filter(
        (e) => e.event_name === "questionnaire_started" && e.path === path,
      ).length;
      const completed = events.filter(
        (e) => e.event_name === "questionnaire_submitted" && e.path === path,
      ).length;
      return {
        path,
        label,
        views: rowsForPage.length,
        uniqueVisitors,
        leadsStarted: started,
        leadsCompleted: completed,
      };
    });

    // ----- CTA analytics (real session-based lead attribution) -----
    const sessionsWithInquiry = new Set(inquiries.map((i) => i.session_id).filter(Boolean));
    const ctaAnalytics = CTA_EVENTS.map((name) => {
      const rows = events.filter((e) => e.event_name === name);
      const sessions = new Set(rows.map((e) => e.session_id).filter(Boolean));
      const leads = [...sessions].filter((s) => sessionsWithInquiry.has(s as string)).length;
      return { event: name, clicks: rows.length, sessions: sessions.size, leads };
    }).sort((a, b) => b.clicks - a.clicks);

    // ----- Portfolio performance -----
    const portfolioCounts: Record<string, number> = {};
    for (const e of events) {
      if (e.event_name !== "work_click") continue;
      const project = e.properties?.["project"] as string | undefined;
      if (project) portfolioCounts[project] = (portfolioCounts[project] ?? 0) + 1;
    }
    const portfolioPerformance = Object.entries(portfolioCounts)
      .map(([project, clicks]) => ({ project, clicks }))
      .sort((a, b) => b.clicks - a.clicks);

    // ----- Funnel -----
    const startProjectSessions = new Set(
      events.filter((e) => e.event_name === "start_project_click").map((e) => e.session_id),
    );
    const questionnaireStartSessions = new Set(
      events.filter((e) => e.event_name === "questionnaire_started").map((e) => e.session_id),
    );
    const funnelStages = [
      { label: "Website visitors", count: visitorSessions.size },
      { label: "Start Project clicks", count: startProjectSessions.size },
      { label: "Questionnaire starts", count: questionnaireStartSessions.size },
      { label: "Questionnaire submissions", count: inquiries.length },
      {
        label: "Contacted",
        count: inquiries.filter((i) => (STAGE_RANK[i.status] ?? -1) >= STAGE_RANK["contacted"]!)
          .length,
      },
      {
        label: "Qualified",
        count: inquiries.filter((i) => (STAGE_RANK[i.status] ?? -1) >= STAGE_RANK["qualified"]!)
          .length,
      },
      { label: "Won", count: inquiries.filter((i) => i.status === "won").length },
    ];
    const funnel = funnelStages.map((stage, i) => ({
      ...stage,
      pctOfPrevious:
        i === 0 || funnelStages[i - 1]!.count === 0
          ? null
          : Math.round((stage.count / funnelStages[i - 1]!.count) * 1000) / 10,
    }));

    // ----- Restaurant ordering funnel (unique sessions, no invented data) -----
    const restaurantStageCount = (eventName: string) =>
      new Set(
        events
          .filter((e) => e.event_name === eventName)
          .map((e) => e.session_id)
          .filter(Boolean),
      ).size;
    const restaurantFunnelStages = [
      { label: "Hero CTA", count: restaurantStageCount("restaurant_offer_click") },
      { label: "Form started", count: restaurantStageCount("restaurant_form_started") },
      { label: "Package selected", count: restaurantStageCount("restaurant_package_selected") },
      {
        label: "Application submitted",
        count: restaurantStageCount("restaurant_application_submitted"),
      },
    ];
    const restaurantFunnel = restaurantFunnelStages.map((stage, i) => ({
      ...stage,
      pctOfPrevious:
        i === 0 || restaurantFunnelStages[i - 1]!.count === 0
          ? null
          : Math.round((stage.count / restaurantFunnelStages[i - 1]!.count) * 1000) / 10,
    }));

    // ----- Daily trend -----
    const dailyMap: Record<
      string,
      { visitors: Set<string>; leads: number; contacted: number; won: number }
    > = {};
    for (const e of pageViewRows) {
      const day = e.created_at.slice(0, 10);
      dailyMap[day] ??= { visitors: new Set(), leads: 0, contacted: 0, won: 0 };
      if (e.session_id) dailyMap[day]!.visitors.add(e.session_id);
    }
    for (const i of inquiries) {
      const day = i.created_at.slice(0, 10);
      dailyMap[day] ??= { visitors: new Set(), leads: 0, contacted: 0, won: 0 };
      dailyMap[day]!.leads += 1;
      // Reflects each inquiry's *current* status against the day it was
      // created (we don't keep a separate stage-change timeline) — a
      // faithful "as of now" view, not a claim about exactly which day the
      // status changed.
      if ((STAGE_RANK[i.status] ?? -1) >= STAGE_RANK["contacted"]!) dailyMap[day]!.contacted += 1;
      if (i.status === "won") dailyMap[day]!.won += 1;
    }
    const dailyTrend = Object.entries(dailyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, v]) => ({
        date,
        visitors: v.visitors.size,
        leads: v.leads,
        contacted: v.contacted,
        won: v.won,
      }));

    // ----- Recent inquiries -----
    const recentInquiries = inquiries.slice(0, 8).map((i) => ({
      id: i.id,
      created_at: i.created_at,
      status: i.status,
      source: i.utm_source || i.source,
    }));

    // ----- KPIs -----
    const questionnaireSubmissions = inquiries.length;
    const contactedCount = funnel.find((f) => f.label === "Contacted")!.count;
    const qualifiedCount = funnel.find((f) => f.label === "Qualified")!.count;
    const wonCount = funnel.find((f) => f.label === "Won")!.count;
    const newCount = inquiries.filter((i) => i.status === "new").length;
    const visitorToLeadPct =
      visitorSessions.size > 0
        ? Math.round((questionnaireSubmissions / visitorSessions.size) * 1000) / 10
        : 0;
    const leadToWonPct =
      questionnaireSubmissions > 0
        ? Math.round((wonCount / questionnaireSubmissions) * 1000) / 10
        : 0;

    // ----- Best-of (never invented — "No data yet" when nothing qualifies) -----
    const bestSourceByLeads =
      trafficSources.filter((s) => s.leads > 0).sort((a, b) => b.leads - a.leads)[0] ?? null;
    const bestSourceByConversion =
      trafficSources
        .filter((s) => s.leads > 0)
        .sort((a, b) => b.conversionRate - a.conversionRate)[0] ?? null;
    const mostViewedPortfolio = portfolioPerformance[0] ?? null;
    const mostViewedPage =
      [...pageAnalytics].filter((p) => p.views > 0).sort((a, b) => b.views - a.views)[0] ?? null;
    const bestCta =
      ctaAnalytics.filter((c) => c.leads > 0).sort((a, b) => b.leads - a.leads)[0] ??
      ctaAnalytics.filter((c) => c.clicks > 0).sort((a, b) => b.clicks - a.clicks)[0] ??
      null;

    return {
      range: { key: data.range, start: start.toISOString(), end: end.toISOString() },
      kpis: {
        visitors: visitorSessions.size,
        pageViews,
        contactedUs: contactedCount,
        formSubmissions: questionnaireSubmissions,
        newLeads: newCount,
        qualifiedLeads: qualifiedCount,
        wonClients: wonCount,
        visitorToLeadPct,
        leadToWonPct,
      },
      trafficSources,
      pageAnalytics,
      ctaAnalytics,
      portfolioPerformance,
      funnel,
      restaurantFunnel,
      dailyTrend,
      recentInquiries,
      deviceBreakdown,
      bestOf: {
        bestSourceByLeads,
        bestSourceByConversion,
        mostViewedPortfolio,
        mostViewedPage,
        bestCta,
      },
      totalEvents: events.length,
      excludedNonHumanEvents: allEvents.length - events.length,
    };
  });

/** Lightweight, fixed-window snapshot for the /admin CEO overview — always
 *  "today" and "this month", independent of whatever range /admin/analytics
 *  is currently showing. */
export const getOverviewKpis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const today = resolveDateRange("today");
    const month = resolveDateRange("thisMonth");

    const [todayEvents, todayInquiries, monthInquiries] = await Promise.all([
      admin
        .from("analytics_events")
        .select("event_name, session_id, properties")
        .gte("created_at", today.start.toISOString())
        .lte("created_at", today.end.toISOString())
        .limit(20000),
      admin
        .from("inquiries")
        .select("id, status")
        .gte("created_at", today.start.toISOString())
        .lte("created_at", today.end.toISOString()),
      admin
        .from("inquiries")
        .select("id, status")
        .gte("created_at", month.start.toISOString())
        .lte("created_at", month.end.toISOString()),
    ]);
    if (todayEvents.error) throw new Error(todayEvents.error.message);
    if (todayInquiries.error) throw new Error(todayInquiries.error.message);
    if (monthInquiries.error) throw new Error(monthInquiries.error.message);

    const visitorsToday = new Set(
      (todayEvents.data ?? [])
        .filter((e) => isReportableTraffic(e.properties))
        .filter(isPageViewRow)
        .map((e) => e.session_id)
        .filter(Boolean),
    ).size;
    const todayInq = todayInquiries.data ?? [];
    const monthInq = monthInquiries.data ?? [];

    return {
      visitorsToday,
      newInquiriesToday: todayInq.length,
      contactedToday: todayInq.filter(
        (i) => (STAGE_RANK[i.status] ?? -1) >= STAGE_RANK["contacted"]!,
      ).length,
      qualifiedToday: todayInq.filter(
        (i) => (STAGE_RANK[i.status] ?? -1) >= STAGE_RANK["qualified"]!,
      ).length,
      wonThisMonth: monthInq.filter((i) => i.status === "won").length,
      visitorToLeadPctToday:
        visitorsToday > 0 ? Math.round((todayInq.length / visitorsToday) * 1000) / 10 : 0,
    };
  });
