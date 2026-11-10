"use client";

import { useState } from "react";
import type { Dictionary } from "@/content/dictionary";
import { openInquiry } from "@/lib/inquiryBus";
import { PREVIEW_MODE } from "@/lib/site";
import { track } from "@/lib/analytics";

export default function Expertise({ t }: { t: Dictionary["expertise"] }) {
  const [active, setActive] = useState(0);
  const g = t.groups[active];

  return (
    <section id="expertise" className="section" aria-labelledby="exp-title">
      <div className="wrap">
        <div className="index-row"><span className="kicker">{t.index}</span></div>
        <h2 id="exp-title" className="display h-lg rv" style={{ margin: 0, maxWidth: "14ch" }}>{t.title}</h2>
        {PREVIEW_MODE && <p className="note" style={{ marginTop: 18 }}>{t.pending}</p>}
        <div className="exp-tabs glass" role="tablist" aria-label={t.title}>
          {t.groups.map((gr, i) => (
            <button key={gr.id} id={`tab-${gr.id}`} role="tab" type="button" className="exp-tab" aria-selected={i === active} aria-controls={`panel-${gr.id}`} tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  const rtl = document.documentElement.dir === "rtl";
                  const d = (e.key === "ArrowRight") !== rtl ? 1 : -1;
                  const n = (active + d + t.groups.length) % t.groups.length;
                  setActive(n);
                  document.getElementById(`tab-${t.groups[n].id}`)?.focus();
                }
              }}>
              {gr.title}
            </button>
          ))}
        </div>
        <div className="exp-panel style-anim" key={g.id} id={`panel-${g.id}`} role="tabpanel" aria-labelledby={`tab-${g.id}`}>
          <div>
            <div className="exp-visual"><ExpVisual kind={g.id} /></div>
            <p className="lead" style={{ marginTop: 24 }}>{g.lead}</p>
            <button type="button" className="btn" onClick={() => { track("cta_click", { cta: g.id }); openInquiry({ intent: g.intent }); }}>
              {g.cta} <span className="arrow">→</span>
            </button>
          </div>
          <ul className="exp-list">
            {g.items.map((it) => (
              <li key={it}>
                <button type="button" onClick={() => { track("service_select", { service: it }); openInquiry({ intent: g.intent }); }}>
                  <span>{it}</span><span>{t.discuss} →</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ExpVisual({ kind }: { kind: string }) {
  const stroke = { fill: "none", stroke: "#151515", strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const };
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="500" fill="#ece6dc" />
      <rect y="370" width="400" height="130" fill="#ddd1bd" />
      {kind === "architecture" && (
        <g {...stroke}>
          <rect x="60" y="170" width="220" height="200" fill="#f8f6f2" />
          <rect x="130" y="100" width="210" height="70" fill="#fbfaf8" />
          {Array.from({ length: 8 }, (_, i) => <line key={i} x1={150 + i * 24} y1="110" x2={150 + i * 24} y2="160" opacity=".4" />)}
          <rect x="80" y="200" width="80" height="170" fill="rgba(210,225,230,.5)" />
          <rect x="180" y="200" width="80" height="170" fill="rgba(210,225,230,.5)" />
          <line x1="20" y1="370" x2="380" y2="370" />
        </g>
      )}
      {kind === "interiors" && (
        <g {...stroke}>
          <path d="M0 80 L120 160 L280 160 L400 80" />
          <path d="M120 160 V330 H280 V160" fill="#f6f2ec" />
          <path d="M0 470 L120 330 M280 330 L400 470" />
          <rect x="150" y="190" width="100" height="70" fill="rgba(210,225,230,.45)" />
          <path d="M130 330 v-30 h140 v30" fill="#d3c4aa" />
          <ellipse cx="200" cy="175" rx="26" ry="6" />
          <line x1="200" y1="160" x2="200" y2="169" />
        </g>
      )}
      {kind === "specialized" && (
        <g {...stroke}>
          <path d="M0 300 C 90 260, 180 330, 260 290 S 360 250, 400 280" />
          <rect x="40" y="380" width="200" height="30" fill="rgba(200,215,218,.8)" />
          <path d="M260 370 V230 a50 50 0 0 1 100 0 V370" fill="#f8f6f2" />
          {Array.from({ length: 5 }, (_, i) => <circle key={i} cx={60 + i * 40} cy={330} r={14} fill="#c9d1bf" />)}
        </g>
      )}
    </svg>
  );
}
