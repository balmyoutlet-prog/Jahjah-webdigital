"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import type { Dictionary } from "@/content/dictionary";
import { openInquiry } from "@/lib/inquiryBus";

export default function Nav({ t }: { t: Dictionary["nav"] }) {
  const [open, setOpen] = useState(false);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHide(y > 400 && y > last + 4);
      if (y < last - 4) setHide(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links: [string, string][] = [
    ["#studio", t.studio],
    ["#expertise", t.expertise],
    ["#designers", t.designers],
    ["#styles", t.styles],
    ["#work", t.work],
    ["#global", t.global],
  ];

  return (
    <>
      <header className={`nav${hide && !open ? " hide" : ""}`}>
        <nav className="nav-inner glass" aria-label="Primary">
          <Logo />
          <ul className="nav-links">
            {links.map(([h, l]) => (
              <li key={h}><a href={h}>{l}</a></li>
            ))}
          </ul>
          <div className="nav-right">
            <a className="lang" href={t.langHref} hrefLang={t.langHref === "/ar" ? "ar" : "en"} lang={t.langHref === "/ar" ? "ar" : "en"}>
              {t.langLabel}
            </a>
            <button type="button" className="btn small" onClick={() => openInquiry()}>
              {t.start}
            </button>
            <button type="button" className="menu-btn" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
              {open ? t.close : t.menu}
            </button>
          </div>
        </nav>
      </header>
      <div id="mobile-menu" className={`mobile-menu${open ? " open" : ""}`} aria-hidden={!open} inert={!open}>
        {links.map(([h, l]) => (
          <a key={h} href={h} onClick={() => setOpen(false)}>{l}</a>
        ))}
        <div style={{ marginTop: 32 }}>
          <button type="button" className="btn" onClick={() => { setOpen(false); openInquiry(); }}>
            {t.start} <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </>
  );
}
