"use client";

import dynamic from "next/dynamic";
import type { Dictionary } from "@/content/dictionary";
import { HeroFallback } from "./HeroScene";
import { openInquiry } from "@/lib/inquiryBus";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false, loading: () => <HeroFallback /> });

export default function Hero({ t }: { t: Dictionary["hero"] }) {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero-sticky">
        <HeroScene heroId="top" />
        <div className="hero-veil" />
        <div className="hero-copy" style={{ opacity: "calc(1 - var(--p, 0) * 2.6)", transform: "translateY(calc(var(--p, 0) * -80px))" }}>
          <p className="kicker">{t.kicker}</p>
          <h1 id="hero-title" className="display h-xl">
            <span>{t.title[0]}</span>
            <span className="indent italic">{t.title[1]}</span>
            <span>{t.title[2]}</span>
          </h1>
          <p className="lead">{t.copy}</p>
          <div className="hero-cta">
            <a className="btn" href="#work">{t.explore} <span className="arrow">→</span></a>
            <button type="button" className="btn ghost" onClick={() => openInquiry()}>{t.start}</button>
          </div>
        </div>
        <div className="scroll-cue" aria-hidden="true"><i />{t.scroll}</div>
      </div>
    </section>
  );
}
