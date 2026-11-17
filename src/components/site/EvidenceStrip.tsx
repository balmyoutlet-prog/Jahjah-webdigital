import { ExternalLink } from "lucide-react";
import { evidenceItems } from "@/lib/site-data";
import { Reveal } from "./Reveal";

export function EvidenceStrip() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {evidenceItems.map((item, i) => (
        <Reveal
          key={item.headline}
          delay={i * 70}
          className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6"
        >
          <p className="text-sm font-medium text-foreground">{item.headline}</p>
          <p className="display mt-3 text-4xl text-primary">{item.stat}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.context}</p>
          <div className="grow" />
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline mt-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            {item.source} · {item.year}
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </Reveal>
      ))}
    </div>
  );
}
