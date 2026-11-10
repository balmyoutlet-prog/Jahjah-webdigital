/**
 * Inquiry routing + WhatsApp message composition.
 * Pure functions (no env access) so they can be unit-tested with plain Node.
 */

export type Specialist = "architecture" | "interiors" | "general";

export type IntentKey =
  | "architectural-design"
  | "floor-plans"
  | "villa-architecture"
  | "exterior-facade"
  | "interior-architecture"
  | "residential-interior"
  | "commercial-interior"
  | "full-consultation"
  | "project-supervision"
  | "other";

export const INTENTS: IntentKey[] = [
  "architectural-design",
  "floor-plans",
  "villa-architecture",
  "exterior-facade",
  "interior-architecture",
  "residential-interior",
  "commercial-interior",
  "full-consultation",
  "project-supervision",
  "other",
];

/** "both" means the visitor is asked which specialist to contact first. */
export function routeIntent(intent: IntentKey): Specialist | "both" {
  switch (intent) {
    case "architectural-design":
    case "floor-plans":
    case "villa-architecture":
    case "exterior-facade":
      return "architecture";
    case "interior-architecture":
    case "residential-interior":
    case "commercial-interior":
      return "interiors";
    case "full-consultation":
    case "project-supervision":
      return "both";
    default:
      return "general";
  }
}

export interface Numbers {
  architecture: string;
  interiors: string;
  general: string;
}

/** General inquiries fall back to interiors, then architecture, if no general number is configured. */
export function resolveNumber(specialist: Specialist, n: Numbers): string {
  if (specialist === "general") return n.general || n.interiors || n.architecture || "";
  return n[specialist] || "";
}

/** A valid wa.me number: 8–15 digits, no leading zero (E.164 without "+"). */
export function isValidWaNumber(digits: string): boolean {
  return /^[1-9]\d{7,14}$/.test(digits);
}

export function waLink(number: string, text: string): string {
  const q = `text=${encodeURIComponent(text)}`;
  return isValidWaNumber(number) ? `https://wa.me/${number}?${q}` : `https://wa.me/?${q}`;
}

export interface MessageFields {
  /** Localized phrase, e.g. "residential interior design" / "تصميم داخلي سكني" */
  intentPhrase: string;
  name?: string;
  city?: string;
  country?: string;
  projectType?: string;
  area?: string;
  style?: string;
  stage?: string;
  budget?: string;
  timeline?: string;
  remote?: boolean;
  notes?: string;
}

export function buildMessage(locale: "en" | "ar", f: MessageFields): string {
  const place = [f.city, f.country].filter(Boolean).join(locale === "ar" ? "، " : ", ");
  const lines: string[] = [];
  if (locale === "ar") {
    lines.push("مرحباً استوديو DOS للتصميم،");
    lines.push(`أودّ مناقشة مشروع ${f.intentPhrase}${place ? ` في ${place}` : ""}.`);
    if (f.area) lines.push(`المساحة التقريبية ${f.area} متر مربع.`);
    if (f.style) lines.push(`الطراز المفضّل: ${f.style}.`);
    if (f.name) lines.push(`الاسم: ${f.name}`);
    if (f.projectType) lines.push(`نوع المشروع: ${f.projectType}`);
    if (f.stage) lines.push(`مرحلة المشروع: ${f.stage}`);
    if (f.budget) lines.push(`الميزانية التقديرية: ${f.budget}`);
    if (f.timeline) lines.push(`موعد البدء المفضّل: ${f.timeline}`);
    if (f.remote) lines.push("أرغب في استشارة عن بُعد.");
    if (f.notes) lines.push(`ملاحظات: ${f.notes}`);
    lines.push("أرجو إعلامي بالخطوات التالية لحجز استشارة.");
  } else {
    lines.push("Hello DOS Design Studio,");
    lines.push(`I would like to discuss a ${f.intentPhrase} project${place ? ` in ${place}` : ""}.`);
    if (f.area) lines.push(`The approximate area is ${f.area} sqm.`);
    if (f.style) lines.push(`My preferred style is ${f.style}.`);
    if (f.name) lines.push(`Name: ${f.name}`);
    if (f.projectType) lines.push(`Project type: ${f.projectType}`);
    if (f.stage) lines.push(`Project stage: ${f.stage}`);
    if (f.budget) lines.push(`Estimated budget: ${f.budget}`);
    if (f.timeline) lines.push(`Preferred start: ${f.timeline}`);
    if (f.remote) lines.push("I am interested in a remote consultation.");
    if (f.notes) lines.push(`Additional requirements: ${f.notes}`);
    lines.push("Please let me know the next steps for a consultation.");
  }
  return lines.join("\n");
}
