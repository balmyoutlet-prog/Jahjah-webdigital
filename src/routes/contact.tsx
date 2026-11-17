import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ContactForm } from "@/components/site/ContactForm";
import { Reveal } from "@/components/site/Reveal";
import { canonicalFor } from "@/lib/seo";

const title = "Request a Business Website Review | Jahjah WebDigital";
const description =
  "Tell us about your business and your goals. Jahjah WebDigital designs and builds premium websites for companies worldwide, remotely and professionally.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonicalFor("/contact") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonicalFor("/contact") }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="glow-top px-5 pb-14 pt-32 sm:px-8 sm:pt-44">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <p className="eyebrow text-primary">Project inquiry</p>
              <h1 className="display mt-6 max-w-4xl text-5xl sm:text-7xl">
                 Tell us what your website needs to do.
              </h1>
              <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground">
                 Share your current site and goals. We review your customer journey and reply with a practical next step. We work remotely with businesses worldwide.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.5fr_1fr]">
            <Reveal className="rounded-sm border border-border bg-surface p-6 sm:p-10">
              <ContactForm />
            </Reveal>
            <Reveal delay={120} className="space-y-10">
              <div>
                <p className="eyebrow">Studio</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Jahjah WebDigital is a boutique web design and development studio based in
                  Lebanon, delivering to companies worldwide.
                </p>
              </div>
              <div>
                <p className="eyebrow">How we work</p>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li>Direct communication with the people building your site</li>
                  <li>Clear scope, timeline and milestones before we start</li>
                  <li>Remote collaboration across time zones</li>
                  <li>Clear scope and agreed handover at launch</li>
                </ul>
              </div>
              <div>
                <p className="eyebrow">Good fit for</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Established businesses, growing brands and companies whose current website no
                  longer reflects the quality of their work.
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
