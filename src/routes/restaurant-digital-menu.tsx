import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ShowUsYourBusiness } from "@/components/site/ShowUsYourBusiness";
import { canonicalFor } from "@/lib/seo";

const title = "Digital Menu for Restaurants | QR Menu & Direct Ordering | Jahjah WebDigital";
const description = "Create a branded restaurant digital menu with QR access, direct ordering, WhatsApp, reservations, upselling and customer insights. Free restaurant demo.";

export const Route = createFileRoute("/restaurant-digital-menu")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonicalFor("/restaurant-digital-menu") },
    ],
    links: [{ rel: "canonical", href: canonicalFor("/restaurant-digital-menu") }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Restaurant Digital Menu & Direct Ordering",
      provider: { "@type": "ProfessionalService", name: "Jahjah WebDigital" },
      areaServed: "Worldwide",
      serviceType: ["Digital Menu","QR Menu","Restaurant Online Ordering","WhatsApp Ordering","Restaurant Reservations"],
      url: canonicalFor("/restaurant-digital-menu"),
      description,
    }) }],
  }),
  component: DigitalMenuPage,
});

function DigitalMenuPage() {
  const benefits = [
    "Update prices and items without reprinting menus",
    "QR menu built around your restaurant brand",
    "Direct ordering without marketplace commission",
    "WhatsApp ordering, takeaway, delivery and dine-in flows",
    "Smart upselling and cross-selling inside the menu",
    "Reservations and customer lead capture",
    "Arabic / English ready experiences",
    "Analytics to understand what customers actually do",
  ];
  return <div className="min-h-screen bg-background">
    <SiteHeader />
    <main>
      <section className="px-5 pb-20 pt-32 sm:px-8 sm:pb-28 sm:pt-44">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div>
            <p className="eyebrow text-primary">Digital menu for restaurants · Worldwide</p>
            <h1 className="display mt-5 text-5xl leading-[.96] sm:text-7xl">Your menu should do more than show prices. <span className="text-primary">It should sell.</span></h1>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">Turn your printed or PDF menu into a branded mobile ordering experience with QR access, direct orders, WhatsApp, reservations, upselling and measurable customer journeys.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#free-demo" className="inline-flex min-h-14 items-center gap-2 rounded-full bg-foreground px-7 text-xs font-semibold uppercase tracking-[.15em] text-white">Get My Free Restaurant Demo <ArrowRight className="size-4"/></a>
              <Link to="/restaurant-google-menu-checker" className="inline-flex min-h-14 items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-7 text-xs font-semibold uppercase tracking-[.15em] text-foreground">Check My Google Menu</Link>
              <Link to="/restaurant" className="inline-flex min-h-14 items-center gap-2 rounded-full border border-border px-7 text-xs font-semibold uppercase tracking-[.15em]">See Restaurant System</Link>
            </div>
          </div>
          <div id="free-demo" className="scroll-mt-28"><ShowUsYourBusiness /></div>
        </div>
      </section>
      <section className="hairline px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow text-primary">Built for restaurant growth</p>
          <h2 className="display mt-5 max-w-3xl text-4xl sm:text-6xl">From Instagram or Google to an order in fewer steps.</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{benefits.map(x=><div key={x} className="rounded-2xl border border-border bg-surface p-5"><Check className="size-5 text-primary"/><p className="mt-4 text-sm leading-relaxed">{x}</p></div>)}</div>
        </div>
      </section>
      <section className="hairline px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-primary/15 bg-[#fff8f7] p-7 sm:p-10">
          <p className="eyebrow text-primary">Free Google menu source check</p>
          <h2 className="display mt-4 text-4xl sm:text-5xl">Your owned menu can be correct while Google still shows stale information.</h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">Use our free eight-question checker to review menu links, providers, branch routing, prices, menu photos and dish names before you send more customers to Google or Maps.</p>
          <Link to="/restaurant-google-menu-checker" className="mt-7 inline-flex min-h-14 items-center gap-2 rounded-full bg-foreground px-7 text-xs font-semibold uppercase tracking-[.15em] text-white">Run Free Menu Check <ArrowRight className="size-4"/></Link> <Link to="/restaurant-menu-sync-checker" className="mt-3 ml-0 inline-flex min-h-14 items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-7 text-xs font-semibold uppercase tracking-[.15em] text-foreground sm:ml-3">Check Menu Sync <ArrowRight className="size-4"/></Link>
        </div>
      </section>
      <section className="hairline px-5 py-20 sm:px-8"><div className="mx-auto max-w-4xl text-center"><p className="eyebrow text-primary">For restaurants, cafés & hospitality groups</p><h2 className="display mt-5 text-4xl sm:text-6xl">See your own restaurant as the demo.</h2><p className="mx-auto mt-5 max-w-2xl text-muted-foreground">Send your restaurant name and Instagram. We use your real concept to understand which digital ordering flow fits your business.</p><a href="#free-demo" className="mt-8 inline-flex min-h-14 items-center gap-2 rounded-full bg-primary px-7 text-xs font-semibold uppercase tracking-[.15em] text-primary-foreground">Request Free Demo <ArrowRight className="size-4"/></a></div></section>
    </main>
    <SiteFooter />
  </div>;
}
