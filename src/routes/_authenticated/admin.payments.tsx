import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminNav } from "@/components/platform/AdminNav";
import {
  getPendingPayments,
  getReceiptSignedUrl,
  rejectPayment,
  requestPaymentClarification,
  verifyPayment,
} from "@/lib/payments.functions";
import { usd } from "@/lib/platform";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  component: PaymentsPage,
});

const STATUS_TONE: Record<string, string> = {
  pending: "border-champagne/40 text-champagne",
  verified: "border-emerald-400/40 text-emerald-400",
  rejected: "border-red-400/40 text-red-400",
  clarification_requested: "border-border text-muted-foreground",
};

function PaymentsPage() {
  const fetchPayments = useServerFn(getPendingPayments);
  const fetchSignedUrl = useServerFn(getReceiptSignedUrl);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => fetchPayments({}),
  });
  const [notes, setNotes] = useState<Record<string, string>>({});

  const verify = useServerFn(verifyPayment);
  const reject = useServerFn(rejectPayment);
  const clarify = useServerFn(requestPaymentClarification);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-payments"] });

  const verifyM = useMutation({
    mutationFn: (submissionId: string) =>
      verify({ data: { submissionId, notes: notes[submissionId] } }),
    onSuccess: () => {
      toast.success("Payment verified. Project moved to production.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not verify."),
  });
  const rejectM = useMutation({
    mutationFn: (submissionId: string) =>
      reject({ data: { submissionId, notes: notes[submissionId] } }),
    onSuccess: () => {
      toast.success("Payment rejected.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not reject."),
  });
  const clarifyM = useMutation({
    mutationFn: (submissionId: string) =>
      clarify({
        data: { submissionId, notes: notes[submissionId] || "Please clarify this payment." },
      }),
    onSuccess: () => {
      toast.success("Clarification requested.");
      refresh();
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not request clarification."),
  });

  async function viewReceipt(path: string) {
    try {
      const res = await fetchSignedUrl({ data: { path } });
      window.open(res.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open receipt.");
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav active="/admin/payments" />
        <Center>You do not have access to the admin console.</Center>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav active="/admin/payments" />
      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <div>
          <h1 className="font-display text-4xl">Whish payment verification</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Every submission stays "Pending Verification" until you confirm the transfer manually.
            Nothing here is auto-approved.
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-4">
            {(data ?? []).map((s: any) => (
              <div key={s.id} className="rounded-lg border border-border bg-surface/30 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{s.orders?.description ?? "Order"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {usd(s.orders?.amount_cents ?? 0)} · payer {s.payer_name} ({s.payer_phone})
                      {s.reference && ` · ref ${s.reference}`}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted {new Date(s.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${STATUS_TONE[s.status] ?? ""}`}
                  >
                    {s.status.replace(/_/g, " ")}
                  </span>
                </div>

                {s.admin_notes && (
                  <p className="mt-2 text-xs text-muted-foreground">Note: {s.admin_notes}</p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {s.receipt_path && (
                    <button
                      type="button"
                      onClick={() => viewReceipt(s.receipt_path)}
                      className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-champagne/40"
                    >
                      View receipt
                    </button>
                  )}
                  <input
                    placeholder="Notes (optional)"
                    value={notes[s.id] ?? ""}
                    onChange={(e) => setNotes({ ...notes, [s.id]: e.target.value })}
                    className="input-luxe max-w-xs text-xs"
                  />
                  {s.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => verifyM.mutate(s.id)}
                        disabled={verifyM.isPending}
                        className="rounded-sm bg-champagne px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-60"
                      >
                        Verify payment
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectM.mutate(s.id)}
                        disabled={rejectM.isPending}
                        className="rounded-sm border border-red-400/40 px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => clarifyM.mutate(s.id)}
                        disabled={clarifyM.isPending}
                        className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-champagne/40"
                      >
                        Request clarification
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {(data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No payment submissions yet.</p>
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
