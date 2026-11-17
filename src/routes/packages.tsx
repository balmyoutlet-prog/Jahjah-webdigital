import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Reveal } from "@/components/site/Reveal";
import { CarePlanNote } from "@/components/site/PricingCommitment";
import { getAddons } from "@/lib/addons.functions";
import { useTrackEvent } from "@/hooks/use-track-event";
import { canonicalFor } from "@/lib/seo";
import {
  TIER_LABEL,
  TIER_LIMITS,
  TIER_ORDER,
  TIER_PRICE_CENTS,
  usd,
  EXTRA_TRIAL_PRICE_CENTS,
  MONTHLY_CARE_PRICE_CENTS,
} from "@/lib/platform";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "Website Packages + $99 Monthly Care | Jahjah WebDigital" },
      {
        name: "description",
        content:
          "Website builds from $319 plus required Website Care & Hosting at $99/month after launch. Two design trials included; additional trials and custom features are $50 each.",
      },
      { property: "og:title", content: "Website Packages — One-Time Pricing | Jahjah WebDigital" },
      {
        property: "og:description",
        content:
          "Website builds at $319, $519 and $719, plus required $99/month care and hosting after launch.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonicalFor("/packages") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonicalFor("/packages") }],
  }),
  component: PackagesPage,
});

const TIER_PITCH: Record<string, string> = {
  basic: "For businesses that need a professional home online.",
  medium: "For businesses ready to turn visitors into inquiries or customers.",
  high: "For brands that need a more custom, high-end digital experience.",
};

const FEATURES: Record<string, string[]> = {
  basic: [
    "Up to 3 pages",
    "Mobile-first responsive build",
    "WhatsApp & contact integration",
    "Google Maps & opening hours",
    "Basic on-page SEO",
    "2 design trials included",
  ],
  medium: [
    "Up to 6 pages",
    "Extended section library",
    "Gallery & services modules",
    "Menu / catalogue layout",
    "Advanced SEO structure",
    "2 design trials included",
  ],
  high: [
    "Up to 10 pages",
    "Full editorial section library",
    "Cinematic luxury directions",
    "Rich motion & interactions",
    "Premium typography system",
    "2 design trials included",
  ],
};

function PackagesPage() {
  const [selectedTier, setSelectedTier] = useState<(typeof TIER_ORDER)[number]>("medium");
  const [selectedAddonKeys, setSelectedAddonKeys] = useState<string[]>([]);
  const fetchAddons = useServerFn(getAddons);
  const { data: addons } = useQuery({
    queryKey: ["public-addons"],
    queryFn: () => fetchAddons({}),
  });
  const track = useTrackEvent();
  const selectedAddons = useMemo(
    () => (addons ?? []).filter((addon: any) => selectedAddonKeys.includes(addon.key)),
    [addons, selectedAddonKeys],
  );
  const estimateCents =
    TIER_PRICE_CENTS[selectedTier] +
    selectedAddons.reduce((total: number, addon: any) => total + addon.price_cents, 0);

  const toggleAddon = (key: string) => {
    setSelectedAddonKeys((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  useEffect(() => {
    track("package_viewed");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-32 pb-24">
        <section className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-champagne-soft">Packages</p>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] md:text-7xl">
              Clear build pricing.
              <br />
              <span className="text-champagne">$99 monthly care after launch.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-muted-foreground">
              Choose a one-time website build, then keep it secure, hosted and supported with our required Website Care & Hosting plan at $99/month after launch.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {TIER_ORDER.map((tier, i) => (
              <Reveal key={tier} delay={i * 90}>
                <div
                  className={`flex h-full flex-col rounded-lg border p-8 transition-colors ${
                    tier === "medium"
                      ? "border-champagne/50 bg-surface"
                      : "border-border bg-surface/40 hover:border-champagne/30"
                  }`}
                >
                  {tier === "medium" && (
                    <span className="mb-4 w-fit rounded-full border border-champagne/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-champagne">
                      Most chosen
                    </span>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="font-display text-3xl">{TIER_LABEL[tier]}</h2>
                    <button
                      type="button"
                      onClick={() => setSelectedTier(tier)}
                      className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                        selectedTier === tier
                          ? "border-champagne bg-champagne text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-champagne"
                      }`}
                      aria-pressed={selectedTier === tier}
                    >
                      {selectedTier === tier ? "Selected" : "Calculate"}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{TIER_PITCH[tier]}</p>
                  <p className="mt-4 font-display text-5xl text-champagne">
                    {usd(TIER_PRICE_CENTS[tier])}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    One-time payment
                  </p>
                  <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
                    {FEATURES[tier]!.map((f) => (
                      <li key={f} className="flex gap-3">
                        <Check className="mt-0.5 size-4 shrink-0 text-champagne" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="grow" />
                  <Link
                    to="/auth"
                    search={{ tier }}
                    onClick={() => track("package_selected", { tier })}
                    className="mt-10 inline-flex items-center justify-center rounded-sm bg-champagne px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Start with {TIER_LABEL[tier].split(" ")[0]}
                  </Link>
                  <p className="mt-3 text-center text-[11px] text-muted-foreground">
                    {TIER_LIMITS[tier].pages} pages · {TIER_LIMITS[tier].sections} sections max
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-12"><CarePlanNote /></div>
          </Reveal>

          <Reveal>
            <div className="mt-16 grid gap-6 rounded-lg border border-border bg-surface/40 p-8 md:grid-cols-3">
              <div>
                <h3 className="font-display text-2xl">Two trials included</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Every package includes two full design trials. Generate, review, refine.
                </p>
              </div>
              <div>
                <h3 className="font-display text-2xl">
                  Third trial {usd(EXTRA_TRIAL_PRICE_CENTS)}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Need another direction? The third and every additional design trial are {usd(EXTRA_TRIAL_PRICE_CENTS)} each.
                </p>
              </div>
              <div>
                <h3 className="font-display text-2xl">Upgrade anytime</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Move to a higher package and pay only the difference — never the full price twice.
                </p>
              </div>
            </div>
          </Reveal>

          {addons && addons.length > 0 && (
            <Reveal>
              <div className="mt-20">
                <h3 className="font-display text-3xl">Optional extras</h3>
                <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                  Features outside your package are $50 each, confirmed and added to the final project scope and invoice at the end of the build.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {addons.map((a: any) => {
                    const selected = selectedAddonKeys.includes(a.key);
                    return (
                      <button
                        type="button"
                        key={a.key}
                        onClick={() => toggleAddon(a.key)}
                        className={`flex min-h-24 items-center justify-between gap-3 rounded-lg border p-4 text-left transition-all ${
                          selected
                            ? "border-champagne bg-champagne/10 shadow-soft"
                            : "border-border bg-surface/30 hover:border-champagne/50"
                        }`}
                        aria-pressed={selected}
                      >
                        <div>
                          <p className="text-sm font-medium">{a.name}</p>
                          {a.description && (
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                              {a.description}
                            </p>
                          )}
                        </div>
                        <span className="flex shrink-0 items-center gap-2 text-sm text-champagne">
                          {usd(a.price_cents)}
                          <span
                            className={`flex size-7 items-center justify-center rounded-full border ${
                              selected
                                ? "border-champagne bg-champagne text-primary-foreground"
                                : "border-border"
                            }`}
                            aria-hidden="true"
                          >
                            {selected ? <Check className="size-4" /> : <Plus className="size-4" />}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="sticky bottom-4 z-20 mt-10 rounded-2xl border border-champagne/40 bg-background/95 p-5 shadow-lift backdrop-blur md:flex md:items-center md:justify-between md:gap-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Your live website estimate
                    </p>
                    <p className="mt-2 font-display text-3xl">
                      {TIER_LABEL[selectedTier]}
                      {selectedAddons.length > 0 && (
                        <span className="text-base text-muted-foreground">
                          {" "}+ {selectedAddons.length} extra{selectedAddons.length === 1 ? "" : "s"}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                       Final scope is confirmed before payment. Website Care & Hosting is $99/month after launch.
                    </p>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-4 md:mt-0 md:justify-end">
                    <p className="font-display text-4xl text-champagne">{usd(estimateCents)}</p>
                    <Link
                      to="/auth"
                      search={{ tier: selectedTier }}
                      onClick={() =>
                        track("package_selected", {
                          tier: selectedTier,
                          addons: selectedAddonKeys.join(","),
                          estimate_cents: estimateCents,
                        })
                      }
                      className="inline-flex min-h-12 items-center justify-center rounded-full bg-champagne px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Create account & continue
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
