import type { Dictionary } from "@/content/dictionary";
import { BRAND } from "@/lib/site";
import projects from "@/content/projects.json";

/**
 * Portfolio. Renders only verified entries from content/projects.json (see docs/CONTENT-WORKFLOW.md).
 * Until the studio supplies authorized files, it shows the categories as an honest "in curation" state.
 */
export default function Work({ t }: { t: Dictionary["work"] }) {
  const verified = (projects as { published: boolean }[]).filter((p) => p.published);
  return (
    <section id="work" className="section" aria-labelledby="work-title" style={{ background: "var(--paper)" }}>
      <div className="wrap">
        <div className="index-row"><span className="kicker">{t.index}</span></div>
        <div className="studio-grid">
          <h2 id="work-title" className="display h-lg rv" style={{ margin: 0 }}>{t.title}</h2>
          <div className="rv rv-d1">
            <p className="lead" style={{ marginTop: 0 }}>{t.lead}</p>
            <a className="btn ghost" href={BRAND.instagram} target="_blank" rel="noopener noreferrer" data-track="instagram_click">
              {t.instagram} · {BRAND.instagramHandle} <span className="arrow">↗</span>
            </a>
          </div>
        </div>
        {verified.length === 0 && (
          <div className="work-grid">
            {t.categories.map((c, i) => (
              <div key={c} className="work-cell">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <line x1="0" y1={20 + ((i * 13) % 60)} x2="100" y2={20 + ((i * 13) % 60)} stroke="#151515" strokeWidth=".2" vectorEffect="non-scaling-stroke" />
                  <line x1={15 + ((i * 17) % 70)} y1="0" x2={15 + ((i * 17) % 70)} y2="100" stroke="#151515" strokeWidth=".2" vectorEffect="non-scaling-stroke" />
                </svg>
                <span className="meta">{String(i + 1).padStart(2, "0")}</span>
                <div style={{ position: "relative" }}>
                  <h3>{c}</h3>
                  <p className="meta" style={{ margin: "8px 0 0" }}>{t.awaiting}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
