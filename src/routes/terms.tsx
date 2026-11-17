import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CUSTOM_FEATURE_PRICE_CENTS, EXTRA_TRIAL_PRICE_CENTS, MONTHLY_CARE_PRICE_CENTS, usd } from "@/lib/platform";
import { canonicalFor } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Jahjah WebDigital" },
      {
        name: "description",
        content:
          "Terms governing use of the Jahjah WebDigital website platform, packages, trials and delivery.",
      },
      { property: "og:title", content: "Terms of Service — Jahjah WebDigital" },
      {
        property: "og:description",
        content:
          "Platform terms covering website build pricing, monthly care from $99, trials, delivery and licensing.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: canonicalFor("/terms") },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: canonicalFor("/terms") }],
  }),
  component: TermsPage,
});

const SECTIONS = [
  {
    title: "1. One account, one company",
    body: "Each account may register exactly one company and operate one website project. Creating multiple accounts to bypass this limit, or registering a business you do not own or represent, is a breach of these terms and may result in suspension without refund.",
  },
  {
    title: "2. Website build and monthly care pricing",
    body: `Company website builds have a fixed one-time price: Basic $319, Medium $519 and High-End / Luxury $719. Restaurant ordering offers are priced separately on the restaurant page. Every launched website also requires Website Care & Hosting, billed separately after launch. Standard care starts at ${usd(MONTHLY_CARE_PRICE_CENTS)} per month. The $1,299 Advanced restaurant package includes premium maintenance at $149 per month. Care covers managed hosting and SSL, security updates and backups, performance and uptime monitoring, one small content or menu update per month, and priority technical support. Recurring payment details are confirmed before activation. Prices and allowances are validated on our servers.`,
  },
  {
    title: "3. Trials and revisions",
    body: `Every package includes two design trials. Each trial produces a complete design of your website for review. The third and every additional design trial are available at ${usd(EXTRA_TRIAL_PRICE_CENTS)} each as a one-time charge. Unused trials have no cash value and are not refundable.`,
  },
  {
    title: "4. Additional features and upgrades",
    body: `Features outside your chosen package are ${usd(CUSTOM_FEATURE_PRICE_CENTS)} each, confirmed and added to the final project scope and invoice at the end of the build. You may upgrade to a higher package at any time and pay only the difference between the package you own and the package you move to. Downgrades and partial refunds of a completed package are not available.`,
  },
  {
    title: "5. Delivery and licensing",
    body: "You receive a hosted, published website for your registered business. We do not provide source-code downloads, template exports, or design files. The underlying platform, templates and generation system remain the property of Jahjah WebDigital and are licensed to you for use on your own registered business only.",
  },
  {
    title: "6. Resale prohibited",
    body: "You may not resell, sublicense, rebrand, redistribute or resupply the delivered website, its templates or the platform to third parties, and you may not use the platform to produce websites for clients of your own.",
  },
  {
    title: "7. Domains",
    body: "Domain names are registered through third-party registrars and are subject to their availability, pricing and policies. Domain fees are separate from package pricing.",
  },
  {
    title: "8. Payments and refunds",
    body: "The website build, custom features and additional design trials are one-time charges. Website Care & Hosting is a separate recurring monthly service after launch, with the applicable amount shown for the selected package before submission. Work begins once the applicable payment is confirmed. Custom design payments are non-refundable once the first design trial has been generated.",
  },
  {
    title: "9. Content and responsibility",
    body: "You are responsible for the accuracy and legality of the business information, imagery and text you provide, and confirm you hold the rights to use them.",
  },
  {
    title: "10. Changes",
    body: "We may update these terms as the platform evolves. Material changes will be communicated to the email address on your account.",
  },
];

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-24">
        <p className="text-xs uppercase tracking-[0.3em] text-champagne-soft">Legal</p>
        <h1 className="mt-5 font-display text-5xl">Terms of Service</h1>
        <p className="mt-6 text-sm text-muted-foreground">
          These terms govern the use of the Jahjah WebDigital platform and the websites delivered
          through it.
        </p>
        <div className="mt-14 space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-2xl text-champagne">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
