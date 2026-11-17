import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminNav } from "@/components/platform/AdminNav";
import {
  getRestaurantApplications,
  updateRestaurantApplication,
} from "@/lib/restaurant.functions";
import { RESTAURANT_EXTRAS, RESTAURANT_PACKAGES } from "@/lib/restaurant";
import { usd } from "@/lib/platform";

export const Route = createFileRoute("/_authenticated/admin/restaurants")({
  component: RestaurantApplicantsPage,
});

type Application = Awaited<ReturnType<typeof getRestaurantApplications>>[number];
type Status = "new" | "contacted" | "qualified" | "won" | "lost";

const STATUS_TONE: Record<Status, string> = {
  new: "border-champagne/40 text-champagne",
  contacted: "border-blue-400/40 text-blue-400",
  qualified: "border-violet-400/40 text-violet-400",
  won: "border-emerald-400/40 text-emerald-400",
  lost: "border-red-400/40 text-red-400",
};

const EXTRA_LABEL: Record<string, string> = Object.fromEntries(
  RESTAURANT_EXTRAS.map((e) => [e.key, e.label]),
);
const PACKAGE_LABEL: Record<string, string> = Object.fromEntries(
  RESTAURANT_PACKAGES.map((p) => [p.key, `${p.name} — ${p.focus}`]),
);

function RestaurantApplicantsPage() {
  const fetchApplications = useServerFn(getRestaurantApplications);
  const updateApplication = useServerFn(updateRestaurantApplication);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-restaurant-applications"],
    queryFn: () => fetchApplications({}),
  });
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");

  const mutation = useMutation({
    mutationFn: (vars: { id: string; status: Status }) =>
      updateApplication({
        data: { id: vars.id, status: vars.status, adminNotes: notes[vars.id] },
      }),
    onSuccess: () => {
      toast.success("Application updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-restaurant-applications"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update."),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((a: Application) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!q) return true;
      return [
        a.business_name,
        a.contact_name,
        a.email,
        a.phone,
        a.country,
        a.city,
        a.package_key,
        a.reference,
        a.notes,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [data, search, statusFilter]);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav active="/admin/restaurants" />
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          You do not have access to the admin console.
        </div>
      </div>
    );
  }

  const count = (s: Status) => (data ?? []).filter((a: Application) => a.status === s).length;

  return (
    <div className="min-h-screen bg-background">
      <AdminNav active="/admin/restaurants" />
      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl">Restaurant applicants</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Applications from the special restaurant offer on /restaurant, newest first. Prices
              and totals are computed server-side — never from the browser.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurant, contact, reference…"
              className="input-luxe min-w-64 text-xs"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | Status)}
              className="input-luxe text-xs"
            >
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Total" value={String((data ?? []).length)} />
          <Stat label="New" value={String(count("new"))} />
          <Stat label="Contacted" value={String(count("contacted"))} />
          <Stat label="Qualified" value={String(count("qualified"))} />
          <Stat label="Won" value={String(count("won"))} />
          <Stat label="Lost" value={String(count("lost"))} />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((a: Application) => (
              <article key={a.id} className="rounded-lg border border-border bg-surface/30 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">
                        {a.business_name} · {a.contact_name}
                      </p>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${STATUS_TONE[a.status as Status] ?? ""}`}
                      >
                        {a.status}
                      </span>
                      <span className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted-foreground">
                        {a.reference}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <a className="hover:text-foreground" href={`mailto:${a.email}`}>
                        {a.email}
                      </a>{" "}
                      ·{" "}
                      <a className="hover:text-foreground" href={`tel:${a.phone}`}>
                        {a.phone}
                      </a>
                      {" · "}
                      {a.country}
                      {a.city ? `, ${a.city}` : ""}
                    </p>

                    <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
                      <Info
                        label="Package"
                        value={`${PACKAGE_LABEL[a.package_key] ?? a.package_key} · ${usd(a.package_price_cents)}`}
                      />
                      <Info
                        label={`Extras (${(a.extras ?? []).length} × $50)`}
                        value={
                          (a.extras ?? []).length > 0
                            ? (a.extras as string[]).map((k) => EXTRA_LABEL[k] ?? k).join(", ")
                            : "None"
                        }
                      />
                      <div>
                        <p className="eyebrow text-[10px]">Total estimate</p>
                        <p className="mt-1 font-display text-lg text-champagne">
                          {usd(a.total_cents)}
                        </p>
                      </div>
                      <Info label="UTM campaign" value={a.utm_campaign} />
                      <Info label="Referrer" value={a.referrer} />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs">
                      {a.current_website && <ExtLink href={a.current_website} label="Website" />}
                      {a.instagram_url && <ExtLink href={a.instagram_url} label="Instagram" />}
                      {a.google_maps_url && <ExtLink href={a.google_maps_url} label="Google Maps" />}
                    </div>

                    {a.notes && (
                      <div className="mt-4 rounded-sm border border-border/70 bg-background/30 p-4">
                        <p className="eyebrow mb-2">Notes / project details</p>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                          {a.notes}
                        </p>
                      </div>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground">
                      Submitted {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 lg:flex-row lg:items-center">
                  <a
                    href={`https://wa.me/${String(a.phone).replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-sm border border-[#25D366]/40 px-4 py-2 text-xs text-[#25D366] hover:bg-[#25D366]/10"
                  >
                    WhatsApp applicant
                  </a>
                  <input
                    placeholder="Private admin note (optional)"
                    value={notes[a.id] ?? a.admin_notes ?? ""}
                    onChange={(e) => setNotes({ ...notes, [a.id]: e.target.value })}
                    className="input-luxe flex-1 text-xs"
                  />
                  <select
                    value={a.status}
                    onChange={(e) => mutation.mutate({ id: a.id, status: e.target.value as Status })}
                    className="input-luxe text-xs"
                    disabled={mutation.isPending}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => mutation.mutate({ id: a.id, status: a.status as Status })}
                    className="rounded-sm border border-border px-4 py-2 text-xs hover:border-champagne/40"
                  >
                    Save note
                  </button>
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground">No matching applications yet.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: unknown }) {
  if (!value) return null;
  return (
    <div>
      <p className="eyebrow text-[10px]">{label}</p>
      <p className="mt-1 text-muted-foreground">{String(value)}</p>
    </div>
  );
}
function ExtLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground underline underline-offset-4 hover:text-champagne"
    >
      {label}
    </a>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface/30 p-4">
      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl text-champagne">{value}</p>
    </div>
  );
}
