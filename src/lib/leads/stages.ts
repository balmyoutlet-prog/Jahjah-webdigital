// Pipeline stages, shared by server code and client UI (no server-only imports).
export const STAGE_ORDER = [
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
] as const;
export type ProspectStage = (typeof STAGE_ORDER)[number];
