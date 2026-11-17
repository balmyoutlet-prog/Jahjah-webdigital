import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminNav } from "@/components/platform/AdminNav";
import { getAllAddonsAdmin, setAddonActive, upsertAddon } from "@/lib/addons.functions";
import { usd } from "@/lib/platform";

export const Route = createFileRoute("/_authenticated/admin/addons")({
  component: AddonsPage,
});

function AddonsPage() {
  const fetchAddons = useServerFn(getAllAddonsAdmin);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-addons"],
    queryFn: () => fetchAddons({}),
  });

  const upsert = useServerFn(upsertAddon);
  const toggle = useServerFn(setAddonActive);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-addons"] });

  const [drafts, setDrafts] = useState<
    Record<string, { name: string; price: string; description: string }>
  >({});

  const saveMutation = useMutation({
    mutationFn: (payload: any) => upsert({ data: payload }),
    onSuccess: () => {
      toast.success("Add-on saved.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save add-on."),
  });
  const toggleMutation = useMutation({
    mutationFn: (payload: { id: string; active: boolean }) => toggle({ data: payload }),
    onSuccess: refresh,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update."),
  });

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav active="/admin/addons" />
        <Center>You do not have access to the admin console.</Center>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav active="/admin/addons" />
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <div>
          <h1 className="font-display text-4xl">Add-on pricing</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Prices here are what customers see live at checkout. Nothing is hardcoded in the
            frontend.
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-3">
            {(data ?? []).map((a: any) => {
              const draft = drafts[a.id] ?? {
                name: a.name,
                price: String(a.price_cents / 100),
                description: a.description ?? "",
              };
              return (
                <div
                  key={a.id}
                  className={`rounded-lg border p-4 ${a.active ? "border-border bg-surface/30" : "border-border/50 bg-surface/10 opacity-60"}`}
                >
                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_120px_auto_auto]">
                    <input
                      className="input-luxe"
                      value={draft.name}
                      onChange={(e) =>
                        setDrafts({ ...drafts, [a.id]: { ...draft, name: e.target.value } })
                      }
                    />
                    <input
                      className="input-luxe"
                      value={draft.description}
                      onChange={(e) =>
                        setDrafts({ ...drafts, [a.id]: { ...draft, description: e.target.value } })
                      }
                      placeholder="Description"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">$</span>
                      <input
                        type="number"
                        min={0}
                        className="input-luxe"
                        value={draft.price}
                        onChange={(e) =>
                          setDrafts({ ...drafts, [a.id]: { ...draft, price: e.target.value } })
                        }
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        saveMutation.mutate({
                          id: a.id,
                          key: a.key,
                          name: draft.name,
                          description: draft.description,
                          price_cents: Math.round(Number(draft.price) * 100),
                          active: a.active,
                          sort_order: a.sort_order,
                        })
                      }
                      className="rounded-sm bg-champagne px-4 py-2 text-xs text-primary-foreground"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleMutation.mutate({ id: a.id, active: !a.active })}
                      className="rounded-sm border border-border px-4 py-2 text-xs hover:border-champagne/40"
                    >
                      {a.active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    key: <code>{a.key}</code> · currently {usd(a.price_cents)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <NewAddonForm onCreated={refresh} />
      </main>
    </div>
  );
}

function NewAddonForm({ onCreated }: { onCreated: () => void }) {
  const upsert = useServerFn(upsertAddon);
  const [form, setForm] = useState({ key: "", name: "", description: "", price: "0" });

  const mutation = useMutation({
    mutationFn: () =>
      upsert({
        data: {
          key: form.key,
          name: form.name,
          description: form.description,
          price_cents: Math.round(Number(form.price) * 100),
          active: true,
          sort_order: 99,
        },
      }),
    onSuccess: () => {
      toast.success("Add-on created.");
      setForm({ key: "", name: "", description: "", price: "0" });
      onCreated();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create add-on."),
  });

  return (
    <form
      className="grid gap-3 rounded-lg border border-dashed border-border p-5 sm:grid-cols-5"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <input
        required
        placeholder="key (e.g. rush_delivery)"
        value={form.key}
        onChange={(e) => setForm({ ...form, key: e.target.value })}
        className="input-luxe"
      />
      <input
        required
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="input-luxe"
      />
      <input
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="input-luxe"
      />
      <input
        type="number"
        min={0}
        placeholder="Price USD"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        className="input-luxe"
      />
      <button
        type="submit"
        disabled={mutation.isPending}
        className="rounded-sm bg-champagne px-4 py-2 text-xs text-primary-foreground"
      >
        Add new add-on
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
