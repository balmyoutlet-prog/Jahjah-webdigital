import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { AdminNav } from "@/components/platform/AdminNav";
import { createLead, getLeads, listDiscoveryAdapters } from "@/lib/leads.functions";
import { BUSINESS_CATEGORIES } from "@/lib/platform";
import { priorityLabel, priorityTone } from "@/lib/leads/scoring";

export const Route = createFileRoute("/_authenticated/admin/leads")({
  component: LeadsPage,
});

const STAGES = [
  "new_lead",
  "qualified",
  "ready_for_outreach",
  "contacted",
  "replied",
  "interested",
  "form_submitted",
  "package_selected",
  "payment_pending",
  "payment_submitted",
  "payment_verified",
  "website_in_production",
  "client_review",
  "published",
  "lost",
];

function LeadsPage() {
  const fetchLeads = useServerFn(getLeads);
  const fetchAdapters = useServerFn(listDiscoveryAdapters);
  const [filters, setFilters] = useState<{
    stage?: string | undefined;
    category?: string | undefined;
    websiteStatus?: string | undefined;
    search?: string | undefined;
  }>({});
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-leads", filters],
    queryFn: () => fetchLeads({ data: filters }),
  });
  const { data: adapters } = useQuery({
    queryKey: ["discovery-adapters"],
    queryFn: () => fetchAdapters({}),
    enabled: !error,
  });

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav active="/admin/leads" />
        <Center>You do not have access to the admin console.</Center>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav active="/admin/leads" />
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl">Prospect Discovery & CRM</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Businesses worth converting into Jahjah WebDigital clients — scored, staged and ready
              for outreach.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 rounded-sm bg-champagne px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
            {showForm ? "Close" : "Add prospect"}
          </button>
        </div>

        {adapters && (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {adapters.map((a) => (
              <span
                key={a.key}
                className={`rounded-full border px-3 py-1 ${a.configured ? "border-emerald-400/40 text-emerald-400" : "border-border"}`}
                title={a.inactiveReason ?? undefined}
              >
                {a.label} {a.configured ? "· connected" : "· manual"}
              </span>
            ))}
          </div>
        )}

        {showForm && (
          <NewProspectForm
            onCreated={() => {
              setShowForm(false);
              refetch();
            }}
          />
        )}

        <div className="flex flex-wrap gap-3">
          <select
            className="input-luxe w-auto"
            value={filters.stage ?? ""}
            onChange={(e) => setFilters({ ...filters, stage: e.target.value || undefined })}
          >
            <option value="">All stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <select
            className="input-luxe w-auto"
            value={filters.category ?? ""}
            onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
          >
            <option value="">All categories</option>
            {BUSINESS_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="input-luxe w-auto"
            value={filters.websiteStatus ?? ""}
            onChange={(e) => setFilters({ ...filters, websiteStatus: e.target.value || undefined })}
          >
            <option value="">Any website status</option>
            <option value="no_website">No website</option>
            <option value="weak_website">Weak website</option>
            <option value="good_website">Good website</option>
            <option value="unknown">Unknown</option>
          </select>
          <input
            className="input-luxe w-56"
            placeholder="Search business name…"
            value={filters.search ?? ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading prospects…</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-surface/30">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Score", "Business", "Category", "City", "Website", "Google", "Stage", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map((p: any) => {
                  const label = priorityLabel(p.opportunity_score);
                  return (
                    <tr key={p.id} className="border-b border-border/50 last:border-0">
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] ${priorityTone(label)}`}
                        >
                          {p.opportunity_score} · {label}
                        </span>
                      </td>
                      <td className="px-4 py-3">{p.business_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.category ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.city ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.website_status.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.google_rating
                          ? `${p.google_rating}★ (${p.google_reviews_count ?? 0})`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.stage.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to="/admin/leads/$id"
                          params={{ id: p.id }}
                          className="text-xs text-champagne hover:underline"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {(data ?? []).length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-muted-foreground">
                      No prospects match these filters yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function NewProspectForm({ onCreated }: { onCreated: () => void }) {
  const create = useServerFn(createLead);
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    business_name: "",
    category: BUSINESS_CATEGORIES[0]!,
    city: "",
    country: "Lebanon",
    instagram_url: "",
    instagram_followers: "",
    google_maps_url: "",
    google_rating: "",
    google_reviews_count: "",
    website_url: "",
    website_status: "unknown" as "no_website" | "weak_website" | "good_website" | "unknown",
    phone: "",
    whatsapp: "",
    email: "",
    description: "",
    lead_source: "manual",
  });

  const mutation = useMutation({
    mutationFn: () =>
      create({
        data: {
          ...form,
          instagram_followers: form.instagram_followers
            ? Number(form.instagram_followers)
            : undefined,
          google_rating: form.google_rating ? Number(form.google_rating) : undefined,
          google_reviews_count: form.google_reviews_count
            ? Number(form.google_reviews_count)
            : undefined,
        } as any,
      }),
    onSuccess: () => {
      toast.success("Prospect added.");
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      onCreated();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add this prospect."),
  });

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      className="grid gap-4 rounded-lg border border-border bg-surface/40 p-6 sm:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <Input
        label="Business name"
        required
        value={form.business_name}
        onChange={set("business_name")}
      />
      <label className="block">
        <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Category
        </span>
        <select
          className="input-luxe"
          value={form.category}
          onChange={(e) => set("category")(e.target.value)}
        >
          {BUSINESS_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <Input label="City" value={form.city} onChange={set("city")} />
      <Input label="Country" value={form.country} onChange={set("country")} />
      <Input label="Instagram URL" value={form.instagram_url} onChange={set("instagram_url")} />
      <Input
        label="Instagram followers"
        value={form.instagram_followers}
        onChange={set("instagram_followers")}
        type="number"
      />
      <Input
        label="Google Maps URL"
        value={form.google_maps_url}
        onChange={set("google_maps_url")}
      />
      <Input
        label="Google rating"
        value={form.google_rating}
        onChange={set("google_rating")}
        type="number"
      />
      <Input
        label="Google reviews count"
        value={form.google_reviews_count}
        onChange={set("google_reviews_count")}
        type="number"
      />
      <Input label="Website URL" value={form.website_url} onChange={set("website_url")} />
      <label className="block">
        <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Website status
        </span>
        <select
          className="input-luxe"
          value={form.website_status}
          onChange={(e) => set("website_status")(e.target.value)}
        >
          <option value="no_website">No website</option>
          <option value="weak_website">Weak website</option>
          <option value="good_website">Good website</option>
          <option value="unknown">Unknown</option>
        </select>
      </label>
      <Input label="Phone" value={form.phone} onChange={set("phone")} />
      <Input label="WhatsApp" value={form.whatsapp} onChange={set("whatsapp")} />
      <Input label="Email" value={form.email} onChange={set("email")} />
      <label className="block sm:col-span-3">
        <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Notes / description
        </span>
        <textarea
          rows={3}
          className="input-luxe"
          value={form.description}
          onChange={(e) => set("description")(e.target.value)}
        />
      </label>
      <button
        type="submit"
        disabled={mutation.isPending}
        className="sm:col-span-3 w-fit rounded-sm bg-champagne px-6 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
      >
        {mutation.isPending ? "Saving…" : "Add prospect"}
      </button>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-luxe"
      />
    </label>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
