import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, CalendarCheck, Check, MessageCircle, PlusCircle, Receipt, Repeat2, Smartphone } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { WorkPreview } from "@/components/site/WorkPreview";
import { EvidenceStrip } from "@/components/site/EvidenceStrip";
import { IndustryGrid } from "@/components/site/IndustryGrid";
import { ShowUsYourBusiness } from "@/components/site/ShowUsYourBusiness";
import { LeadLightbox } from "@/components/site/LeadLightbox";
import { RestaurantMockup, RestaurantOffer } from "@/components/site/RestaurantOffer";
import { IndustryProof } from "@/components/site/IndustryProof";
import { RestaurantIndustryStudies } from "@/components/site/RestaurantIndustryStudies";
import { CarePlanNote } from "@/components/site/PricingCommitment";
import { Reveal } from "@/components/site/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTrackEvent } from "@/hooks/use-track-event";
import { useContextualWhatsAppUrl } from "@/hooks/use-contextual-whatsapp";
import { RESTAURANT_PACKAGES } from "@/lib/restaurant";
import { getPublishedCaseStudies } from "@/lib/case-studies.functions";
import { faqs, howItWorks, whyPoints } from "@/lib/site-data";
import { portfolioProjects } from "@/lib/portfolio-projects";
import { MONTHLY_CARE_PRICE_CENTS, TIER_LABEL, TIER_ORDER, TIER_PRICE_CENTS, usd } from "@/lib/platform";
import { canonicalFor } from "@/lib/seo";

const title = "Business Website Design, Restaurant Digital Menus & Online Ordering | Jahjah WebDigital";
const description =
  "Company website packages, restaurant digital and QR menus, commission-free online ordering and custom web systems for businesses worldwide. One-time pricing and a free review.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonicalFor("/") }, { property: "og:image", content: "https://jahjahwebdigital.com/__l5e/assets-v1/73a32339-debb-47a8-b9d5-77120ef5eb7d/jahjah-digital-menu-ordering.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "google-site-verification", content: "lPT_QNRNC0asfWXmKyXFw09L3xSEU22ZRWXsayNOXHI" },
    ],
    links: [{ rel: "canonical", href: canonicalFor("/") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              name: "Jahjah WebDigital",
              url: canonicalFor("/"),
              publisher: { "@id": `${canonicalFor("/")}#organization` },
            },
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }),
      },
    ],
  }),
  component: Home,
});

const TIER_PITCH: Record<(typeof TIER_ORDER)[number], string> = {
  basic: "For businesses that need a professional home online.",
  medium: "For businesses ready to turn visitors into inquiries or customers.",
  high: "For brands that need a more custom, high-end digital experience.",
};

function Home() {
  // Homepage views are now covered by the generic `page_view` event fired
  // once per route change from the root layout (path === "/") — this used
  // to fire its own "homepage_view" here too, which double-counted every
  // homepage load as two events for the same page view.
  const track = useTrackEvent();
  const whatsappUrl = useContextualWhatsAppUrl();
  const quoteUrl = `https://wa.me/96171466516?text=${encodeURIComponent("Hi Jihan, I would like a quote for a website, digital menu or custom system. My country is ")}`;

  const fetchCaseStudies = useServerFn(getPublishedCaseStudies);
  const { data: caseStudies } = useQuery({
    queryKey: ["public-case-studies"],
    queryFn: () => fetchCaseStudies({}),
  });

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <SiteHeader />
      <main>
        {/* Hero: the business result first, live proof one tap away */}
        <section className="relative overflow-hidden bg-[#fff9f8] px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-40">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: "radial-gradient(circle at 84% 12%, rgba(225,176,167,.34), transparent 34%), radial-gradient(circle at 12% 85%, rgba(184,115,99,.12), transparent 32%)" }} />
          <div className="relative mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[.92fr_1.08fr]">
            <div className="min-w-0">
              <p className="eyebrow reveal text-primary">Business websites and digital menus · Worldwide</p>
              <h1 className="display reveal mt-5 max-w-3xl text-[2.3rem] leading-[1.04] text-foreground sm:text-6xl lg:text-7xl">
                A successful business starts with <span className="text-primary">the system you run.</span>
              </h1>
              <p className="reveal mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                We build websites and custom systems for businesses worldwide. Launch a restaurant with a digital menu, online ordering and a kitchen dashboard, or upgrade the accounting, marketing and workflows your company already uses.
              </p>
              <div className="reveal mt-8 grid gap-3 sm:flex sm:flex-wrap">
                <a href={quoteUrl} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_click", { location: "home_hero" })} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-emerald-700 px-7 text-xs font-semibold text-white shadow-lift">
                  Get a quote on WhatsApp <MessageCircle className="size-4" aria-hidden="true" />
                </a>
                <a href="https://alafandichicken.com/" target="_blank" rel="noopener noreferrer" onClick={() => track("work_click", { project: "al-afandi-chicken-dubai", location: "home_hero_live_demo" })} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-primary/25 bg-white/70 px-7 text-xs font-semibold uppercase tracking-[.15em] text-foreground">
                  Try a live ordering site <ArrowUpRight className="size-4" />
                </a>
              </div>
              <ul className="reveal mt-6 grid gap-2 text-xs text-muted-foreground sm:flex sm:flex-wrap sm:gap-x-5">
                <li className="flex items-center gap-1.5"><Check className="size-3.5 text-primary" aria-hidden="true" /> Ordering system {usd(RESTAURANT_PACKAGES[1]!.priceCents)} one-time</li>
                <li className="flex items-center gap-1.5"><Check className="size-3.5 text-primary" aria-hidden="true" /> Arabic &amp; English</li>
                <li className="flex items-center gap-1.5"><Check className="size-3.5 text-primary" aria-hidden="true" /> Live in Dubai and Lebanon</li>
              </ul>
              <p className="reveal mt-5 text-xs text-muted-foreground">Not a restaurant? <Link to="/packages" className="underline underline-offset-4">See business website packages</Link>.</p>
              <nav aria-label="Popular services" className="reveal mt-4 flex flex-wrap gap-2 text-sm">
                <Link to="/packages" className="rounded-full border border-border px-3 py-1.5 hover:bg-secondary">Company website packages</Link>
                <Link to="/restaurant-digital-menu" className="rounded-full border border-border px-3 py-1.5 hover:bg-secondary">Restaurant digital menus</Link>
                <Link to="/qr-menu" className="rounded-full border border-border px-3 py-1.5 hover:bg-secondary">QR menu</Link>
                <Link to="/restaurant-online-ordering" className="rounded-full border border-border px-3 py-1.5 hover:bg-secondary">Online ordering</Link>
              </nav>
            </div>
            <Reveal delay={100}><RestaurantMockup /></Reveal>
          </div>
        </section>

        {/* Services overview */}
        <section aria-labelledby="services-heading" className="border-b border-primary/10">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
            <h2 id="services-heading" className="font-display text-2xl sm:text-3xl">What we build</h2>
            <p className="mt-2 text-sm text-muted-foreground">Every custom system is scoped with you before development, whether you need a new system or an upgrade.</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
              <Link to="/restaurant-launch-readiness-score" className="underline">Opening a restaurant soon? Check your launch readiness</Link>
              <a href={quoteUrl} target="_blank" rel="noopener noreferrer" className="underline">Discuss a system upgrade on WhatsApp</a>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {([
                { to: "/website-design", label: "Websites", ar: "تصميم مواقع", body: "Company websites and online stores, from $319." },
                { to: "/restaurant", label: "Complete restaurant systems", ar: "منيو رقمي وطلبات", body: "Digital menu, QR menu and direct ordering." },
                { to: "/kitchen-display-dashboard", label: "Kitchen dashboards", ar: "شاشة مطبخ", body: "Incoming orders on a kitchen screen." },
                { to: "/custom-accounting-system", label: "Custom accounting systems", ar: "نظام محاسبة", body: "Invoices, expenses and reports for your workflow." },
                { to: "/marketing-system", label: "Marketing systems", ar: "نظام تسويق", body: "Lead capture, customer list and follow-up." },
                { to: "/google-business-profile", label: "Google Maps listing", ar: "جوجل بزنس", body: "Be found by customers searching nearby." },
                { to: "/google-ads", label: "Google Ads", ar: "إعلانات جوجل", body: "Search campaigns with every enquiry tracked." },
                { to: "/google-merchant-center", label: "Google Shopping", ar: "جوجل ميرشانت سنتر", body: "Your products and prices in Google results." },
                { to: "/seo-services", label: "SEO", ar: "تحسين محركات البحث", body: "Pages and fixes so Google can find you." },
                { to: "/ar", label: "بالعربي", ar: "منيو إلكتروني وتصميم مواقع", body: "Our services and prices in Arabic." },
              ] as const).map((s) => (
                <Link key={s.to} to={s.to} className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40">
                  <h3 className="font-semibold">{s.label}</h3>
                  <p lang="ar" dir="rtl" className="mt-1 text-xs text-primary">{s.ar}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 02 — Trust strip: real proof only */}
        <div className="border-b border-primary/10 bg-[#fff8f7] text-foreground">
          <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-8">
            <p className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
              Live restaurant &amp; retail websites we built — tap to open
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-8 sm:gap-y-3">
              {portfolioProjects.map((p) => (
                <a
                  key={p.slug}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("work_click", { project: p.slug, location: "trust_strip" })}
                  className="rounded-full border border-primary/10 px-3 py-2 text-[11px] font-medium text-muted-foreground transition-all hover:border-primary hover:text-foreground sm:border-0 sm:p-0 sm:text-sm"
                >
                  {p.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 03 — Our work */}
        <section
          id="work"
          className="scroll-mt-24 bg-[#fff8f7] px-5 pb-20 pt-14 text-foreground sm:px-8 sm:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <Reveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="eyebrow text-primary">Selected live work</p>
                <h2 className="display mt-4 text-4xl leading-none text-foreground sm:mt-6 sm:text-6xl">
                  Don't take our word for it. Place a test order.
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                  These restaurant ordering websites are live today. Open one on your phone, add items, see the add-on suggestions and go through branch selection — exactly what your customers would do.
                </p>
              </div>
              <Link
                to="/work"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/25 px-5 py-3 text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-white/[0.06]"
              >
                See the case studies
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Reveal>
            <div className="mt-9 sm:mt-14">
              <WorkPreview />
              <div className="mt-5 rounded-3xl border border-primary/15 bg-white p-5">
                <h3 className="text-lg font-semibold">Roof Resto Café</h3>
                <p className="mt-1 text-sm text-muted-foreground">Restaurant website and digital menu project.</p>
                <a href="https://roofrestocafe.com/" target="_blank" rel="noopener noreferrer" className="mt-3 mr-4 inline-block underline">Visit the website</a>
                <a href={quoteUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-semibold text-emerald-700">Request a similar website on WhatsApp</a>
              </div>
            </div>
          </div>
        </section>

        {/* 02b — Special restaurant website offer */}
        <RestaurantOffer />

        {/* Public, sourced industry examples — not client claims */}
        <IndustryProof />

        {/* How the system makes the restaurant money — each tied to live proof */}
        <section className="hairline px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <Reveal className="max-w-3xl">
              <p className="eyebrow text-primary">What it does for your restaurant</p>
              <h2 className="display mt-6 text-4xl sm:text-6xl">Built to sell, not just to look good.</h2>
              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Every feature has one job: turn people who are already hungry for your food into orders and bookings that come straight to you.
              </p>
            </Reveal>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Receipt, title: "More direct orders", body: "Customers order on your own website or WhatsApp — you pay a fixed build price, not a commission on every order.", proof: "Al Afandi Chicken Dubai takes orders across 5 branches on its own site." },
                { icon: PlusCircle, title: "Bigger baskets", body: "A “complete your meal” step suggests sides, drinks and desserts before checkout — the easiest way to lift average order value.", proof: "Live on Al Afandi Chicken Dubai." },
                { icon: Smartphone, title: "Faster ordering", body: "No app to download. From Instagram, Google or a QR code to the cart in a few taps, in Arabic or English.", proof: "Live on Afandi Chicken and The Sweet Spot." },
                { icon: CalendarCheck, title: "More reservations", body: "A reserve-a-table path on every key page, so a guest who likes what they see can book on the spot.", proof: "Live on Wholesome Craft Resto Café, El Mina." },
                { icon: Repeat2, title: "Repeat customers", body: "Order-again shortcuts and a direct channel customers come back to, instead of a marketplace that shows them your competitors.", proof: "“Order again” is live on Afandi Chicken." },
                { icon: MessageCircle, title: "Your customers, your data", body: "Orders arrive with the customer's name and WhatsApp number — so you can follow up, run offers and build loyalty.", proof: "WhatsApp handoff and analytics are set up per restaurant." },
              ].map(({ icon: Icon, title: t, body, proof }, i) => (
                <Reveal key={t} delay={(i % 3) * 70} className="flex flex-col rounded-2xl border border-border bg-surface p-6">
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-medium text-foreground">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  <p className="mt-4 border-t border-border pt-3 text-xs text-foreground/75">{proof}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Evidence */}
        <section id="about" className="hairline scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <Reveal className="max-w-2xl">
              <p className="eyebrow text-primary">What the research says</p>
              <h2 className="display mt-6 text-4xl sm:text-6xl">
                A website is a business asset, not just an expense.
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Independent research, not our own claims. Every figure below links to its original
                source.
              </p>
            </Reveal>
            <div className="mt-14">
              <EvidenceStrip />
            </div>
          </div>
        </section>

        {/* Imagine your business here */}
        <section
          id="show-us-your-business"
          className="hairline scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32"
        >
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1fr_1fr]">
            <Reveal>
              <p className="eyebrow text-primary">Imagine your business here</p>
              <h2 className="display mt-6 text-4xl sm:text-6xl">
                Imagine your business easier to find, easier to trust, easier to buy from.
              </h2>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                One website connects Instagram, Google Search, Google Maps, WhatsApp, your products
                and your bookings into a single place customers can act on — not just a brochure.
              </p>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                Send us your Instagram, Google Maps page, or current website. We'll understand your
                business before asking you to explain everything from zero.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <ShowUsYourBusiness />
            </Reveal>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="hairline scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <Reveal className="max-w-2xl">
              <p className="eyebrow text-primary">How it works</p>
              <h2 className="display mt-6 text-4xl sm:text-6xl">Three steps. No jargon.</h2>
            </Reveal>
            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
              {howItWorks.map((s, i) => (
                <Reveal key={s.step} delay={i * 70} className="bg-background p-8 sm:p-10">
                  <span className="display text-4xl text-primary/50">{s.step}</span>
                  <h3 className="mt-6 text-lg font-medium tracking-tight text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </Reveal>
              ))}
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Want the fuller studio process — discovery, strategy, design, build, test, launch?{" "}
              <Link to="/process" className="link-underline text-foreground">
                See how we work
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Solutions by business type */}
        <section id="solutions" className="hairline scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <Reveal className="max-w-2xl">
              <p className="eyebrow text-primary">Solutions by business type</p>
              <h2 className="display mt-6 text-4xl sm:text-6xl">
                Built for businesses like yours.
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                These are the categories we know well — the approach adapts to any serious business
                with something worth presenting properly.
              </p>
            </Reveal>
            <div className="mt-14">
              <IndustryGrid />
            </div>
          </div>
        </section>

        {/* Packages */}
        <section id="pricing" className="hairline scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <Reveal className="max-w-2xl">
              <p className="eyebrow text-primary">Not a restaurant? Company websites</p>
              <h2 className="display mt-6 text-4xl sm:text-6xl">Business website pricing.</h2>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">For retail, clinics, beauty, hotels and service businesses. Restaurant ordering packages are <a href="#restaurant-packages" className="underline underline-offset-4">listed above</a>.</p>
            </Reveal>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {TIER_ORDER.map((tier, i) => (
                <Reveal key={tier} delay={i * 90}>
                  <div
                    className={`flex h-full flex-col rounded-2xl border p-8 transition-colors ${
                      tier === "medium"
                        ? "border-primary/40 bg-surface"
                        : "border-border bg-surface/50 hover:border-primary/30"
                    }`}
                  >
                    {tier === "medium" && (
                      <span className="mb-4 w-fit rounded-full border border-primary/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-primary">
                         Recommended
                      </span>
                    )}
                    <h3 className="font-display text-3xl">{TIER_LABEL[tier]}</h3>
                    <p className="mt-3 text-sm text-muted-foreground">{TIER_PITCH[tier]}</p>
                    <p className="mt-6 font-display text-4xl text-primary">
                      {usd(TIER_PRICE_CENTS[tier])}
                    </p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">One-time website build</p>
                    <p className="mt-3 text-sm font-medium text-foreground">+ {usd(MONTHLY_CARE_PRICE_CENTS)}/month after launch</p>
                    <div className="grow" />
                    <Link
                      to="/packages"
                      onClick={() => track("package_viewed", { tier })}
                      className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      See what's included
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
            <p className="mt-8 text-sm text-muted-foreground">Features outside your package are $50 each, confirmed and added to the final project scope and invoice at the end of the build.</p>
            <div className="mt-8"><CarePlanNote /></div>
          </div>
        </section>

        {/* Published case studies — only renders once approved metrics exist */}
        {caseStudies && caseStudies.length > 0 && (
          <section className="hairline px-5 py-24 sm:px-8 sm:py-32">
            <div className="mx-auto max-w-7xl">
              <Reveal className="max-w-2xl">
                <p className="eyebrow text-primary">Real work. Real numbers.</p>
                <h2 className="display mt-6 text-4xl sm:text-6xl">What happened after launch.</h2>
              </Reveal>
              <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {caseStudies.map((cs: any) => (
                  <div key={cs.id} className="rounded-2xl border border-border bg-surface p-6">
                    <h3 className="text-lg font-medium text-foreground">{cs.title}</h3>
                    {cs.summary && (
                      <p className="mt-2 text-sm text-muted-foreground">{cs.summary}</p>
                    )}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {cs.case_study_metrics.map((m: any) => (
                        <div key={m.id}>
                          <p className="display text-2xl text-primary">
                            {m.metric_value}
                            {m.metric_unit ?? ""}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{m.metric_name}</p>
                        </div>
                      ))}
                    </div>
                    {cs.live_url && (
                      <a
                        href={cs.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline mt-4 inline-block text-xs uppercase tracking-[0.18em] text-foreground"
                      >
                        Visit live website
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Why Jahjah */}
        <section className="hairline px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <Reveal className="max-w-2xl">
              <p className="eyebrow text-primary">Why Jahjah</p>
              <h2 className="display mt-6 text-4xl sm:text-6xl">
                Real people, building real websites.
              </h2>
            </Reveal>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {whyPoints.map((p, i) => (
                <Reveal
                  key={p.title}
                  delay={(i % 3) * 70}
                  className="rounded-2xl border border-border bg-surface p-6"
                >
                  <div className="flex items-start gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{p.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {p.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* High-intent restaurant acquisition paths */}
        <section className="border-b border-primary/10 bg-background px-5 py-8 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Restaurant growth solutions</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {([
                ["/free-restaurant-demo", "Free Restaurant Audit"],
                ["/restaurant-ordering-readiness-score", "Ordering Score"],
                ["/restaurant-launch-readiness-score", "Launch Score"],
                ["/restaurant-google-menu-checker", "Google Menu Checker"],
                ["/restaurant-menu-sync-checker", "Menu Sync Checker"],
                ["/restaurant-relocation-seo-checklist", "Restaurant relocation checklist"],
                ["/restaurant-digital-menu", "Digital Menu"],
                ["/restaurant-online-ordering", "Direct Ordering"],
                ["/qr-menu", "QR Menu"],
                ["/whatsapp-ordering", "WhatsApp Ordering"],
                ["/restaurants/dubai", "Dubai / UAE"],
                ["/restaurants/saudi-arabia", "Saudi Arabia"],
                ["/restaurants/qatar", "Qatar"],
                ["/restaurants/kuwait", "Kuwait"],
                ["/restaurants/lebanon", "Lebanon"],
              ] as const).map(([to, label]) => (
                <Link key={to} to={to} className="rounded-full border border-border bg-surface px-4 py-2 text-xs text-foreground transition-colors hover:border-primary/40">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="hairline px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <p className="eyebrow text-primary">Questions</p>
              <h2 className="display mt-6 text-4xl sm:text-5xl">Good to know before you start.</h2>
            </Reveal>
            <Reveal delay={80} className="mt-10">
              <Accordion type="single" collapsible>
                {faqs.map((f, i) => (
                  <AccordionItem key={f.q} value={`faq-${i}`}>
                    <AccordionTrigger className="text-base">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="hairline px-5 py-24 text-center sm:px-8 sm:py-36">
          <Reveal className="mx-auto max-w-4xl">
            <h2 className="display text-4xl sm:text-7xl">
              See your own restaurant as the demo.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Send your restaurant name and Instagram. We come back with what your menu and ordering flow would look like — free, before you decide anything.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/free-restaurant-demo"
                onClick={() => track("demo_cta_click", { location: "homepage_final_cta" })}
                className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-10 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                Get my free restaurant demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("whatsapp_click", { location: "homepage_final_cta" })}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-8 text-xs uppercase tracking-[0.2em] text-foreground"
              >
                <MessageCircle className="size-4 text-[#159447]" aria-hidden="true" /> Talk about my restaurant
              </a>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">Not a restaurant? <Link to="/contact" onClick={() => track("start_project_click", { location: "homepage_final_cta" })} className="underline underline-offset-4">Send a business website brief</Link>.</p>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
      <LeadLightbox />
      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-primary/15 bg-[#fff9f8]/95 p-3 backdrop-blur-xl sm:hidden" style={{ paddingBottom: "calc(.75rem + env(safe-area-inset-bottom, 0px))" }}>
        <div className="flex gap-2">
          <a href={quoteUrl} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_click", { location: "homepage_mobile_sticky" })} className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white shadow-lift">
            <MessageCircle className="size-5" aria-hidden="true" /> Get a quote on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}