"use client";

import { useEffect } from "react";
import { useReveal } from "@/lib/useReveal";
import { track } from "@/lib/analytics";

/** Page-level client behaviour: scroll reveals + delegated tracking for `data-track` links. */
export default function ClientInit() {
  useReveal();
  useEffect(() => {
    const on = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>("[data-track]");
      if (a) track(a.dataset.track!, { href: a.getAttribute("href") ?? "" });
    };
    document.addEventListener("click", on);
    // Keep the preview ribbon off the inquiry so it never covers "Continue on WhatsApp".
    const start = document.getElementById("start");
    const io = start ? new IntersectionObserver(([e]) => document.documentElement.classList.toggle("at-inquiry", e.isIntersecting), { threshold: 0.05 }) : null;
    if (start && io) io.observe(start);
    // Section labels "decode" into place like a futuristic readout (Latin script only; Arabic shaping must stay intact).
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    let sio: IntersectionObserver | null = null;
    if (!reduced && document.documentElement.lang === "en") {
      const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/—·";
      const run = (el: HTMLElement) => {
        const final = el.textContent || "";
        el.setAttribute("aria-label", final);
        el.dataset.scramble = "1";
        const t0 = performance.now(), dur = 900;
        const step = () => {
          const k = Math.min(1, (performance.now() - t0) / dur);
          const done = Math.floor(k * final.length);
          el.textContent = final.split("").map((ch, idx) => (idx < done || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join("");
          if (k < 1) timers.push(requestAnimationFrame(step));
          else el.textContent = final;
        };
        step();
      };
      sio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { run(e.target as HTMLElement); sio?.unobserve(e.target); } }), { threshold: 0.6 });
      document.querySelectorAll<HTMLElement>(".index-row .kicker").forEach((el) => sio!.observe(el));
    }
    return () => { document.removeEventListener("click", on); io?.disconnect(); sio?.disconnect(); timers.forEach(cancelAnimationFrame); };
  }, []);
  return null;
}
