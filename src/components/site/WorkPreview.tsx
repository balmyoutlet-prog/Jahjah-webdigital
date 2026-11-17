import { ArrowUpRight } from "lucide-react";
import { portfolioProjects } from "@/lib/portfolio-projects";
import { portfolioCover } from "@/lib/portfolio-covers";
import { Reveal } from "./Reveal";
import { useTrackEvent } from "@/hooks/use-track-event";

// Restaurant proof first — that is what restaurant owners came to see.
const featuredOrder = [
  "al-afandi-chicken-dubai",
  "al-afandi-chicken",
  "sweet-spot-lebanon",
  "wholesome-craft",
  "bloom-outlet",
];

export function WorkPreview() {
  const track = useTrackEvent();
  const featuredProjects = [...portfolioProjects].sort(
    (a, b) => featuredOrder.indexOf(a.slug) - featuredOrder.indexOf(b.slug),
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
      {featuredProjects.map((p, i) => (
        <Reveal key={p.slug} delay={i * 60} className="min-w-0">
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track("work_click", { project: p.slug, location: "homepage_portfolio" })
            }
            className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.35rem] border border-primary/15 bg-white p-1.5 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:rounded-3xl sm:p-2.5"
            aria-label={`Open the live ${p.name} website`}
          >
            <div className="overflow-hidden rounded-[1rem] border border-black/5 bg-white sm:rounded-[1.25rem]">
              <div className="hidden h-7 items-center gap-1.5 border-b border-black/10 bg-[#f7f7f7] px-3 sm:flex">
                <span className="size-1.5 rounded-full bg-[#ff6b66]" />
                <span className="size-1.5 rounded-full bg-[#f6bd4a]" />
                <span className="size-1.5 rounded-full bg-[#55c76f]" />
                <span className="ml-auto max-w-[60%] truncate text-[8px] uppercase tracking-[0.14em] text-black/45">
                  {p.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                </span>
              </div>
              <div className="relative aspect-[16/11] overflow-hidden bg-white sm:aspect-[16/10]">
                <img
                  src={portfolioCover(p.slug, p.image)}
                  alt={`${p.name} live website homepage`}
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                  width={1200}
                  height={750}
                  className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.02] motion-reduce:transition-none"
                />
                <span className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full border border-white/30 bg-[#211b23]/80 px-2 py-1 text-[8px] uppercase tracking-[0.12em] text-white backdrop-blur-md sm:bottom-3 sm:right-3 sm:px-2.5 sm:text-[9px]">
                  <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  Live
                </span>
              </div>
            </div>

            <div className="flex min-w-0 grow flex-col px-2 pb-2 pt-3 sm:px-3 sm:pb-3 sm:pt-4">
              <p className="text-[12px] font-semibold leading-snug text-foreground sm:text-sm">
                {p.name}
              </p>
              {p.market && (
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-primary">{p.market}</p>
              )}
              <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground sm:text-xs">{p.outcome}</p>
              <div className="grow" />
              <span className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-foreground transition-all group-hover:bg-foreground group-hover:text-white sm:text-[10px]">
                {p.restaurant ? "Try it live" : "View live site"}
                <ArrowUpRight className="size-3 shrink-0" aria-hidden="true" />
              </span>
            </div>
          </a>
        </Reveal>
      ))}
    </div>
  );
}
