"use client";

import type { Dictionary } from "@/content/dictionary";
import { openInquiry } from "@/lib/inquiryBus";

// Equirectangular placement over lon 32–58°E, lat 19–37°N. Schematic: positions are true, no coastlines drawn.
const W = 1000, H = 700;
const proj = (lon: number, lat: number) => [((lon - 32) / 26) * W, ((37 - lat) / 18) * H] as const;
const PLACES = [
  { k: "beirut", lon: 35.5, lat: 33.89, country: "LB", city: "" },
  { k: "riyadh", lon: 46.72, lat: 24.71, country: "SA", city: "Riyadh" },
  { k: "jeddah", lon: 39.19, lat: 21.49, country: "SA", city: "Jeddah" },
  { k: "dubai", lon: 55.27, lat: 25.2, country: "AE", city: "Dubai" },
  { k: "doha", lon: 51.53, lat: 25.29, country: "QA", city: "Doha" },
] as const;

export default function GlobalMap({ t }: { t: Dictionary["global"] }) {
  const [bx, by] = proj(PLACES[0].lon, PLACES[0].lat);
  return (
    <section id="global" className="section global" aria-labelledby="global-title">
      <div className="wrap">
        <div className="index-row"><span className="kicker">{t.index}</span></div>
        <div className="studio-grid">
          <h2 id="global-title" className="display h-lg rv" style={{ margin: 0 }}>{t.title}</h2>
          <div className="rv rv-d1">
            <p className="lead" style={{ marginTop: 0 }}>{t.copy}</p>
            <p className="muted" style={{ fontSize: 14 }}>{t.note}</p>
          </div>
        </div>
        <div className="map-wrap">
          <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={t.title}>
            <g className="map-grid" aria-hidden="true">
              {Array.from({ length: 14 }, (_, i) => <line key={`v${i}`} className={i % 5 === 0 ? "major" : ""} x1={(i * W) / 13} y1="0" x2={(i * W) / 13} y2={H} />)}
              {Array.from({ length: 10 }, (_, i) => <line key={`h${i}`} className={i % 3 === 0 ? "major" : ""} x1="0" y1={(i * H) / 9} x2={W} y2={(i * H) / 9} />)}
            </g>
            {PLACES.slice(1).map((p) => {
              const [x, y] = proj(p.lon, p.lat);
              const cx = (bx + x) / 2, cy = Math.min(by, y) - 140;
              return <path key={p.k} className="map-arc" d={`M${bx} ${by} Q ${cx} ${cy} ${x} ${y}`} aria-hidden="true" />;
            })}
            {PLACES.map((p) => {
              const [x, y] = proj(p.lon, p.lat);
              const label = t.places[p.k];
              const left = p.k === "doha";
              return (
                <g key={p.k} className="map-pin" transform={`translate(${x} ${y})`} tabIndex={0} role="button" aria-label={`${label} — ${t.start}`}
                  onClick={() => openInquiry()} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openInquiry(); } }}>
                  <circle className="halo" r="14" />
                  <circle className="dot" r="4.5" />
                  <text x={left ? -14 : 14} y="-12" textAnchor={left ? "end" : "start"}>{label}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div style={{ marginTop: 40 }}>
          <button type="button" className="btn" onClick={() => openInquiry()}>{t.start} <span className="arrow">→</span></button>
        </div>
      </div>
    </section>
  );
}
