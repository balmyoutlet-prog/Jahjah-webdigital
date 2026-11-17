import type { ReactNode } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTrackEvent } from "@/hooks/use-track-event";

const sources = {
  dominos: "https://ir.dominos.com/news-releases/news-release-details/dominos-pizzar-announces-second-quarter-2025-financial-results",
  chipotle: "https://ir.chipotle.com/2026-02-03-CHIPOTLE-ANNOUNCES-FOURTH-QUARTER-AND-FULL-YEAR-2025-RESULTS",
  mcdonalds2025: "https://corporate.mcdonalds.com/content/mcdonalds/corpmcd/our-stories/article/Q4-full-year-2025-results.html",
  mcdonalds2024: "https://corporate.mcdonalds.com/corpmcd/our-stories/article/Q4-full-year-2024-results.html",
};

function SourceLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary">
      {children}<ExternalLink className="size-4" aria-hidden="true" />
    </a>
  );
}

export function RestaurantIndustryStudies() {
  const track = useTrackEvent();
  return (
    <section className="border-y border-primary/10 bg-[#fff8f7] px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="industry-studies-title">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="eyebrow text-primary">Public restaurant benchmarks</p>
          <h2 id="industry-studies-title" className="display mt-5 text-4xl leading-[1.02] sm:text-6xl">
            Restaurant leaders already treat digital ordering as core.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Public company-reported examples—not Jahjah WebDigital client results. They show why a direct digital customer journey matters.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.08fr_.92fr]">
          <article className="rounded-[1.8rem] border border-primary/20 bg-white p-6 shadow-lift sm:p-8">
            <div className="grid items-center gap-8 sm:grid-cols-[.75fr_1.25fr]">
              <div className="relative mx-auto grid size-52 place-items-center" role="img" aria-label="More than 85 percent of Domino's United States retail sales were digital in 2024">
                <svg viewBox="0 0 180 180" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
                  <circle cx="90" cy="90" r="72" fill="none" stroke="var(--border)" strokeWidth="13" />
                  <circle cx="90" cy="90" r="72" fill="none" stroke="var(--primary)" strokeWidth="13" strokeLinecap="round" strokeDasharray="452.4" strokeDashoffset="67.9" />
                </svg>
                <div className="text-center">
                  <span className="block font-display text-6xl text-primary">85%+</span>
                  <span className="mt-1 block text-xs uppercase tracking-[.14em] text-muted-foreground">digital</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[.14em] text-primary">Domino's · 2024</p>
                <h3 className="mt-3 font-display text-3xl">Digital became the primary ordering channel.</h3>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  Domino's reported that more than 85% of U.S. retail sales were generated through digital channels in 2024.
                </p>
                <SourceLink href={sources.dominos}>Official Domino's source</SourceLink>
              </div>
            </div>
          </article>

          <article className="rounded-[1.8rem] border border-primary/15 bg-white p-6 shadow-soft sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[.14em] text-primary">McDonald's loyalty momentum</p>
            <h3 className="mt-3 font-display text-3xl">Reported loyalty-member systemwide sales</h3>
            <div className="mt-7" role="img" aria-label="McDonald's reported approximately 30 billion dollars in loyalty-member systemwide sales in 2024 and nearly 37 billion dollars in 2025">
              <svg viewBox="0 0 560 250" className="h-auto w-full" aria-hidden="true">
                <defs>
                  <linearGradient id="loyalty-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity=".28" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity=".02" />
                  </linearGradient>
                </defs>
                <line x1="60" y1="205" x2="520" y2="205" stroke="var(--border)" strokeWidth="2" />
                <path d="M80 174 L490 54 L490 205 L80 205 Z" fill="url(#loyalty-area)" />
                <path d="M80 174 L490 54" fill="none" stroke="var(--primary)" strokeWidth="5" strokeLinecap="round" />
                <circle cx="80" cy="174" r="8" fill="var(--card)" stroke="var(--primary)" strokeWidth="4" />
                <circle cx="490" cy="54" r="8" fill="var(--card)" stroke="var(--primary)" strokeWidth="4" />
                <text x="80" y="150" textAnchor="middle" fill="currentColor" fontSize="22">$30B</text>
                <text x="490" y="32" textAnchor="middle" fill="currentColor" fontSize="22">~$37B</text>
                <text x="80" y="234" textAnchor="middle" fill="currentColor" fontSize="16">2024</text>
                <text x="490" y="234" textAnchor="middle" fill="currentColor" fontSize="16">2025</text>
              </svg>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Company-reported figures: approximately $30B in 2024 and nearly $37B in 2025.
            </p>
            <div className="flex flex-wrap gap-x-5">
              <SourceLink href={sources.mcdonalds2024}>2024 source</SourceLink>
              <SourceLink href={sources.mcdonalds2025}>2025 source</SourceLink>
            </div>
          </article>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <article className="rounded-[1.5rem] border border-primary/15 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[.14em] text-primary">Chipotle · 2025</p>
            <p className="mt-3 font-display text-4xl text-foreground">37.2%</p>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">Digital sales represented 37.2% of total food and beverage revenue.</p>
            <SourceLink href={sources.chipotle}>Official Chipotle source</SourceLink>
          </article>
          <article className="rounded-[1.5rem] border border-primary/15 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[.14em] text-primary">McDonald's · 2025</p>
            <p className="mt-3 font-display text-4xl text-foreground">+20% · nearly $37B</p>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">Systemwide sales to loyalty members increased 20% to nearly $37B.</p>
            <SourceLink href={sources.mcdonalds2025}>Official McDonald's source</SourceLink>
          </article>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          Company metrics differ and are not forecasts or guaranteed results for an individual restaurant.
        </p>

        <div className="mt-9 grid gap-3 sm:grid-cols-3">
          {["Own the ordering relationship", "Make mobile ordering effortless", "Turn first orders into repeat visits"].map((item) => (
            <div key={item} className="rounded-xl border border-primary/12 bg-white px-5 py-4 text-base font-medium text-foreground">{item}</div>
          ))}
        </div>

        <Link to="/restaurant" onClick={() => track("restaurant_offer_click", { location: "public_case_studies" })} className="mt-8 inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-foreground px-7 text-xs font-semibold uppercase tracking-[.15em] text-white shadow-lift">
          Build My Ordering Website <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
