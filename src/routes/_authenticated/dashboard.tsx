import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTrackEvent } from "@/hooks/use-track-event";
import { PreviewCanvas } from "@/components/platform/PreviewCanvas";
import type { GeneratedSpec } from "@/lib/generator";
import {
  amIAdmin,
  checkDomain,
  createGeneration,
  createOrder,
  getDomainSuggestions,
  getWorkspace,
  requestPublish,
  saveIdentity,
  selectDomain,
  selectGeneration,
  updateSelectedAddons,
} from "@/lib/platform.functions";
import { submitWhishPayment } from "@/lib/payments.functions";
import {
  DIRECTIONS,
  EXTRA_TRIAL_PRICE_CENTS,
  INCLUDED_TRIALS,
  MONTHLY_CARE_PRICE_CENTS,
  TIER_LABEL,
  TIER_LIMITS,
  TIER_ORDER,
  TIER_PRICE_CENTS,
  WHISH_INSTRUCTIONS,
  WHISH_NUMBER,
  tierRank,
  upgradePriceCents,
  usd,
  type Tier,
} from "@/lib/platform";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

// Any domain state past the customer's initial pick — a real state machine
// step happened, even though the site may still be far from live.
const ACTIVE_DOMAIN_STATUSES = new Set([
  "requested",
  "selected",
  "verified",
  "dns_pending",
  "dns_configured",
  "tls_active",
  "live",
]);

const TABS = [
  "Overview",
  "Company identity",
  "Website builder",
  "Trials & revisions",
  "Domain",
  "Package & upgrade",
  "Billing",
  "Launch",
] as const;
type Tab = (typeof TABS)[number];

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchWorkspace = useServerFn(getWorkspace);
  const fetchAdmin = useServerFn(amIAdmin);
  const [tab, setTab] = useState<Tab>("Overview");

  const { data, isLoading, error } = useQuery({
    queryKey: ["workspace"],
    queryFn: () => fetchWorkspace({}),
  });
  const { data: adminFlag } = useQuery({ queryKey: ["am-i-admin"], queryFn: () => fetchAdmin({}) });

  useEffect(() => {
    if (!isLoading && data && !data.project) navigate({ to: "/onboarding" });
  }, [data, isLoading, navigate]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["workspace"] });

  if (isLoading) return <Center>Loading your workspace…</Center>;
  if (error) return <Center>We could not load your workspace. Please refresh the page.</Center>;
  if (!data?.project || !data.company) return <Center>Preparing your project…</Center>;

  const project = data.project;
  const company = data.company;
  const tier = project.tier as Tier;
  const allowed = INCLUDED_TRIALS + project.extra_trials_purchased;
  const remaining = Math.max(0, allowed - project.trials_used);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link to="/" className="font-display text-lg">
            Jahjah <span className="text-champagne">WebDigital</span>
          </Link>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {adminFlag?.admin && (
              <Link to="/admin" className="text-champagne hover:underline">
                Admin
              </Link>
            )}
            <span className="hidden sm:inline">{company.name}</span>
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                queryClient.clear();
                navigate({ to: "/" });
              }}
              className="rounded-sm border border-border px-3 py-1.5 transition-colors hover:border-champagne/50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10 lg:flex-row">
        <nav className="flex gap-2 overflow-x-auto lg:w-56 lg:flex-col lg:overflow-visible">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-sm px-3 py-2 text-left text-sm transition-colors ${
                tab === t
                  ? "bg-surface text-champagne"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        <main className="min-w-0 flex-1">
          {tab === "Overview" && <Overview data={data} onGo={setTab} />}
          {tab === "Company identity" && (
            <Identity company={company} tier={tier} onSaved={refresh} />
          )}
          {tab === "Website builder" && <Builder data={data} onDone={refresh} />}
          {tab === "Trials & revisions" && (
            <Trials data={data} remaining={remaining} allowed={allowed} onDone={refresh} />
          )}
          {tab === "Domain" && <DomainPanel data={data} onDone={refresh} />}
          {tab === "Package & upgrade" && <Upgrade data={data} onDone={refresh} />}
          {tab === "Billing" && <Billing data={data} onDone={refresh} />}
          {tab === "Launch" && <Publish data={data} onDone={refresh} />}
        </main>
      </div>
    </div>
  );
}

type Workspace = Awaited<ReturnType<typeof getWorkspace>>;

function Overview({ data, onGo }: { data: Workspace; onGo: (t: Tab) => void }) {
  const project = data.project!;
  const company = data.company!;
  const tier = project.tier as Tier;
  const allowed = INCLUDED_TRIALS + project.extra_trials_purchased;
  const steps = [
    { label: "Company registered", done: true, tab: "Company identity" as Tab },
    { label: "Package paid", done: project.paid, tab: "Billing" as Tab },
    {
      label: "Business identity completed",
      done: company.identity_completed,
      tab: "Company identity" as Tab,
    },
    {
      label: "Website generated",
      done: Boolean(project.selected_generation_id),
      tab: "Website builder" as Tab,
    },
    {
      label: "Domain requested",
      done: data.domains.some((d: any) => ACTIVE_DOMAIN_STATUSES.has(d.status)),
      tab: "Domain" as Tab,
    },
    {
      label: "Launch requested",
      done: project.status === "launch_requested" || project.status === "published",
      tab: "Launch" as Tab,
    },
    { label: "Live", done: project.status === "published", tab: "Launch" as Tab },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl">{company.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {TIER_LABEL[tier]} package · {usd(TIER_PRICE_CENTS[tier])} one-time build · +{usd(MONTHLY_CARE_PRICE_CENTS)}/month after launch ·{" "}
          {project.status.replace(/_/g, " ")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Trials used" value={`${project.trials_used} / ${allowed}`} />
        <Stat label="Pages included" value={String(TIER_LIMITS[tier].pages)} />
        <Stat label="Payment" value={project.paid ? "Settled" : "Outstanding"} />
      </div>

      <div className="rounded-lg border border-border bg-surface/40 p-6">
        <h2 className="font-display text-2xl">Your build path</h2>
        <ul className="mt-6 space-y-3">
          {steps.map((s) => (
            <li
              key={s.label}
              className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0"
            >
              <span className={`text-sm ${s.done ? "text-foreground" : "text-muted-foreground"}`}>
                <span
                  className={`mr-3 inline-block size-2 rounded-full ${s.done ? "bg-champagne" : "bg-muted-foreground/40"}`}
                />
                {s.label}
              </span>
              <button
                type="button"
                onClick={() => onGo(s.tab)}
                className="text-xs text-champagne hover:underline"
              >
                Open
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
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

function Identity({ company, tier, onSaved }: { company: any; tier: Tier; onSaved: () => void }) {
  const save = useServerFn(saveIdentity);
  const [form, setForm] = useState({
    logo_url: company.logo_url ?? "",
    visual_direction: company.visual_direction ?? "",
    primary_color: company.primary_color ?? "",
    accent_color: company.accent_color ?? "",
    font_style: company.font_style ?? "",
    whatsapp: company.whatsapp ?? "",
    address: company.address ?? "",
    opening_hours: company.opening_hours ?? "",
    instagram_url: company.instagram_url ?? "",
    maps_url: company.maps_url ?? "",
  });

  const mutation = useMutation({
    mutationFn: () => save({ data: form }),
    onSuccess: () => {
      toast.success("Business identity saved.");
      onSaved();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save."),
  });

  const directions = DIRECTIONS.filter((d) => d.tiers.includes(tier));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Business identity</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          This is what your website is built from: your look, tone and the practical details
          customers need.
        </p>
      </div>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <div>
          <span className="mb-3 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Preferred direction
          </span>
          <div className="grid gap-3 sm:grid-cols-2">
            {directions.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setForm({ ...form, visual_direction: d.key })}
                className={`rounded-sm border p-4 text-left transition-colors ${
                  form.visual_direction === d.key
                    ? "border-champagne bg-surface"
                    : "border-border bg-surface/30 hover:border-champagne/40"
                }`}
              >
                <span className="block text-sm">{d.name}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{d.note}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Text
            label="Logo URL"
            value={form.logo_url}
            onChange={(v) => setForm({ ...form, logo_url: v })}
          />
          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Typography
            </span>
            <select
              value={form.font_style}
              onChange={(e) => setForm({ ...form, font_style: e.target.value })}
              className="input-luxe"
            >
              <option value="" className="bg-surface">
                Studio recommendation
              </option>
              <option value="modern-sans" className="bg-surface">
                Modern sans
              </option>
              <option value="editorial-serif" className="bg-surface">
                Editorial serif
              </option>
            </select>
          </label>
          <Text
            label="Brand colour (hex)"
            value={form.primary_color}
            onChange={(v) => setForm({ ...form, primary_color: v })}
          />
          <Text
            label="Accent colour (hex)"
            value={form.accent_color}
            onChange={(v) => setForm({ ...form, accent_color: v })}
          />
          <Text
            label="WhatsApp number"
            value={form.whatsapp}
            onChange={(v) => setForm({ ...form, whatsapp: v })}
          />
          <Text
            label="Instagram"
            value={form.instagram_url}
            onChange={(v) => setForm({ ...form, instagram_url: v })}
          />
          <Text
            label="Address"
            value={form.address}
            onChange={(v) => setForm({ ...form, address: v })}
          />
          <Text
            label="Google Maps link"
            value={form.maps_url}
            onChange={(v) => setForm({ ...form, maps_url: v })}
          />
        </div>

        <label className="block">
          <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Opening hours
          </span>
          <textarea
            rows={3}
            value={form.opening_hours}
            onChange={(e) => setForm({ ...form, opening_hours: e.target.value })}
            className="input-luxe"
            placeholder="Mon–Sat 9:00–19:00"
          />
        </label>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-sm bg-champagne px-8 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {mutation.isPending ? "Saving…" : "Save identity"}
        </button>
      </form>
    </div>
  );
}

function Text({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="input-luxe" />
    </label>
  );
}

function Builder({ data, onDone }: { data: Workspace; onDone: () => void }) {
  const project = data.project!;
  const company = data.company!;
  const tier = project.tier as Tier;
  const generate = useServerFn(createGeneration);
  const pick = useServerFn(selectGeneration);
  const directions = useMemo(() => DIRECTIONS.filter((d) => d.tiers.includes(tier)), [tier]);
  const [direction, setDirection] = useState(company.visual_direction ?? directions[0]!.key);

  const allowed = INCLUDED_TRIALS + project.extra_trials_purchased;
  const remaining = Math.max(0, allowed - project.trials_used);

  const gen = useMutation({
    mutationFn: () => generate({ data: { direction } }),
    onSuccess: () => {
      toast.success("Your website has been generated.");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Generation failed."),
  });

  const choose = useMutation({
    mutationFn: (generationId: string) => pick({ data: { generationId } }),
    onSuccess: () => {
      toast.success("Design selected.");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not select this design."),
  });

  const selected = data.generations.find((g: any) => g.id === project.selected_generation_id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Website builder</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Choose a direction and generate a complete website from your business identity.{" "}
          {remaining} of {allowed} trials remaining.
        </p>
      </div>

      {!project.paid && (
        <Notice>
          Payment for your {TIER_LABEL[tier]} package is required before generating your website.
        </Notice>
      )}
      {!company.identity_completed && <Notice>Complete your business identity first.</Notice>}

      <div className="grid gap-3 sm:grid-cols-2">
        {directions.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => setDirection(d.key)}
            className={`rounded-sm border p-4 text-left transition-colors ${
              direction === d.key
                ? "border-champagne bg-surface"
                : "border-border bg-surface/30 hover:border-champagne/40"
            }`}
          >
            <span className="block text-sm">{d.name}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{d.note}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => gen.mutate()}
        disabled={gen.isPending || remaining <= 0 || !project.paid || !company.identity_completed}
        className="rounded-sm bg-champagne px-8 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {gen.isPending
          ? "Generating…"
          : remaining > 0
            ? "Generate my website"
            : "No trials remaining"}
      </button>

      {selected && (
        <div>
          <h2 className="font-display text-2xl">Current preview</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Preview only. Your finished site is published by us — no source code or export is
            provided.
          </p>
          <div className="mt-5 overflow-hidden rounded-lg border border-border">
            <PreviewCanvas spec={selected.spec as GeneratedSpec} companyName={company.name} />
          </div>
        </div>
      )}

      {data.generations.length > 1 && (
        <div>
          <h2 className="font-display text-2xl">All trials</h2>
          <div className="mt-4 space-y-3">
            {data.generations.map((g: any) => (
              <div
                key={g.id}
                className="flex items-center justify-between rounded-sm border border-border bg-surface/30 px-4 py-3 text-sm"
              >
                <span>
                  Trial {g.trial_number} ·{" "}
                  {DIRECTIONS.find((d) => d.key === g.direction_key)?.name ?? g.direction_key}
                </span>
                {g.id === project.selected_generation_id ? (
                  <span className="text-xs text-champagne">Selected</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => choose.mutate(g.id)}
                    className="text-xs text-champagne hover:underline"
                  >
                    Use this design
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Trials({
  data,
  remaining,
  allowed,
  onDone,
}: {
  data: Workspace;
  remaining: number;
  allowed: number;
  onDone: () => void;
}) {
  const order = useServerFn(createOrder);
  const buy = useMutation({
    mutationFn: () => order({ data: { kind: "extra_trial" as const } }),
    onSuccess: (res) => {
      toast.message(res.message);
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not start the purchase."),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Trials & revisions</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Every package includes {INCLUDED_TRIALS} trials. Each additional trial is{" "}
          {usd(EXTRA_TRIAL_PRICE_CENTS)}, one-time.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Included" value={String(INCLUDED_TRIALS)} />
        <Stat label="Used" value={String(data.project!.trials_used)} />
        <Stat label="Remaining" value={`${remaining} / ${allowed}`} />
      </div>

      <div className="space-y-3">
        {data.generations.map((g: any) => (
          <div
            key={g.id}
            className="flex items-center justify-between rounded-sm border border-border bg-surface/30 px-4 py-3 text-sm"
          >
            <span>
              Trial {g.trial_number} —{" "}
              {DIRECTIONS.find((d) => d.key === g.direction_key)?.name ?? g.direction_key}
            </span>
            <span className="text-xs text-muted-foreground">
              {g.billable ? `Paid trial · ${usd(EXTRA_TRIAL_PRICE_CENTS)}` : "Included"}
            </span>
          </div>
        ))}
        {data.generations.length === 0 && (
          <p className="text-sm text-muted-foreground">No trials generated yet.</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => buy.mutate()}
        className="rounded-sm border border-champagne/50 px-8 py-3 text-sm text-champagne transition-colors hover:bg-surface"
      >
        Buy an additional trial — {usd(EXTRA_TRIAL_PRICE_CENTS)}
      </button>
      {!data.paymentsConfigured && (
        <Notice>A payment provider is not connected yet, so purchases cannot be completed.</Notice>
      )}
    </div>
  );
}

function DomainPanel({ data, onDone }: { data: Workspace; onDone: () => void }) {
  const check = useServerFn(checkDomain);
  const select = useServerFn(selectDomain);
  const fetchSuggestions = useServerFn(getDomainSuggestions);
  const [domain, setDomain] = useState("");

  const { data: suggestions } = useQuery({
    queryKey: ["domain-suggestions"],
    queryFn: () => fetchSuggestions({}),
  });

  const request = useMutation({
    mutationFn: (value: string) => check({ data: { domain: value } }),
    onSuccess: () => {
      toast.success("Domain request saved. Our team will confirm availability.");
      setDomain("");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Invalid domain."),
  });

  const choose = useMutation({
    mutationFn: (requestId: string) => select({ data: { requestId } }),
    onSuccess: () => {
      toast.success("Domain set as your launch target. Our team verifies it before going live.");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not select this domain."),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Domain</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Request the domain you want for your website. Registration fees are charged separately by
          the registrar.
        </p>
      </div>

      {!data.domainProviderConfigured && (
        <Notice>
          No domain registrar is connected to the platform yet, so live availability cannot be
          checked automatically. Your request is recorded and our team confirms availability
          manually.
        </Notice>
      )}

      {suggestions && suggestions.candidates.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Your best domain options
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {suggestions.candidates.map((c) => (
              <div key={c.domain} className="rounded-sm border border-border bg-surface/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  {c.label}
                </p>
                <p className="mt-1 font-display text-lg">{c.domain}</p>
                <button
                  type="button"
                  onClick={() => request.mutate(c.domain)}
                  disabled={request.isPending}
                  className="mt-3 w-full rounded-sm border border-champagne/40 py-2 text-xs uppercase tracking-[0.15em] text-champagne disabled:opacity-60"
                >
                  Use This Domain
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{suggestions.note}</p>
        </div>
      )}

      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          request.mutate(domain);
        }}
      >
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="yourcompany.com"
          className="input-luxe sm:max-w-sm"
          required
        />
        <button
          type="submit"
          disabled={request.isPending}
          className="rounded-sm bg-champagne px-6 py-3 text-sm text-primary-foreground disabled:opacity-60"
        >
          {request.isPending ? "Submitting…" : "Request domain"}
        </button>
      </form>

      <div className="space-y-3">
        {data.domains.map((d: any) => (
          <div
            key={d.id}
            className="flex items-center justify-between rounded-sm border border-border bg-surface/30 px-4 py-3 text-sm"
          >
            <span>{d.domain}</span>
            <span className="flex items-center gap-4 text-xs text-muted-foreground">
              {d.status.replace(/_/g, " ")}
              {!ACTIVE_DOMAIN_STATUSES.has(d.status) && (
                <button
                  type="button"
                  onClick={() => choose.mutate(d.id)}
                  className="text-champagne hover:underline"
                >
                  Select
                </button>
              )}
            </span>
          </div>
        ))}
        {data.domains.length === 0 && (
          <p className="text-sm text-muted-foreground">No domain requested yet.</p>
        )}
      </div>
    </div>
  );
}

function Upgrade({ data, onDone }: { data: Workspace; onDone: () => void }) {
  const project = data.project!;
  const tier = project.tier as Tier;
  const order = useServerFn(createOrder);
  const buy = useMutation({
    mutationFn: (target: Tier) => order({ data: { kind: "upgrade" as const, targetTier: target } }),
    onSuccess: (res) => {
      toast.message(res.message);
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not start the upgrade."),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Package & upgrade</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          You are on {TIER_LABEL[tier]}. Upgrade at any time and pay only the difference.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {TIER_ORDER.map((t) => {
          const isCurrent = t === tier;
          const higher = tierRank(t) > tierRank(tier);
          return (
            <div
              key={t}
              className={`rounded-lg border p-6 ${isCurrent ? "border-champagne bg-surface" : "border-border bg-surface/30"}`}
            >
              <h2 className="font-display text-2xl">{TIER_LABEL[t]}</h2>
              <p className="mt-2 text-champagne">{usd(TIER_PRICE_CENTS[t])}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {TIER_LIMITS[t].pages} pages · {TIER_LIMITS[t].sections} sections
              </p>
              {isCurrent && (
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-champagne">
                  Current package
                </p>
              )}
              {higher && (
                <button
                  type="button"
                  onClick={() => buy.mutate(t)}
                  className="mt-4 w-full rounded-sm border border-champagne/50 px-4 py-2 text-xs text-champagne hover:bg-surface"
                >
                  Upgrade for {usd(upgradePriceCents(tier, t))}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Billing({ data, onDone }: { data: Workspace; onDone: () => void }) {
  const project = data.project!;
  const tier = project.tier as Tier;
  const order = useServerFn(createOrder);
  const setAddons = useServerFn(updateSelectedAddons);
  const [selected, setSelected] = useState<string[]>(project.selected_addons ?? []);
  const [latestOrderId, setLatestOrderId] = useState<string | null>(
    data.orders.find((o: any) => o.kind === "package")?.id ?? null,
  );

  const addonsCatalog: any[] = data.addons ?? [];
  const addonTotal = addonsCatalog
    .filter((a) => selected.includes(a.key))
    .reduce((s, a) => s + a.price_cents, 0);
  const total = TIER_PRICE_CENTS[tier] + addonTotal;

  const saveAddons = useMutation({
    mutationFn: (keys: string[]) => setAddons({ data: { addonKeys: keys } }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save add-ons."),
  });

  function toggleAddon(key: string) {
    const next = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key];
    setSelected(next);
    saveAddons.mutate(next);
  }

  const pay = useMutation({
    mutationFn: () => order({ data: { kind: "package" as const } }),
    onSuccess: (res) => {
      toast.message(res.message);
      setLatestOrderId(res.orderId);
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not start checkout."),
  });

  const packageOrder =
    data.orders.find((o: any) => o.id === latestOrderId) ??
    data.orders.find((o: any) => o.kind === "package");
  const mySubmissions = (data.paymentSubmissions ?? []).filter(
    (s: any) => s.order_id === packageOrder?.id,
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl">Billing & orders</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Website builds, custom features and additional design trials are one-time charges. Website Care & Hosting is $99/month after launch.
        </p>
      </div>

      {!project.paid && (
        <>
          <div>
            <h2 className="font-display text-2xl">Optional extras</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Add anything else your project needs. Prices update live.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {addonsCatalog.map((a) => {
                const active = selected.includes(a.key);
                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => toggleAddon(a.key)}
                    className={`flex items-start justify-between gap-3 rounded-sm border p-4 text-left transition-colors ${
                      active
                        ? "border-champagne bg-surface"
                        : "border-border bg-surface/30 hover:border-champagne/40"
                    }`}
                  >
                    <span>
                      <span className="block text-sm">{a.name}</span>
                      {a.description && (
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {a.description}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-sm text-champagne">{usd(a.price_cents)}</span>
                  </button>
                );
              })}
              {addonsCatalog.length === 0 && (
                <p className="text-sm text-muted-foreground">No add-ons configured yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-champagne/40 bg-surface p-6">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>{TIER_LABEL[tier]} package</span>
                <span>{usd(TIER_PRICE_CENTS[tier])}</span>
              </div>
              {addonsCatalog
                .filter((a) => selected.includes(a.key))
                .map((a) => (
                  <div
                    key={a.key}
                    className="flex items-center justify-between text-muted-foreground"
                  >
                    <span>+ {a.name}</span>
                    <span>{usd(a.price_cents)}</span>
                  </div>
                ))}
              <div className="flex items-center justify-between border-t border-border pt-2 font-medium">
                <span>Total due</span>
                <span className="text-champagne">{usd(total)}</span>
              </div>
            </div>
            {!packageOrder && (
              <button
                type="button"
                onClick={() => pay.mutate()}
                disabled={pay.isPending}
                className="mt-5 rounded-sm bg-champagne px-8 py-3 text-sm text-primary-foreground disabled:opacity-60"
              >
                {pay.isPending ? "Preparing…" : "Proceed to payment"}
              </button>
            )}
          </div>

          {packageOrder && (
            <WhishPayment order={packageOrder} submissions={mySubmissions} onDone={onDone} />
          )}
        </>
      )}

      {project.paid && (
        <Notice>
          Your {TIER_LABEL[tier]} package is fully paid. Add further extras from an upgrade order if
          needed.
        </Notice>
      )}

      <div className="space-y-3">
        <h2 className="font-display text-2xl">Order history</h2>
        {data.orders.map((o: any) => (
          <div
            key={o.id}
            className="flex items-center justify-between rounded-sm border border-border bg-surface/30 px-4 py-3 text-sm"
          >
            <span>{o.description}</span>
            <span className="flex gap-4 text-xs text-muted-foreground">
              <span>{usd(o.amount_cents)}</span>
              <span>{o.status.replace(/_/g, " ")}</span>
            </span>
          </div>
        ))}
        {data.orders.length === 0 && (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        )}
      </div>
    </div>
  );
}

function WhishPayment({
  order,
  submissions,
  onDone,
}: {
  order: any;
  submissions: any[];
  onDone: () => void;
}) {
  const submit = useServerFn(submitWhishPayment);
  const track = useTrackEvent();
  const [payerName, setPayerName] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [reference, setReference] = useState("");
  const [receiptPath, setReceiptPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const latest = submissions[0];
  const alreadyVerifiedOrPending =
    latest && (latest.status === "pending" || latest.status === "verified");

  async function uploadReceipt(file: File) {
    setUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in.");
      const path = `${user.id}/receipt-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage.from("payment-receipts").upload(path, file);
      if (error) throw error;
      setReceiptPath(path);
      toast.success("Receipt uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const mutation = useMutation({
    mutationFn: () =>
      submit({
        data: {
          orderId: order.id,
          payerName,
          payerPhone,
          reference,
          receiptPath: receiptPath ?? "",
        },
      }),
    onSuccess: () => {
      track("whish_submitted");
      toast.success("Payment details submitted. We'll verify it shortly.");
      onDone();
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not submit payment details."),
  });

  return (
    <div className="rounded-lg border border-border bg-surface/30 p-6">
      <h2 className="font-display text-2xl">Pay with Whish Money</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{WHISH_INSTRUCTIONS}</p>
      <p className="mt-4 text-sm">
        Send <span className="text-champagne">{usd(order.amount_cents)}</span> to{" "}
        <span className="font-medium text-champagne">{WHISH_NUMBER}</span>
      </p>

      {latest && (
        <div className="mt-5 rounded-sm border border-border bg-surface/50 px-4 py-3 text-xs">
          <p>
            Last submission: <span className="capitalize">{latest.status.replace(/_/g, " ")}</span>
            {latest.admin_notes && (
              <span className="text-muted-foreground"> — {latest.admin_notes}</span>
            )}
          </p>
        </div>
      )}

      {!alreadyVerifiedOrPending && (
        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Payer name
            </span>
            <input
              required
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              className="input-luxe"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Payer phone
            </span>
            <input
              required
              value={payerPhone}
              onChange={(e) => setPayerPhone(e.target.value)}
              className="input-luxe"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Transaction / reference number{" "}
              <span className="normal-case tracking-normal">(optional)</span>
            </span>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="input-luxe"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Payment screenshot / receipt
            </span>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => e.target.files?.[0] && uploadReceipt(e.target.files[0])}
              className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-sm file:border-0 file:bg-surface file:px-3 file:py-2 file:text-xs"
            />
            {uploading && <span className="mt-1 block text-xs text-champagne">Uploading…</span>}
            {receiptPath && (
              <span className="mt-1 block text-xs text-champagne">Receipt attached ✓</span>
            )}
          </label>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="sm:col-span-2 rounded-sm bg-champagne px-8 py-3 text-sm text-primary-foreground disabled:opacity-60"
          >
            {mutation.isPending ? "Submitting…" : "Submit payment for verification"}
          </button>
          <p className="text-[11px] text-muted-foreground sm:col-span-2">
            Your payment stays "Pending Verification" until our team manually confirms it. We never
            mark a payment as complete automatically.
          </p>
        </form>
      )}
    </div>
  );
}

function Publish({ data, onDone }: { data: Workspace; onDone: () => void }) {
  const project = data.project!;
  const publish = useServerFn(requestPublish);
  const run = useMutation({
    mutationFn: () => publish({}),
    onSuccess: (res) => {
      toast.success(`Launch requested for ${res.domain}. Our team will confirm and deploy it.`);
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not request launch yet."),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Launch</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          No registrar or automated deployment is connected yet, so going live is real work our team
          does by hand: verifying your domain, pointing DNS, issuing TLS, then deploying. We never
          mark a project live until your domain actually responds over HTTPS.
        </p>
      </div>

      {project.status === "published" ? (
        <div className="space-y-6">
          <div className="rounded-lg border border-champagne/40 bg-surface p-6 text-sm">
            Live at <span className="text-champagne">{project.published_domain}</span> — verified
            reachable over HTTPS.
          </div>
          {data.company?.referral_code && (
            <ReferralPanel referralCode={data.company.referral_code} />
          )}
        </div>
      ) : project.status === "launch_requested" ? (
        <div className="rounded-lg border border-border bg-surface/40 p-6 text-sm text-muted-foreground">
          Launch requested. Our team is verifying your domain and deploying your site — you'll see
          this update to "Live" the moment it's actually reachable over HTTPS.
        </div>
      ) : (
        <button
          type="button"
          onClick={() => run.mutate()}
          disabled={run.isPending}
          className="rounded-sm bg-champagne px-8 py-3 text-sm text-primary-foreground disabled:opacity-60"
        >
          {run.isPending ? "Requesting…" : "Request Launch"}
        </button>
      )}
    </div>
  );
}

function ReferralPanel({ referralCode }: { referralCode: string }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const link = origin ? `${origin}/?ref=${referralCode}` : "";

  return (
    <div className="rounded-lg border border-border bg-surface/40 p-6">
      <h2 className="font-display text-xl">
        Know another business that should have a stronger digital presence?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Share your link — we'll know it came from you.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input readOnly value={link} className="input-luxe flex-1 text-xs" />
        <button
          type="button"
          onClick={() => {
            if (link) navigator.clipboard?.writeText(link);
            toast.success("Referral link copied.");
          }}
          className="rounded-sm border border-champagne/40 px-6 py-3 text-xs uppercase tracking-[0.15em] text-champagne"
        >
          Copy Link
        </button>
      </div>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-champagne/30 bg-surface/60 px-4 py-3 text-xs text-muted-foreground">
      {children}
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
