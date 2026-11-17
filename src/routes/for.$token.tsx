import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Reveal } from "@/components/site/Reveal";
import {
  chooseDirection,
  getPublicProspectPage,
  submitPreviewEdit,
  submitStudySnapshot,
  trackPreviewMilestoneFn,
} from "@/lib/leads.functions";
import { useTrackEvent } from "@/hooks/use-track-event";
import {
  PRIMARY_GOAL_OPTIONS,
  SALES_RANGE_OPTIONS,
  type SalesRangeKey,
} from "@/lib/leads/advisory";
import type { Direction } from "@/lib/leads/concept";
import { TIER_LABEL, TIER_PRICE_CENTS, usd, type Tier } from "@/lib/platform";

export const Route = createFileRoute("/for/$token")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex" }],
  }),
  component: StudyPage,
});

function money(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return `$${Math.round(n).toLocaleString()}`;
}

function hoursLeft(iso: string | null | undefined) {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (60 * 60 * 1000));
}

function StudyPage() {
  const { token } = Route.useParams();
  const fetchPage = useServerFn(getPublicProspectPage);
  const submitSnapshot = useServerFn(submitStudySnapshot);
  const chooseDir = useServerFn(chooseDirection);
  const submitEdit = useServerFn(submitPreviewEdit);
  const trackMilestone = useServerFn(trackPreviewMilestoneFn);
  const track = useTrackEvent();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["prospect-study", token],
    queryFn: () => fetchPage({ data: { token } }),
  });
  const study = data?.study;

  const [viewingDirection, setViewingDirection] = useState<"a" | "b">("a");
  const [viewedBoth, setViewedBoth] = useState(false);
  const [editStep, setEditStep] = useState<"choice" | "few_changes" | "special" | "done" | null>(
    null,
  );
  const [editTypes, setEditTypes] = useState<string[]>([]);
  const [editNote, setEditNote] = useState("");
  const [selectedDirection, setSelectedDirection] = useState<"a" | "b" | null>(null);

  const [salesRange, setSalesRange] = useState<SalesRangeKey | "">("");
  const [salesExact, setSalesExact] = useState("");
  const [avgOrderValue, setAvgOrderValue] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState<(typeof PRIMARY_GOAL_OPTIONS)[number] | "">("");

  const directionMutation = useMutation({
    mutationFn: (direction: "a" | "b") => chooseDir({ data: { token, direction } }),
    onSuccess: (_res, direction) => {
      track("package_selected");
      setSelectedDirection(direction);
      queryClient.invalidateQueries({ queryKey: ["prospect-study", token] });
      setEditStep("choice");
    },
  });

  const editMutation = useMutation({
    mutationFn: (input: { types?: string[]; note?: string; special?: boolean }) =>
      submitEdit({
        data: {
          token,
          types: input.types as ("colors" | "images" | "text" | "sections" | "other")[] | undefined,
          note: input.note,
          special: input.special,
        },
      }),
    onSuccess: (res) => setEditStep(res.routedToOwner ? "special" : "done"),
  });

  const snapshotMutation = useMutation({
    mutationFn: () =>
      submitSnapshot({
        data: {
          token,
          salesRange: salesRange as SalesRangeKey,
          salesExact: salesRange === "exact" && salesExact ? Number(salesExact) : undefined,
          avgOrderValue: avgOrderValue ? Number(avgOrderValue) : undefined,
          primaryGoal: primaryGoal || undefined,
        },
      }),
    onSuccess: () => {
      track("snapshot_submitted");
      queryClient.invalidateQueries({ queryKey: ["prospect-study", token] });
    },
  });

  const showResults = study?.hasSnapshot || snapshotMutation.isSuccess;
  const scenario = snapshotMutation.data?.scenario ?? study?.scenario;
  const recommendation = snapshotMutation.data?.recommendation ?? study?.recommendation;
  const whatWeWouldDoFirst =
    snapshotMutation.data?.whatWeWouldDoFirst ?? study?.whatWeWouldDoFirst ?? [];

  const concept = study?.concept as
    { directionA: Direction; directionB: Direction; recommended: "a" | "b" } | null | undefined;
  const directionSelected = selectedDirection ?? study?.directionSelected ?? null;

  useEffect(() => {
    if (study?.concept && !study.directionSelected) {
      setViewingDirection((concept?.recommended as "a" | "b") ?? "a");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(study?.concept)]);

  useEffect(() => {
    if (showResults && recommendation) {
      track("scenario_viewed");
      track("recommendation_viewed");
      trackMilestone({ data: { token, milestone: "viewed_pricing" } }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults, Boolean(recommendation)]);

  function switchDirection(next: "a" | "b") {
    setViewingDirection(next);
    if (next !== viewingDirection && !viewedBoth) {
      setViewedBoth(true);
      trackMilestone({ data: { token, milestone: "viewed_both_directions" } }).catch(() => {});
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-32 pb-24">
        <section className="mx-auto max-w-4xl px-6">
          {isLoading ? (
            <p className="text-center text-sm text-muted-foreground">Loading…</p>
          ) : !study ? (
            <Reveal className="text-center">
              <h1 className="font-display text-4xl">This link isn't valid anymore.</h1>
              <p className="mt-4 text-muted-foreground">
                But we'd still love to talk about your business.{" "}
                <Link to="/packages" className="text-champagne underline underline-offset-4">
                  See our packages
                </Link>
                .
              </p>
            </Reveal>
          ) : study.expired ? (
            <ExpiredPreview token={token} businessName={study.businessName} />
          ) : (
            <div className="space-y-16">
              {study.autoExtended && (
                <Reveal>
                  <p className="mx-auto max-w-xl rounded-full border border-champagne/30 bg-surface px-4 py-2 text-center text-xs text-champagne">
                    Your private preview was refreshed for another 24 hours.
                  </p>
                </Reveal>
              )}

              {/* Private website concept — Direction A / B */}
              {concept && (
                <Reveal>
                  <div className="text-center">
                    {study.logoUrl && (
                      <img
                        src={study.logoUrl}
                        alt={`${study.businessName} logo`}
                        className="mx-auto mb-6 h-14 w-auto object-contain"
                      />
                    )}
                    <p className="eyebrow text-primary">Private Website Concept</p>
                    <h1 className="display mt-6 text-4xl sm:text-6xl">{study.businessName}</h1>
                    <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
                      {viewingDirection === "a"
                        ? concept.directionA.heroSub
                        : concept.directionB.heroSub}
                    </p>
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Private concept prepared for {study.businessName}
                      {hoursLeft(study.previewExpiresAt) !== null &&
                        ` · Available for ${hoursLeft(study.previewExpiresAt)}h`}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Nothing has been published on your behalf. This is a private concept only.
                    </p>
                  </div>

                  <div className="mx-auto mt-10 flex max-w-md justify-center gap-2 rounded-full border border-border bg-surface/40 p-1">
                    {(["a", "b"] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => switchDirection(d)}
                        className={`flex-1 rounded-full px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors ${
                          viewingDirection === d
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {d === "a" ? concept.directionA.label : concept.directionB.label}
                        {concept.recommended === d && (
                          <span className="ml-1.5 text-[10px] normal-case opacity-80">
                            (Recommended)
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <DirectionPreview
                    direction={viewingDirection === "a" ? concept.directionA : concept.directionB}
                  />

                  {!directionSelected && !editStep && (
                    <div className="mt-8 flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={() => directionMutation.mutate(viewingDirection)}
                        disabled={directionMutation.isPending}
                        className="rounded-full bg-primary px-8 py-3.5 text-xs uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-60"
                      >
                        I Like This Direction
                      </button>
                      <button
                        type="button"
                        onClick={() => switchDirection(viewingDirection === "a" ? "b" : "a")}
                        className="text-xs uppercase tracking-[0.15em] text-muted-foreground underline underline-offset-4"
                      >
                        Show Me Option {viewingDirection === "a" ? "2" : "1"}
                      </button>
                    </div>
                  )}

                  {directionSelected && editStep && (
                    <EditFlow
                      step={editStep}
                      setStep={setEditStep}
                      editTypes={editTypes}
                      setEditTypes={setEditTypes}
                      editNote={editNote}
                      setEditNote={setEditNote}
                      editMutation={editMutation}
                    />
                  )}
                </Reveal>
              )}

              {/* Diagnosis */}
              <Reveal className="text-center">
                <p className="eyebrow text-primary">Digital Growth Diagnosis</p>
                {!concept && (
                  <h1 className="display mt-6 text-4xl sm:text-6xl">{study.businessName}</h1>
                )}
                <div className="mx-auto mt-10 max-w-2xl space-y-4 text-left">
                  <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                    You already have:
                  </p>
                  <ul className="space-y-2.5">
                    {study.diagnosis.positives.map((line: string) => (
                      <li key={line} className="flex items-start gap-2.5 text-base text-foreground">
                        <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                        {line}
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-2xl border border-border bg-surface p-6">
                    <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                      The gap
                    </p>
                    <p className="mt-2 text-base leading-relaxed text-foreground">
                      {study.diagnosis.gapStatement}
                    </p>
                  </div>
                </div>
              </Reveal>

              {/* Snapshot form or results */}
              {!showResults ? (
                <Reveal>
                  <div className="mx-auto max-w-xl rounded-2xl border border-border bg-surface p-6 sm:p-8">
                    <p className="display text-2xl">
                      To model the opportunity more accurately, give us three quick numbers.
                    </p>
                    <form
                      className="mt-6 space-y-5"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!salesRange) return;
                        snapshotMutation.mutate();
                      }}
                    >
                      <div>
                        <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          Approximate monthly sales
                        </span>
                        <select
                          required
                          value={salesRange}
                          onChange={(e) => setSalesRange(e.target.value as SalesRangeKey)}
                          className="input-luxe"
                        >
                          <option value="" disabled>
                            Select a range
                          </option>
                          {SALES_RANGE_OPTIONS.map((r) => (
                            <option key={r.key} value={r.key}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {salesRange === "exact" && (
                        <Field
                          label="Exact monthly sales (USD)"
                          value={salesExact}
                          onChange={setSalesExact}
                          type="number"
                        />
                      )}
                      <Field
                        label="Average order / booking / customer value (USD, optional)"
                        value={avgOrderValue}
                        onChange={setAvgOrderValue}
                        type="number"
                      />
                      <div>
                        <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          Main objective
                        </span>
                        <select
                          value={primaryGoal}
                          onChange={(e) => setPrimaryGoal(e.target.value as typeof primaryGoal)}
                          className="input-luxe"
                        >
                          <option value="">Select an objective (optional)</option>
                          {PRIMARY_GOAL_OPTIONS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="submit"
                        disabled={!salesRange || snapshotMutation.isPending}
                        className="w-full rounded-full bg-primary px-6 py-3.5 text-xs uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-60"
                      >
                        {snapshotMutation.isPending ? "Calculating…" : "See My Growth Opportunity"}
                      </button>
                    </form>
                  </div>
                </Reveal>
              ) : (
                <>
                  {/* Opportunity scenarios */}
                  <Reveal>
                    <h2 className="display text-center text-3xl sm:text-4xl">
                      Your Digital Opportunity
                    </h2>
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                      <ScenarioCard label="Conservative" monthly={scenario?.conservativeMonthly} />
                      <ScenarioCard
                        label="Expected"
                        monthly={scenario?.expectedMonthly}
                        highlight
                      />
                      <ScenarioCard label="High opportunity" monthly={scenario?.highMonthly} />
                    </div>
                    <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
                      This is an illustrative scenario based on the information you provided and the
                      selected model assumptions. It is not a guarantee of future performance.
                      Figures shown are potential incremental revenue — not profit.
                    </p>
                  </Reveal>

                  {/* What needs to change */}
                  <Reveal>
                    <h2 className="display text-2xl sm:text-3xl">
                      What needs to change to pursue this opportunity?
                    </h2>
                    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                      {(recommendation?.features ?? whatWeWouldDoFirst).map(
                        (f: string, i: number) => (
                          <li
                            key={f}
                            className="flex items-start gap-3 rounded-sm border border-border bg-surface/40 p-4 text-sm"
                          >
                            <span className="display text-lg text-primary/60">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            {f}
                          </li>
                        ),
                      )}
                    </ul>
                  </Reveal>

                  {/* What we would do first */}
                  <Reveal>
                    <h2 className="display text-2xl sm:text-3xl">
                      If we were advising {study.businessName} today, this is what we would do
                      first.
                    </h2>
                    <ol className="mt-6 space-y-3">
                      {whatWeWouldDoFirst.map((step: string, i: number) => (
                        <li key={step} className="flex items-start gap-3 text-sm text-foreground">
                          <span className="display text-lg text-primary/60">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </Reveal>

                  {/* Recommendation */}
                  {recommendation && (
                    <Reveal>
                      <div className="rounded-2xl border border-primary/30 bg-surface p-6 sm:p-10">
                        <p className="eyebrow text-primary">
                          Our recommendation for {study.businessName}
                        </p>
                        <h2 className="display mt-4 text-3xl sm:text-4xl">
                          {TIER_LABEL[recommendation.tier as Tier]}
                        </h2>
                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                          {recommendation.reasoning}
                        </p>
                        <ul className="mt-6 space-y-2">
                          {recommendation.features.map((f: string) => (
                            <li
                              key={f}
                              className="flex items-start gap-2.5 text-sm text-foreground"
                            >
                              <Check
                                className="mt-0.5 size-4 shrink-0 text-primary"
                                aria-hidden="true"
                              />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-6 text-sm text-muted-foreground">
                          Recommended investment:{" "}
                          <span className="font-medium text-foreground">
                            {usd(TIER_PRICE_CENTS[recommendation.tier as Tier])}
                          </span>
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          The website is the infrastructure. Results still depend on your offer,
                          traffic, marketing, pricing, operations and execution.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                          <Link
                            to="/auth"
                            search={{
                              tier: recommendation.tier as Tier,
                              prospect: study.publicToken,
                            }}
                            onClick={() => {
                              track("recommendation_continue_clicked");
                              trackMilestone({
                                data: { token, milestone: "payment_started" },
                              }).catch(() => {});
                            }}
                            className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
                          >
                            Continue With My Recommendation
                            <ArrowRight
                              className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1"
                              aria-hidden="true"
                            />
                          </Link>
                          <Link
                            to="/packages"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-8 py-3.5 text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary hover:text-primary"
                          >
                            Compare All Packages
                          </Link>
                        </div>
                      </div>
                    </Reveal>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function DirectionPreview({ direction }: { direction: Direction }) {
  return (
    <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-border bg-surface/40 p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.18em] text-primary">{direction.label}</p>
      <p className="mt-1 text-sm text-muted-foreground">{direction.tagline}</p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {direction.modules.map((m, i) => (
          <div
            key={m}
            className="flex items-center gap-2.5 rounded-sm border border-border bg-background/60 px-3 py-2.5 text-sm"
          >
            <span className="text-[10px] text-primary/60">{String(i + 1).padStart(2, "0")}</span>
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditFlow({
  step,
  setStep,
  editTypes,
  setEditTypes,
  editNote,
  setEditNote,
  editMutation,
}: {
  step: "choice" | "few_changes" | "special" | "done";
  setStep: (s: "choice" | "few_changes" | "special" | "done") => void;
  editTypes: string[];
  setEditTypes: (t: string[]) => void;
  editNote: string;
  setEditNote: (n: string) => void;
  editMutation: {
    mutate: (input: { types?: string[]; note?: string; special?: boolean }) => void;
    isPending: boolean;
    data?: { routedToOwner?: boolean } | undefined;
  };
}) {
  if (step === "done") {
    return (
      <p className="mt-8 text-center text-sm text-champagne">
        Thanks — noted. Continuing to your growth plan below.
      </p>
    );
  }
  if (editMutation.data && (editMutation.data as { routedToOwner?: boolean }).routedToOwner) {
    return (
      <p className="mt-8 text-center text-sm text-champagne">
        We've flagged this for personal review so we can give you the right answer.
      </p>
    );
  }

  if (step === "choice") {
    return (
      <div className="mt-8 text-center">
        <p className="text-sm text-champagne">
          Great choice. We'll use this direction as the base for your website.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setStep("done")}
            className="rounded-full bg-primary px-6 py-2.5 text-xs uppercase tracking-[0.15em] text-primary-foreground"
          >
            Keep It As Is
          </button>
          <button
            type="button"
            onClick={() => setStep("few_changes")}
            className="rounded-full border border-border px-6 py-2.5 text-xs uppercase tracking-[0.15em] text-foreground"
          >
            I Want a Few Changes
          </button>
          <button
            type="button"
            onClick={() => setStep("special")}
            className="rounded-full border border-border px-6 py-2.5 text-xs uppercase tracking-[0.15em] text-foreground"
          >
            I Need Something Special
          </button>
        </div>
      </div>
    );
  }

  const types = ["colors", "images", "text", "sections", "other"] as const;
  const isSpecial = step === "special";

  return (
    <div className="mx-auto mt-8 max-w-md rounded-2xl border border-border bg-surface p-6">
      {!isSpecial && (
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() =>
                setEditTypes(
                  editTypes.includes(t) ? editTypes.filter((x) => x !== t) : [...editTypes, t],
                )
              }
              className={`rounded-full border px-4 py-1.5 text-xs capitalize ${
                editTypes.includes(t)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
      <textarea
        rows={3}
        value={editNote}
        onChange={(e) => setEditNote(e.target.value)}
        placeholder={isSpecial ? "Tell us what you need…" : "A short note (optional)…"}
        className="input-luxe mt-4"
      />
      <button
        type="button"
        onClick={() =>
          editMutation.mutate({ types: editTypes, note: editNote, special: isSpecial })
        }
        disabled={editMutation.isPending}
        className="mt-4 w-full rounded-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground disabled:opacity-60"
      >
        {editMutation.isPending ? "Sending…" : "Send"}
      </button>
    </div>
  );
}

function ExpiredPreview({ token, businessName }: { token: string; businessName: string }) {
  const submitEdit = useServerFn(submitPreviewEdit);
  const [sent, setSent] = useState(false);
  const mutation = useMutation({
    mutationFn: () =>
      submitEdit({
        data: {
          token,
          special: true,
          note: "Prospect requested to reopen an expired private preview.",
        },
      }),
    onSuccess: () => setSent(true),
  });

  return (
    <Reveal className="text-center">
      <h1 className="font-display text-4xl">Your private preview has expired.</h1>
      <p className="mt-4 text-muted-foreground">
        The direction and growth plan we prepared for {businessName} are still saved.
      </p>
      {sent ? (
        <p className="mt-6 text-sm text-champagne">We've let the team know — check back shortly.</p>
      ) : (
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="mt-6 rounded-full bg-primary px-8 py-3.5 text-xs uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-60"
        >
          {mutation.isPending ? "Sending…" : "Reopen My Growth Plan"}
        </button>
      )}
    </Reveal>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-luxe"
      />
    </label>
  );
}

function ScenarioCard({
  label,
  monthly,
  highlight,
}: {
  label: string;
  monthly: number | null | undefined;
  highlight?: boolean;
}) {
  const annual = typeof monthly === "number" ? monthly * 12 : null;
  return (
    <div
      className={`rounded-2xl border p-6 text-center ${highlight ? "border-primary/40 bg-surface" : "border-border bg-surface/50"}`}
    >
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="display mt-3 text-3xl text-primary">{money(monthly)}/mo</p>
      <p className="mt-1 text-xs text-muted-foreground">≈ {money(annual)}/year</p>
    </div>
  );
}
