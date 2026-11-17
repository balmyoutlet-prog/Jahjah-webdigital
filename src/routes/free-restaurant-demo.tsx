import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ShowUsYourBusiness } from "@/components/site/ShowUsYourBusiness";
import { useContextualWhatsAppUrl } from "@/hooks/use-contextual-whatsapp";
import { useTrackEvent } from "@/hooks/use-track-event";
import { canonicalFor } from "@/lib/seo";

const title = "Free Restaurant Website & Digital Menu Audit | Jahjah WebDigital";
const description =
  "Free restaurant digital audit for owners. We review your menu, mobile ordering, QR, WhatsApp, reservations and Google/AI findability, then show a restaurant-specific demo.";

export const Route = createFileRoute("/free-restaurant-demo")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonicalFor("/free-restaurant-demo") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonicalFor("/free-restaurant-demo") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Free Restaurant Digital Audit & Ordering Demo",
          description,
          provider: { "@type": "ProfessionalService", name: "Jahjah WebDigital" },
          areaServed: "Worldwide",
          serviceType: [
            "Restaurant Website Audit",
            "Digital Menu Audit",
            "Restaurant Online Ordering Audit",
            "Restaurant SEO and AI Findability Review",
          ],
          url: canonicalFor("/free-restaurant-demo"),
        }),
      },
    ],
  }),
  component: Page,
});

const checks = [
  "Google and AI-search findability",
  "Mobile menu clarity and speed",
  "Direct ordering and checkout friction",
  "QR, WhatsApp and reservation flow",
  "Menu structure, categories and upselling",
  "Customer capture and conversion paths",
];

function Page() {
  const whatsappUrl = useContextualWhatsAppUrl();
  const track = useTrackEvent();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="px-5 pb-20 pt-32 sm:px-8 sm:pt-44">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_.9fr]">
            <div>
              <p className="eyebrow text-primary">Free restaurant digital audit</p>
              <h1 className="display mt-5 text-5xl leading-[.96] sm:text-7xl">
                See what customers — and search engines — see before they order.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Send your restaurant name, website or Instagram. We review the public customer journey,
                identify the highest-priority digital gaps, and show how a branded menu or direct-ordering
                experience could work for your restaurant.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {checks.map((item) => (
                  <p key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {item}
                  </p>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-border bg-surface p-5">
                <p className="text-sm font-medium text-foreground">What you get</p>
                <div className="mt-3 space-y-2">
                  {[
                    "A short prioritized review based on your public restaurant presence",
                    "A restaurant-specific digital menu / ordering demo direction",
                    "No obligation to buy and no unsupported sales promises",
                  ].map((item) => (
                    <p key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("whatsapp_click", { location: "free_demo_hero" })}
                  className="inline-flex min-h-13 items-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-6 text-xs font-semibold uppercase tracking-[.14em]"
                >
                  <MessageCircle className="size-4 text-[#159447]" />
                  Ask for my demo on WhatsApp
                </a>
                <Link
                  to="/work"
                  className="inline-flex min-h-13 items-center gap-2 rounded-full border border-border px-6 text-xs font-semibold uppercase tracking-[.14em]"
                >
                  See live restaurant projects <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
            <ShowUsYourBusiness />
          </div>
        </section>

        <section className="hairline px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow text-primary">Built around real restaurant problems</p>
            <h2 className="display mt-5 max-w-4xl text-4xl sm:text-6xl">
              One audit across menu, ordering, reservations, Google, Instagram and WhatsApp.
            </h2>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              A restaurant can look active on social media and still make customers work too hard to
              view the menu, choose a branch, reserve a table or place a direct order. The audit looks
              at that complete path instead of judging the website design alone.
            </p>
          </div>
        </section>

        <section className="hairline px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow text-primary">Restaurant markets we support</p>
            <h2 className="display mt-5 text-4xl sm:text-5xl">
              Lebanon, UAE, Saudi Arabia, Qatar, Kuwait — and restaurants worldwide.
            </h2>
            <div className="mt-8 flex flex-wrap gap-2">
              {[
                ["/restaurants/lebanon", "Lebanon"],
                ["/restaurants/dubai", "Dubai"],
                ["/restaurants/abu-dhabi", "Abu Dhabi"],
                ["/restaurants/saudi-arabia", "Saudi Arabia"],
                ["/restaurants/riyadh", "Riyadh"],
                ["/restaurants/jeddah", "Jeddah"],
                ["/restaurants/qatar", "Qatar"],
                ["/restaurants/doha", "Doha"],
                ["/restaurants/kuwait", "Kuwait"],
              ].map(([to, label]) => (
                <a
                  key={to}
                  href={to}
                  className="rounded-full border border-border bg-surface px-4 py-2 text-xs text-foreground transition-colors hover:border-primary/40"
                >
                  {label}
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
