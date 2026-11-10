"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dictionary, Locale } from "@/content/dictionary";
import { INTENTS, routeIntent, resolveNumber, buildMessage, waLink, isValidWaNumber, type IntentKey, type Specialist } from "@/lib/whatsapp";
import { WHATSAPP, TEAM } from "@/lib/site";
import { STYLES } from "@/content/styles";
import { readSaved } from "@/lib/stylePrefs";
import type { InquiryPreset } from "@/lib/inquiryBus";
import { track } from "@/lib/analytics";

type Form = {
  intent: IntentKey | "";
  country: string;
  city: string;
  cityOther: string;
  projectType: string;
  area: string;
  style: string;
  stage: string;
  name: string;
  budget: string;
  timeline: string;
  remote: boolean;
  notes: string;
  consent: boolean;
};

const EMPTY: Form = { intent: "", country: "", city: "", cityOther: "", projectType: "", area: "", style: "", stage: "", name: "", budget: "", timeline: "", remote: false, notes: "", consent: false };

export default function Inquiry({ t, locale }: { t: Dictionary["inquiry"]; locale: Locale }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>(EMPTY);
  const [who, setWho] = useState<Specialist | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((o) => ({ ...o, [k]: v }));

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<InquiryPreset>).detail || {};
      setF((o) => ({ ...o, intent: d.intent ?? o.intent, style: d.styleId ?? o.style }));
      if (d.specialist) setWho(d.specialist);
      if (d.intent) setStep((s) => (s === 0 ? 1 : s));
      setErrors([]);
    };
    window.addEventListener("dos:inquiry", on);
    return () => window.removeEventListener("dos:inquiry", on);
  }, []);

  // Default the style to the visitor's first saved preference.
  useEffect(() => {
    if (step === 1 && !f.style) {
      const s = readSaved()[0];
      if (s) set("style", s);
    }
  }, [step, f.style]);

  const countryCities = f.country ? t.countries[f.country]?.cities ?? [] : [];
  const needsCityText = f.country === "XX" || f.city === "__other";
  const cityValue = needsCityText ? f.cityOther.trim() : f.city;
  const route = f.intent ? routeIntent(f.intent) : null;
  const specialist: Specialist | null = route === "both" ? who : route;

  const validate = (s: number): string[] => {
    const e: string[] = [];
    if (s === 0 && !f.intent) e.push("intent");
    if (s === 1) {
      if (!f.country) e.push("country");
      if (!cityValue) e.push("city");
    }
    if (s === 2) {
      if (!f.name.trim()) e.push("name");
      if (!f.consent) e.push("consent");
    }
    if (s === 3 && route === "both" && !who) e.push("who");
    return e;
  };

  const go = (d: 1 | -1) => {
    if (d === 1) {
      const e = validate(step);
      setErrors(e);
      if (e.length) return;
      track("consultation_step", { step: step + 1, intent: f.intent });
      if (step === 2) track("inquiry_qualified", { intent: f.intent, country: f.country });
    } else setErrors([]);
    setStep((s) => Math.min(3, Math.max(0, s + d)));
  };

  const styleName = f.style ? STYLES.find((s) => s.id === f.style)?.name[locale] ?? "" : "";
  const message = useMemo(() => {
    if (!f.intent) return "";
    return buildMessage(locale, {
      intentPhrase: t.phrases[f.intent],
      name: f.name.trim(),
      city: cityValue,
      country: f.country ? t.countries[f.country]?.label : "",
      projectType: f.projectType,
      area: f.area.trim(),
      style: styleName,
      stage: f.stage,
      budget: f.budget,
      timeline: f.timeline,
      remote: f.remote,
      notes: f.notes.trim(),
    });
  }, [f, locale, t, cityValue, styleName]);

  const number = specialist ? resolveNumber(specialist, WHATSAPP) : "";
  const href = waLink(number, message);
  const person = specialist === "architecture" ? TEAM.architecture : specialist === "interiors" ? TEAM.interiors : null;
  const personName = specialist === "architecture" ? t.whoArch : specialist === "interiors" ? t.whoInt : t.general;
  const err = (k: string) => errors.includes(k);

  const sel = ({ k, label, options, required }: { k: keyof Form; label: string; options: string[] | [string, string][]; required?: boolean }) => (
    <div className={`field${err(k as string) ? " err" : ""}`}>
      <label htmlFor={`f-${k}`}>{label}{required ? " *" : ""}</label>
      <select id={`f-${k}`} value={f[k] as string} onChange={(e) => set(k, e.target.value as never)} aria-invalid={err(k as string)} required={required}>
        <option value="">{t.select}</option>
        {options.map((o) => (Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o} value={o}>{o}</option>))}
      </select>
    </div>
  );

  return (
    <section id="start" className="section" aria-labelledby="inq-title" style={{ scrollMarginTop: 40 }}>
      <div className="wrap inq">
        <div>
          <div className="index-row"><span className="kicker">{t.index}</span></div>
          <h2 id="inq-title" className="display h-lg" style={{ margin: 0 }}>{t.title}</h2>
          <p className="lead" style={{ marginTop: 22 }}>{t.lead}</p>
        </div>

        <div className="inq-card glass">
          <ol className="inq-steps" aria-label="Progress">
            {t.steps.map((s, i) => <li key={s} className={i <= step ? "on" : ""} aria-current={i === step ? "step" : undefined}>{s}</li>)}
          </ol>

          {step === 0 && (
            <div className="intent-grid" role="group" aria-label={t.title}>
              {INTENTS.map((k) => (
                <button key={k} type="button" className="intent" aria-pressed={f.intent === k}
                  onClick={() => { set("intent", k); setErrors([]); if (routeIntent(k) !== "both") setWho(null); }}>
                  {t.intents[k]}
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="fgrid">
              {sel({ k: "country", label: t.fields.country, required: true, options: Object.entries(t.countries).map(([c, v]) => [c, v.label] as [string, string]) })}
              {f.country && f.country !== "XX" ? (
                sel({ k: "city", label: t.fields.city, required: true, options: [...countryCities.map((c) => [c, c] as [string, string]), ["__other", t.otherCity] as [string, string]] })
              ) : (
                <div className={`field${err("city") ? " err" : ""}`}>
                  <label htmlFor="f-cityOther">{t.fields.cityOther} *</label>
                  <input id="f-cityOther" value={f.cityOther} onChange={(e) => set("cityOther", e.target.value)} autoComplete="address-level2" />
                </div>
              )}
              {f.city === "__other" && f.country !== "XX" && (
                <div className={`field full${err("city") ? " err" : ""}`}>
                  <label htmlFor="f-cityOther2">{t.fields.cityOther} *</label>
                  <input id="f-cityOther2" value={f.cityOther} onChange={(e) => set("cityOther", e.target.value)} autoComplete="address-level2" />
                </div>
              )}
              {sel({ k: "projectType", label: t.fields.projectType, options: t.projectTypes })}
              <div className="field">
                <label htmlFor="f-area">{t.fields.area}</label>
                <input id="f-area" inputMode="numeric" pattern="[0-9]*" value={f.area} onChange={(e) => set("area", e.target.value.replace(/[^\d٠-٩]/g, "").slice(0, 6))} />
              </div>
              {sel({ k: "style", label: t.fields.style, options: STYLES.map((s) => [s.id, s.name[locale]] as [string, string]) })}
              {sel({ k: "stage", label: t.fields.stage, options: t.stages })}
            </div>
          )}

          {step === 2 && (
            <div className="fgrid">
              <div className={`field full${err("name") ? " err" : ""}`}>
                <label htmlFor="f-name">{t.fields.name} *</label>
                <input id="f-name" value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" maxLength={80} />
              </div>
              {sel({ k: "budget", label: t.fields.budget, options: t.budgets })}
              {sel({ k: "timeline", label: t.fields.timeline, options: t.timelines })}
              <div className="field full">
                <label htmlFor="f-notes">{t.fields.notes}</label>
                <textarea id="f-notes" value={f.notes} onChange={(e) => set("notes", e.target.value)} maxLength={600} />
              </div>
              <label className="check full"><input type="checkbox" checked={f.remote} onChange={(e) => set("remote", e.target.checked)} />{t.fields.remote}</label>
              <label className={`check full${err("consent") ? " err" : ""}`}><input type="checkbox" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} required />{t.fields.consent}</label>
              <p className="muted full" style={{ fontSize: 13.5, margin: 0 }}>{t.fields.files}</p>
            </div>
          )}

          {step === 3 && (
            <div>
              {route === "both" && (
                <>
                  <p style={{ margin: 0 }}>{t.who}</p>
                  <div className="who" role="group">
                    <button type="button" className="intent" aria-pressed={who === "architecture"} onClick={() => { setWho("architecture"); setErrors([]); }}>{t.whoArch}</button>
                    <button type="button" className="intent" aria-pressed={who === "interiors"} onClick={() => { setWho("interiors"); setErrors([]); }}>{t.whoInt}</button>
                  </div>
                </>
              )}
              {specialist && (
                <>
                  <div className="routed">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {person && <img src={person.photo} alt="" width={44} height={44} />}
                    <div>
                      <div className="kicker">{t.routedTo}</div>
                      <div>{personName}</div>
                    </div>
                  </div>
                  <p className="kicker" style={{ margin: "0 0 8px" }}>{t.preview}</p>
                  <div className="msg-preview" dir={locale === "ar" ? "rtl" : "ltr"}>{message}</div>
                  {!isValidWaNumber(number) && <p className="note" style={{ marginTop: 12 }}>{t.notConfigured}</p>}
                </>
              )}
            </div>
          )}

          {errors.length > 0 && <p className="err-text" role="alert">{t.required}</p>}

          <div className="inq-nav">
            {step > 0 ? <button type="button" className="link" onClick={() => go(-1)}>{t.back}</button> : <span />}
            {step < 3 ? (
              <button type="button" className="btn" onClick={() => go(1)}>{t.next} <span className="arrow">→</span></button>
            ) : specialist ? (
              <a className="btn wa-btn" href={href} target="_blank" rel="noopener noreferrer"
                onClick={() => track("whatsapp_click", { specialist, intent: f.intent, country: f.country })}>
                {t.whatsapp} <span className="arrow">→</span>
              </a>
            ) : (
              <button type="button" className="btn" onClick={() => go(1)}>{t.whatsapp} <span className="arrow">→</span></button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
