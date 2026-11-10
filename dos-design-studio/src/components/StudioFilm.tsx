"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/content/dictionary";
import { track } from "@/lib/analytics";

/**
 * 32s studio film rendered from the studio's own posts (camera moves + architectural transitions).
 * Loads nothing until near the viewport; autoplays muted only in view, never for reduced motion or Save-Data.
 * Prefers H.264 MP4 and falls back to VP9 WebM if the browser cannot decode it.
 */
export default function StudioFilm({ t }: { t: Dictionary["work"] }) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useRef(false);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    const allowAuto = !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !nav.connection?.saveData;
    setAuto(allowAuto);
    const io = new IntersectionObserver(
      ([e]) => {
        inView.current = e.isIntersecting;
        if (e.isIntersecting) {
          if (allowAuto) setSrc((s) => s ?? pickFile(v, "mp4"));
          if (allowAuto && v.currentSrc) v.play().catch(() => {});
        } else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  // Start once the source is attached (and again after a codec fallback).
  useEffect(() => {
    const v = ref.current;
    if (v && src && inView.current && auto) v.play().catch(() => {});
  }, [src, auto]);

  const onError = () => {
    const v = ref.current;
    if (v && src?.endsWith(".mp4")) setSrc(pickFile(v, "webm"));
  };

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (!src) { setSrc(pickFile(v, "mp4")); setAuto(true); track("film_play"); return; }
    if (v.paused) { v.play().catch(() => {}); track("film_play"); } else v.pause();
  };

  return (
    <div className="film">
      <div className="film-frame">
        <video
          ref={ref}
          src={src ?? undefined}
          poster="/film/dos-studio-film-poster.jpg"
          muted
          loop
          playsInline
          preload="none"
          width={1080}
          height={1080}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={onError}
          aria-label={t.filmTitle}
        />
        <button type="button" className="film-btn" onClick={toggle} aria-label={playing ? t.pause : t.play}>
          {playing ? "❚❚" : "▶"}
        </button>
      </div>
      <div className="film-copy">
        <p className="kicker">{t.filmKicker}</p>
        <h3 className="display h-md" style={{ margin: "14px 0 16px" }}>{t.filmTitle}</h3>
        <p className="muted" style={{ margin: 0, maxWidth: "44ch" }}>{t.filmLead}</p>
        {!auto && <p className="note" style={{ marginTop: 14 }}>{t.filmManual}</p>}
      </div>
    </div>
  );
}

/** 720p on small screens; H.264 MP4 where offered, VP9 WebM as the fallback. */
function pickFile(v: HTMLVideoElement, prefer: "mp4" | "webm") {
  const size = window.innerWidth < 900 ? "720" : "1080";
  const ext = prefer === "mp4" && v.canPlayType('video/mp4; codecs="avc1.640028"') !== "" ? "mp4" : "webm";
  return `/film/dos-studio-film-${size}.${ext}`;
}
