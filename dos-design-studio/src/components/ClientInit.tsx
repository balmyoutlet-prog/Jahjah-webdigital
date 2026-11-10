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
    return () => { document.removeEventListener("click", on); io?.disconnect(); };
  }, []);
  return null;
}
