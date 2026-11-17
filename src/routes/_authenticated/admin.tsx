import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getAdminOverview } from "@/lib/platform.functions";
import {
  getCrmOverview,
  getHotLeadsTodayFn,
  getOwnerDailyReportFn,
  getTodayFunnelCountsFn,
} from "@/lib/leads.functions";
import { getOverviewKpis } from "@/lib/analytics.functions";
import { AdminNav } from "@/components/platform/AdminNav";
import { priorityTone, priorityLabel } from "@/lib/leads/scoring";
import { TIER_LABEL, usd, type Tier } from "@/lib/platform";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

const MONTHLY_TARGET_CENTS = 2_000_000;

const NAV_CARDS = [
  { to: "/admin/analytics", label: "Analytics", helper: "Visitors, funnel, traffic sources" },
  { to: "/admin/inquiries", label: "Client Inquiries", helper: "Every project questionnaire" },
  { to: "/admin/leads", label: "CRM Leads", helper: "Outbound prospect discovery" },
  { to: "/admin/payments", label: "Payments", helper: "Whish verification queue" },
  { to: "/admin/domains", label: "Domains", helper: "Domain verification & go-live" },
] as const;

function AdminPage() {
  const fetchOverview = useServerFn(getAdminOverview);
  const fetchCrm = useServerFn(getCrmOverview);
  const fetchOverviewKpis = useServerFn(getOverviewKpis);
  const fetchHotLeads = useServerFn(getHotLeadsTodayFn);
  const fetchTodayCounts = useServerFn(getTodayFunnelCountsFn);
  const fetchOwnerReport = useServerFn(getOwnerDailyReportFn);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview({}),
  });
  const { data: crm } = useQuery({
    queryKey: ["admin-crm-overview"],
    queryFn: () => fetchCrm({}),
    enabled: !error,
  });
  const { data: overviewKpis } = useQuery({
    queryKey: ["admin-overview-kpis"],
    queryFn: () => fetchOverviewKpis({}),
    enabled: !error,
  });
  const { data: hotLeads } = useQuery({
    queryKey: ["admin-hot-leads-today"],
    queryFn: () => fetchHotLeads({}),
    enabled: !error,
  });
  const { data: todayCounts } = useQuery({
    queryKey: ["admin-today-counts"],
    queryFn: () => fetchTodayCounts({}),
    enabled: !error,
  });
  const { data: ownerReport } = useQuery({
    queryKey: ["admin-owner-report"],
    queryFn: () => fetchOwnerReport({}),
    enabled: !error,
  });

  if (isLoading) return <Center>Loading platform data…</Center>;
  if (error) return <Center>You do not have access to the admin console.</Center>;
  if (!data) return null;

  const progress = Math.min(
    100,
    Math.round((data.kpis.monthRevenueCents / MONTHLY_TARGET_CENTS) * 100),
  );

  return (
    <div className="min-h-screen bg-background">
      <AdminNav active="/admin" />

      <main className="mx-auto max-w-7xl space-y-12 px-6 py-10">
        {overviewKpis && (
          <section className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="Visitors today" value={String(overviewKpis.visitorsToday)} />
            <Stat label="New inquiries today" value={String(overviewKpis.newInquiriesToday)} />
            <Stat label="Contacted today" value={String(overviewKpis.contactedToday)} />
            <Stat label="Qualified today" value={String(overviewKpis.qualifiedToday)} />
            <Stat label="Won this month" value={String(overviewKpis.wonThisMonth)} />
            <Stat label="Visitor → lead (today)" value={`${overviewKpis.visitorToLeadPctToday}%`} />
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-4">
          <Stat label="Revenue this month" value={usd(data.kpis.monthRevenueCents)} />
          <Stat label="Lifetime revenue" value={usd(data.kpis.revenueCents)} />
          <Stat label="Paid orders" value={String(data.kpis.paidOrders)} />
          <Stat label="Active projects" value={String(data.projects.length)} />
        </section>

        <section>
          <h2 className="font-display text-2xl">Go to</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {NAV_CARDS.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="rounded-lg border border-border bg-surface/40 p-4 transition-colors hover:border-champagne/40"
              >
                <p className="font-display text-lg">{c.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.helper}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface/40 p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl">Monthly target — $20,000</h2>
            <span className="text-sm text-champagne">{progress}%</span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-champagne" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Roughly 41 Medium packages, or a blend of ~20 Medium + ~17 High-End builds, plus
            upgrades and extra trials.
            {!data.kpis.paymentsConfigured &&
              " Card checkout stays off until Stripe is connected — Whish Money works today."}
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl">Hot leads today</h2>
          <div className="mt-4 space-y-2">
            {(hotLeads ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No prospect activity yet today.</p>
            )}
            {(hotLeads ?? []).map((l: any) => (
              <Link
                key={l.id}
                to="/admin/leads/$id"
                params={{ id: l.id }}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface/40 p-4 text-sm hover:border-champagne/40"
              >
                <span className="font-medium">{l.business_name}</span>
                <span className="text-xs text-muted-foreground">
                  {l.category ?? "—"} · {l.country ?? "—"} · last:{" "}
                  {l.lastAction?.replace(/_/g, " ")}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs ${priorityTone(priorityLabel(l.engagement_score))}`}
                >
                  {l.engagement_score}/100
                </span>
              </Link>
            ))}
          </div>
        </section>

        {todayCounts && (
          <section>
            <h2 className="font-display text-2xl">Today</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              <Stat label="Discovered" value={String(todayCounts.discovered)} />
              <Stat label="Concepts generated" value={String(todayCounts.conceptsGenerated)} />
              <Stat label="Messages sent" value={String(todayCounts.messagesSent)} />
              <Stat label="Previews opened" value={String(todayCounts.previewsOpened)} />
              <Stat label="Directions selected" value={String(todayCounts.directionsSelected)} />
              <Stat label="Payments" value={String(todayCounts.paymentsCount)} />
              <Stat label="Revenue today" value={usd(todayCounts.paymentsRevenueCents)} />
              <Stat label="Launches" value={String(todayCounts.launchesToday)} />
            </div>
          </section>
        )}

        {ownerReport && (
          <section className="rounded-lg border border-border bg-surface/40 p-6">
            <h2 className="font-display text-2xl">Owner daily report</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              No WhatsApp Business Platform credentials are connected — this opens a wa.me draft to{" "}
              {ownerReport.phone} for you to send manually. It is never sent automatically.
            </p>
            <pre className="mt-4 whitespace-pre-wrap rounded-sm border border-border bg-surface/50 p-3 text-xs">
              {ownerReport.text}
            </pre>
            <a
              href={`https://wa.me/${ownerReport.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(ownerReport.text)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded-sm bg-champagne px-4 py-2 text-xs text-primary-foreground"
            >
              Open in WhatsApp
            </a>
          </section>
        )}

        {crm && (
          <>
            <section>
              <h2 className="font-display text-2xl">Sales funnel</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                {crm.funnel.map((f: any, i: number) => {
                  const prev = i > 0 ? (crm.funnel[i - 1]?.count ?? f.count) : f.count;
                  const pct = prev > 0 ? Math.round((f.count / prev) * 100) : 0;
                  return (
                    <div
                      key={f.label}
                      className="rounded-lg border border-border bg-surface/40 p-4"
                    >
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        {f.label}
                      </p>
                      <p className="mt-2 font-display text-2xl text-champagne">{f.count}</p>
                      {i > 0 && (
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {pct}% of prior stage
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-4">
              <Stat label="Websites in production" value={String(crm.websitesInProduction)} />
              <Stat label="Websites launched" value={String(crm.websitesLaunched)} />
              <Stat label="Avg. order value" value={usd(crm.avgOrderValue)} />
              <Stat label="Add-on revenue" value={usd(crm.addonRevenue)} />
            </section>

            <section>
              <h2 className="font-display text-2xl">Revenue by package</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Stat label="Basic sales" value={usd(crm.revenueByTier["basic"] ?? 0)} />
                <Stat label="Medium sales" value={usd(crm.revenueByTier["medium"] ?? 0)} />
                <Stat label="Luxury sales" value={usd(crm.revenueByTier["high"] ?? 0)} />
              </div>
            </section>
          </>
        )}

        <section className="rounded-lg border border-champagne/30 bg-surface/40 p-6">
          <h2 className="font-display text-2xl">Public site funnel &amp; traffic</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Visitors, traffic sources, CTA performance, the full sales funnel and daily trend now
            live on the dedicated Analytics page, with date-range filtering.
          </p>
          <Link
            to="/admin/analytics"
            className="mt-4 inline-flex rounded-sm bg-champagne px-4 py-2 text-xs text-primary-foreground"
          >
            Open Analytics
          </Link>
        </section>

        <Panel title="Companies & projects">
          <Table
            head={["Company", "Owner", "Country", "Package", "Status", "Trials", "Paid"]}
            rows={data.projects.map((p: any) => {
              const c = data.companies.find((x: any) => x.id === p.company_id);
              return [
                c?.name ?? "—",
                c?.owner_name ?? "—",
                c?.country ?? "—",
                TIER_LABEL[p.tier as Tier],
                p.status.replace(/_/g, " "),
                `${p.trials_used}/${2 + p.extra_trials_purchased}`,
                p.paid ? "Yes" : "No",
              ];
            })}
          />
        </Panel>

        <Panel title="Orders">
          <Table
            head={["Description", "Kind", "Amount", "Status", "Created"]}
            rows={data.orders.map((o: any) => [
              o.description,
              o.kind,
              usd(o.amount_cents),
              o.status.replace(/_/g, " "),
              new Date(o.created_at).toLocaleDateString(),
            ])}
          />
        </Panel>

        <Panel title="Domain requests">
          <Table
            head={["Domain", "Status", "Provider", "Created"]}
            rows={data.domains.map((d: any) => [
              d.domain,
              d.status.replace(/_/g, " "),
              d.provider ?? "—",
              new Date(d.created_at).toLocaleDateString(),
            ])}
          />
        </Panel>

        <Panel title="Activity log">
          <Table
            head={["Event", "Project", "When"]}
            rows={data.logs.map((l: any) => [
              l.event,
              l.project_id?.slice(0, 8) ?? "—",
              new Date(l.created_at).toLocaleString(),
            ])}
          />
        </Panel>
      </main>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface/30">
        {children}
      </div>
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <table className="w-full min-w-[560px] text-left text-sm">
      <thead>
        <tr className="border-b border-border">
          {head.map((h) => (
            <th
              key={h}
              className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={head.length} className="px-4 py-6 text-muted-foreground">
              Nothing yet.
            </td>
          </tr>
        )}
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-border/50 last:border-0">
            {r.map((cell, j) => (
              <td key={j} className="px-4 py-3">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface/40 p-5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl text-champagne">{value}</p>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
