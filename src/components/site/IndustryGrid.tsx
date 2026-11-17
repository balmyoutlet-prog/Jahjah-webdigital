import { industrySolutions } from "@/lib/site-data";
import { Reveal } from "./Reveal";

export function IndustryGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {industrySolutions.map((ind, i) => (
        <Reveal
          key={ind.key}
          delay={(i % 4) * 60}
          className="group rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/30"
        >
          <h3 className="text-base font-medium text-foreground">{ind.label}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{ind.blurb}</p>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {ind.features.map((f) => (
              <li
                key={f}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground"
              >
                {f}
              </li>
            ))}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}
