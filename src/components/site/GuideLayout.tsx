import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { canonicalFor } from "@/lib/seo";
import { useContextualWhatsAppUrl } from "@/hooks/use-contextual-whatsapp";
import { useTrackEvent } from "@/hooks/use-track-event";

export type GuideMeta = {
  path: string;
  title: string;
  description: string;
  headline: string;
  published: string;
  faqs: { q: string; a: string }[];
};

/** `head()` for a buyer guide: metadata plus Article, Breadcrumb and FAQ schema. */
export function guideHead(g: GuideMeta) {
  const url = canonicalFor(g.path);
  return {
    meta: [
      { title: g.title },
      { name: "description", content: g.description },
      { property: "og:title", content: g.title },
      { property: "og:description", content: g.description },
      { property: "og:type", content: "article" },
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
              "@type": "Article",
              headline: g.headline,
              description: g.description,
              datePublished: g.published,
              dateModified: g.published,
              mainEntityOfPage: url,
              author: { "@id": `${canonicalFor("/")}#organization` },
              publisher: { "@id": `${canonicalFor("/")}#organization` },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: canonicalFor("/") },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Restaurant guides",
                  item: canonicalFor("/restaurant"),
                },
                { "@type": "ListItem", position: 3, name: g.headline, item: url },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: g.faqs.map((f) => ({
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

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Timezone-independent so server and client render the same text. */
function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[(m ?? 1) - 1]} ${y}`;
}

export function GuideSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="display text-3xl sm:text-4xl">{title}</h2>
      <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}

export function GuideLayout({
  meta,
  eyebrow,
  intro,
  service,
  proof,
  children,
}: {
  meta: GuideMeta;
  eyebrow: string;
  intro: string;
  service: { to: string; label: string };
  proof: { url: string; label: string; slug: string };
  children: ReactNode;
}) {
  const whatsappUrl = useContextualWhatsAppUrl();
  const track = useTrackEvent();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="px-5 pb-24 pt-32 sm:px-8 sm:pt-44">
        <article className="mx-auto max-w-3xl">
          <p className="eyebrow text-primary">{eyebrow}</p>
          <h1 className="display mt-5 text-4xl leading-[1.02] sm:text-6xl">{meta.headline}</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{intro}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            Jahjah WebDigital · Updated {formatDate(meta.published)}
          </p>

          {children}

          <section className="mt-16">
            <h2 className="display text-3xl sm:text-4xl">Quick answers</h2>
            <div className="mt-6 space-y-6">
              {meta.faqs.map((f) => (
                <div key={f.q} className="border-t border-border pt-5">
                  <h3 className="text-lg font-medium">{f.q}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="mt-16 rounded-[1.5rem] border border-primary/20 bg-[#fff8f7] p-6 sm:p-8">
            <p className="eyebrow text-primary">Next step</p>
            <p className="display mt-3 text-3xl">See it working for your restaurant.</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Try a live ordering site, then send us your restaurant name — we'll show you what your
              menu and ordering flow would look like, free.
            </p>
            <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
              <Link
                to="/free-restaurant-demo"
                onClick={() =>
                  track("demo_cta_click", { location: `guide${meta.path.replace("/guides", "")}` })
                }
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-xs font-semibold uppercase tracking-[.14em] text-white"
              >
                Get my free demo <ArrowRight className="size-4" />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track("whatsapp_click", { location: `guide${meta.path.replace("/guides", "")}` })
                }
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-white px-6 text-xs font-semibold uppercase tracking-[.14em]"
              >
                <MessageCircle className="size-4 text-[#159447]" /> Talk about my restaurant
              </a>
              <a
                href={proof.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track("work_click", {
                    project: proof.slug,
                    location: `guide${meta.path.replace("/guides", "")}`,
                  })
                }
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-white px-6 text-xs font-semibold uppercase tracking-[.14em]"
              >
                {proof.label} <ArrowUpRight className="size-4" />
              </a>
            </div>
            <Link
              to={service.to}
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4"
            >
              {service.label}
            </Link>
          </aside>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
