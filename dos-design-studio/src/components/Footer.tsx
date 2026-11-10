import type { Dictionary } from "@/content/dictionary";
import Logo from "./Logo";
import { BRAND, WHATSAPP, TEAM } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";

const fmt = (d: string) => (d.startsWith("961") ? `+961 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8)}` : `+${d}`);

export default function Footer({ t, nav, locale }: { t: Dictionary["footer"]; nav: Dictionary["nav"]; locale: "en" | "ar" }) {
  const hello = locale === "ar" ? "مرحباً استوديو DOS للتصميم،" : "Hello DOS Design Studio,";
  const lines = [
    { k: "architecture" as const, label: t.architecture, name: locale === "ar" ? TEAM.architecture.nameAr : TEAM.architecture.name, n: WHATSAPP.architecture },
    { k: "interiors" as const, label: t.interiors, name: locale === "ar" ? TEAM.interiors.nameAr : TEAM.interiors.name, n: WHATSAPP.interiors },
  ].filter((x) => x.n);
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <Logo full height={72} />
            <p className="display h-md" style={{ margin: "28px 0 0", maxWidth: "18ch" }}>{t.tagline}</p>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <a className="link" href={BRAND.instagram} target="_blank" rel="noopener noreferrer">{t.follow} · Instagram ↗</a>
            <a className="link" href={nav.langHref} hrefLang={nav.langHref === "/ar" ? "ar" : "en"}>{nav.langLabel}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {BRAND.name}. {t.rights}</span>
          <span style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {lines.map((l) => (
              <a key={l.k} className="link" href={waLink(l.n, hello)} target="_blank" rel="noopener noreferrer" data-track="whatsapp_click">
                {l.label} · {l.name} · <span dir="ltr">{fmt(l.n)}</span>
              </a>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
