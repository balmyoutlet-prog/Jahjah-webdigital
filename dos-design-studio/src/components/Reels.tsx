"use client";

import { useState } from "react";
import type { Dictionary } from "@/content/dictionary";
import { REELS } from "@/content/instagram";
import { BRAND } from "@/lib/site";
import { track } from "@/lib/analytics";

/**
 * The studio's reels via Instagram's official embed player. Click-to-load: nothing is requested from
 * Instagram (no cookies, no third-party JS) until the visitor presses play.
 */
export default function Reels({ t }: { t: Dictionary["work"] }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  return (
    <div className="reels">
      <div className="reels-head">
        <h3 className="kicker" style={{ margin: 0 }}>{t.reelsTitle}</h3>
        <a className="link" href={BRAND.instagram + "/reels/"} target="_blank" rel="noopener noreferrer" data-track="instagram_click">{t.reelsAll} ↗</a>
      </div>
      <ul className="reels-grid">
        {REELS.map((id, n) => (
          <li key={id} className="reel-card mask" style={{ transitionDelay: `${n * 120}ms` }}>
            {open[id] ? (
              <iframe
                src={`https://www.instagram.com/reel/${id}/embed/`}
                title={`${t.reel} ${n + 1} — ${BRAND.instagramHandle}`}
                loading="lazy"
                allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
                allowFullScreen
              />
            ) : (
              <button type="button" className="reel-facade" onClick={() => { setOpen((o) => ({ ...o, [id]: true })); track("reel_play", { reel: id }); }}>
                <span className="arc" aria-hidden="true" />
                <span className="arc thin" aria-hidden="true" />
                <span className="k kicker"><span dir="ltr">{String(n + 1).padStart(2, "0")}</span> · {t.reel}</span>
                <span className="mid">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="mark" src={BRAND.logoMark} alt="" />
                  <span className="play"><span aria-hidden="true">▶</span>{t.playReel}</span>
                </span>
              </button>
            )}
          </li>
        ))}
      </ul>
      <p className="reels-note">{t.reelsNote}</p>
    </div>
  );
}
