import type { Dictionary } from "@/content/dictionary";

export default function Studio({ t }: { t: Dictionary["studio"] }) {
  return (
    <section id="studio" className="section" aria-labelledby="studio-title">
      <div className="wrap">
        <div className="index-row"><span className="kicker">{t.index}</span></div>
        <div className="studio-grid">
          <h2 id="studio-title" className="display h-lg rv" style={{ margin: 0 }}>{t.title}</h2>
          <p className="studio-body rv rv-d1" style={{ margin: 0 }}>{t.body}</p>
        </div>
        <div className="pillars">
          {t.pillars.map((p, i) => (
            <div key={p.k} className={`rv rv-d${i + 1}`}>
              <h3>{p.k}</h3>
              <p className="muted" style={{ margin: 0 }}>{p.v}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
