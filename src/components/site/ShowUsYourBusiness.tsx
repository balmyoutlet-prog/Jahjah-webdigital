import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Check, Loader2, MessageCircle, Instagram } from "lucide-react";
import { submitBusinessLead } from "@/lib/public-lead.functions";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { INSTAGRAM_URL } from "@/lib/site-data";
import { getLandingPage, getSessionId, getUtm, useTrackEvent } from "@/hooks/use-track-event";
import {
  RESTAURANT_LEAD_COUNTRIES,
  RESTAURANT_LEAD_NEEDS as SERVICES,
} from "@/lib/restaurant-lead";

export function ShowUsYourBusiness({ compact = false, id }: { compact?: boolean; id?: string }) {
  const submit = useServerFn(submitBusinessLead);
  const track = useTrackEvent();
  const mountedAt = useRef(Date.now());
  const startedTracking = useRef(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [country, setCountry] = useState("");
  const [otherCountry, setOtherCountry] = useState("");
  const [need, setNeed] = useState<(typeof SERVICES)[number]>("Online Ordering");
  const [honeypot, setHoneypot] = useState("");

  const mutation = useMutation({
    mutationFn: () => {
      const utm = getUtm();
      let ref: string | undefined;
      try { ref = new URLSearchParams(window.location.search).get("ref") || undefined; } catch { ref = undefined; }
      return submit({ data: {
        name: name.trim(),
        phone: phone.trim(),
        businessName: businessName.trim(),
        instagram: instagram.trim(),
        country: (country === "Other" ? otherCountry : country).trim(),
        email: "",
        need,
        company_website: honeypot,
        elapsedMs: Date.now() - mountedAt.current,
        ref,
        sessionId: getSessionId(),
        landingPage: getLandingPage(),
        referrer: document.referrer || "",
        utmSource: utm.utmSource || "",
        utmMedium: utm.utmMedium || "",
        utmCampaign: utm.utmCampaign || "",
      }});
    },
    onSuccess: () => {
      track("lead_form_submitted", { lead_type: "restaurant" });
      track("contact_form_submit", { form: "restaurant_demo" });
      try {
        localStorage.setItem("jwd_restaurant_lead_submitted", "1");
        sessionStorage.setItem("jwd_lead_engaged", "1");
      } catch { /* storage may be unavailable */ }
    },
  });

  function markStarted() {
    if (!startedTracking.current) {
      startedTracking.current = true;
      track("lead_form_start", { lead_type: "restaurant" });
      track("contact_form_start", { form: "restaurant_demo" });
      try { sessionStorage.setItem("jwd_lead_engaged", "1"); } catch { /* ignore */ }
    }
  }

  const whatsappFallback = buildWhatsAppUrl(
    `Hi Jahjah WebDigital, I own/manage ${businessName.trim() || "a restaurant"} and I'd like to see what you can build for us.\nInterested in: ${need}` +
      (name.trim() ? `\nMy name: ${name.trim()}` : "") +
      (country && country !== "Other" ? `\nCountry: ${country}` : "") +
      (instagram.trim() ? `\nInstagram/website: ${instagram.trim()}` : ""),
  );

  if (mutation.isSuccess) {
    return (
      <div className={compact ? "space-y-4" : "space-y-5 rounded-2xl border border-border bg-surface p-6 sm:p-8"}>
        <p className="display text-2xl">Got it — your demo request is in.</p>
        <ul className="space-y-2.5">
          {[
            "We look at your current menu, Instagram and how customers order today.",
            "We message you on WhatsApp with what we would build for your restaurant.",
            "Want to start now? Send the same details on WhatsApp in one tap below.",
          ].map((step) => (
            <li key={step} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              {step}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <Link to="/work" className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground">
            See live restaurant work <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a href={whatsappFallback} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_click", { location: "lead_success" })} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#25D366]/50 bg-[#25D366]/10 px-6 py-3 text-xs uppercase tracking-[0.18em] text-foreground">
            <MessageCircle className="h-4 w-4 text-[#25D366]" aria-hidden="true" /> Start on WhatsApp now
          </a>
        </div>
      </div>
    );
  }

  return (
    <form id={id} className={compact ? "space-y-3" : "space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8"} onFocus={markStarted} onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
      {!compact && (
        <div>
          <p className="display text-2xl">Get your free restaurant demo.</p>
          <p className="mt-1.5 text-sm text-muted-foreground">Tell us the essentials. We will shape the demo around your restaurant.</p>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" className="input-luxe" />
        <input required minLength={7} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="WhatsApp / phone *" inputMode="tel" autoComplete="tel" className="input-luxe" />
        <input required minLength={2} value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Restaurant name" autoComplete="organization" className="input-luxe" />
        <select required value={country} onChange={(e) => setCountry(e.target.value)} className="input-luxe" aria-label="Country">
          <option value="" disabled>Country</option>
          {RESTAURANT_LEAD_COUNTRIES.map((c) => <option key={c} value={c}>{c === "Other" ? "Other country" : c}</option>)}
        </select>
        {country === "Other" && (
          <input required minLength={2} value={otherCountry} onChange={(e) => setOtherCountry(e.target.value)} placeholder="Which country?" autoComplete="country-name" className="input-luxe sm:col-span-2" />
        )}
      </div>
      <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram or website (optional)" inputMode="url" autoCapitalize="none" autoCorrect="off" className="input-luxe w-full" />
      <select value={need} onChange={(e) => setNeed(e.target.value as (typeof SERVICES)[number])} className="input-luxe w-full" aria-label="What do you need?">
        {SERVICES.map((service) => <option key={service} value={service}>{`I need: ${service}`}</option>)}
      </select>
      <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute h-0 w-0 opacity-0" aria-hidden="true" />
      <button type="submit" disabled={mutation.isPending} className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-xs uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-60">
        {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Get My Free Restaurant Demo
        {!mutation.isPending && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
      </button>
      {mutation.isError && (
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-4">
          <p className="text-xs leading-relaxed text-destructive">We couldn't save this automatically. Your details are still here—continue on WhatsApp in one tap.</p>
          <a href={whatsappFallback} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_click", { location: "lead_form_fallback" })} className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#25D366]/50 bg-[#25D366]/10 px-4 py-2 text-xs font-medium text-foreground">
            <MessageCircle className="h-4 w-4 text-[#25D366]" aria-hidden="true" /> Continue on WhatsApp
          </a>
        </div>
      )}
      {!compact && (
        <>
          <div className="grid gap-2 pt-1 sm:grid-cols-2">
            <a href={whatsappFallback} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_click", { location: "lead_form_alt" })} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#25D366]/35 bg-[#25D366]/8 px-3 text-[11px] font-medium text-foreground">
              <MessageCircle className="size-4 text-[#159447]" /> Send on WhatsApp instead
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" onClick={() => track("instagram_click", { location: "lead_form_alt" })} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-3 text-[11px] font-medium text-foreground">
              <Instagram className="size-4 text-primary" /> Instagram DM
            </a>
          </div>
          <p className="text-[11px] text-muted-foreground">Free and no obligation. Your details are used only to prepare your demo and contact you about it.</p>
        </>
      )}
    </form>
  );
}
