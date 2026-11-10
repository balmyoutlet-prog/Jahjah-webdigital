"use client";

import { useEffect, useState } from "react";

const KEY = "dos:intro-seen";

export default function Intro({ skipLabel }: { skipLabel: string }) {
  const [out, setOut] = useState(false);

  useEffect(() => {
    const w = window as Window & { __dosIntroDone?: boolean };
    const done = () => {
      if (w.__dosIntroDone) return;
      w.__dosIntroDone = true;
      window.dispatchEvent(new Event("dos:intro-done"));
    };
    if (document.documentElement.classList.contains("no-intro")) {
      done();
      setOut(true);
      return;
    }
    try { sessionStorage.setItem(KEY, "1"); } catch {}
    const a = window.setTimeout(done, 1900);
    const b = window.setTimeout(() => setOut(true), 2300);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  const skip = () => {
    const w = window as Window & { __dosIntroDone?: boolean };
    if (!w.__dosIntroDone) { w.__dosIntroDone = true; window.dispatchEvent(new Event("dos:intro-done")); }
    setOut(true);
  };

  return (
    <div className={`intro${out ? " out" : ""}`} aria-hidden={out}>
      <svg viewBox="0 0 520 300" role="img" aria-label="DOS Design Studio">
        <path className="ln" d="M20 250 H500" />
        <path className="ln l2" d="M60 250 V70 H460 V250" />
        <path className="ln l3" d="M140 250 V130 H380 V250 M260 70 V250" />
        <g className="mark">
          <text x="260" y="205" textAnchor="middle" fontFamily="var(--f-display), serif" fontSize="76" letterSpacing="18" fill="#121212">DOS</text>
          <text x="260" y="290" textAnchor="middle" fontFamily="var(--f-sans), sans-serif" fontSize="11" letterSpacing="7" fill="#6f6a62">DESIGN STUDIO</text>
        </g>
      </svg>
      {!out && (
        <button type="button" className="skipbtn" onClick={skip}>
          {skipLabel}
        </button>
      )}
    </div>
  );
}

/** Inline, pre-paint: suppress the intro for reduced motion or a repeat view in the same session. */
export const introGuardScript = `try{if(sessionStorage.getItem("${KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("no-intro")}catch(e){}`;
