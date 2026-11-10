"use client";

import type { Dictionary } from "@/content/dictionary";
import { TEAM, PREVIEW_MODE } from "@/lib/site";
import { openInquiry } from "@/lib/inquiryBus";

export default function Designers({ t, locale }: { t: Dictionary["designers"]; locale: "en" | "ar" }) {
  const people = [
    { key: "interiors" as const, m: TEAM.interiors, c: t.interiors, nameAr: TEAM.interiors.nameAr, intent: "interior-architecture" as const },
    { key: "architecture" as const, m: TEAM.architecture, c: t.architecture, nameAr: TEAM.architecture.nameAr, intent: "architectural-design" as const },
  ];
  return (
    <section id="designers" className="section" aria-labelledby="des-title" style={{ background: "var(--paper)" }}>
      <div className="wrap">
        <div className="index-row"><span className="kicker">{t.index}</span></div>
        <h2 id="des-title" className="display h-lg rv" style={{ margin: 0, maxWidth: "12ch" }}>{t.title}</h2>
        <div className="team">
          {people.map((p) => (
            <article key={p.key} className="member">
              <div className="portrait">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.m.photo} alt={locale === "ar" ? p.nameAr : p.m.name} width={880} height={1100} loading="lazy" decoding="async" />
                <span className="frame" />
              </div>
              <h3>
                {locale === "ar" ? p.nameAr : p.m.name}
                {PREVIEW_MODE && !p.m.confirmed && <span className="pending">{t.pending}</span>}
              </h3>
              <p className="kicker role">{p.c.role}</p>
              <p className="bio">{p.c.bio}</p>
              <ul className="chips">{p.c.expertise.map((x) => <li key={x}>{x}</li>)}</ul>
              <button type="button" className="btn ghost" onClick={() => openInquiry({ intent: p.intent, specialist: p.key })}>
                {p.c.cta} <span className="arrow">→</span>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
