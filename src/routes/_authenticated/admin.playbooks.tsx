import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminNav } from "@/components/platform/AdminNav";
import { getAllPlaybooksAdmin, upsertPlaybook } from "@/lib/industry-playbooks.functions";

export const Route = createFileRoute("/_authenticated/admin/playbooks")({
  component: PlaybooksPage,
});

function PlaybooksPage() {
  const fetchPlaybooks = useServerFn(getAllPlaybooksAdmin);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-playbooks"],
    queryFn: () => fetchPlaybooks({}),
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-playbooks"] });

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav active="/admin/playbooks" />
        <Center>You do not have access to the admin console.</Center>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav active="/admin/playbooks" />
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <div>
          <h1 className="font-display text-4xl">Industry advisory playbooks</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            These percentages are assumptions that drive the opportunity-scenario calculator on
            every prospect's study page — they are not researched statistics. Adjust them per
            industry as you learn what's realistic. Recommended features drive both the study page
            and the outreach angle.
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-4">
            {(data ?? []).map((pb: any) => (
              <PlaybookCard key={pb.id} playbook={pb} onSaved={refresh} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function PlaybookCard({ playbook, onSaved }: { playbook: any; onSaved: () => void }) {
  const upsert = useServerFn(upsertPlaybook);
  const [draft, setDraft] = useState({
    label: playbook.label,
    conservative_pct: String(playbook.conservative_pct),
    expected_pct: String(playbook.expected_pct),
    high_pct: String(playbook.high_pct),
    recommended_features: (playbook.recommended_features ?? []).join(", "),
    messaging_angle: playbook.messaging_angle ?? "",
    default_tier: playbook.default_tier,
  });

  const save = useMutation({
    mutationFn: () =>
      upsert({
        data: {
          id: playbook.id,
          key: playbook.key,
          sort_order: playbook.sort_order,
          label: draft.label,
          conservative_pct: Number(draft.conservative_pct),
          expected_pct: Number(draft.expected_pct),
          high_pct: Number(draft.high_pct),
          recommended_features: draft.recommended_features
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
          messaging_angle: draft.messaging_angle,
          default_tier: draft.default_tier,
        },
      }),
    onSuccess: () => {
      toast.success("Playbook saved.");
      onSaved();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save."),
  });

  return (
    <div className="rounded-lg border border-border bg-surface/30 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          key: <code>{playbook.key}</code>
        </p>
        <button
          type="button"
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="rounded-sm bg-champagne px-4 py-1.5 text-xs text-primary-foreground"
        >
          Save
        </button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input
          className="input-luxe"
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
        />
        <label className="flex items-center gap-2 text-xs">
          Default tier
          <select
            className="input-luxe"
            value={draft.default_tier}
            onChange={(e) => setDraft({ ...draft, default_tier: e.target.value })}
          >
            <option value="basic">Basic</option>
            <option value="medium">Medium</option>
            <option value="high">Luxury</option>
          </select>
        </label>
        <div className="grid grid-cols-3 gap-2 sm:col-span-2">
          <label className="text-xs">
            Conservative %
            <input
              className="input-luxe mt-1"
              type="number"
              value={draft.conservative_pct}
              onChange={(e) => setDraft({ ...draft, conservative_pct: e.target.value })}
            />
          </label>
          <label className="text-xs">
            Expected %
            <input
              className="input-luxe mt-1"
              type="number"
              value={draft.expected_pct}
              onChange={(e) => setDraft({ ...draft, expected_pct: e.target.value })}
            />
          </label>
          <label className="text-xs">
            High %
            <input
              className="input-luxe mt-1"
              type="number"
              value={draft.high_pct}
              onChange={(e) => setDraft({ ...draft, high_pct: e.target.value })}
            />
          </label>
        </div>
        <label className="text-xs sm:col-span-2">
          Recommended features (comma-separated)
          <input
            className="input-luxe mt-1"
            value={draft.recommended_features}
            onChange={(e) => setDraft({ ...draft, recommended_features: e.target.value })}
          />
        </label>
        <label className="text-xs sm:col-span-2">
          Messaging angle
          <textarea
            rows={2}
            className="input-luxe mt-1"
            value={draft.messaging_angle}
            onChange={(e) => setDraft({ ...draft, messaging_angle: e.target.value })}
          />
        </label>
      </div>
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
