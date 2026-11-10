"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/content/dictionary";

type Wall = { x: number; y: number; len: number; v?: boolean; glazed?: boolean };

// Illustrative plan on a 100×100 grid (not a DOS project).
const WALLS: Wall[] = [
  { x: 14, y: 22, len: 40 },
  { x: 54, y: 22, len: 32, glazed: true },
  { x: 14, y: 78, len: 30, glazed: true },
  { x: 44, y: 78, len: 42 },
  { x: 14, y: 22, len: 56, v: true },
  { x: 86, y: 22, len: 56, v: true, glazed: true },
  { x: 44, y: 22, len: 30, v: true },
  { x: 62, y: 48, len: 30, v: true },
  { x: 44, y: 52, len: 18 },
  { x: 62, y: 40, len: 30 },
];

export default function PlanToSpace({ t }: { t: Dictionary["plan"] }) {
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [isStatic, setStatic] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStatic(true);
      setStep(2);
      return;
    }
    let ctx: { revert: () => void } | undefined;
    let alive = true;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (!alive) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
            onUpdate: (st) => setStep(st.progress < 0.3 ? 0 : st.progress < 0.62 ? 1 : 2),
          },
        });
        tl.fromTo(".plan-svg .draw", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3, stagger: 0.004 }, 0)
          .fromTo(".plan-world", { rotateX: 0, rotateZ: 0, scale: 1 }, { rotateX: 58, rotateZ: -38, scale: 0.86, duration: 0.32, ease: "power1.inOut" }, 0.26)
          .fromTo(".plan-face", { scaleY: 0 }, { scaleY: 1, duration: 0.3, stagger: 0.012, ease: "power2.out" }, 0.34)
          .fromTo(".plan-roof", { opacity: 0, z: "40cqw" }, { opacity: 1, z: "17cqw", duration: 0.22, ease: "power2.out" }, 0.68)
          .to(".plan-world", { rotateZ: -24, duration: 0.3 }, 0.7);
      }, el);
    })();
    return () => {
      alive = false;
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={root} className={`plan${isStatic ? " static" : ""}`} aria-labelledby="plan-title">
      <div className="plan-sticky">
        <div className="plan-copy">
          <p className="kicker">{t.index}</p>
          <h2 id="plan-title" className="display h-lg" style={{ margin: "18px 0 0" }}>{t.title}</h2>
          <ol className="plan-steps">
            {t.steps.map((s, i) => (
              <li key={s} className={i <= step ? "on" : ""}><b>0{i + 1}</b>{s}</li>
            ))}
          </ol>
        </div>
        <div className="plan-stage" aria-hidden="true">
          <div className="plan-world">
            <div className="plan-floor" />
            <svg className="plan-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* dimension lines */}
              <g opacity="0.45">
                <line className="draw" pathLength={1} strokeDasharray="1" x1="14" y1="12" x2="86" y2="12" />
                <line className="draw" pathLength={1} strokeDasharray="1" x1="14" y1="10" x2="14" y2="14" />
                <line className="draw" pathLength={1} strokeDasharray="1" x1="86" y1="10" x2="86" y2="14" />
                <line className="draw" pathLength={1} strokeDasharray="1" x1="6" y1="22" x2="6" y2="78" />
              </g>
              {WALLS.map((w, i) => (
                <line key={i} className="draw" pathLength={1} strokeDasharray="1" x1={w.x} y1={w.y} x2={w.v ? w.x : w.x + w.len} y2={w.v ? w.y + w.len : w.y} style={{ strokeWidth: w.glazed ? 0.6 : 1.6 }} />
              ))}
              {/* door swings, pool, columns */}
              <path className="draw" pathLength={1} strokeDasharray="1" d="M44 40 A8 8 0 0 1 52 48" />
              <path className="draw" pathLength={1} strokeDasharray="1" d="M62 66 A8 8 0 0 0 70 58" />
              <rect className="draw" pathLength={1} strokeDasharray="1" x="66" y="84" width="22" height="8" />
              <circle className="draw" pathLength={1} strokeDasharray="1" cx="29" cy="50" r="5" />
              <rect className="draw" pathLength={1} strokeDasharray="1" x="20" y="60" width="16" height="9" />
              <rect className="draw" pathLength={1} strokeDasharray="1" x="68" y="26" width="12" height="9" />
            </svg>
            {WALLS.map((w, i) => (
              <div
                key={i}
                className="plan-wall-wrap"
                style={{
                  position: "absolute",
                  left: `${w.x}%`,
                  top: `${w.y}%`,
                  width: `${w.len}cqw`,
                  height: 0,
                  transformOrigin: "0 0",
                  transform: w.v ? "rotateZ(90deg)" : undefined,
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="plan-stand" style={{ height: w.glazed ? "15cqw" : "17cqw" }}>
                  <div className={`plan-face plan-wall ${w.glazed ? "glazed" : "solid"}`} />
                </div>
              </div>
            ))}
            <div className="plan-roof" style={{ left: "10%", top: "18%", width: "56%", height: "64%" }} />
          </div>
        </div>
        <p className="plan-caption">{t.caption}</p>
      </div>
    </section>
  );
}
