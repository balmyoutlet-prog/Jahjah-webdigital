import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminNav } from "@/components/platform/AdminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getOutreachBoard, saveOutreachRecord, saveOutreachSettings, setOutreachStatus } from "@/lib/outreach.functions";
import {
  allowedNext,
  composeDrafts,
  computeMetrics,
  DEFAULT_CTA,
  DM_MAX_CHARS,
  draftGaps,
  FOLLOW_UP_DAYS,
  OUTREACH_STATUSES,
  qualificationGaps,
  STATUS_LABEL,
  type OutreachRecord,
  type OutreachStatus,
} from "@/lib/outreach-rules";

export const Route = createFileRoute("/_authenticated/admin/outreach")({
  head: () => ({
    meta: [
      { title: "Outreach Queue | Jahjah WebDigital" },
      { name: "description", content: "Private, approval-based outreach pipeline for Jahjah WebDigital." },
      { property: "og:title", content: "Outreach Queue | Jahjah WebDigital" },
      { property: "og:description", content: "Private, approval-based outreach pipeline for Jahjah WebDigital." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OutreachQueue,
});

type Board = Awaited<ReturnType<typeof getOutreachBoard>>;
type Row = Board["rows"][number];

const KEY = ["admin-outreach-board"];
const selectCls = "h-10 rounded-md border border-input bg-background px-3 text-sm";

function emptyRecord(): OutreachRecord {
  return {
    status: "research_needed", signal_type: null, signal_summary: null, signal_date: null, observation: null,
    observation_verified: false, consequence: null, solution_angle: null, cta: DEFAULT_CTA, contact_route: null,
    contact_route_type: null, contact_verified: false, contact_role: null, source_urls: [], proof_slug: null,
    opted_in: false, email_first: null, email_follow_up: null, dm_first: null, dm_follow_up: null,
    follow_up_count: 0, replied_at: null,
  };
}

function OutreachQueue() {
  const fetchBoard = useServerFn(getOutreachBoard);
  const { data, isPending, error } = useQuery({ queryKey: KEY, queryFn: () => fetchBoard() });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <AdminNav active="/admin/outreach" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="font-display text-3xl sm:text-4xl">Outreach Queue</h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          Researched outbound prospects only. Nothing is sent from this page: every message needs verified research,
          explicit approval, and is sent manually by you. Plan: first message, one value-adding follow-up after{" "}
          {FOLLOW_UP_DAYS}–4 days if there is no reply, then stop. Any reply cancels the follow-up. Do Not Contact is permanent.
        </p>
        {error ? (
          <p role="alert" className="mt-8 text-sm text-destructive">You do not have access to this queue.</p>
        ) : isPending || !data ? (
          <p className="mt-8 text-sm">Loading pipeline…</p>
        ) : (
          <>
            <InboundNote inbound={data.inbound} />
            <Metrics data={data} />
            <Readiness settings={data.settings} />
            <section className="mt-10" aria-labelledby="pipeline-h">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 id="pipeline-h" className="font-display text-2xl">Prospects</h2>
                <label className="text-sm">
                  <span className="mr-2 text-muted-foreground">Status</span>
                  <select className={selectCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All</option>
                    <option value="follow_up_window">Follow-up window open</option>
                    {OUTREACH_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </label>
              </div>
              <ul className="mt-4 space-y-3">
                {data.rows
                  .filter((r) => {
                    const st = (r.record?.status ?? "research_needed") as string;
                    if (statusFilter === "all") return true;
                    if (statusFilter === "follow_up_window") return r.followUpDue;
                    return st === statusFilter;
                  })
                  .map((r) => (
                    <ProspectRow key={r.prospect.id} row={r} rows={data.rows} proofs={data.proofs} settings={data.settings}
                      open={openId === r.prospect.id} onToggle={() => setOpenId(openId === r.prospect.id ? null : r.prospect.id)} />
                  ))}
                {!data.rows.length && <li className="text-sm text-muted-foreground">No prospects yet. Add them in Leads first.</li>}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function InboundNote({ inbound }: { inbound: Board["inbound"] }) {
  return (
    <aside className="mt-6 rounded-xl border border-border bg-card p-4 text-sm">
      <p className="font-medium">Inbound leads are kept separate</p>
      <p className="mt-1 text-muted-foreground">
        Website popup / contact submissions ({inbound.inquiries}) and restaurant applications ({inbound.restaurantApplications})
        keep their submitted details and are never edited from this queue. Review them in{" "}
        <Link to="/admin/inquiries" className="underline">Inquiries</Link> and{" "}
        <Link to="/admin/restaurants" className="underline">Restaurants</Link>.
      </p>
    </aside>
  );
}

function Metrics({ data }: { data: Board }) {
  const [country, setCountry] = useState("all");
  const [signal, setSignal] = useState("all");
  const [channel, setChannel] = useState("all");
  const uniq = (k: "country" | "signal_type" | "channel") =>
    [...new Set((data.metricRows as any[]).map((r: any) => r[k]).filter(Boolean) as string[])].sort();
  const m = useMemo(
    () =>
      computeMetrics(
        (data.metricRows as any[]).filter(
          (r: any) => (country === "all" || r.country === country) && (signal === "all" || r.signal_type === signal) && (channel === "all" || r.channel === channel),
        ) as any,
      ),
    [data.metricRows, country, signal, channel],
  );
  const cards: [string, string | number][] = [
    ["Qualified prospects", m.qualified], ["Approved (awaiting send)", m.approved], ["Sent", m.sent], ["Replied", m.replied],
    ["Positive replies", m.classified ? m.positive : "Not classified yet"], ["Meetings", m.meetings], ["Proposals", m.proposals],
    ["Won", m.won], ["Lost", m.lost],
  ];
  return (
    <section className="mt-8" aria-labelledby="metrics-h">
      <div className="flex flex-wrap items-end gap-3">
        <h2 id="metrics-h" className="mr-auto font-display text-2xl">Pipeline metrics</h2>
        {([["Country", country, setCountry, uniq("country")], ["Signal", signal, setSignal, uniq("signal_type")], ["Channel", channel, setChannel, uniq("channel")]] as const).map(
          ([label, val, set, opts]) => (
            <label key={label} className="text-sm">
              <span className="mr-2 text-muted-foreground">{label}</span>
              <select className={selectCls} value={val} onChange={(e) => set(e.target.value)}>
                <option value="all">All</option>
                {opts.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          ),
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Counts come only from stored pipeline records ({m.total} tracked prospects).</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border bg-card p-4">
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="mt-1 text-xl font-semibold">{v}</dd>
          </div>
        ))}
        {([["Reply rate", m.replyRate], ["Meeting rate (of replies)", m.meetingRate], ["Qualified-lead rate", m.qualifiedLeadRate]] as const).map(([k, r]) => (
          <div key={k} className="rounded-xl border border-border bg-card p-4">
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="mt-1 text-base font-semibold">{r.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Readiness({ settings }: { settings: Board["settings"] }) {
  const qc = useQueryClient();
  const save = useServerFn(saveOutreachSettings);
  const s: any = settings ?? {};
  const [f, setF] = useState({
    sending_domain: s.sending_domain ?? "", domain_verified: !!s.domain_verified, sender_address: s.sender_address ?? "",
    reply_to: s.reply_to ?? "", reply_to_configured: !!s.reply_to_configured, inbound_tested: !!s.inbound_tested,
    last_test_result: s.last_test_result ?? "", last_test_at: s.last_test_at ? String(s.last_test_at).slice(0, 10) : "",
    spf_status: s.spf_status ?? "unknown", dkim_status: s.dkim_status ?? "unknown", dmarc_status: s.dmarc_status ?? "unknown",
    readiness_confirmed: !!s.readiness_confirmed,
  });
  const m = useMutation({
    mutationFn: () => save({ data: f as any }),
    onSuccess: () => { toast.success("Readiness saved"); qc.invalidateQueries({ queryKey: KEY }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const check = (k: keyof typeof f, label: string) => (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={f[k] as boolean} onChange={(e) => setF({ ...f, [k]: e.target.checked })} /> {label}
    </label>
  );
  const dns = (k: "spf_status" | "dkim_status" | "dmarc_status", label: string) => (
    <label className="text-sm">
      <span className="block text-muted-foreground">{label}</span>
      <select className={selectCls} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })}>
        {["unknown", "pending", "pass", "fail"].map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
  return (
    <section className="mt-10 rounded-xl border border-border bg-card p-4 sm:p-6" aria-labelledby="ready-h">
      <h2 id="ready-h" className="font-display text-2xl">Email & reply readiness</h2>
      <p className={`mt-2 text-sm font-medium ${s.readiness_confirmed ? "text-foreground" : "text-destructive"}`}>
        {s.readiness_confirmed ? "Marked ready by an admin." : "Not ready — sending domain verification and reply handling are pending externally."}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Manual status fields only; this app does not check DNS or hold any email provider key. No sending service is connected,
        so the Send button stays disabled even when ready.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm"><span className="block text-muted-foreground">Sending domain</span>
          <Input value={f.sending_domain} onChange={(e) => setF({ ...f, sending_domain: e.target.value })} /></label>
        <label className="text-sm"><span className="block text-muted-foreground">Sender address</span>
          <Input value={f.sender_address} onChange={(e) => setF({ ...f, sender_address: e.target.value })} /></label>
        <label className="text-sm"><span className="block text-muted-foreground">Reply-to</span>
          <Input value={f.reply_to} onChange={(e) => setF({ ...f, reply_to: e.target.value })} /></label>
        {dns("spf_status", "SPF")}{dns("dkim_status", "DKIM")}{dns("dmarc_status", "DMARC")}
        <label className="text-sm"><span className="block text-muted-foreground">Last test email date</span>
          <Input type="date" value={f.last_test_at} onChange={(e) => setF({ ...f, last_test_at: e.target.value })} /></label>
        <label className="text-sm sm:col-span-2"><span className="block text-muted-foreground">Last test email result</span>
          <Input value={f.last_test_result} onChange={(e) => setF({ ...f, last_test_result: e.target.value })} /></label>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {check("domain_verified", "Sending domain verified")}
        {check("reply_to_configured", "Reply-to configured")}
        {check("inbound_tested", "Inbound reply handling tested")}
        {check("readiness_confirmed", "I confirm email sending is ready")}
      </div>
      <Button className="mt-4" onClick={() => m.mutate()} disabled={m.isPending}>Save readiness</Button>
    </section>
  );
}

function ProspectRow({ row, rows, proofs, settings, open, onToggle }: {
  row: Row; rows: Board["rows"]; proofs: Board["proofs"]; settings: Board["settings"]; open: boolean; onToggle: () => void;
}) {
  const p: any = row.prospect;
  const rec: any = row.record ?? emptyRecord();
  const status = rec.status as OutreachStatus;
  const gaps = qualificationGaps(rec);
  const dupNames = (row.duplicates as string[]).map((id) => rows.find((r) => r.prospect.id === id)?.prospect.business_name).filter(Boolean);
  return (
    <li className="rounded-xl border border-border bg-card">
      <button type="button" onClick={onToggle} aria-expanded={open}
        className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 p-4 text-left">
        <span className="font-medium">{p.business_name}</span>
        <span className="text-sm text-muted-foreground">{[p.city, p.country].filter(Boolean).join(", ")}</span>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">{STATUS_LABEL[status]}</span>
        {row.followUpDue && <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs">Follow-up window open</span>}
        {dupNames.length > 0 && <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs text-destructive">Possible duplicate</span>}
        <span className="ml-auto text-xs text-muted-foreground">
          {rec.last_contacted_at ? `Last contact ${String(rec.last_contacted_at).slice(0, 10)} via ${rec.last_channel}` : "Never contacted"}
          {rec.replied_at ? " · replied" : ""}
        </span>
      </button>
      {open && (
        <div className="border-t border-border p-4">
          {dupNames.length > 0 && (
            <p className="mb-3 text-sm text-destructive">Shares a name, domain, email or phone with: {dupNames.join(", ")}. Check their history before contacting.</p>
          )}
          {status === "research_needed" && gaps.length > 0 && (
            <p className="mb-3 text-sm"><span className="font-medium">Research Needed — missing:</span> {gaps.join("; ")}</p>
          )}
          <Editor key={JSON.stringify(rec)} prospect={p} rec={rec} proofs={proofs} />
          <Transitions prospectId={p.id} rec={rec} settings={settings} />
          <History row={row} />
          <p className="mt-3 text-sm"><Link to="/admin/leads/$id" params={{ id: p.id }} className="underline">Open full lead record</Link></p>
        </div>
      )}
    </li>
  );
}

function Editor({ prospect, rec, proofs }: { prospect: any; rec: any; proofs: Board["proofs"] }) {
  const qc = useQueryClient();
  const save = useServerFn(saveOutreachRecord);
  const locked = rec.status === "do_not_contact";
  const [f, setF] = useState({ ...rec, source_urls_text: (rec.source_urls ?? []).join("\n") });
  const set = (k: string, v: unknown) => setF((o: any) => ({ ...o, [k]: v }));
  const m = useMutation({
    mutationFn: () => {
      const { source_urls_text, ...rest } = f;
      const keys = ["signal_type","signal_summary","signal_date","observation","observation_verified","consequence","solution_angle","cta","contact_route","contact_route_type","contact_verified","contact_role","proof_slug","opted_in","preferred_channel","reply_classification","email_first","email_follow_up","dm_first","dm_follow_up"];
      const payload: any = { prospectId: prospect.id };
      for (const k of keys) payload[k] = rest[k] ?? null;
      payload.source_urls = String(source_urls_text).split(/\s+/).map((s) => s.trim()).filter(Boolean);
      return save({ data: payload });
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: KEY }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const proof = proofs.find((x) => x.slug === f.proof_slug) ?? null;
  const generate = () => {
    const d = composeDrafts(f, prospect.business_name, proof);
    setF((o: any) => ({ ...o, ...d }));
  };
  const txt = (k: string, label: string, rows = 2, hint?: string) => (
    <label className="block text-sm">
      <span className="block font-medium">{label}</span>
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      <Textarea rows={rows} disabled={locked} value={f[k] ?? ""} onChange={(e) => set(k, e.target.value)} />
    </label>
  );
  const dg = draftGaps(f);
  return (
    <fieldset disabled={locked} className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <h3 className="font-display text-lg">Qualification</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm"><span className="block font-medium">Signal type</span>
            <select className={selectCls + " w-full"} value={f.signal_type ?? ""} onChange={(e) => set("signal_type", e.target.value || null)}>
              <option value="">Choose…</option>
              {["relocation", "new_branch", "ordering_gap", "new_opening", "menu_update", "website_issue", "other"].map((o) => <option key={o}>{o}</option>)}
            </select></label>
          <label className="text-sm"><span className="block font-medium">Signal date</span>
            <Input type="date" value={f.signal_date ?? ""} onChange={(e) => set("signal_date", e.target.value || null)} /></label>
        </div>
        {txt("signal_summary", "Fresh buying signal")}
        {txt("observation", "Verified observation / problem", 2, "Something you checked yourself on a public page.")}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f.observation_verified} onChange={(e) => set("observation_verified", e.target.checked)} /> I verified this observation on the source</label>
        {txt("source_urls_text", "Source URLs (one per line)", 2, "Public pages supporting the signal and the contact route.")}
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm"><span className="block font-medium">Public contact route</span>
            <Input value={f.contact_route ?? ""} onChange={(e) => set("contact_route", e.target.value)} /></label>
          <label className="text-sm"><span className="block font-medium">Route type</span>
            <select className={selectCls + " w-full"} value={f.contact_route_type ?? ""} onChange={(e) => set("contact_route_type", e.target.value || null)}>
              <option value="">Choose…</option>
              <option value="email">Public email</option>
              <option value="phone">Public phone (not WhatsApp)</option>
              <option value="whatsapp_verified">WhatsApp — verified by source</option>
              <option value="instagram_dm">Instagram DM</option>
              <option value="contact_form">Website contact form</option>
              <option value="other">Other</option>
            </select></label>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f.contact_verified} onChange={(e) => set("contact_verified", e.target.checked)} /> Contact route is published by the business itself</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f.opted_in} onChange={(e) => set("opted_in", e.target.checked)} /> Contact opted in / reached out to us first</label>
        <label className="block text-sm"><span className="block font-medium">Contact suitability / role</span>
          <Input value={f.contact_role ?? ""} placeholder="e.g. Owner (named on About page) or Unknown — general contact" onChange={(e) => set("contact_role", e.target.value)} /></label>
        {txt("solution_angle", "Jahjah solution / demo angle")}
        <label className="block text-sm"><span className="block font-medium">Relevant proof / demo</span>
          <select className={selectCls + " w-full"} value={f.proof_slug ?? ""} onChange={(e) => set("proof_slug", e.target.value || null)}>
            <option value="">None</option>
            {proofs.map((x) => <option key={x.slug} value={x.slug}>{x.name} — {x.category}</option>)}
          </select>
          {proof && <a href={proof.url} target="_blank" rel="noreferrer" className="text-xs underline">{proof.url}</a>}
          <span className="block text-xs text-muted-foreground">Only published Jahjah work. Match ordering leads to ordering work and multi-branch leads to multi-branch work.</span>
        </label>
      </div>
      <div className="space-y-3">
        <h3 className="font-display text-lg">Personalization & drafts</h3>
        {txt("consequence", "Likely business consequence", 2, "Cautious wording (\"may\", \"could\"); no revenue claims.")}
        <label className="block text-sm"><span className="block font-medium">Low-friction CTA</span>
          <Input value={f.cta ?? ""} onChange={(e) => set("cta", e.target.value)} /></label>
        <Button type="button" variant="outline" onClick={generate}>Build drafts: Observation → Consequence → Idea → CTA</Button>
        {txt("email_first", "Email — first message", 6)}
        {txt("email_follow_up", "Email — follow-up (one, value-adding)", 4)}
        {txt("dm_first", `WhatsApp/DM — first message (${(f.dm_first ?? "").length}/${DM_MAX_CHARS})`, 3)}
        {txt("dm_follow_up", `WhatsApp/DM — follow-up (${(f.dm_follow_up ?? "").length}/${DM_MAX_CHARS})`, 2)}
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm"><span className="block font-medium">Preferred channel</span>
            <select className={selectCls + " w-full"} value={f.preferred_channel ?? ""} onChange={(e) => set("preferred_channel", e.target.value || null)}>
              <option value="">Choose…</option><option value="email">Email</option><option value="whatsapp">WhatsApp</option><option value="instagram_dm">Instagram DM</option>
            </select></label>
          <label className="text-sm"><span className="block font-medium">Reply classification</span>
            <select className={selectCls + " w-full"} value={f.reply_classification ?? ""} onChange={(e) => set("reply_classification", e.target.value || null)}>
              <option value="">Not classified</option><option value="positive">Positive</option><option value="neutral">Neutral</option><option value="not_now">Not now</option><option value="negative">Negative</option>
            </select></label>
        </div>
        {dg.length > 0 && <p className="text-xs text-destructive">{dg.join(" · ")}</p>}
        <Button type="button" onClick={() => m.mutate()} disabled={m.isPending || locked}>Save research & drafts</Button>
        {rec.status === "approved" && <p className="text-xs text-muted-foreground">Editing message content sends it back to Needs Approval.</p>}
      </div>
    </fieldset>
  );
}

function Transitions({ prospectId, rec, settings }: { prospectId: string; rec: any; settings: Board["settings"] }) {
  const qc = useQueryClient();
  const setStatus = useServerFn(setOutreachStatus);
  const [channel, setChannel] = useState<"email" | "whatsapp" | "instagram_dm">(rec.preferred_channel ?? "email");
  const m = useMutation({
    mutationFn: (to: OutreachStatus) => setStatus({ data: { prospectId, to, ...(to === "sent" ? { channel } : {}) } }),
    onSuccess: () => { toast.success("Status updated"); qc.invalidateQueries({ queryKey: KEY }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const next = allowedNext(rec);
  const ready = !!(settings as any)?.readiness_confirmed;
  const canSend = ready && rec.status === "approved";
  return (
    <div className="mt-6 border-t border-border pt-4">
      <h3 className="font-display text-lg">Pipeline</h3>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {next.includes("sent") && (
          <label className="text-sm">
            <span className="mr-2 text-muted-foreground">Channel used</span>
            <select className={selectCls} value={channel} onChange={(e) => setChannel(e.target.value as any)}>
              <option value="email">Email</option><option value="whatsapp">WhatsApp</option><option value="instagram_dm">Instagram DM</option>
            </select>
          </label>
        )}
        {next.map((s) => (
          <Button key={s} size="sm" variant={s === "do_not_contact" ? "destructive" : "outline"} disabled={m.isPending}
            onClick={() => {
              if (s === "do_not_contact" && !confirm("Do Not Contact is permanent. Continue?")) return;
              m.mutate(s);
            }}>
            {s === "sent" ? "Record manual send" : `Move to ${STATUS_LABEL[s]}`}
          </Button>
        ))}
        {!next.length && <span className="text-sm text-muted-foreground">No further steps.</span>}
        <Button size="sm" disabled title={canSend ? "No sending service is connected" : "Requires confirmed email readiness and Approved status"}>
          Send email (disabled)
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {canSend
          ? "Approved and readiness confirmed, but no sending service is connected — send manually, then record it."
          : "Sending stays disabled until email readiness is confirmed and this prospect is Approved. No sending service is connected yet."}
      </p>
    </div>
  );
}

function History({ row }: { row: Row }) {
  if (!row.history.length) return <p className="mt-4 text-xs text-muted-foreground">No outreach history yet.</p>;
  return (
    <details className="mt-4 text-sm">
      <summary className="cursor-pointer font-medium">Outreach history ({row.history.length})</summary>
      <ol className="mt-2 space-y-1">
        {row.history.map((e: any) => (
          <li key={e.id} className="text-muted-foreground">
            {String(e.created_at).slice(0, 16).replace("T", " ")} · {e.event_type.replace(/_/g, " ")}
            {e.channel ? ` · ${e.channel}` : ""}
            {e.from_status !== e.to_status && e.to_status ? ` · ${STATUS_LABEL[e.from_status as OutreachStatus] ?? e.from_status} → ${STATUS_LABEL[e.to_status as OutreachStatus] ?? e.to_status}` : ""}
          </li>
        ))}
      </ol>
    </details>
  );
}
