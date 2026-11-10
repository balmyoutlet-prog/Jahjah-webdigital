"use client";
import { useEffect } from "react";

/** Adds `.in` to every `.rv` / `.portrait` element once it scrolls into view. */
export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".rv, .portrait"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}
