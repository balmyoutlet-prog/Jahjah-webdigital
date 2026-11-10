"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dictionary, Locale } from "@/content/dictionary";
import { STYLES, type Tag } from "@/content/styles";
import StyleArt from "./StyleArt";
import { readSaved, writeSaved, MAX_SAVED } from "@/lib/stylePrefs";
import { openInquiry } from "@/lib/inquiryBus";
import { track } from "@/lib/analytics";

export default function StyleExplorer({ t, locale }: { t: Dictionary["styles"]; locale: Locale }) {
  const [filter, setFilter] = useState<Tag | "all">("all");
  const [id, setId] = useState(STYLES[0].id);
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    setSaved(readSaved());
    const on = () => setSaved(readSaved());
    window.addEventListener("dos:styles-changed", on);
    return () => window.removeEventListener("dos:styles-changed", on);
  }, []);

  const list = useMemo(() => (filter === "all" ? STYLES : STYLES.filter((s) => s.tags.includes(filter))), [filter]);
  const s = STYLES.find((x) => x.id === id) ?? STYLES[0];
  const isSaved = saved.includes(s.id);

  const select = (nid: string) => {
    setId(nid);
    track("style_view", { style: nid });
  };
  const toggle = () => {
    const next = isSaved ? saved.filter((x) => x !== s.id) : [...saved.filter((x) => x !== s.id), s.id].slice(-MAX_SAVED);
    writeSaved(next);
    if (!isSaved) track("style_save", { style: s.id });
  };

  return (
    <section id="styles" className="section" aria-labelledby="styles-title">
      <div className="wrap">
        <div className="index-row"><span className="kicker">{t.index}</span></div>
        <div className="styles-head">
          <div>
            <h2 id="styles-title" className="display h-lg rv" style={{ margin: 0 }}>{t.title}</h2>
            <p className="lead" style={{ marginTop: 20 }}>{t.lead}</p>
          </div>
          <p className="note">{t.disclaimer}</p>
        </div>

        <div className="style-filters" role="group" aria-label="Filter">
          {(["all", "residential", "commercial", "regional"] as const).map((f) => (
            <button key={f} type="button" className="chip-btn" aria-pressed={filter === f}
              onClick={() => { setFilter(f); const first = f === "all" ? STYLES[0] : STYLES.find((x) => x.tags.includes(f)); if (first && !(f === "all" || s.tags.includes(f))) setId(first.id); }}>
              {f === "all" ? t.all : t.filters[f]}
            </button>
          ))}
        </div>

        <div className="styles-body">
          <ul className="style-index">
            {list.map((x) => (
              <li key={x.id}>
                <button type="button" aria-current={x.id === s.id} onClick={() => select(x.id)}>
                  <span>{x.name[locale]}{saved.includes(x.id) ? " ●" : ""}</span>
                  <span className="n">{String(STYLES.indexOf(x) + 1).padStart(2, "0")}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="style-stage style-anim" key={s.id} aria-live="polite">
            <div className="style-art">
              {s.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
              ) : (
                <StyleArt palette={s.palette} motif={s.motif} id={s.id} />
              )}
              <span className="tag">{t.disclaimer}</span>
            </div>
            <div className="style-info">
              <p className="kicker">{String(STYLES.indexOf(s) + 1).padStart(2, "0")} / {STYLES.length}</p>
              <h3>{s.name[locale]}</h3>
              <p style={{ color: "var(--ink-2)", margin: 0 }}>{s.desc[locale]}</p>
              <div className="swatches" aria-hidden="true">{s.palette.map((c) => <span key={c} style={{ background: c }} />)}</div>
              <dl>
                <div><dt className="kicker">{t.materials}</dt><dd>{s.materials[locale].join(" · ")}</dd></div>
                <div><dt className="kicker">{t.traits}</dt><dd>{s.traits[locale].join(" · ")}</dd></div>
                <div><dt className="kicker">{t.uses}</dt><dd>{s.uses[locale]}</dd></div>
              </dl>
              <div className="style-actions">
                <button type="button" className="btn" onClick={() => { track("style_select", { style: s.id }); openInquiry({ styleId: s.id }); }}>
                  {t.designMySpace} <span className="arrow">→</span>
                </button>
                <button type="button" className="btn ghost" aria-pressed={isSaved} onClick={toggle}>
                  {isSaved ? `✓ ${t.saved}` : t.save}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="compare glass" aria-labelledby="compare-title">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <h3 id="compare-title" className="kicker" style={{ margin: 0 }}>{t.compareTitle} ({saved.length}/{MAX_SAVED})</h3>
            {saved.length > 0 && <button type="button" className="link" onClick={() => writeSaved([])}>{t.clear}</button>}
          </div>
          {saved.length === 0 ? (
            <p className="muted" style={{ margin: "12px 0 0", fontSize: 14 }}>{t.compareEmpty}</p>
          ) : (
            <div className="compare-grid">
              {saved.map((sid) => {
                const x = STYLES.find((y) => y.id === sid);
                if (!x) return null;
                return (
                  <div key={sid} className="compare-card">
                    <div className="swatches">{x.palette.map((c) => <span key={c} style={{ background: c }} />)}</div>
                    <h4>{x.name[locale]}</h4>
                    <p style={{ margin: "0 0 6px" }}><span className="muted">{t.materials}: </span>{x.materials[locale].slice(0, 3).join(", ")}</p>
                    <p style={{ margin: 0 }}><span className="muted">{t.uses}: </span>{x.uses[locale]}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
