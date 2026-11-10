"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { GA4_ID } from "@/lib/site";
import { CONSENT_KEY } from "@/lib/analytics";

const COPY = {
  en: { text: "We use privacy-friendly analytics to understand how visitors use this site. No data is collected unless you accept.", yes: "Accept", no: "Decline" },
  ar: { text: "نستخدم تحليلات تحترم الخصوصية لفهم كيفية استخدام الموقع. لا تُجمع أيّ بيانات ما لم توافق.", yes: "موافق", no: "رفض" },
};

/** Loads the DOS GA4 property only when configured and only after explicit consent. */
export default function Analytics({ locale }: { locale: "en" | "ar" }) {
  const [choice, setChoice] = useState<"granted" | "denied" | "unset" | null>(null);

  useEffect(() => {
    if (!GA4_ID) return;
    try {
      const v = localStorage.getItem(CONSENT_KEY);
      setChoice(v === "granted" || v === "denied" ? v : "unset");
    } catch {
      setChoice("unset");
    }
  }, []);

  if (!GA4_ID || choice === null) return null;
  const decide = (v: "granted" | "denied") => {
    try { localStorage.setItem(CONSENT_KEY, v); } catch {}
    setChoice(v);
  };
  const c = COPY[locale];

  return (
    <>
      {choice === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA4_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {choice === "unset" && (
        <div className="consent glass" role="dialog" aria-label="Analytics consent">
          <p>{c.text}</p>
          <button type="button" className="btn small" onClick={() => decide("granted")}>{c.yes}</button>
          <button type="button" className="link" onClick={() => decide("denied")}>{c.no}</button>
        </div>
      )}
    </>
  );
}
