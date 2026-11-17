import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, ExternalLink, MessageCircle } from "lucide-react";
import { AdminNav } from "@/components/platform/AdminNav";
import {
  addLeadNote,
  extendLeadPreview,
  generateLeadConcept,
  getLeadDetail,
  markLeadContacted,
  runLeadAudit,
  scheduleLeadFollowUp,
  setLeadStage,
  STAGE_ORDER,
  updateLead,
} from "@/lib/leads.functions";
import { priorityLabel, priorityTone } from "@/lib/leads/scoring";
import { buildWhatsAppLink } from "@/lib/leads/whatsapp";

export const Route = createFileRoute("/_authenticated/admin/leads/$id")({
  component: LeadDetailPage,
});

function LeadDetailPage() {
  const { id } = Route.useParams();
  const fetchDetail = useServerFn(getLeadDetail);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-lead", id],
    queryFn: () =>
      fetchDetail({
        data: { id, origin: typeof window !== "undefined" ? window.location.origin : undefined },
      }),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-lead", id] });

  const stageFn = useServerFn(setLeadStage);
  const noteFn = useServerFn(addLeadNote);
  const followUpFn = useServerFn(scheduleLeadFollowUp);
  const contactedFn = useServerFn(markLeadContacted);
  const auditFn = useServerFn(runLeadAudit);

  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState("");

  const stageMutation = useMutation({
    mutationFn: (stage: string) => stageFn({ data: { id, stage: stage as any } }),
    onSuccess: () => {
      toast.success("Stage updated.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update stage."),
  });
  const noteMutation = useMutation({
    mutationFn: () => noteFn({ data: { id, note } }),
    onSuccess: () => {
      toast.success("Note added.");
      setNote("");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add note."),
  });
  const followUpMutation = useMutation({
    mutationFn: () => followUpFn({ data: { id, date: followUp } }),
    onSuccess: () => {
      toast.success("Follow-up scheduled.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not schedule follow-up."),
  });
  const contactedMutation = useMutation({
    mutationFn: () => contactedFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Marked contacted.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update."),
  });
  const auditMutation = useMutation({
    mutationFn: () => auditFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Audit complete.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Audit failed."),
  });

  const conceptFn = useServerFn(generateLeadConcept);
  const extendFn = useServerFn(extendLeadPreview);
  const updateFn = useServerFn(updateLead);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoUrlTouched, setLogoUrlTouched] = useState(false);

  const conceptMutation = useMutation({
    mutationFn: () => conceptFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Private concept generated — 24h preview window opened.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not generate a concept."),
  });
  const extendMutation = useMutation({
    mutationFn: () => extendFn({ data: { id, hours: 24 } }),
    onSuccess: () => {
      toast.success("Preview extended 24h.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not extend."),
  });
  const brandMutation = useMutation({
    mutationFn: (patch: { logo_url?: string; brand_verified?: boolean }) =>
      updateFn({ data: { id, patch } }),
    onSuccess: () => {
      toast.success("Brand facts saved.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save."),
  });

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav active="/admin/leads" />
        <Center>You do not have access to the admin console.</Center>
      </div>
    );
  }
  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav active="/admin/leads" />
        <Center>Loading prospect…</Center>
      </div>
    );
  }

  const {
    prospect,
    activities,
    outreachMessage,
    strongOutreachMessage,
    followUpMessages,
    publicUrl,
    angleLabel,
  } = data;
  const label = priorityLabel(prospect.opportunity_score);

  return (
    <div className="min-h-screen bg-background">
      <AdminNav active="/admin/leads" />
      <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl">{prospect.business_name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {prospect.category ?? "—"} · {prospect.city ?? "—"}, {prospect.country}
            </p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-sm ${priorityTone(label)}`}>
            {prospect.opportunity_score}/100 · {label}
          </span>
        </div>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Panel title="Business facts">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <Fact label="Website">
                  {prospect.website_url ? (
                    <a
                      href={prospect.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-champagne hover:underline"
                    >
                      {prospect.website_url}
                    </a>
                  ) : (
                    "None"
                  )}
                </Fact>
                <Fact label="Website status">{prospect.website_status.replace(/_/g, " ")}</Fact>
                <Fact label="Google">
                  {prospect.google_rating
                    ? `${prospect.google_rating}★ (${prospect.google_reviews_count ?? 0} reviews)`
                    : "—"}
                </Fact>
                <Fact label="Instagram">
                  {prospect.instagram_url ? (
                    <a
                      href={prospect.instagram_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-champagne hover:underline"
                    >
                      {prospect.instagram_followers
                        ? `${prospect.instagram_followers.toLocaleString()} followers`
                        : "Profile"}
                    </a>
                  ) : (
                    "—"
                  )}
                </Fact>
                <Fact label="Phone">{prospect.phone ?? "—"}</Fact>
                <Fact label="WhatsApp">{prospect.whatsapp ?? "—"}</Fact>
                <Fact label="Email">{prospect.email ?? "—"}</Fact>
                <Fact label="Lead source">{prospect.lead_source}</Fact>
              </dl>
              {prospect.description && (
                <p className="mt-4 text-sm text-muted-foreground">{prospect.description}</p>
              )}
            </Panel>

            <Panel title="Opportunity score breakdown">
              <ul className="space-y-2 text-sm">
                {(prospect.score_breakdown ?? []).map((b: any, i: number) => (
                  <li
                    key={i}
                    className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0"
                  >
                    <span className="text-muted-foreground">{b.label}</span>
                    <span className="text-champagne">+{b.points}</span>
                  </li>
                ))}
                {(prospect.score_breakdown ?? []).length === 0 && (
                  <p className="text-muted-foreground">No scoring signals yet.</p>
                )}
              </ul>
            </Panel>

            <Panel title="Advisor diagnosis &amp; recommendation">
              <p className="text-xs uppercase tracking-[0.15em] text-champagne">{angleLabel}</p>
              {prospect.identified_gap && (
                <p className="mt-3 text-sm text-foreground">{prospect.identified_gap}</p>
              )}
              {prospect.snapshot_submitted_at ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <Fact label="Sales range">
                      {prospect.monthly_sales_range?.replace(/_/g, " ") ?? "—"}
                    </Fact>
                    <Fact label="Avg order value">
                      {prospect.avg_order_value ? `$${prospect.avg_order_value}` : "—"}
                    </Fact>
                    <Fact label="Goal">{prospect.primary_goal ?? "—"}</Fact>
                    <Fact label="Recommended package">{prospect.recommended_tier ?? "—"}</Fact>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <Fact label="Conservative/mo">
                      {prospect.scenario_conservative_monthly
                        ? `$${Math.round(prospect.scenario_conservative_monthly)}`
                        : "—"}
                    </Fact>
                    <Fact label="Expected/mo">
                      {prospect.scenario_expected_monthly
                        ? `$${Math.round(prospect.scenario_expected_monthly)}`
                        : "—"}
                    </Fact>
                    <Fact label="High/mo">
                      {prospect.scenario_high_monthly
                        ? `$${Math.round(prospect.scenario_high_monthly)}`
                        : "—"}
                    </Fact>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">
                  No business snapshot submitted yet — opportunity scenarios appear here once the
                  prospect completes it on their study page.
                </p>
              )}
            </Panel>

            <Panel title="Brand facts &amp; private concept">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs">
                  Logo URL (admin-verified only)
                  <input
                    className="input-luxe mt-1"
                    value={logoUrlTouched ? logoUrl : (prospect.logo_url ?? "")}
                    onChange={(e) => {
                      setLogoUrlTouched(true);
                      setLogoUrl(e.target.value);
                    }}
                    placeholder="https://…"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={Boolean(prospect.brand_verified)}
                    onChange={(e) => brandMutation.mutate({ brand_verified: e.target.checked })}
                  />
                  Brand verified — logo may be shown to the prospect
                </label>
              </div>
              <button
                type="button"
                onClick={() =>
                  brandMutation.mutate({ logo_url: logoUrlTouched ? logoUrl : prospect.logo_url })
                }
                disabled={brandMutation.isPending || !logoUrlTouched}
                className="mt-2 rounded-sm border border-border px-3 py-1.5 text-xs hover:border-champagne/40 disabled:opacity-40"
              >
                Save logo URL
              </button>

              <div className="mt-5 border-t border-border/50 pt-4">
                {prospect.concept_generated_at ? (
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p>
                      Concept generated {new Date(prospect.concept_generated_at).toLocaleString()}
                    </p>
                    <p>
                      Preview expires:{" "}
                      {prospect.preview_expires_at
                        ? new Date(prospect.preview_expires_at).toLocaleString()
                        : "—"}
                    </p>
                    <p>Direction selected: {prospect.direction_selected?.toUpperCase() ?? "—"}</p>
                    {prospect.edit_request_note && (
                      <p>Edit request: {prospect.edit_request_note}</p>
                    )}
                    {prospect.owner_attention_required && (
                      <p className="text-champagne">
                        Owner attention required — {prospect.owner_attention_reason}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No concept generated yet.</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => conceptMutation.mutate()}
                    disabled={conceptMutation.isPending}
                    className="rounded-sm bg-champagne px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-40"
                  >
                    {conceptMutation.isPending ? "Generating…" : "Generate Private Concept"}
                  </button>
                  <button
                    type="button"
                    onClick={() => extendMutation.mutate()}
                    disabled={extendMutation.isPending}
                    className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-champagne/40 disabled:opacity-40"
                  >
                    Extend Preview 24h
                  </button>
                </div>
              </div>
            </Panel>

            <Panel title="Website audit">
              <button
                type="button"
                onClick={() => auditMutation.mutate()}
                disabled={!prospect.website_url || auditMutation.isPending}
                className="rounded-sm border border-champagne/50 px-4 py-2 text-xs text-champagne hover:bg-surface disabled:opacity-40"
              >
                {auditMutation.isPending ? "Auditing…" : "Run website audit"}
              </button>
              {!prospect.website_url && (
                <p className="mt-2 text-xs text-muted-foreground">
                  High Opportunity — No Website Detected.
                </p>
              )}
              {prospect.audit_result && (
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                  {Object.entries(prospect.audit_result)
                    .filter(([k]) => !["checkedUrl", "checkedAt", "error"].includes(k))
                    .map(([k, v]) => (
                      <div
                        key={k}
                        className="rounded-sm border border-border bg-surface/30 px-3 py-2"
                      >
                        <p className="text-muted-foreground">{k}</p>
                        <p className="mt-1">{v === null ? "unknown" : String(v)}</p>
                      </div>
                    ))}
                  {prospect.audit_result.error && (
                    <p className="col-span-full text-muted-foreground">
                      {prospect.audit_result.error}
                    </p>
                  )}
                </div>
              )}
            </Panel>

            <Panel title="Timeline">
              <ul className="space-y-3 text-sm">
                {activities.map((a: any) => (
                  <li key={a.id} className="border-b border-border/50 pb-3 last:border-0">
                    <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                      {a.activity_type.replace(/_/g, " ")} ·{" "}
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                    {a.message && <p className="mt-1">{a.message}</p>}
                  </li>
                ))}
                {activities.length === 0 && (
                  <p className="text-muted-foreground">No activity yet.</p>
                )}
              </ul>
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (note.trim()) noteMutation.mutate();
                }}
              >
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note…"
                  className="input-luxe"
                />
                <button
                  type="submit"
                  disabled={noteMutation.isPending}
                  className="shrink-0 rounded-sm border border-border px-4 py-2 text-xs hover:border-champagne/40"
                >
                  Add
                </button>
              </form>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Pipeline stage">
              <select
                className="input-luxe"
                value={prospect.stage}
                onChange={(e) => stageMutation.mutate(e.target.value)}
                disabled={stageMutation.isPending}
              >
                {STAGE_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </Panel>

            <Panel title="Follow-up">
              <div className="flex gap-2">
                <input
                  type="date"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  className="input-luxe"
                />
                <button
                  type="button"
                  onClick={() => followUp && followUpMutation.mutate()}
                  className="shrink-0 rounded-sm border border-border px-4 py-2 text-xs hover:border-champagne/40"
                >
                  Set
                </button>
              </div>
              {prospect.next_follow_up_date && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Next: {prospect.next_follow_up_date}
                </p>
              )}
            </Panel>

            <Panel title="Advisor outreach">
              <OutreachMessages
                messages={{
                  Advisor: outreachMessage,
                  Strong: strongOutreachMessage,
                  "Follow-up 1": followUpMessages[0]!,
                  "Follow-up 2": followUpMessages[1]!,
                  "Follow-up 3": followUpMessages[2]!,
                }}
                phone={prospect.whatsapp || prospect.phone}
                onContacted={() => contactedMutation.mutate()}
                contactedPending={contactedMutation.isPending}
              />
            </Panel>

            <Panel title="Personalized page">
              <p className="text-xs text-muted-foreground">
                Secure, non-guessable link — safe to send.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <input readOnly value={publicUrl} className="input-luxe text-xs" />
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-sm border border-border p-2 hover:border-champagne/40"
                >
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </Panel>
          </div>
        </section>
      </main>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface/30 p-5">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function OutreachMessages({
  messages,
  phone,
  onContacted,
  contactedPending,
}: {
  messages: Record<string, string>;
  phone?: string | null;
  onContacted: () => void;
  contactedPending: boolean;
}) {
  const tabs = Object.keys(messages);
  const [active, setActive] = useState(tabs[0]!);
  const message = messages[active]!;
  const whatsappLink = buildWhatsAppLink(phone, message);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActive(t)}
            className={`rounded-full border px-3 py-1 text-[11px] ${
              active === t
                ? "border-champagne bg-surface text-champagne"
                : "border-border text-muted-foreground hover:border-champagne/40"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <pre className="mt-3 whitespace-pre-wrap rounded-sm border border-border bg-surface/50 p-3 text-xs">
        {message}
      </pre>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(message);
            toast.success("Message copied.");
          }}
          className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs hover:border-champagne/40"
        >
          <Copy className="size-3.5" /> Copy
        </button>
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm bg-champagne px-3 py-1.5 text-xs text-primary-foreground"
          >
            <MessageCircle className="size-3.5" /> Open WhatsApp
          </a>
        )}
        <button
          type="button"
          onClick={onContacted}
          disabled={contactedPending}
          className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-champagne/40"
        >
          Mark contacted
        </button>
      </div>
      {!whatsappLink && (
        <p className="mt-2 text-xs text-muted-foreground">
          No phone/WhatsApp on file — add one to enable the WhatsApp link.
        </p>
      )}
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
