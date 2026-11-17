import { ArrowUpRight } from "lucide-react";

const EXAMPLES = [
  {
    brand: "Starbucks UK",
    metric: "+28%",
    label: "Mobile Order & Pay orders",
    detail: "Mobile Order & Pay orders increased 28% year over year in FY2025. Rewards sales also increased 45% and represented 42% of UK sales.",
    source: "Starbucks FY2025 UK & EMEA accounts",
    href: "https://stories.starbucks.com/emea/stories/2026/starbucks-uk-and-emea-accounts-fiscal-year-ended-september-2025/",
  },
  {
    brand: "Domino’s",
    metric: "85%+",
    label: "U.S. sales through digital channels",
    detail: "More than 85% of U.S. retail sales came through digital channels in 2025. Domino’s also reported 5.4% global retail sales growth for the year; the report does not attribute that growth to digital alone.",
    source: "Domino’s FY2025 results",
    href: "https://ir.dominos.com/news-releases/news-release-details/dominos-pizzar-announces-fourth-quarter-and-fiscal-2025",
  },
  {
    brand: "Chipotle",
    metric: "38.3%",
    label: "Digital share of food & beverage sales",
    detail: "Digital sales represented 38.3% of food and beverage revenue in Q2 2026, up from 35.5% in Q2 2025.",
    source: "Chipotle Q2 2026 results",
    href: "https://ir.chipotle.com/2026-07-29-CHIPOTLE-RAISES-FULL-YEAR-COMPARABLE-SALES-GUIDANCE-ON-STRONG-Q2-MOMENTUM",
  },
];

export function IndustryProof() {
  return (
    <section className="border-y border-primary/10 bg-[#f8e9e7] px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="eyebrow text-primary">Public restaurant industry evidence</p>
          <h2 className="display mt-5 text-4xl leading-[1.02] sm:text-6xl">
            Digital ordering is already part of how leading restaurants grow.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            These public examples show the scale of customer demand for convenient digital ordering, loyalty and direct channels.
          </p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {EXAMPLES.map((example) => (
            <article key={example.brand} className="flex h-full flex-col rounded-[1.75rem] border border-primary/15 bg-white p-6 shadow-soft sm:p-7">
              <p className="text-sm font-medium text-foreground">{example.brand}</p>
              <p className="mt-5 font-display text-5xl text-primary">{example.metric}</p>
              <h3 className="mt-2 text-base font-medium text-foreground">{example.label}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{example.detail}</p>
              <div className="grow" />
              <a href={example.href} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary">
                Read the original source <ArrowUpRight className="size-4" aria-hidden="true" />
                <span className="sr-only">: {example.source}</span>
              </a>
            </article>
          ))}
        </div>
        <p className="mt-7 rounded-2xl border border-primary/15 bg-white/70 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Public industry examples — not Jahjah WebDigital client results.</strong>{" "}
          Results depend on the restaurant, offer, traffic, operations and marketing. No sales outcome is guaranteed.
        </p>
      </div>
    </section>
  );
}
