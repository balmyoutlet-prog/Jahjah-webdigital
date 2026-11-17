import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "./admin-guard.server";
import { audit, getAdmin } from "./platform.server";

export const submitWhishPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        orderId: z.string().uuid(),
        payerName: z.string().trim().min(2).max(120),
        payerPhone: z.string().trim().min(5).max(40),
        reference: z.string().trim().max(120).optional().or(z.literal("")),
        receiptPath: z.string().trim().max(300).optional().or(z.literal("")),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const admin = await getAdmin();
    const { data: order, error: orderErr } = await admin
      .from("orders")
      .select("id, owner_id, status")
      .eq("id", data.orderId)
      .eq("owner_id", context.userId)
      .maybeSingle();
    if (orderErr) throw new Error(orderErr.message);
    if (!order) throw new Error("Order not found on your account.");

    if (data.receiptPath && !data.receiptPath.startsWith(`${context.userId}/`)) {
      throw new Error("Invalid receipt path.");
    }

    const { data: row, error } = await admin
      .from("payment_submissions")
      .insert({
        order_id: order.id,
        owner_id: context.userId,
        payer_name: data.payerName,
        payer_phone: data.payerPhone,
        reference: data.reference || null,
        receipt_path: data.receiptPath || null,
        status: "pending",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await audit(admin, context.userId, null, "payment_submission.created", { order_id: order.id });
    return row;
  });

async function adminAndSubmission(
  context: { supabase: any; userId: string },
  submissionId: string,
) {
  await requireAdmin(context.supabase, context.userId);
  const admin = await getAdmin();
  const { data: submission, error } = await admin
    .from("payment_submissions")
    .select("*, orders(*)")
    .eq("id", submissionId)
    .single();
  if (error) throw new Error(error.message);
  return { admin, submission };
}

export const verifyPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({ submissionId: z.string().uuid(), notes: z.string().max(500).optional() })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { admin, submission } = await adminAndSubmission(context, data.submissionId);
    const order = submission.orders;

    await admin
      .from("payment_submissions")
      .update({
        status: "verified",
        admin_notes: data.notes || null,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submission.id);

    await admin
      .from("orders")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", order.id);

    if (order.kind === "package" && order.project_id) {
      await admin
        .from("projects")
        .update({ paid: true, status: "active" })
        .eq("id", order.project_id);
    }
    if (order.kind === "extra_trial" && order.project_id) {
      const { data: project } = await admin
        .from("projects")
        .select("extra_trials_purchased")
        .eq("id", order.project_id)
        .single();
      await admin
        .from("projects")
        .update({ extra_trials_purchased: (project?.extra_trials_purchased ?? 0) + 1 })
        .eq("id", order.project_id);
    }
    if (order.kind === "upgrade" && order.project_id && order.tier) {
      await admin.from("projects").update({ tier: order.tier }).eq("id", order.project_id);
    }

    await audit(admin, context.userId, order.project_id, "payment.verified", {
      submission_id: submission.id,
      order_id: order.id,
    });
    return { ok: true };
  });

export const rejectPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({ submissionId: z.string().uuid(), notes: z.string().max(500).optional() })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { admin, submission } = await adminAndSubmission(context, data.submissionId);
    await admin
      .from("payment_submissions")
      .update({
        status: "rejected",
        admin_notes: data.notes || null,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submission.id);
    await audit(admin, context.userId, submission.orders.project_id, "payment.rejected", {
      submission_id: submission.id,
    });
    return { ok: true };
  });

export const requestPaymentClarification = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({ submissionId: z.string().uuid(), notes: z.string().trim().min(2).max(500) })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { admin, submission } = await adminAndSubmission(context, data.submissionId);
    await admin
      .from("payment_submissions")
      .update({
        status: "clarification_requested",
        admin_notes: data.notes,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submission.id);
    await audit(
      admin,
      context.userId,
      submission.orders.project_id,
      "payment.clarification_requested",
      { submission_id: submission.id },
    );
    return { ok: true };
  });

export const getPendingPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const { data, error } = await admin
      .from("payment_submissions")
      .select("*, orders(description, amount_cents, kind, tier, project_id)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getReceiptSignedUrl = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ path: z.string().min(1).max(300) }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const { data: signed, error } = await admin.storage
      .from("payment-receipts")
      .createSignedUrl(data.path, 300);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });
