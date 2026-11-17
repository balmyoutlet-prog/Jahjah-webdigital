import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminNav } from "@/components/platform/AdminNav";
import { getInquiries, updateInquiryStatus } from "@/lib/contact.functions";

export const Route = createFileRoute("/_authenticated/admin/inquiries")({
  component: InquiriesPage,
});

type Inquiry = Awaited<ReturnType<typeof getInquiries>>[number];
type Status = "new" | "contacted" | "meeting_booked" | "quotation_sent" | "qualified" | "won" | "lost" | "archived";

const STATUS_TONE: Record<Status, string> = {
  new: "border-champagne/40 text-champagne",
  contacted: "border-blue-400/40 text-blue-400",
  meeting_booked: "border-cyan-400/40 text-cyan-400",
  quotation_sent: "border-amber-400/40 text-amber-400",
  qualified: "border-violet-400/40 text-violet-400",
  won: "border-emerald-400/40 text-emerald-400",
  lost: "border-red-400/40 text-red-400",
  archived: "border-border text-muted-foreground",
};

function InquiriesPage() {
  const fetchInquiries = useServerFn(getInquiries);
  const updateStatus = useServerFn(updateInquiryStatus);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: () => fetchInquiries({}),
  });
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");

  const mutation = useMutation({
    mutationFn: (vars: { id: string; status: Status }) =>
      updateStatus({ data: { id: vars.id, status: vars.status, adminNotes: notes[vars.id] } }),
    onSuccess: () => {
      toast.success("Inquiry updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update."),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((i: Inquiry) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (!q) return true;
      return [i.name, i.company, i.email, i.phone, i.country, i.industry, i.need, i.details]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [data, search, statusFilter]);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav active="/admin/inquiries" />
        <Center>You do not have access to the admin console.</Center>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav active="/admin/inquiries" />
      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl">Client inquiries</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Every project questionnaire submitted on the public website lands here privately,
              newest first.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, company, service…"
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
              <option value="meeting_booked">Meeting Booked</option>
              <option value="quotation_sent">Quotation Sent</option>
              <option value="qualified">Qualified</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          <Stat label="Total inquiries" value={String((data ?? []).length)} />
          <Stat label="Today" value={String((data ?? []).filter((i: Inquiry) => Date.now() - new Date(i.created_at).getTime() < 86400000).length)} />
          <Stat label="Last 7 days" value={String((data ?? []).filter((i: Inquiry) => Date.now() - new Date(i.created_at).getTime() < 604800000).length)} />
          <Stat label="Last 30 days" value={String((data ?? []).filter((i: Inquiry) => Date.now() - new Date(i.created_at).getTime() < 2592000000).length)} />
          <Stat
            label="New"
            value={String((data ?? []).filter((i: Inquiry) => i.status === "new").length)}
          />
          <Stat
            label="Contacted"
            value={String((data ?? []).filter((i: Inquiry) => i.status === "contacted").length)}
          />
          <Stat
            label="Qualified"
            value={String((data ?? []).filter((i: Inquiry) => i.status === "qualified").length)}
          />
          <Stat
            label="Won"
            value={String((data ?? []).filter((i: Inquiry) => i.status === "won").length)}
          />
          <Stat
            label="Lost"
            value={String((data ?? []).filter((i: Inquiry) => i.status === "lost").length)}
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((i: Inquiry) => (
              <article key={i.id} className="rounded-lg border border-border bg-surface/30 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">
                        {i.name} · {i.company}
                      </p>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${STATUS_TONE[(i.crm_status ?? i.status) as Status] ?? ""}`}
                      >
                        {String(i.crm_status ?? i.status).replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <a className="hover:text-foreground" href={`mailto:${i.email}`}>
                        {i.email}
                      </a>
                      {i.phone && (
                        <>
                          {" "}
                          ·{" "}
                          <a className="hover:text-foreground" href={`tel:${i.phone}`}>
                            {i.phone}
                          </a>
                        </>
                      )}
                      {i.country && ` · ${i.country}`}
                    </p>
                    <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
                      <Info label="Industry" value={i.industry} />
                      <Info label="Requested service" value={i.need} />
                      <Info label="Budget" value={i.budget_range} />
                      <Info label="Launch timing" value={i.launch_timing} />
                      <Info label="Heard about us" value={i.heard_about} />
                      <Info label="Source" value={i.source} />
                      <Info label="Referrer" value={i.referrer} />
                      <Info label="UTM campaign" value={i.utm_campaign} />
                    </div>
                    {i.current_website && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Current website:{" "}
                        <a
                          href={i.current_website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-foreground underline underline-offset-4"
                        >
                          {i.current_website}
                        </a>
                      </p>
                    )}
                    <div className="mt-4 rounded-sm border border-border/70 bg-background/30 p-4">
                      <p className="eyebrow mb-2">Project goals / details</p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                        {i.details}
                      </p>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Submitted {new Date(i.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 lg:flex-row lg:items-center">
                  {i.phone && (
                    <a
                      href={`https://wa.me/${i.phone.replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-sm border border-[#25D366]/40 px-4 py-2 text-xs text-[#25D366] hover:bg-[#25D366]/10"
                    >
                      WhatsApp client
                    </a>
                  )}
                  <input
                    placeholder="Private admin note (optional)"
                    value={notes[i.id] ?? i.admin_notes ?? ""}
                    onChange={(e) => setNotes({ ...notes, [i.id]: e.target.value })}
                    className="input-luxe flex-1 text-xs"
                  />
                  <select
                    value={i.crm_status ?? i.status}
                    onChange={(e) =>
                      mutation.mutate({ id: i.id, status: e.target.value as Status })
                    }
                    className="input-luxe text-xs"
                    disabled={mutation.isPending}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => mutation.mutate({ id: i.id, status: (i.crm_status ?? i.status) as Status })}
                    className="rounded-sm border border-border px-4 py-2 text-xs hover:border-champagne/40"
                  >
                    Save note
                  </button>
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground">No matching inquiries yet.</p>
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
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface/30 p-4">
      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl text-champagne">{value}</p>
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
