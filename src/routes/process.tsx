import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Minus } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Reveal } from "@/components/site/Reveal";
import { comparison, processSteps } from "@/lib/site-data";
import { canonicalFor } from "@/lib/seo";

const title = "Our Process — Jahjah WebDigital";
const description =
  "How Jahjah WebDigital builds a website end to end: discover, strategy, design, build, test, launch — and what makes a custom build different from a template.";

export const Route = createFileRoute("/process")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonicalFor("/process") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonicalFor("/process") }],
  }),
  component: ProcessPage,
});

function ProcessPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-32 pb-24">
        <section className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <p className="eyebrow text-primary">Our process</p>
            <h1 className="display mt-6 text-5xl sm:text-7xl">
              Discover → Strategy → Design → Build → Test → Launch.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
              A structured process, so you always know what is happening, what comes next and what
              we need from you.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((s, i) => (
              <Reveal key={s.step} delay={i * 60} className="bg-background p-8 sm:p-10">
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
        </section>

        <section className="mx-auto mt-24 max-w-6xl px-5 sm:px-8">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-primary">The difference</p>
            <h2 className="display mt-6 text-4xl sm:text-6xl">
              Built for businesses, not templates.
            </h2>
          </Reveal>
          <div className="mt-14 overflow-hidden rounded-2xl border border-border">
            <div className="hidden grid-cols-12 border-b border-border bg-surface/60 md:grid">
              <p className="eyebrow col-span-3 p-5">Area</p>
              <p className="eyebrow col-span-4 p-5">Generic template site</p>
              <p className="eyebrow col-span-5 p-5 text-primary">Jahjah WebDigital</p>
            </div>
            {comparison.map((row, i) => (
              <Reveal
                key={row.topic}
                delay={i * 40}
                className="grid gap-3 border-b border-border p-5 last:border-b-0 md:grid-cols-12 md:gap-0 md:p-0"
              >
                <p className="text-sm font-medium text-foreground md:col-span-3 md:p-5">
                  {row.topic}
                </p>
                <p className="flex items-start gap-2 text-sm text-muted-foreground md:col-span-4 md:p-5">
                  <Minus className="mt-0.5 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
                  {row.template}
                </p>
                <p className="flex items-start gap-2 text-sm text-foreground md:col-span-5 md:p-5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {row.studio}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-24 max-w-6xl px-5 text-center sm:px-8">
          <Reveal>
            <h2 className="display text-3xl sm:text-5xl">Ready to start?</h2>
            <div className="mt-8">
              <Link
                to="/packages"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-primary px-8 py-4 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                See Packages
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
