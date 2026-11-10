import type { Dictionary } from "@/content/dictionary";
import Logo from "./Logo";
import { BRAND } from "@/lib/site";

export default function Footer({ t, nav }: { t: Dictionary["footer"]; nav: Dictionary["nav"] }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <Logo />
            <p className="display h-md" style={{ margin: "28px 0 0", maxWidth: "18ch" }}>{t.tagline}</p>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <a className="link" href={BRAND.instagram} target="_blank" rel="noopener noreferrer">{t.follow} · Instagram ↗</a>
            <a className="link" href={nav.langHref} hrefLang={nav.langHref === "/ar" ? "ar" : "en"}>{nav.langLabel}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {BRAND.name}. {t.rights}</span>
          <span>{t.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
