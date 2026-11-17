import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Loader2, MessageCircle, Plus, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BrandMark } from "@/components/site/BrandMark";
import { RestaurantGrowthSection, RestaurantHeroVisual, RestaurantOrderingJourney } from "@/components/site/RestaurantMarketing";
import { IndustryProof } from "@/components/site/IndustryProof";
import { RestaurantToolLinks } from "@/components/site/RestaurantToolLinks";
import { submitRestaurantApplication } from "@/lib/restaurant.functions";
import { RESTAURANT_EXTRAS, RESTAURANT_EXTRA_PRICE_CENTS, RESTAURANT_PACKAGES, computeRestaurantTotals, restaurantPackage, type RestaurantPackageKey } from "@/lib/restaurant";
import { usd } from "@/lib/platform";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getSessionId, getUtm, useTrackEvent } from "@/hooks/use-track-event";
import { canonicalFor } from "@/lib/seo";

const title = "Restaurant Digital Menu & Ordering System | Worldwide | Jahjah WebDigital";
const description = "Restaurant digital menu and direct ordering system with QR ordering, WhatsApp, upselling, table ordering, reservations, GPS delivery and customer insights for restaurants worldwide.";

export const Route = createFileRoute("/restaurant")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { property: "og:url", content: canonicalFor("/restaurant") }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "canonical", href: canonicalFor("/restaurant") }], scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "Service", name: "Restaurant Digital Menu & Ordering System", serviceType: ["Digital Menu","Restaurant Online Ordering","QR Menu","WhatsApp Ordering","Restaurant Reservations"], areaServed: "Worldwide", provider: { "@type": "ProfessionalService", name: "Jahjah WebDigital" }, url: canonicalFor("/restaurant"), description }) }] }),
  component: RestaurantPage,
});

type FormState = { businessName: string; phone: string; contactName: string; instagramUrl: string; googleMapsUrl: string; currentWebsite: string; notes: string };
const EMPTY: FormState = { businessName: "", phone: "", contactName: "", instagramUrl: "", googleMapsUrl: "", currentWebsite: "", notes: "" };
const STEP_LABELS = ["Business", "Online presence", "Choose offer", "Smart features", "Review"];
const isUrl = (value: string) => { try { const url = new URL(value); return url.protocol === "http:" || url.protocol === "https:"; } catch { return false; } };

function RestaurantPage() {
  const track = useTrackEvent();
  useEffect(() => { track("restaurant_landing_view"); }, [track]);
  const submit = useServerFn(submitRestaurantApplication);
  const mountedAt = useRef(Date.now());
  const formStartedTracked = useRef(false);
  const [step, setStep] = useState(0);
  const [pkg, setPkg] = useState<RestaurantPackageKey>("moderate");
  const [extras, setExtras] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("jahjah-restaurant-draft-v2");
      if (saved) { const draft = JSON.parse(saved); setForm({ ...EMPTY, ...draft.form }); setPkg(draft.pkg || "moderate"); setExtras(Array.isArray(draft.extras) ? draft.extras : []); }
    } catch { /* ignore an invalid local draft */ }
  }, []);
  useEffect(() => { try { localStorage.setItem("jahjah-restaurant-draft-v2", JSON.stringify({ form, pkg, extras })); } catch { /* storage may be unavailable */ } }, [form, pkg, extras]);

  const totals = useMemo(() => computeRestaurantTotals(pkg, extras), [pkg, extras]);
  const selectedPackage = restaurantPackage(pkg);
  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { if (!formStartedTracked.current) { formStartedTracked.current = true; track("restaurant_form_started", { first_field: key }); } setError(""); setForm((v) => ({ ...v, [key]: e.target.value })); };
  const toggleExtra = (key: string) => setExtras((v) => v.includes(key) ? v.filter((x) => x !== key) : [...v, key]);

  const validateStep = () => {
    if (step === 0 && form.businessName.trim().length < 2) return "Please enter your restaurant or business name.";
    if (step === 0 && !/^\+?[0-9][0-9\s().-]{6,}$/.test(form.phone.trim())) return "Enter a valid WhatsApp number with country code, for example +961 71 000 000.";
    if (step === 1 && !isUrl(form.instagramUrl.trim())) return "Paste the full Instagram link beginning with https://";
    if (step === 1 && !isUrl(form.googleMapsUrl.trim())) return "Paste the full Google Maps link beginning with https://";
    if (step === 4 && form.currentWebsite.trim() && !isUrl(form.currentWebsite.trim())) return "Your website link should begin with https://";
    if (step === 4 && !consent) return "Please agree to be contacted about this request.";
    return "";
  };
  const next = () => { const message = validateStep(); if (message) { setError(message); document.getElementById("step-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }); return; } setError(""); setStep((v) => Math.min(4, v + 1)); };

  const mutation = useMutation({
    mutationFn: () => { const utm = getUtm(); return submit({ data: { businessName: form.businessName.trim(), contactName: form.contactName.trim(), phone: form.phone.trim(), email: "", currentWebsite: form.currentWebsite.trim(), instagramUrl: form.instagramUrl.trim(), googleMapsUrl: form.googleMapsUrl.trim(), country: "", city: "", packageKey: pkg, extras, notes: form.notes.trim(), consent: true, sessionId: getSessionId(), referrer: typeof document !== "undefined" ? document.referrer.slice(0,300) : "", utmSource: utm.utmSource ?? "", utmMedium: utm.utmMedium ?? "", utmCampaign: utm.utmCampaign ?? "", company_website: honeypot, elapsedMs: Date.now() - mountedAt.current } }); },
    onSuccess: () => { localStorage.removeItem("jahjah-restaurant-draft-v2"); track("restaurant_application_submitted", { package: pkg, extras_count: extras.length, total_cents: totals.totalCents, care_cents: selectedPackage.careCents }); },
  });
  const finalSubmit = () => { const message = validateStep(); if (message) { setError(message); return; } mutation.mutate(); };

  if (mutation.isSuccess) return <Success reference={mutation.data.reference} business={form.businessName} packageName={`${selectedPackage.name} — ${selectedPackage.focus}`} total={totals.totalCents} care={selectedPackage.careCents} />;

  return (
    <div className="min-h-screen bg-[#fff9f8]">
      <SiteHeader />
      <main className="pb-24 md:pb-0">
        <section className="relative overflow-hidden px-5 pb-16 pt-24 sm:px-8 sm:pb-20 sm:pt-32">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_12%,rgba(226,177,168,.34),transparent_34%),radial-gradient(circle_at_8%_70%,rgba(184,115,99,.12),transparent_30%)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[.88fr_1.12fr] lg:gap-14">
            <div><BrandMark /><p className="eyebrow mt-6 text-primary">AI-smart ordering websites for restaurants</p><h1 className="display mt-4 text-[2.65rem] leading-[.98] sm:text-6xl lg:text-7xl">Turn Your Restaurant Menu Into a Sales System.</h1><p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">Digital ordering, smart upselling, cross-selling, table ordering, reservations and customer insights — built around your restaurant.</p><div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground"><span className="rounded-full border border-primary/15 bg-card px-4 py-2">No login</span><span className="rounded-full border border-primary/15 bg-card px-4 py-2">Start in under 2 minutes</span><span className="rounded-full border border-primary/15 bg-card px-4 py-2">Exact price before submitting</span></div><button onClick={()=>document.getElementById("builder")?.scrollIntoView({behavior:"smooth"})} className="mt-7 inline-flex min-h-14 items-center gap-3 rounded-full bg-foreground px-7 text-xs font-semibold uppercase tracking-[.15em] text-primary-foreground shadow-lift">Build my ordering website <ArrowRight className="size-4" /></button></div>
            <RestaurantHeroVisual />
          </div>
        </section>

        <section className="border-y border-primary/10 bg-white/60 px-5 py-7 sm:px-8"><div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-3">{[["01","Share your business","Instagram, Maps and WhatsApp"],["02","Choose the system","Package plus smart features"],["03","Receive direct orders","A branded mobile-first experience"]].map(x=><div key={x[0]} className="flex items-center gap-4"><span className="font-display text-3xl text-primary">{x[0]}</span><span><strong className="block text-sm font-medium">{x[1]}</strong><span className="text-xs text-muted-foreground">{x[2]}</span></span></div>)}</div></section>

        <RestaurantOrderingJourney />
        <RestaurantGrowthSection onCtaClick={()=>track("restaurant_offer_click",{location:"restaurant_journey"})} />

        <IndustryProof />
        <RestaurantToolLinks />

        <section id="builder" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="eyebrow text-primary">Your ordering website</p><h2 className="display mt-4 text-4xl sm:text-6xl">One guided request. End to end.</h2></div>
            <div className="mt-10 grid gap-7 lg:grid-cols-[1fr_350px]">
              <div>
                <ol className="mb-6 grid grid-cols-5 gap-1" aria-label="Application progress">{STEP_LABELS.map((label,i)=><li key={label} className="min-w-0"><button type="button" onClick={()=>i<step&&setStep(i)} className="w-full text-left"><span className={i<=step?"block h-1.5 rounded-full bg-primary":"block h-1.5 rounded-full bg-primary/12"} /><span className={i===step?"mt-2 hidden text-[10px] font-medium text-foreground sm:block":"mt-2 hidden text-[10px] text-muted-foreground sm:block"}>{label}</span></button></li>)}</ol>
                <div id="step-panel" className="scroll-mt-28 rounded-[1.8rem] border border-primary/12 bg-white p-5 shadow-soft sm:p-8">
                  <p className="text-xs uppercase tracking-[.18em] text-primary">Step {step+1} of 5</p><h3 className="mt-2 font-display text-3xl">{STEP_LABELS[step]}</h3>
                  <div className="mt-7"><StepContent step={step} form={form} set={set} pkg={pkg} setPkg={(key)=>{setPkg(key);track("restaurant_package_selected",{package:key,location:"builder"});}} extras={extras} toggleExtra={toggleExtra} totals={totals.totalCents} consent={consent} setConsent={setConsent} /></div>
                  {error && <p role="alert" className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
                  {mutation.isError && <p role="alert" className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">We couldn't submit automatically. Your information is still saved—please try again or contact us on WhatsApp.</p>}
                  <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e)=>setHoneypot(e.target.value)} className="absolute h-0 w-0 opacity-0" aria-hidden="true" />
                  <div className="mt-8 flex items-center justify-between gap-3"><button type="button" disabled={step===0} onClick={()=>setStep(v=>Math.max(0,v-1))} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-primary/20 px-5 text-xs uppercase tracking-[.14em] disabled:invisible"><ArrowLeft className="size-4" /> Back</button>{step<4?<button type="button" onClick={next} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-foreground px-6 text-xs font-semibold uppercase tracking-[.14em] text-white">Continue <ArrowRight className="size-4" /></button>:<button type="button" disabled={mutation.isPending} onClick={finalSubmit} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-xs font-semibold uppercase tracking-[.14em] text-white disabled:opacity-60">{mutation.isPending?<Loader2 className="size-4 animate-spin" />:<Sparkles className="size-4" />} Submit my restaurant</button>}</div>
                </div>
              </div>
              <Summary pkg={pkg} extras={extras} total={totals.totalCents} />
            </div>
          </div>
        </section>
      </main>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/15 bg-[#fff9f8]/95 p-3 backdrop-blur-xl lg:hidden"><button type="button" disabled={mutation.isPending} onClick={step<4?next:finalSubmit} className="flex min-h-14 w-full items-center justify-between rounded-full bg-foreground px-5 text-xs font-semibold uppercase tracking-[.14em] text-white"><span>{step<4?"Continue":"Submit my restaurant"}</span><span className="text-right"><span className="block font-display text-xl text-[#efc9c2]">{usd(totals.totalCents)} build</span><span className="block text-[10px] normal-case tracking-normal text-white/75">+ {usd(selectedPackage.careCents)}/month maintenance</span></span></button></div>
      <SiteFooter />
    </div>
  );
}

function StepContent({ step, form, set, pkg, setPkg, extras, toggleExtra, totals, consent, setConsent }: { step:number; form:FormState; set:(key:keyof FormState)=>(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>void; pkg:RestaurantPackageKey; setPkg:(key:RestaurantPackageKey)=>void; extras:string[]; toggleExtra:(key:string)=>void; totals:number; consent:boolean; setConsent:(v:boolean)=>void }) {
  if (step===0) return <div className="grid gap-5 sm:grid-cols-2"><Field label="Business / restaurant name" required><input autoFocus value={form.businessName} onChange={set("businessName")} autoComplete="organization" className="input-luxe min-h-12" placeholder="Your restaurant name" /></Field><Field label="WhatsApp phone with country code" required><input value={form.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" className="input-luxe min-h-12" placeholder="+961 71 000 000" /></Field></div>;
  if (step===1) return <div className="grid gap-5"><Field label="Instagram link" required hint="We use it to understand your identity, menu and content."><input autoFocus value={form.instagramUrl} onChange={set("instagramUrl")} inputMode="url" className="input-luxe min-h-12" placeholder="https://instagram.com/yourrestaurant" /></Field><Field label="Google Maps link" required hint="This gives us your location, hours and public business information."><input value={form.googleMapsUrl} onChange={set("googleMapsUrl")} inputMode="url" className="input-luxe min-h-12" placeholder="https://maps.google.com/..." /></Field></div>;
  if (step===2) return <div className="grid gap-4 md:grid-cols-3">{RESTAURANT_PACKAGES.map(p=><button type="button" key={p.key} onClick={()=>setPkg(p.key)} className={pkg===p.key?"relative min-h-48 rounded-2xl border border-primary bg-primary/5 p-5 text-left":"relative min-h-48 rounded-2xl border border-primary/12 bg-[#fffaf9] p-5 text-left"}>{p.popular&&<span className="absolute right-3 top-3 rounded-full bg-primary/10 px-2 py-1 text-[9px] uppercase tracking-[.12em] text-primary">Recommended</span>}<span className="block text-sm font-medium">{p.name}</span><span className="mt-1 block font-display text-2xl">{p.focus}</span><span className="mt-5 block font-display text-4xl text-primary">{usd(p.priceCents)}</span><span className="mt-1 block text-xs font-medium text-foreground">one-time build + {usd(p.careCents)}/month maintenance</span>{p.key==="advanced"&&<span className="mt-2 inline-flex rounded-full bg-primary/10 px-2 py-1 text-[9px] uppercase tracking-[.12em] text-primary">Premium maintenance</span>}<span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{p.pitch}</span>{pkg===p.key&&<Check className="absolute bottom-4 right-4 size-5 text-primary" />}</button>)}</div>;
  if (step===3) return <div><p className="mb-4 text-sm text-muted-foreground">Select only what you need. Every option adds exactly {usd(RESTAURANT_EXTRA_PRICE_CENTS)}.</p><div className="grid gap-3 sm:grid-cols-2">{RESTAURANT_EXTRAS.map(extra=>{const selected=extras.includes(extra.key);return <button type="button" key={extra.key} onClick={()=>toggleExtra(extra.key)} aria-pressed={selected} className={selected?"flex min-h-24 items-start gap-3 rounded-2xl border border-primary bg-primary/5 p-4 text-left":"flex min-h-24 items-start gap-3 rounded-2xl border border-primary/12 bg-[#fffaf9] p-4 text-left"}><span className={selected?"grid size-7 shrink-0 place-items-center rounded-full bg-primary text-white":"grid size-7 shrink-0 place-items-center rounded-full border border-primary/20 text-primary"}>{selected?<Check className="size-4" />:<Plus className="size-4" />}</span><span className="min-w-0 flex-1"><strong className="block text-sm font-medium">{extra.label}</strong><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{extra.note}</span></span><span className="shrink-0 text-xs font-medium text-primary">+$50</span></button>})}</div></div>;
  return <div><div className="rounded-2xl border border-primary/12 bg-[#fffaf9] p-5"><div className="flex justify-between gap-4"><span><span className="block text-xs uppercase tracking-[.14em] text-muted-foreground">Restaurant</span><strong className="mt-1 block text-lg">{form.businessName}</strong><span className="text-sm text-muted-foreground">{form.phone}</span></span><span className="text-right"><span className="block text-xs uppercase tracking-[.14em] text-muted-foreground">One-time build total</span><strong className="mt-1 block font-display text-4xl text-primary">{usd(totals)}</strong></span></div><div className="mt-5 border-t border-primary/10 pt-4 text-sm"><p><strong>{restaurantPackage(pkg).name}</strong> — {restaurantPackage(pkg).focus}</p><p className="mt-1 text-muted-foreground">{extras.length ? `${extras.length} smart feature${extras.length===1?"":"s"} selected` : "No extra features selected"}</p><p className="mt-3 rounded-lg bg-white p-3 text-sm"><strong>Website Care & Hosting:</strong> {usd(restaurantPackage(pkg).careCents)}/month after launch, billed separately.</p><p className="mt-2 text-xs text-muted-foreground">Features outside your package are $50 each, confirmed and added to the final project invoice at the end of the build.</p></div></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Contact name (optional)"><input value={form.contactName} onChange={set("contactName")} autoComplete="name" className="input-luxe min-h-12" placeholder="Who should we contact?" /></Field><Field label="Current website (optional)"><input value={form.currentWebsite} onChange={set("currentWebsite")} inputMode="url" className="input-luxe min-h-12" placeholder="https://yourrestaurant.com" /></Field></div><Field label="Notes / special requests (optional)"><textarea value={form.notes} onChange={set("notes")} rows={4} className="input-luxe mt-5 resize-y" placeholder="Cuisine, branches, delivery areas or anything else we should know…" /></Field><label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-primary/12 p-4 text-sm leading-relaxed text-muted-foreground"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1 size-4 accent-[var(--champagne)]" />I agree to be contacted on WhatsApp or phone about this request. The final scope is confirmed before payment.</label></div>;
}

function Summary({ pkg, extras, total }: { pkg:RestaurantPackageKey; extras:string[]; total:number }) { const p=restaurantPackage(pkg); return <aside className="hidden self-start rounded-[1.8rem] border border-primary/15 bg-white p-6 shadow-lift lg:sticky lg:top-28 lg:block"><p className="eyebrow text-primary">Live order summary</p><h3 className="mt-3 font-display text-3xl">{p.name}</h3><p className="text-sm text-muted-foreground">{p.focus}</p><div className="my-5 h-px bg-primary/10" /><div className="flex justify-between text-sm"><span>Package</span><span>{usd(p.priceCents)}</span></div><div className="mt-3 flex justify-between text-sm"><span>Smart features × {extras.length}</span><span>{usd(extras.length*RESTAURANT_EXTRA_PRICE_CENTS)}</span></div><div className="mt-5 flex items-end justify-between border-t border-primary/10 pt-5"><span className="text-xs uppercase tracking-[.14em] text-muted-foreground">One-time build</span><strong className="font-display text-4xl text-primary">{usd(total)}</strong></div><div className="mt-3 flex justify-between text-sm font-medium"><span>Care & Hosting after launch</span><span>{usd(p.careCents)}/month</span></div>{p.key==="advanced"&&<p className="mt-2 text-xs font-medium text-primary">Advanced includes premium maintenance at $149/month.</p>}<p className="mt-3 text-xs leading-relaxed text-muted-foreground">Features outside your package are $50 each and added to the final project invoice.</p><p className="mt-5 rounded-xl bg-[#fff5f2] p-3 text-xs leading-relaxed text-muted-foreground">No marketplace commission. No hidden package price. We confirm your final scope before payment.</p></aside>; }

function Field({ label, required, hint, children }: { label:string; required?:boolean; hint?:string; children:React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-medium text-foreground">{label}{required&&<span className="text-primary"> *</span>}</span>{children}{hint&&<span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{hint}</span>}</label>; }

function Success({ reference, business, packageName, total, care }: { reference:string; business:string; packageName:string; total:number; care:number }) { const url=buildWhatsAppUrl(`Hello Jahjah WebDigital, I submitted my restaurant ordering website request. Reference: ${reference}.`); return <div className="min-h-screen bg-[#fff9f8]"><SiteHeader /><main className="px-5 pb-20 pt-32 sm:px-8 sm:pt-40"><div className="mx-auto max-w-2xl rounded-[2rem] border border-primary/15 bg-white p-7 text-center shadow-lift sm:p-12"><span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary"><Check className="size-7" /></span><p className="eyebrow mt-6 text-primary">Request received</p><h1 className="display mt-4 text-4xl sm:text-5xl">Your ordering website journey has started.</h1><p className="mt-5 text-muted-foreground">Thank you, {business}. We will review your Instagram, Google Maps and selected offer, then contact you to confirm the scope.</p><div className="mt-7 rounded-2xl bg-[#fff6f4] p-5 text-left"><div className="flex justify-between"><span className="text-xs uppercase tracking-[.14em] text-muted-foreground">Reference</span><strong className="font-mono text-primary">{reference}</strong></div><div className="mt-3 flex justify-between gap-4"><span>{packageName} · one-time build</span><strong className="font-display text-2xl text-primary">{usd(total)}</strong></div><div className="mt-3 flex justify-between gap-4 text-sm"><span>Website Care & Hosting after launch</span><strong>{usd(care)}/month</strong></div></div><ol className="mx-auto mt-8 max-w-md space-y-3 text-left text-sm text-muted-foreground"><li>1. We review your business links and request.</li><li>2. We contact you to confirm content and final scope.</li><li>3. Your first branded ordering direction is prepared.</li></ol><a href={url} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-13 items-center gap-2 rounded-full bg-[#1fa855] px-6 text-xs font-semibold uppercase tracking-[.14em] text-white"><MessageCircle className="size-4" /> Continue on WhatsApp</a></div></main><SiteFooter /></div>; }