import { Check } from "lucide-react";
import {
  CUSTOM_FEATURE_PRICE_CENTS,
  MONTHLY_CARE_FEATURES,
  MONTHLY_CARE_PRICE_CENTS,
  usd,
} from "@/lib/platform";
import { RESTAURANT_PACKAGES } from "@/lib/restaurant";

const ADVANCED_RESTAURANT = RESTAURANT_PACKAGES.find((p) => p.key === "advanced")!;

export const CUSTOM_FEATURE_NOTE =
  `Features outside your package are ${usd(CUSTOM_FEATURE_PRICE_CENTS)} each, confirmed and added to the final project scope and invoice at the end of the build.`;

export function CarePlanNote({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      aria-label="Website Care and Hosting"
      className={compact
        ? "rounded-xl border border-primary/15 bg-[#fff6f4] p-4"
        : "rounded-[1.5rem] border border-primary/20 bg-[#fff6f4] p-6 shadow-soft"}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <strong className="text-base text-foreground">Website Care & Hosting</strong>
        <span className="font-display text-2xl text-primary">
          From {usd(MONTHLY_CARE_PRICE_CENTS)}<span className="font-sans text-sm">/month</span>
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Required after launch and billed separately from the one-time website build. Standard care is {usd(MONTHLY_CARE_PRICE_CENTS)}/month; the {usd(ADVANCED_RESTAURANT.priceCents)} Advanced restaurant package includes premium maintenance at {usd(ADVANCED_RESTAURANT.careCents)}/month. Recurring payment is confirmed with you before activation.
      </p>
      {!compact && (
        <ul className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          {MONTHLY_CARE_FEATURES.map((feature) => (
            <li key={feature} className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 border-t border-primary/10 pt-4 text-sm leading-relaxed text-muted-foreground">
        {CUSTOM_FEATURE_NOTE}
      </p>
    </aside>
  );
}
