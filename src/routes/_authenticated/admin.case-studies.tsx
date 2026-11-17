import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminNav } from "@/components/platform/AdminNav";
import {
  getAllCaseStudiesAdmin,
  upsertCaseStudy,
  upsertCaseStudyMetric,
} from "@/lib/case-studies.functions";
import { getAllMilestonesAdmin, upsertMilestone } from "@/lib/milestones.functions";

export const Route = createFileRoute("/_authenticated/admin/case-studies")({
  component: CaseStudiesPage,
});

function CaseStudiesPage() {
  const fetchStudies = useServerFn(getAllCaseStudiesAdmin);
  const fetchMilestones = useServerFn(getAllMilestonesAdmin);
  const {
    data: studies,
    isLoading,
    error,
  } = useQuery({ queryKey: ["admin-case-studies"], queryFn: () => fetchStudies({}) });
  const { data: milestones } = useQuery({
    queryKey: ["admin-milestones"],
    queryFn: () => fetchMilestones({}),
    enabled: !error,
  });
  const queryClient = useQueryClient();
  const refreshStudies = () => queryClient.invalidateQueries({ queryKey: ["admin-case-studies"] });
  const refreshMilestones = () => queryClient.invalidateQueries({ queryKey: ["admin-milestones"] });

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav active="/admin/case-studies" />
        <Center>You do not have access to the admin console.</Center>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav active="/admin/case-studies" />
      <main className="mx-auto max-w-6xl space-y-14 px-6 py-10">
        <section>
          <h1 className="font-display text-4xl">Case studies &amp; verified results</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Nothing here reaches the public site until both "Published" and "Verified" are checked —
            on the case study itself, and on each individual metric. Ship qualitative case studies
            without numbers any time; add metrics only once you can stand behind them.
          </p>
        </section>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-6">
            {(studies ?? []).map((cs: any) => (
              <CaseStudyCard key={cs.id} caseStudy={cs} onSaved={refreshStudies} />
            ))}
          </div>
        )}
        <NewCaseStudyForm onCreated={refreshStudies} />

        <section>
          <h2 className="font-display text-3xl">Trust milestones</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Only publish a milestone once its number is verified. Disabled milestones are never
            shown anywhere on the public site.
          </p>
          <div className="mt-6 space-y-3">
            {(milestones ?? []).map((m: any) => (
              <MilestoneRow key={m.id} milestone={m} onSaved={refreshMilestones} />
            ))}
          </div>
          <NewMilestoneForm onCreated={refreshMilestones} />
        </section>
      </main>
    </div>
  );
}

function CaseStudyCard({ caseStudy, onSaved }: { caseStudy: any; onSaved: () => void }) {
  const upsert = useServerFn(upsertCaseStudy);
  const upsertMetric = useServerFn(upsertCaseStudyMetric);
  const [draft, setDraft] = useState({
    title: caseStudy.title,
    summary: caseStudy.summary ?? "",
    live_url: caseStudy.live_url ?? "",
    public: caseStudy.public,
    verified: caseStudy.verified,
  });
  const [metricDraft, setMetricDraft] = useState({
    metric_name: "",
    metric_value: "",
    metric_unit: "",
    source: "",
  });

  const save = useMutation({
    mutationFn: () =>
      upsert({
        data: {
          id: caseStudy.id,
          public_slug: caseStudy.public_slug,
          sort_order: caseStudy.sort_order,
          ...draft,
        },
      }),
    onSuccess: () => {
      toast.success("Case study saved.");
      onSaved();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save."),
  });

  const addMetric = useMutation({
    mutationFn: () =>
      upsertMetric({
        data: {
          case_study_id: caseStudy.id,
          metric_name: metricDraft.metric_name,
          metric_value: Number(metricDraft.metric_value),
          metric_unit: metricDraft.metric_unit,
          source: metricDraft.source,
          verified: false,
          public: false,
        },
      }),
    onSuccess: () => {
      toast.success("Metric added as a draft — verify and publish it below.");
      setMetricDraft({ metric_name: "", metric_value: "", metric_unit: "", source: "" });
      onSaved();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add metric."),
  });

  const toggleMetric = useMutation({
    mutationFn: (payload: {
      id: string;
      field: "public" | "verified";
      value: boolean;
      metric: any;
    }) =>
      upsertMetric({
        data: {
          id: payload.id,
          case_study_id: caseStudy.id,
          metric_name: payload.metric.metric_name,
          metric_value: payload.metric.metric_value,
          metric_unit: payload.metric.metric_unit ?? "",
          source: payload.metric.source ?? "",
          public: payload.field === "public" ? payload.value : payload.metric.public,
          verified: payload.field === "verified" ? payload.value : payload.metric.verified,
        },
      }),
    onSuccess: onSaved,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update metric."),
  });

  return (
    <div className="rounded-lg border border-border bg-surface/30 p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="input-luxe"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <input
          className="input-luxe"
          placeholder="Live URL"
          value={draft.live_url}
          onChange={(e) => setDraft({ ...draft, live_url: e.target.value })}
        />
        <textarea
          className="input-luxe sm:col-span-2"
          rows={2}
          placeholder="Summary"
          value={draft.summary}
          onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={draft.public}
            onChange={(e) => setDraft({ ...draft, public: e.target.checked })}
          />
          Published
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={draft.verified}
            onChange={(e) => setDraft({ ...draft, verified: e.target.checked })}
          />
          Verified
        </label>
        <button
          type="button"
          onClick={() => save.mutate()}
          className="rounded-sm bg-champagne px-4 py-1.5 text-primary-foreground"
        >
          Save
        </button>
        <code className="text-muted-foreground">/{caseStudy.public_slug}</code>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Metrics</p>
        <div className="mt-3 space-y-2">
          {(caseStudy.case_study_metrics ?? []).map((m: any) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center gap-3 rounded-sm border border-border bg-surface/40 px-3 py-2 text-xs"
            >
              <span>
                {m.metric_name}:{" "}
                <strong>
                  {m.metric_value}
                  {m.metric_unit}
                </strong>{" "}
                {m.source && `· ${m.source}`}
              </span>
              <label className="ml-auto flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={m.verified}
                  onChange={(e) =>
                    toggleMetric.mutate({
                      id: m.id,
                      field: "verified",
                      value: e.target.checked,
                      metric: m,
                    })
                  }
                />
                Verified
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={m.public}
                  onChange={(e) =>
                    toggleMetric.mutate({
                      id: m.id,
                      field: "public",
                      value: e.target.checked,
                      metric: m,
                    })
                  }
                />
                Public
              </label>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <input
            className="input-luxe"
            placeholder="Metric name"
            value={metricDraft.metric_name}
            onChange={(e) => setMetricDraft({ ...metricDraft, metric_name: e.target.value })}
          />
          <input
            className="input-luxe"
            placeholder="Value"
            value={metricDraft.metric_value}
            onChange={(e) => setMetricDraft({ ...metricDraft, metric_value: e.target.value })}
          />
          <input
            className="input-luxe"
            placeholder="Unit (%, k…)"
            value={metricDraft.metric_unit}
            onChange={(e) => setMetricDraft({ ...metricDraft, metric_unit: e.target.value })}
          />
          <input
            className="input-luxe"
            placeholder="Source"
            value={metricDraft.source}
            onChange={(e) => setMetricDraft({ ...metricDraft, source: e.target.value })}
          />
          <button
            type="button"
            onClick={() => addMetric.mutate()}
            className="rounded-sm border border-border px-3 py-2 text-xs hover:border-champagne/40"
          >
            Add metric
          </button>
        </div>
      </div>
    </div>
  );
}

function NewCaseStudyForm({ onCreated }: { onCreated: () => void }) {
  const upsert = useServerFn(upsertCaseStudy);
  const [form, setForm] = useState({ public_slug: "", title: "", live_url: "" });
  const mutation = useMutation({
    mutationFn: () => upsert({ data: { ...form, public: false, verified: false, sort_order: 99 } }),
    onSuccess: () => {
      toast.success("Case study created as a draft.");
      setForm({ public_slug: "", title: "", live_url: "" });
      onCreated();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create."),
  });
  return (
    <form
      className="grid gap-3 rounded-lg border border-dashed border-border p-5 sm:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <input
        required
        placeholder="slug (e.g. bloom-outlet)"
        value={form.public_slug}
        onChange={(e) => setForm({ ...form, public_slug: e.target.value })}
        className="input-luxe"
      />
      <input
        required
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="input-luxe"
      />
      <input
        placeholder="Live URL"
        value={form.live_url}
        onChange={(e) => setForm({ ...form, live_url: e.target.value })}
        className="input-luxe"
      />
      <button
        type="submit"
        className="rounded-sm bg-champagne px-4 py-2 text-xs text-primary-foreground"
      >
        Add case study
      </button>
    </form>
  );
}

function MilestoneRow({ milestone, onSaved }: { milestone: any; onSaved: () => void }) {
  const upsert = useServerFn(upsertMilestone);
  const [draft, setDraft] = useState({
    label: milestone.label,
    value: milestone.value,
    enabled: milestone.enabled,
  });
  const mutation = useMutation({
    mutationFn: () =>
      upsert({
        data: { id: milestone.id, key: milestone.key, sort_order: milestone.sort_order, ...draft },
      }),
    onSuccess: onSaved,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save."),
  });
  return (
    <div className="grid grid-cols-2 gap-2 rounded-sm border border-border bg-surface/30 p-3 sm:grid-cols-[1fr_120px_auto_auto]">
      <input
        className="input-luxe"
        value={draft.label}
        onChange={(e) => setDraft({ ...draft, label: e.target.value })}
      />
      <input
        className="input-luxe"
        value={draft.value}
        onChange={(e) => setDraft({ ...draft, value: e.target.value })}
      />
      <label className="flex items-center gap-1.5 text-xs">
        <input
          type="checkbox"
          checked={draft.enabled}
          onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
        />
        Enabled
      </label>
      <button
        type="button"
        onClick={() => mutation.mutate()}
        className="rounded-sm bg-champagne px-3 py-1.5 text-xs text-primary-foreground"
      >
        Save
      </button>
    </div>
  );
}

function NewMilestoneForm({ onCreated }: { onCreated: () => void }) {
  const upsert = useServerFn(upsertMilestone);
  const [form, setForm] = useState({ key: "", label: "", value: "" });
  const mutation = useMutation({
    mutationFn: () => upsert({ data: { ...form, enabled: false, sort_order: 99 } }),
    onSuccess: () => {
      toast.success("Milestone created (disabled until you enable it).");
      setForm({ key: "", label: "", value: "" });
      onCreated();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create."),
  });
  return (
    <form
      className="mt-3 grid gap-2 rounded-sm border border-dashed border-border p-4 sm:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <input
        required
        placeholder="key (e.g. websites_launched)"
        value={form.key}
        onChange={(e) => setForm({ ...form, key: e.target.value })}
        className="input-luxe"
      />
      <input
        required
        placeholder="Label (e.g. Websites launched)"
        value={form.label}
        onChange={(e) => setForm({ ...form, label: e.target.value })}
        className="input-luxe"
      />
      <input
        required
        placeholder="Value (e.g. 24)"
        value={form.value}
        onChange={(e) => setForm({ ...form, value: e.target.value })}
        className="input-luxe"
      />
      <button
        type="submit"
        className="rounded-sm border border-border px-3 py-2 text-xs hover:border-champagne/40"
      >
        Add milestone
      </button>
    </form>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
