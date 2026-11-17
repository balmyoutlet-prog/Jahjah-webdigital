import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AdminNav } from "@/components/platform/AdminNav";
import { getAdminAnalytics, type DateRangeKey } from "@/lib/analytics.functions";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AdminAnalyticsPage,
});

const RANGES: { key: DateRangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "thisMonth", label: "This month" },
  { key: "prevMonth", label: "Previous month" },
  { key: "custom", label: "Custom range" },
];

function AdminAnalyticsPage() {
  const fetchAnalytics = useServerFn(getAdminAnalytics);
  const [range, setRange] = useState<DateRangeKey>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-analytics", range, customFrom, customTo],
    queryFn: () =>
      fetchAnalytics({
        data: { range, from: customFrom || undefined, to: customTo || undefined },
      }),
  });

  if (error) return <Center>You do not have access to website analytics.</Center>;

  return (
    <div className="min-h-screen bg-background">
      <AdminNav active="/admin/analytics" />
      <main className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">First-party analytics</p>
            <h1 className="mt-2 font-display text-4xl">Website analytics</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Real visitor and inquiry activity from the Jahjah WebDigital website. No seeded or
              fake numbers — every figure below comes from stored events and inquiries.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  range === r.key
                    ? "border-champagne bg-champagne/10 text-champagne"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
            {range === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="input-luxe text-xs"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="input-luxe text-xs"
                />
              </div>
            )}
          </div>
        </header>

        {isLoading || !data ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Visitors" value={String(data.kpis.visitors)} helper="Unique sessions" />
              <Stat
                label="Page views"
                value={String(data.kpis.pageViews)}
                helper="All public pages"
              />
              <Stat
                label="Contacted us"
                value={String(data.kpis.contactedUs)}
                helper="Submitted the questionnaire and/or moved past New"
              />
              <Stat
                label="Form submissions"
                value={String(data.kpis.formSubmissions)}
                helper="Completed project questionnaires"
              />
              <Stat label="New leads" value={String(data.kpis.newLeads)} helper="Status: New" />
              <Stat
                label="Qualified leads"
                value={String(data.kpis.qualifiedLeads)}
                helper="Status: Qualified or Won"
              />
              <Stat label="Won clients" value={String(data.kpis.wonClients)} helper="Status: Won" />
              <Stat
                label="Visitor → lead"
                value={`${data.kpis.visitorToLeadPct}%`}
                helper="Submissions ÷ visitors"
              />
              <Stat
                label="Lead → won"
                value={`${data.kpis.leadToWonPct}%`}
                helper="Won ÷ submissions"
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <Panel title="Traffic sources">
                {data.trafficSources.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[420px] text-left text-sm">
                      <thead className="border-b border-border text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        <tr>
                          <th className="py-2 pr-4">Source</th>
                          <th className="py-2 pr-4">Visitors</th>
                          <th className="py-2 pr-4">Leads</th>
                          <th className="py-2">Conversion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.trafficSources.map((s) => (
                          <tr key={s.source} className="border-b border-border/60 last:border-0">
                            <td className="py-2 pr-4">{s.source}</td>
                            <td className="py-2 pr-4 text-champagne">{s.visitors}</td>
                            <td className="py-2 pr-4">{s.leads}</td>
                            <td className="py-2">{s.conversionRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty />
                )}
              </Panel>

              <Panel title="Page analytics">
                {data.pageAnalytics.some((p) => p.views > 0) ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-sm">
                      <thead className="border-b border-border text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        <tr>
                          <th className="py-2 pr-4">Page</th>
                          <th className="py-2 pr-4">Views</th>
                          <th className="py-2 pr-4">Unique</th>
                          <th className="py-2 pr-4">Leads started</th>
                          <th className="py-2">Completed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.pageAnalytics.map((p) => (
                          <tr key={p.path} className="border-b border-border/60 last:border-0">
                            <td className="py-2 pr-4">{p.label}</td>
                            <td className="py-2 pr-4 text-champagne">{p.views}</td>
                            <td className="py-2 pr-4">{p.uniqueVisitors}</td>
                            <td className="py-2 pr-4">{p.leadsStarted}</td>
                            <td className="py-2">{p.leadsCompleted}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty />
                )}
              </Panel>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <Panel title="CTA / button performance">
                {data.ctaAnalytics.some((c) => c.clicks > 0) ? (
                  <div className="divide-y divide-border">
                    {data.ctaAnalytics.map((c) => (
                      <div key={c.event} className="flex items-center justify-between gap-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {c.event.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {c.clicks} clicks ·{" "}
                          <span className="text-champagne">{c.leads} leads</span>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty />
                )}
              </Panel>

              <Panel title="Portfolio performance">
                {data.portfolioPerformance.length ? (
                  <div className="divide-y divide-border">
                    {data.portfolioPerformance.map((p) => (
                      <Row key={p.project} label={p.project.replace(/-/g, " ")} value={p.clicks} />
                    ))}
                  </div>
                ) : (
                  <Empty />
                )}
              </Panel>
            </section>

            <Panel title="Restaurant ordering funnel">
              <p className="mb-4 text-sm text-muted-foreground">
                Unique sessions moving from the homepage offer to a completed restaurant request.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {data.restaurantFunnel.map((f) => (
                  <div
                    key={f.label}
                    className="rounded-lg border border-primary/15 bg-[#fff9f8] p-4"
                  >
                    <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {f.label}
                    </p>
                    <p className="mt-2 font-display text-3xl text-champagne">{f.count}</p>
                    {f.pctOfPrevious !== null && (
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {f.pctOfPrevious}% of prior stage
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Visitor → sales funnel">
              <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {data.funnel.map((f) => (
                  <div
                    key={f.label}
                    className="rounded-lg border border-border bg-background/30 p-4"
                  >
                    <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {f.label}
                    </p>
                    <p className="mt-2 font-display text-2xl text-champagne">{f.count}</p>
                    {f.pctOfPrevious !== null && (
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {f.pctOfPrevious}% of prior stage
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Daily trend">
              {data.dailyTrend.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="border-b border-border text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      <tr>
                        <th className="py-3 pr-4">Date</th>
                        <th className="py-3 pr-4">Visitors</th>
                        <th className="py-3 pr-4">Leads</th>
                        <th className="py-3 pr-4">Contacted</th>
                        <th className="py-3">Won</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.dailyTrend.map((d) => (
                        <tr key={d.date} className="border-b border-border/60 last:border-0">
                          <td className="py-3 pr-4">{d.date}</td>
                          <td className="py-3 pr-4 text-champagne">{d.visitors}</td>
                          <td className="py-3 pr-4">{d.leads}</td>
                          <td className="py-3 pr-4">{d.contacted}</td>
                          <td className="py-3">{d.won}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Contacted/Won reflect each inquiry's current status against the day it was
                    created — not necessarily the day the status changed.
                  </p>
                </div>
              ) : (
                <Empty />
              )}
            </Panel>

            <section className="grid gap-6 lg:grid-cols-2">
              <Panel title="Recent inquiries">
                {data.recentInquiries.length ? (
                  <div className="divide-y divide-border">
                    {data.recentInquiries.map((i) => (
                      <div
                        key={i.id}
                        className="flex items-center justify-between gap-4 py-3 text-sm"
                      >
                        <span className="text-muted-foreground">
                          {new Date(i.created_at).toLocaleString()} · {i.source ?? "Direct"}
                        </span>
                        <span className="rounded-full border border-border px-2.5 py-0.5 text-xs">
                          {i.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty />
                )}
              </Panel>

              <Panel title="Device breakdown">
                {data.deviceBreakdown.length ? (
                  <div className="divide-y divide-border">
                    {data.deviceBreakdown.map((d) => (
                      <Row key={d.device} label={d.device} value={`${d.pct}%`} />
                    ))}
                  </div>
                ) : (
                  <Empty />
                )}
              </Panel>
            </section>

            <Panel title="Best performers">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <BestOf
                  label="Best source by leads"
                  value={data.bestOf.bestSourceByLeads?.source}
                />
                <BestOf
                  label="Best source by conversion"
                  value={
                    data.bestOf.bestSourceByConversion
                      ? `${data.bestOf.bestSourceByConversion.source} (${data.bestOf.bestSourceByConversion.conversionRate}%)`
                      : undefined
                  }
                />
                <BestOf
                  label="Most viewed portfolio"
                  value={data.bestOf.mostViewedPortfolio?.project?.replace(/-/g, " ")}
                />
                <BestOf label="Most viewed page" value={data.bestOf.mostViewedPage?.label} />
                <BestOf label="Best CTA" value={data.bestOf.bestCta?.event?.replace(/_/g, " ")} />
              </div>
            </Panel>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface/40 p-5">
      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl text-champagne">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{helper}</p>
    </div>
  );
}
function BestOf({ label, value }: { label: string; value?: string | undefined }) {
  return (
    <div className="rounded-lg border border-border bg-background/30 p-4">
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg text-champagne">{value || "No data yet"}</p>
    </div>
  );
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface/30 p-5">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
function Row({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="truncate text-sm capitalize text-muted-foreground">{label}</span>
      <span className="font-display text-lg text-champagne">{value}</span>
    </div>
  );
}
function Empty() {
  return <p className="text-sm text-muted-foreground">No data yet.</p>;
}
function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      {children}
    </div>
  );
}
