import { Link } from "@tanstack/react-router";
import { Check, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { canonicalFor } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useTrackEvent } from "@/hooks/use-track-event";
import { CUSTOM_SYSTEMS, GOOGLE_FORM_URL, type CustomSystem } from "@/lib/custom-systems";

export function customSystemHead(s: CustomSystem) {
  const url = canonicalFor(s.path);
  return {
    meta: [
      { title: s.title },
      { name: "description", content: s.description },
      { property: "og:title", content: s.title },
      { property: "og:description", content: s.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              name: s.label,
              alternateName: s.arabic,
              description: s.description,
              url,
              provider: { "@type": "ProfessionalService", name: "Jahjah WebDigital", url: canonicalFor("/") },
              areaServed: "Worldwide",
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: canonicalFor("/") },
                { "@type": "ListItem", position: 2, name: s.label, item: url },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: s.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            },
          ],
        }),
      },
    ],
  };
}

export function CustomSystemPage({ system: s }: { system: CustomSystem }) {
  const track = useTrackEvent();
  const wa = buildWhatsAppUrl(s.whatsapp);
  const loc = s.path.slice(1);
  const others = Object.values(CUSTOM_SYSTEMS).filter((o) => o.path !== s.path);
  return (
    <>
      <SiteHeader />
      <main className="bg-background text-foreground">
        <section className="mx-auto max-w-5xl px-5 pb-14 pt-28 sm:px-8 sm:pt-36">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
            <Link to="/" className="underline-offset-4 hover:underline">Home</Link> / {s.label}
          </nav>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-primary">
            {s.label} · <span lang="ar" dir="rtl">{s.arabic}</span>
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">{s.headline}</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">{s.intro}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { location: loc })}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4" aria-hidden /> Get a WhatsApp quote — share your project and country
            </a>
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("contact_form_start", { location: `${loc}_google_form` })}
              className="text-sm underline underline-offset-4"
            >
              Prefer a form? Send an inquiry
            </a>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/40">
          <div className="mx-auto grid max-w-5xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl">Who it's for</h2>
              <ul className="mt-5 space-y-3">
                {s.forWho.map((w) => (
                  <li key={w} className="flex gap-3 text-sm leading-relaxed"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />{w}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl">How scope is agreed</h2>
              <ol className="mt-5 space-y-3 text-sm leading-relaxed">
                {s.discovery.map((d, i) => (
                  <li key={d} className="flex gap-3"><span className="font-semibold text-primary">{i + 1}.</span>{d}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
          <h2 className="font-display text-2xl">{s.modulesHeading ?? "Typical modules we can build"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">Examples only — your project includes what we agree in writing.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.modules.map((m) => (
              <div key={m.name} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-semibold">{m.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{m.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 pb-14 sm:px-8">
          <h2 className="font-display text-2xl">Questions</h2>
          <dl className="mt-5 space-y-5">
            {s.faqs.map((f) => (
              <div key={f.q}><dt className="font-semibold">{f.q}</dt><dd className="mt-1 text-sm text-muted-foreground">{f.a}</dd></div>
            ))}
          </dl>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
            <h2 className="font-display text-xl">Related services</h2>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {others.map((o) => (
                <Link key={o.path} to={o.path} className="rounded-full border border-border px-3 py-1.5 hover:bg-secondary">{o.label}</Link>
              ))}
              <Link to="/restaurant" className="rounded-full border border-border px-3 py-1.5 hover:bg-secondary">Complete restaurant systems</Link>
              <Link to="/restaurant-digital-menu" className="rounded-full border border-border px-3 py-1.5 hover:bg-secondary">Digital menus</Link>
              <Link to="/packages" className="rounded-full border border-border px-3 py-1.5 hover:bg-secondary">Business websites</Link>
              <Link to="/work" className="rounded-full border border-border px-3 py-1.5 hover:bg-secondary">Live work</Link>
              <Link to="/ar" className="rounded-full border border-border px-3 py-1.5 hover:bg-secondary" lang="ar">بالعربي</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
