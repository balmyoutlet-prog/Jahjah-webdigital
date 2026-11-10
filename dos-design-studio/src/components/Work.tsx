"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Dictionary, Locale } from "@/content/dictionary";
import { BRAND } from "@/lib/site";
import { FEED } from "@/content/instagram";
import { TRANSITIONS } from "./ReelGL";
import { track } from "@/lib/analytics";
import Reels from "./Reels";

const ReelGL = dynamic(() => import("./ReelGL"), { ssr: false });
const HOLD = 4200; // ms each image stays before the next transition

export default function Work({ t, locale }: { t: Dictionary["work"]; locale: Locale }) {
  const [i, setI] = useState(0);
  const [type, setType] = useState(0);
  const [moved, setMoved] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  const [hover, setHover] = useState(false);
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLElement>(null);
  const srcs = FEED.map((f) => f.src);

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(r);
    if (r) setPlaying(false);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 });
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, []);

  const go = useCallback((n: number) => {
    setI((cur) => {
      const next = (n + FEED.length) % FEED.length;
      if (next !== cur) { setType((tt) => (tt + 1) % TRANSITIONS); setMoved(true); }
      return next;
    });
  }, []);

  const running = playing && inView && !hover && !reduced;
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => go(i + 1), HOLD);
    return () => clearTimeout(id);
  }, [running, i, go]);

  const post = FEED[i];
  // The label names the transition that brought this image in.
  const label = t.transitions[(type + TRANSITIONS - 1) % TRANSITIONS];

  return (
    <section ref={root} id="work" className="section" aria-labelledby="work-title" style={{ background: "var(--paper)" }}>
      <div className="wrap">
        <div className="index-row"><span className="kicker">{t.index}</span></div>
        <div className="studio-grid">
          <h2 id="work-title" className="display h-lg rv" style={{ margin: 0 }}>{t.title}</h2>
          <div className="rv rv-d1">
            <p className="lead" style={{ marginTop: 0 }}>{t.lead}</p>
            <a className="btn ghost" href={BRAND.instagram} target="_blank" rel="noopener noreferrer" data-track="instagram_click">
              {t.instagram} · <span dir="ltr">{BRAND.instagramHandle}</span> <span className="arrow">↗</span>
            </a>
          </div>
        </div>

        <div className="feed">
          <figure className="reel" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
            <ReelGL srcs={srcs} index={i} type={(type + TRANSITIONS - 1) % TRANSITIONS} alt={post.caption[locale]} />
            <div className="reel-hud" aria-hidden="true">
              <span className="reel-scan" />
              <span className="reel-corner tl" /><span className="reel-corner tr" /><span className="reel-corner bl" /><span className="reel-corner br" />
            </div>
            <figcaption className="reel-bar">
              <div className="reel-meta" aria-live="polite">
                <span className="kicker"><span dir="ltr">{String(i + 1).padStart(2, "0")} / {FEED.length}</span>{post.kind === "reel" ? ` · ${t.reel}` : ""}</span>
                <span className="reel-cap">{post.caption[locale]}</span>
                <span className="reel-fx">{moved ? `${t.transition}: ${label}` : "\u00a0"}</span>
              </div>
              <div className="reel-ctrl">
                <button type="button" aria-label={t.prev} onClick={() => go(i - 1)}>{locale === "ar" ? "→" : "←"}</button>
                <button type="button" aria-label={playing ? t.pause : t.play} aria-pressed={!playing} onClick={() => setPlaying((p) => !p)}>{playing ? "❚❚" : "▶"}</button>
                <button type="button" aria-label={t.next} onClick={() => go(i + 1)}>{locale === "ar" ? "←" : "→"}</button>
              </div>
              <span className="reel-progress" key={`${i}-${running}`} style={{ animationDuration: `${HOLD}ms`, animationPlayState: running ? "running" : "paused" }} />
            </figcaption>
          </figure>

          <ul className="wall">
            {FEED.map((f, n) => (
              <li key={f.src} className="wall-item mask" style={{ transitionDelay: `${(n % 3) * 90 + Math.floor(n / 3) * 60}ms` }}>
                <button type="button" aria-current={n === i} aria-label={`${t.show}: ${f.caption[locale]}`}
                  onClick={() => { go(n); setPlaying(false); track("portfolio_engage", { post: n + 1 }); }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.src} alt="" width={386} height={384} loading="lazy" decoding="async" />
                  {f.kind === "reel" && <span className="wall-tag">▶ {t.reel}</span>}
                  <span className="wall-sheen" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <Reels t={t} />
      </div>
    </section>
  );
}
