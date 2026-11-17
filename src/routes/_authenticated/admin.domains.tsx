import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminNav } from "@/components/platform/AdminNav";
import {
  adminMarkDomainFailed,
  adminUpdateDomainStage,
  adminVerifyAndGoLive,
  adminVerifyDomainOwnership,
  getAdminOverview,
} from "@/lib/platform.functions";

export const Route = createFileRoute("/_authenticated/admin/domains")({
  component: DomainsPage,
});

type Overview = Awaited<ReturnType<typeof getAdminOverview>>;
type Project = Overview["projects"][number];
type Company = Overview["companies"][number];

const STATUS_TONE: Record<string, string> = {
  unchecked: "border-border text-muted-foreground",
  provider_not_connected: "border-border text-muted-foreground",
  available: "border-border text-muted-foreground",
  unavailable: "border-red-400/40 text-red-400",
  selected: "border-champagne/40 text-champagne",
  requested: "border-champagne/40 text-champagne",
  verified: "border-blue-400/40 text-blue-400",
  dns_pending: "border-amber-400/40 text-amber-400",
  dns_configured: "border-amber-400/40 text-amber-400",
  tls_active: "border-amber-400/40 text-amber-400",
  live: "border-emerald-400/40 text-emerald-400",
  failed: "border-red-400/40 text-red-400",
};

const CAN_VERIFY = new Set(["requested", "selected"]);
const CAN_ADVANCE_DNS = new Set(["verified", "dns_pending"]);
const CAN_ADVANCE_TLS = new Set(["dns_configured"]);
const CAN_GO_LIVE = new Set(["verified", "dns_pending", "dns_configured", "tls_active", "failed"]);

function DomainsPage() {
  const fetchOverview = useServerFn(getAdminOverview);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview({}),
  });
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const verify = useServerFn(adminVerifyDomainOwnership);
  const advance = useServerFn(adminUpdateDomainStage);
  const markFailed = useServerFn(adminMarkDomainFailed);
  const goLive = useServerFn(adminVerifyAndGoLive);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-overview"] });

  const verifyM = useMutation({
    mutationFn: (requestId: string) => verify({ data: { requestId } }),
    onSuccess: () => {
      toast.success("Domain ownership verified.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not verify domain."),
  });
  const advanceM = useMutation({
    mutationFn: (vars: {
      requestId: string;
      stage: "dns_pending" | "dns_configured" | "tls_active";
    }) => advance({ data: vars }),
    onSuccess: () => {
      toast.success("Domain stage updated.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update stage."),
  });
  const failM = useMutation({
    mutationFn: (requestId: string) =>
      markFailed({ data: { requestId, reason: reasons[requestId] || "Marked failed by admin." } }),
    onSuccess: () => {
      toast.success("Domain marked failed.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update."),
  });
  const goLiveM = useMutation({
    mutationFn: (requestId: string) => goLive({ data: { requestId } }),
    onSuccess: (res) => {
      toast.success(`Live — published at ${res.domain}.`);
      refresh();
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Domain is not reachable over HTTPS yet."),
  });

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav active="/admin/domains" />
        <Center>You do not have access to the admin console.</Center>
      </div>
    );
  }

  const companyNameForProject = (projectId: string) => {
    const project = data?.projects.find((p: Project) => p.id === projectId);
    const company = project
      ? data?.companies.find((c: Company) => c.id === project.company_id)
      : null;
    return company?.name ?? "Unknown company";
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav active="/admin/domains" />
      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <div>
          <h1 className="font-display text-4xl">Domain verification & go-live</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            No registrar or DNS-automation API is connected. Every stage below is a manual,
            admin-confirmed fact about real work done outside this app. "Run live check" makes an
            actual outbound HTTPS request to the domain — a project is only ever marked published
            after that request succeeds.
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-4">
            {(data?.domains ?? []).map((d: Overview["domains"][number]) => (
              <div key={d.id} className="rounded-lg border border-border bg-surface/30 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{d.domain}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {companyNameForProject(d.project_id)} · requested{" "}
                      {new Date(d.created_at).toLocaleString()}
                    </p>
                    {d.failure_reason && (
                      <p className="mt-1 text-xs text-red-400">Reason: {d.failure_reason}</p>
                    )}
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${STATUS_TONE[d.status] ?? ""}`}
                  >
                    {d.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {CAN_VERIFY.has(d.status) && (
                    <button
                      type="button"
                      onClick={() => verifyM.mutate(d.id)}
                      disabled={verifyM.isPending}
                      className="rounded-sm bg-champagne px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-60"
                    >
                      Verify ownership
                    </button>
                  )}
                  {CAN_ADVANCE_DNS.has(d.status) && (
                    <>
                      <button
                        type="button"
                        onClick={() => advanceM.mutate({ requestId: d.id, stage: "dns_pending" })}
                        disabled={advanceM.isPending}
                        className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-champagne/40"
                      >
                        Mark DNS pending
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          advanceM.mutate({ requestId: d.id, stage: "dns_configured" })
                        }
                        disabled={advanceM.isPending}
                        className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-champagne/40"
                      >
                        Mark DNS configured
                      </button>
                    </>
                  )}
                  {CAN_ADVANCE_TLS.has(d.status) && (
                    <button
                      type="button"
                      onClick={() => advanceM.mutate({ requestId: d.id, stage: "tls_active" })}
                      disabled={advanceM.isPending}
                      className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-champagne/40"
                    >
                      Mark TLS active
                    </button>
                  )}
                  {CAN_GO_LIVE.has(d.status) && (
                    <button
                      type="button"
                      onClick={() => goLiveM.mutate(d.id)}
                      disabled={goLiveM.isPending}
                      className="rounded-sm border border-emerald-400/40 px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-400/10 disabled:opacity-60"
                    >
                      {goLiveM.isPending ? "Checking…" : "Run live check & publish"}
                    </button>
                  )}
                  {d.status !== "live" && d.status !== "failed" && (
                    <>
                      <input
                        placeholder="Failure reason (optional)"
                        value={reasons[d.id] ?? ""}
                        onChange={(e) => setReasons({ ...reasons, [d.id]: e.target.value })}
                        className="input-luxe max-w-[220px] text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => failM.mutate(d.id)}
                        disabled={failM.isPending}
                        className="rounded-sm border border-red-400/40 px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10"
                      >
                        Mark failed
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {(data?.domains ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No domain requests yet.</p>
            )}
          </div>
        )}
      </main>
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
