import type { GeneratedSpec } from "@/lib/generator";

type Props = { spec: GeneratedSpec; companyName: string; className?: string };

const SECTION_LABEL: Record<string, string> = {
  hero: "Hero",
  intro: "Introduction",
  highlights: "Highlights",
  gallery: "Gallery",
  menu: "Menu / Catalogue",
  services: "Services",
  about: "About",
  "testimonial-space": "Testimonials",
  hours: "Opening hours",
  location: "Location",
  editorial: "Editorial feature",
  cta: "Call to action",
  contact: "Contact",
  footer: "Footer",
};

/**
 * Renders a visual preview of a generated design spec. Preview only —
 * no source code, assets or export is exposed to the customer.
 */
export function PreviewCanvas({ spec, companyName, className }: Props) {
  const p = spec.palette;
  const rounded = spec.layout.corners === "soft" ? "12px" : "0px";

  return (
    <div
      className={className}
      style={{ background: p.background, color: p.text, fontFamily: `${spec.typography.body}, sans-serif` }}
    >
      <div style={{ padding: "18px 24px", borderBottom: `1px solid ${p.muted}33`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: `${spec.typography.display}, serif`, fontSize: 18, letterSpacing: "0.02em" }}>
          {companyName}
        </span>
        <span style={{ display: "flex", gap: 16, fontSize: 11, color: p.muted, textTransform: "uppercase", letterSpacing: "0.14em" }}>
          {spec.pages.slice(0, 5).map((page) => (
            <span key={page}>{page}</span>
          ))}
        </span>
      </div>

      <div style={{ padding: spec.layout.density === "editorial" ? "84px 32px" : "56px 32px" }}>
        <h1
          style={{
            fontFamily: `${spec.typography.display}, serif`,
            fontSize: spec.typography.scale === "grand" ? 46 : spec.typography.scale === "regular" ? 36 : 30,
            lineHeight: 1.05,
            margin: 0,
            maxWidth: "18ch",
          }}
        >
          {spec.headline}
        </h1>
        <p style={{ color: p.muted, maxWidth: "52ch", marginTop: 18, fontSize: 14, lineHeight: 1.7 }}>{spec.subline}</p>
        <span
          style={{
            display: "inline-block",
            marginTop: 26,
            padding: "11px 22px",
            background: p.accent,
            color: p.background,
            borderRadius: rounded,
            fontSize: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {spec.cta}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, padding: "0 32px 40px" }}>
        {spec.sections.slice(1).map((section) => (
          <div
            key={section}
            style={{
              background: p.surface,
              borderRadius: rounded,
              padding: "20px 16px",
              minHeight: 84,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: p.muted }}>
              {SECTION_LABEL[section] ?? section}
            </span>
            <span style={{ height: 3, width: "45%", background: p.accent, borderRadius: 3 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
