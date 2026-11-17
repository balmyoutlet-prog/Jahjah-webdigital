import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, BookOpen, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ShowUsYourBusiness } from "@/components/site/ShowUsYourBusiness";
import { portfolioProjects } from "@/lib/portfolio-projects";
import { portfolioCover } from "@/lib/portfolio-covers";
import { canonicalFor } from "@/lib/seo";
import { useContextualWhatsAppUrl } from "@/hooks/use-contextual-whatsapp";
import { useTrackEvent } from "@/hooks/use-track-event";
import type { RestaurantService } from "@/lib/restaurant-services";

/** `head()` for a service route: metadata plus Service, Breadcrumb and FAQ schema. */
export function restaurantServiceHead(s: RestaurantService) {
  const url = canonicalFor(s.path);
  return {
    meta: [
      { title: s.title },
      { name: "description", content: s.description },
      { property: "og:title", content: s.title },
      { property: "og:description", content: s.description },
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
              name: s.h1,
              serviceType: s.serviceType,
              provider: { "@id": `${canonicalFor("/")}#organization` },
              areaServed: [
                "Lebanon",
                "United Arab Emirates",
                "Saudi Arabia",
                "Qatar",
                "Kuwait",
              ].map((name) => ({ "@type": "Country", name })),
              url,
              description: s.description,
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
                { "@type": "ListItem", position: 3, name: s.eyebrow, item: url },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: s.faqs.map((f) => ({
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

export function RestaurantServicePage({ service: s }: { service: RestaurantService }) {
  const whatsappUrl = useContextualWhatsAppUrl();
  const track = useTrackEvent();
  const proof = s.proofSlugs
    .map((slug) => portfolioProjects.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const valueColumns = s.compare.columns.filter((c): c is string => Boolean(c));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="px-5 pb-20 pt-32 sm:px-8 sm:pb-28 sm:pt-44">
          <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-14 lg:grid-cols-[1.05fr_.95fr]">
            <div className="min-w-0">
              <p className="eyebrow text-primary">{s.eyebrow}</p>
              <h1 className="display mt-5 text-4xl leading-[1] sm:text-6xl">{s.h1}</h1>
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {s.intro}
              </p>
              <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                <a
                  href="#free-demo"
                  onClick={() => track("demo_cta_click", { location: `service_${s.key}_hero` })}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-foreground px-7 text-xs font-semibold uppercase tracking-[.15em] text-white"
                >
                  Get my free restaurant demo <ArrowRight className="size-4" />
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("whatsapp_click", { location: `service_${s.key}_hero` })}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-7 text-xs font-semibold uppercase tracking-[.15em]"
                >
                  <MessageCircle className="size-4 text-[#159447]" /> Ask on WhatsApp
                </a>
              </div>
            </div>
            <div id="free-demo" className="min-w-0 scroll-mt-28">
              <ShowUsYourBusiness />
            </div>
          </div>
        </section>

        <section className="hairline bg-[#fff8f7] px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="eyebrow text-primary">How it works</p>
            <h2 className="display mt-5 max-w-3xl text-4xl sm:text-5xl">
              What your customer does, step by step.
            </h2>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {s.steps.map((step, i) => (
                <li key={step.title} className="rounded-2xl border border-border bg-background p-6">
                  <span className="font-display text-3xl text-primary">0{i + 1}</span>
                  <h3 className="mt-3 text-lg font-medium">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="hairline px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <p className="eyebrow text-primary">Compare</p>
            <h2 className="display mt-5 text-4xl sm:text-5xl">{s.compare.heading}</h2>
            {/* Phones: one card per row so the last (our) column is never off-screen. */}
            <div className="mt-10 space-y-3 sm:hidden">
              {s.compare.rows.map(([label, ...cells]) => (
                <div key={label} className="rounded-2xl border border-border p-4">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <dl className="mt-3 space-y-2 text-sm">
                    {valueColumns.map((col, i) => (
                      <div key={col} className="flex justify-between gap-4">
                        <dt
                          className={
                            i === valueColumns.length - 1
                              ? "font-medium text-primary"
                              : "text-muted-foreground"
                          }
                        >
                          {col}
                        </dt>
                        <dd
                          className={`text-right ${i === valueColumns.length - 1 ? "font-medium text-foreground" : "text-muted-foreground"}`}
                        >
                          {cells[i]}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
            <div className="mt-10 hidden overflow-x-auto rounded-2xl border border-border sm:block">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-surface">
                  <tr>
                    <th scope="col" className="p-4 font-medium text-muted-foreground">
                      <span className="sr-only">Aspect</span>
                    </th>
                    {valueColumns.map((c, i, all) => (
                      <th
                        key={c}
                        scope="col"
                        className={`p-4 font-medium ${i === all.length - 1 ? "text-primary" : "text-foreground"}`}
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.compare.rows.map(([label, ...cells]) => (
                    <tr key={label} className="border-t border-border">
                      <th scope="row" className="p-4 font-medium text-foreground">
                        {label}
                      </th>
                      {cells
                        .filter((c) => c !== undefined)
                        .map((c, i, all) => (
                          <td
                            key={i}
                            className={`p-4 ${i === all.length - 1 ? "font-medium text-foreground" : "text-muted-foreground"}`}
                          >
                            {c}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link
              to={s.guide.to}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4"
            >
              <BookOpen className="size-4" /> {s.guide.label}
            </Link>
          </div>
        </section>

        <section className="hairline px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="eyebrow text-primary">Live proof</p>
            <h2 className="display mt-5 max-w-3xl text-4xl sm:text-5xl">
              Open a live site and try it yourself.
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {proof.map((p) => (
                <a
                  key={p.slug}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    track("work_click", { project: p.slug, location: `service_${s.key}` })
                  }
                  className="overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-primary/40"
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
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[.14em]">
                      Try it live <ArrowUpRight className="size-3.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="hairline px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <p className="eyebrow text-primary">Questions</p>
            <h2 className="display mt-5 text-4xl sm:text-5xl">Before you ask.</h2>
            <div className="mt-10 grid gap-x-12 gap-y-9 md:grid-cols-2">
              {s.faqs.map((f) => (
                <div key={f.q} className="border-t border-border pt-5">
                  <h3 className="text-lg font-medium">{f.q}</h3>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
            <div className="mt-14 flex flex-col gap-3 rounded-2xl border border-primary/20 bg-[#fff8f7] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <p className="display text-2xl sm:text-3xl">See it with your own menu.</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#free-demo"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-foreground px-6 text-xs font-semibold uppercase tracking-[.14em] text-white"
                >
                  Free demo <ArrowRight className="size-4" />
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("whatsapp_click", { location: `service_${s.key}_final` })}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#25D366]/40 bg-white px-6 text-xs font-semibold uppercase tracking-[.14em]"
                >
                  <MessageCircle className="size-4 text-[#159447]" /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
