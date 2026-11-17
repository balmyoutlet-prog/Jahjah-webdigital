import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Check, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ShowUsYourBusiness } from "@/components/site/ShowUsYourBusiness";
import { portfolioProjects } from "@/lib/portfolio-projects";
import { portfolioCover } from "@/lib/portfolio-covers";
import { RESTAURANT_PACKAGES } from "@/lib/restaurant";
import { usd } from "@/lib/platform";
import { canonicalFor } from "@/lib/seo";
import { useContextualWhatsAppUrl } from "@/hooks/use-contextual-whatsapp";
import { useTrackEvent } from "@/hooks/use-track-event";
import type { RestaurantMarket } from "@/lib/restaurant-markets";

const SERVICES = [
  {
    to: "/restaurant-digital-menu",
    label: "Digital & QR menu",
    body: "Your full menu with photos and options, updated once and correct everywhere.",
  },
  {
    to: "/restaurant-online-ordering",
    label: "Direct online ordering",
    body: "Delivery, takeaway or dine-in orders on your own site — no commission per order.",
  },
  {
    to: "/whatsapp-ordering",
    label: "WhatsApp ordering",
    body: "The customer builds the order; it reaches your WhatsApp complete.",
  },
  {
    to: "/qr-menu",
    label: "QR & table ordering",
    body: "One QR code per table to browse, order and add extras without waiting.",
  },
  {
    to: "/restaurant",
    label: "Upsells & reservations",
    body: "Add-on suggestions before checkout and a reserve-a-table path.",
  },
] as const;

/** `head()` for a market route: metadata plus Service, Breadcrumb and FAQ schema. */
export function restaurantMarketHead(m: RestaurantMarket) {
  const url = canonicalFor(m.path);
  return {
    meta: [
      { title: m.title },
      { name: "description", content: m.description },
      { property: "og:title", content: m.title },
      { property: "og:description", content: m.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
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
              name: `Restaurant websites, digital menus and online ordering in ${m.name}`,
              serviceType: "Restaurant website and online ordering system",
              areaServed:
                m.name === m.country
                  ? { "@type": "Country", name: m.country }
                  : {
                      "@type": "City",
                      name: m.name,
                      containedInPlace: { "@type": "Country", name: m.country },
                    },
              provider: { "@id": `${canonicalFor("/")}#organization` },
              url,
              description: m.description,
              offers: RESTAURANT_PACKAGES.map((p) => ({
                "@type": "Offer",
                name: `${p.name} — ${p.focus}`,
                price: (p.priceCents / 100).toFixed(0),
                priceCurrency: "USD",
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: canonicalFor("/") },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Restaurant ordering systems",
                  item: canonicalFor("/restaurant"),
                },
                { "@type": "ListItem", position: 3, name: m.name, item: url },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: m.faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }),
      },
    ],
  };
}

export function RestaurantMarketPage({ market: m }: { market: RestaurantMarket }) {
  const whatsappUrl = useContextualWhatsAppUrl();
  const track = useTrackEvent();
  const proof = m.proofSlugs
    .map((slug) => portfolioProjects.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="px-5 pb-20 pt-32 sm:px-8 sm:pb-28 sm:pt-44">
          <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-14 lg:grid-cols-[1.05fr_.95fr]">
            <div className="min-w-0">
              <p className="eyebrow text-primary">{m.eyebrow}</p>
              <h1 className="display mt-5 text-4xl leading-[1] sm:text-6xl">{m.h1}</h1>
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {m.intro}
              </p>
              <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                <a
                  href="#free-demo"
                  onClick={() => track("demo_cta_click", { location: `market_${m.slug}_hero` })}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-foreground px-7 text-xs font-semibold uppercase tracking-[.15em] text-white"
                >
                  Get my free restaurant demo <ArrowRight className="size-4" />
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("whatsapp_click", { location: `market_${m.slug}_hero` })}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-7 text-xs font-semibold uppercase tracking-[.15em]"
                >
                  <MessageCircle className="size-4 text-[#159447]" /> Talk about my restaurant
                </a>
              </div>
              <ul className="mt-8 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                {[
                  `Prices in ${m.currency}`,
                  "Arabic / English",
                  "No commission per order",
                  "Fixed one-time build price",
                ].map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-primary" aria-hidden="true" /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <div id="free-demo" className="min-w-0 scroll-mt-28">
              <ShowUsYourBusiness />
            </div>
          </div>
        </section>

        <section className="hairline bg-[#fff8f7] px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="eyebrow text-primary">What restaurants in {m.name} need online</p>
            <h2 className="display mt-5 max-w-4xl text-4xl sm:text-5xl">
              Built around how your customers order.
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {m.context.map((c) => (
                <article
                  key={c.title}
                  className="rounded-2xl border border-border bg-background p-6"
                >
                  <h3 className="text-lg font-medium">{c.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="hairline px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="eyebrow text-primary">Proof you can open</p>
            <h2 className="display mt-5 max-w-4xl text-4xl sm:text-5xl">
              Try a live ordering site before you talk to us.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {m.proofNote}
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {proof.map((p) => (
                <a
                  key={p.slug}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    track("work_click", { project: p.slug, location: `market_${m.slug}` })
                  }
                  className="group overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-primary/40"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-white">
                    <img
                      src={portfolioCover(p.slug, p.image)}
                      alt={`${p.name} live ordering website`}
                      loading="lazy"
                      decoding="async"
                      width={1200}
                      height={750}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] uppercase tracking-[.14em] text-primary">
                      {p.market}
                    </p>
                    <h3 className="mt-1 text-lg font-medium">{p.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{p.outcome}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[.14em] text-foreground">
                      Try it live <ArrowUpRight className="size-3.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
            <Link
              to="/work"
              className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[.16em] text-primary"
            >
              Read the full case studies <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <section className="hairline px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="eyebrow text-primary">What we build</p>
            <h2 className="display mt-5 max-w-4xl text-4xl sm:text-5xl">
              Pick what your restaurant needs now. Add the rest later.
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {SERVICES.map((s) => (
                <Link
                  key={s.to}
                  to={s.to}
                  className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/40"
                >
                  <h3 className="text-base font-medium">{s.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </Link>
              ))}
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {RESTAURANT_PACKAGES.map((p) => (
                <div
                  key={p.key}
                  className={`rounded-2xl border p-6 ${p.popular ? "border-primary/40 bg-[#fff8f7]" : "border-border"}`}
                >
                  <p className="text-sm text-muted-foreground">{p.name}</p>
                  <h3 className="mt-1 font-display text-2xl">{p.focus}</h3>
                  <p className="mt-3 font-display text-4xl text-primary">{usd(p.priceCents)}</p>
                  <p className="text-xs uppercase tracking-[.14em] text-muted-foreground">
                    one-time · + {usd(p.careCents)}/month care
                  </p>
                </div>
              ))}
            </div>
            <Link
              to="/restaurant"
              hash="packages"
              className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[.16em] text-primary"
            >
              Compare packages and features <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <section className="hairline px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow text-primary">Questions from {m.name} restaurant owners</p>
            <h2 className="display mt-5 text-4xl sm:text-5xl">Straight answers.</h2>
            <div className="mt-10 grid gap-x-12 gap-y-9 md:grid-cols-2">
              {m.faqs.map((f) => (
                <div key={f.q} className="border-t border-border pt-5">
                  <h3 className="text-lg font-medium">{f.q}</h3>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="hairline px-5 py-20 text-center sm:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="display text-4xl sm:text-6xl">See your restaurant as the demo.</h2>
            <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
              Send your restaurant name and Instagram. We show you what your menu and ordering flow
              would look like — free, before you decide.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#free-demo"
                className="inline-flex min-h-14 items-center gap-2 rounded-full bg-primary px-8 text-xs font-semibold uppercase tracking-[.15em] text-primary-foreground"
              >
                Get my free demo <ArrowRight className="size-4" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("whatsapp_click", { location: `market_${m.slug}_final` })}
                className="inline-flex min-h-14 items-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-8 text-xs font-semibold uppercase tracking-[.15em]"
              >
                <MessageCircle className="size-4 text-[#159447]" /> WhatsApp us
              </a>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {m.related.map((r) => (
                <a
                  key={r.to}
                  href={r.to}
                  className="rounded-full border border-border bg-surface px-4 py-2 text-xs text-foreground hover:border-primary/40"
                >
                  Restaurants in {r.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
