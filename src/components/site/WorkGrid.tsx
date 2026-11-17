import { ArrowUpRight, Check, MessageCircle } from "lucide-react";
import { portfolioProjects } from "@/lib/portfolio-projects";
import { portfolioCover } from "@/lib/portfolio-covers";
import { Reveal } from "./Reveal";
import { useTrackEvent } from "@/hooks/use-track-event";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function WorkGrid() {
  const track = useTrackEvent();
  return (
    <div className="space-y-20 sm:space-y-28">
      {portfolioProjects.map((p, i) => (
        <Reveal as="article" key={p.slug} delay={40}>
          <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-14">
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("work_click", { project: p.slug, location: "work_page_image" })}
              className={`group lg:col-span-7 ${i % 2 === 1 ? "lg:order-2 lg:col-start-6" : ""}`}
            >
              <div className="browser-frame">
                <div className="browser-frame-bar">
                  <span className="browser-frame-dot" />
                  <span className="browser-frame-dot" />
                  <span className="browser-frame-dot" />
                </div>
                <div className="aspect-[16/11] overflow-hidden sm:aspect-[16/10]">
                  <img
                    src={portfolioCover(p.slug, p.image)}
                    alt={`${p.name} website designed and built by Jahjah WebDigital`}
                    loading="lazy"
                    decoding="async"
                    width={1440}
                    height={900}
                    className="h-full w-full object-cover object-top transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                </div>
              </div>
            </a>

            <div className={`lg:col-span-5 ${i % 2 === 1 ? "lg:order-1 lg:col-start-1" : ""}`}>
              <p className="eyebrow text-primary">
                {p.category}
                {p.market ? ` · ${p.market}` : ""}
              </p>
              <h2 className="display mt-4 text-4xl sm:text-5xl">{p.name}</h2>
              <span className="mt-3 inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-foreground">
                {p.outcome}
              </span>

              <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">The problem</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                {p.challenge}
              </p>

              <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">What we built</h3>
              <ul className="mt-3 space-y-2">
                {p.whatWeBuilt.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>

              {p.journey && (
                <>
                  <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">Customer journey you can test</h3>
                  <ol className="mt-3 flex flex-wrap gap-2">
                    {p.journey.map((step, n) => (
                      <li key={step} className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-foreground">
                        <span className="mr-1.5 text-primary">{n + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </>
              )}

              <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Why it matters to the owner: </span>
                {p.businessValue}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("work_click", { project: p.slug, location: "work_page_cta" })}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-foreground px-6 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                >
                  {p.restaurant ? "Try the live site" : "View live website"}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
                {p.restaurant && (
                  <a
                    href={buildWhatsAppUrl(
                      `Hi Jahjah WebDigital, I saw the website you built for ${p.name}. I'd like something like it for my restaurant.\nRestaurant name: `,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("whatsapp_click", { location: "work_case_study", project: p.slug })}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-6 text-xs font-semibold uppercase tracking-[0.14em] text-foreground"
                  >
                    <MessageCircle className="size-4 text-[#159447]" aria-hidden="true" />
                    I want this for my restaurant
                  </a>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
