import type { IntentKey } from "./whatsapp";

/** Lets any CTA on the page pre-fill the inquiry (intent and/or style) and scroll to it. */
export interface InquiryPreset { intent?: IntentKey; styleId?: string; specialist?: "architecture" | "interiors" }

export function openInquiry(preset: InquiryPreset = {}) {
  window.dispatchEvent(new CustomEvent<InquiryPreset>("dos:inquiry", { detail: preset }));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("start")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}
