import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { canonicalFor } from "@/lib/seo";

const path = "/restaurant-relocation-seo-checklist";
const title = "Restaurant Relocation SEO Checklist | Jahjah WebDigital";
const description =
  "A practical checklist for moving an existing restaurant: keep your website, Google Business Profile, menu, reservations, ordering links and listings aligned with your new address.";

const phases = [
  {
    label: "Before the move",
    heading: "Map every place customers find you",
    intro: "Record your current details and decide what will change before editing public listings.",
    items: [
      "Confirm the new street address, map pin, contact number, opening date and hours. Check whether the move changes delivery zones or pickup instructions.",
      "List every customer-facing location: website pages, Google Business Profile, menu and QR links, reservation and ordering providers, Instagram and other social profiles, and directory listings.",
      "Keep access to each account and note which third-party providers control your menu, booking buttons or order links. Prepare the new details for each provider.",
      "If you have multiple branches, document each branch's own address, hours, menu and booking destination so a move does not send guests to the wrong location.",
    ],
  },
  {
    label: "When the address changes",
    heading: "Update the destinations customers actually use",
    intro: "Make the new location clear across your owned pages and the platforms you manage.",
    items: [
      "Update the restaurant's website address, contact page, directions link, location schema if used, hours and pickup or delivery instructions. Keep the site usable on mobile.",
      "Edit the address and map pin on the existing Google Business Profile where appropriate. Follow Google's verification prompts; some changes can require review or reverification.",
      "Check the menu URL and any menu provider connected to Google. Make sure visible items, prices and branch links still point to the right restaurant.",
      "Update reservation, table, direct-order and WhatsApp entry points. Check that confirmation messages and pickup details show the new location.",
      "Update social bios, pinned posts and major directories you control. If a page URL must change, redirect the old URL to the relevant new page where possible rather than leaving a broken link.",
    ],
  },
  {
    label: "After reopening",
    heading: "Test the journey and keep checking",
    intro: "A changed address is only useful if customers can complete their next step.",
    items: [
      "Search your restaurant name and check the address, map pin, website link and hours as a customer would see them. Allow time for third-party listings to update.",
      "From a phone, follow Google Maps and Instagram links through the menu, booking or order flow. Place a safe test order or reservation if your provider allows it.",
      "Review the most important directories and provider pages again for old addresses or links. Request corrections on listings you cannot edit directly.",
      "Recheck holiday hours, delivery areas and branch-specific links when operations settle; keep a single record of the approved details for future updates.",
    ],
  },
] as const;

const faqs = [
  {
    question: "Should I create a new Google Business Profile when my restaurant moves?",
    answer:
      "For an existing restaurant moving locations, start by reviewing and updating its existing profile according to Google's guidance rather than creating a duplicate. Whether the change is eligible and whether reverification is needed depend on the business and Google's review process.",
  },
  {
    question: "How quickly will my new address appear everywhere?",
    answer:
      "There is no single update time. Your website can be changed directly, while Google, directories and third-party providers may review or refresh information on their own schedules. Check each important listing after the move.",
  },
  {
    question: "Do I need a new website after moving?",
    answer:
      "Not necessarily. Often the existing website can be updated with the new address, directions, hours and relevant ordering or booking details. If a location page URL changes, preserve a useful path from its old URL.",
  },
  {
    question: "What if Google still shows an old menu or ordering link?",
    answer:
      "Check the menu URL on your Business Profile and identify any connected menu or ordering provider. Correct the source that supplies the outdated information, then check the customer-facing result again. Different sources may update at different times.",
  },
] as const;

export const Route = createFileRoute("/restaurant-relocation-seo-checklist")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: canonicalFor(path) },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonicalFor(path) }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: "Restaurant relocation SEO checklist",
              description,
              datePublished: "2026-10-01",
              author: { "@type": "Organization", name: "Jahjah WebDigital", url: canonicalFor("/") },
              mainEntityOfPage: canonicalFor(path),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: canonicalFor("/") },
                { "@type": "ListItem", position: 2, name: "Restaurant relocation SEO checklist", item: canonicalFor(path) },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: faqs.map(({ question, answer }) => ({
                "@type": "Question",
                name: question,
                acceptedAnswer: { "@type": "Answer", text: answer },
              })),
            },
          ],
        }),
      },
    ],
  }),
  component: RelocationGuide,
});

function RelocationGuide() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border px-5 pb-16 pt-32 sm:px-8 sm:pb-20 sm:pt-44">
          <div className="mx-auto max-w-6xl">
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Home</Link> <span aria-hidden="true">/</span> Restaurant relocation checklist
            </nav>
            <p className="eyebrow mt-10 text-primary">Restaurant owner guide · October 1, 2026</p>
            <h1 className="display mt-5 max-w-5xl text-5xl leading-[.98] sm:text-7xl">
              Restaurant relocation SEO checklist
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Moving an existing restaurant? Help guests find the right door and the right next step. Use this phased checklist to align your website, Google Business Profile, menu, reservations, ordering links, social profiles and directories with the new address.
            </p>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-24" aria-labelledby="checklist-heading">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow text-primary">A practical sequence</p>
            <h2 id="checklist-heading" className="display mt-4 text-4xl sm:text-5xl">Before, during and after the move.</h2>
            <div className="mt-12 space-y-14">
              {phases.map((phase, index) => (
                <section key={phase.label} className="grid gap-7 border-t border-border pt-8 lg:grid-cols-[.38fr_1fr]">
                  <div>
                    <p className="eyebrow text-primary">0{index + 1} / {phase.label}</p>
                    <h3 className="display mt-3 text-3xl sm:text-4xl">{phase.heading}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{phase.intro}</p>
                  </div>
                  <ul className="space-y-5">
                    {phase.items.map((item) => (
                      <li key={item} className="flex gap-4 text-base leading-relaxed text-foreground">
                        <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <p className="mt-12 max-w-3xl border-l-2 border-primary pl-5 text-sm leading-relaxed text-muted-foreground">
              These updates can make information more consistent, but no checklist guarantees search placement, immediate listing changes or a particular number of orders.
            </p>
          </div>
        </section>

        <section className="hairline px-5 py-16 sm:px-8 sm:py-24" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow text-primary">Common questions</p>
            <h2 id="faq-heading" className="display mt-4 text-4xl sm:text-5xl">Relocation FAQs</h2>
            <div className="mt-10 grid gap-x-12 gap-y-9 md:grid-cols-2">
              {faqs.map(({ question, answer }) => (
                <div key={question} className="border-t border-border pt-5">
                  <h3 className="text-lg font-medium text-foreground">{question}</h3>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">{answer}</p>
                </div>
              ))}
            </div>
            <a href="https://support.google.com/business/answer/3039617" target="_blank" rel="noopener noreferrer" className="mt-9 inline-flex text-sm font-medium text-primary underline">Google Business Profile guidance on editing business information</a>
          </div>
        </section>

        <section className="hairline px-5 py-16 sm:px-8 sm:py-24" aria-labelledby="next-heading">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow text-primary">Keep the customer journey connected</p>
            <h2 id="next-heading" className="display mt-4 max-w-3xl text-4xl sm:text-5xl">Check the links before customers have to.</h2>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/restaurant-google-menu-checker" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium text-foreground hover:border-primary">Google Menu Checker <ArrowRight className="size-4" /></Link>
              <Link to="/restaurant-ordering-readiness-score" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium text-foreground hover:border-primary">Ordering Readiness Score <ArrowRight className="size-4" /></Link>
              <Link to="/restaurant-launch-readiness-score" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium text-foreground hover:border-primary">Launch Readiness Score <ArrowRight className="size-4" /></Link>
            </div>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground">Want a second look at your restaurant's public menu, location and ordering journey? Request a free restaurant-specific audit.</p>
            <Link to="/free-restaurant-demo" className="mt-6 inline-flex min-h-14 items-center gap-2 rounded-full bg-foreground px-7 text-xs font-semibold uppercase tracking-[.14em] text-background">Request a Free Restaurant Audit <ArrowRight className="size-4" /></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}