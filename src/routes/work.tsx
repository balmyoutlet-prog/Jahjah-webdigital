import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { WorkGrid } from "@/components/site/WorkGrid";
import { Reveal } from "@/components/site/Reveal";
import { canonicalFor } from "@/lib/seo";
import { useTrackEvent } from "@/hooks/use-track-event";
import { RestaurantToolLinks } from "@/components/site/RestaurantToolLinks";
import { portfolioProjects } from "@/lib/portfolio-projects";

const title = "Restaurant Ordering Website Examples & Case Studies | Jahjah WebDigital";
const description =
  "Live restaurant ordering websites built by Jahjah WebDigital in Dubai and Lebanon — bilingual menus, add-on upsells, branch selection, reservations and pickup or delivery ordering you can test yourself.";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonicalFor("/work") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonicalFor("/work") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "ItemList",
              name: "Live websites built by Jahjah WebDigital",
              itemListElement: portfolioProjects.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                  "@type": "CreativeWork",
                  name: `${p.name} website`,
                  url: p.url,
                  description: p.description,
                  ...(p.market ? { locationCreated: { "@type": "Place", name: p.market } } : {}),
                  creator: { "@id": `${canonicalFor("/")}#organization` },
                },
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: canonicalFor("/") },
                { "@type": "ListItem", position: 2, name: "Live work", item: canonicalFor("/work") },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: WorkPage,
});

function WorkPage() {
  const track = useTrackEvent();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="glow-top px-5 pb-16 pt-32 sm:px-8 sm:pb-24 sm:pt-44">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <p className="eyebrow text-primary">Live work · case studies</p>
              <h1 className="display mt-6 max-w-4xl text-5xl sm:text-7xl lg:text-8xl">
                Restaurant ordering websites you can test right now.
              </h1>
              <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground">
                Every project below is live. Open it on your phone and order like a customer would — choose a branch, add a side, reserve a table. Then imagine it with your menu and your brand.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="mx-auto max-w-7xl">
            <WorkGrid />
          </div>
        </section>

        <RestaurantToolLinks />

        <section className="hairline px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <h2 className="display max-w-2xl text-4xl sm:text-5xl">
              Want to see your restaurant built like this?
            </h2>
            <Link
              to="/free-restaurant-demo"
              onClick={() => track("demo_cta_click", { location: "work_page_cta" })}
              className="group inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get my free restaurant demo
              <ArrowRight
                className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
