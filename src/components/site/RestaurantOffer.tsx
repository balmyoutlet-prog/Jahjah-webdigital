import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Bot,
  Check,
  Plus,
  ShoppingBag,
  Sparkles,
  Zap,
} from "lucide-react";
import { RESTAURANT_PACKAGES } from "@/lib/restaurant";
import { usd } from "@/lib/platform";
import { useTrackEvent } from "@/hooks/use-track-event";

const items = [
  { emoji: "🍗", name: "Crispy chicken", price: "$9.50" },
  { emoji: "🍔", name: "Signature burger", price: "$8.00" },
  { emoji: "🥗", name: "Garden bowl", price: "$7.50" },
  { emoji: "🍰", name: "Pistachio cake", price: "$5.00" },
];

export function RestaurantMockup() {
  return (
    <div
      className="relative mx-auto w-full max-w-[650px] pb-14"
      aria-label="Illustrative restaurant ordering website shown on desktop and phone"
    >
      <div className="absolute -inset-12 -z-10 rounded-[4rem] bg-[radial-gradient(circle_at_65%_30%,rgba(218,126,185,.28),transparent_35%),radial-gradient(circle_at_30%_75%,rgba(137,116,255,.2),transparent_35%)] blur-2xl" />

      <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#151318] shadow-[0_38px_100px_-38px_rgba(68,39,76,.7)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(214,122,184,.15),transparent_32%),linear-gradient(135deg,rgba(255,255,255,.025),transparent_48%)]" />
        <div className="relative flex items-center gap-2 border-b border-white/10 bg-white/[.025] px-4 py-3 backdrop-blur-xl">
          <span className="size-2 rounded-full bg-[#ff8a9a]" />
          <span className="size-2 rounded-full bg-[#ffd08a]" />
          <span className="size-2 rounded-full bg-[#7ee5a4]" />
          <span className="ml-3 rounded-full border border-white/10 bg-white/[.045] px-4 py-1 text-[9px] text-white/50">
            cedar-table.com/order
          </span>
          <span className="ml-auto hidden items-center gap-1 rounded-full border border-[#d97fbc]/25 bg-[#d97fbc]/10 px-2.5 py-1 text-[8px] uppercase tracking-[.12em] text-[#f3bfdc] sm:inline-flex">
            <Bot className="size-3" /> Order preview
          </span>
        </div>

        <div className="relative grid min-h-[330px] grid-cols-[1fr_.72fr] text-white">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-xl text-white">Ordering flow preview</p>
                <p className="text-[9px] uppercase tracking-[.2em] text-[#f1a9ce]">Smart direct ordering</p>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[9px] text-emerald-300">
                Open now
              </span>
            </div>

            <div className="mt-5 flex gap-2 overflow-hidden">
              {["Popular", "Meals", "Burgers", "Desserts"].map((x, i) => (
                <span
                  key={x}
                  className={
                    i === 0
                      ? "rounded-full bg-white px-3 py-1.5 text-[8px] font-medium text-[#1b171d]"
                      : "rounded-full border border-white/10 bg-white/[.035] px-3 py-1.5 text-[8px] text-white/55"
                  }
                >
                  {x}
                </span>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {items.map((item, index) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-white/10 bg-white/[.045] p-2 backdrop-blur-md transition-transform hover:-translate-y-0.5"
                >
                  <div className="relative grid h-12 place-items-center overflow-hidden rounded-lg bg-[linear-gradient(135deg,rgba(218,126,185,.16),rgba(137,116,255,.12))] text-xl">
                    <span>{item.emoji}</span>
                    {index === 0 && (
                      <span className="absolute right-1 top-1 rounded-full bg-[#f0b1d3]/15 px-1.5 py-0.5 text-[6px] uppercase tracking-[.1em] text-[#f7cce3]">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-2 truncate text-[9px] font-medium text-white/90">{item.name}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[9px] text-[#f0b1d3]">{item.price}</span>
                    <span className="grid size-5 place-items-center rounded-full bg-white text-[#1b171d]">
                      <Plus className="size-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-l border-white/10 bg-white/[.025] p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-[9px] uppercase tracking-[.16em] text-white/45">Your order</p>
              <span className="flex items-center gap-1 text-[8px] text-[#c8b7ff]">
                <Activity className="size-3" /> live
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {items.slice(0, 2).map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[.045] p-2 text-[9px]"
                >
                  <span className="text-white/75">{i + 1}× {item.name}</span>
                  <span className="text-[#f0b1d3]">{item.price}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-xl border border-[#d97fbc]/20 bg-[linear-gradient(135deg,rgba(218,126,185,.11),rgba(137,116,255,.08))] p-3">
              <p className="flex items-center gap-1 text-[9px] font-medium text-[#f4bfdc]">
                 <Sparkles className="size-3" /> Suggested add-on
              </p>
              <p className="mt-1 text-[8px] leading-relaxed text-white/45">
                Add fries + a drink to increase basket value with one tap.
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-white/8 bg-white/[.035] p-2">
                <p className="text-[7px] uppercase tracking-[.12em] text-white/35">Direct channel</p>
                <p className="mt-1 font-display text-xl text-white">No commission</p>
              </div>
              <div className="rounded-lg border border-white/8 bg-white/[.035] p-2">
                <p className="text-[7px] uppercase tracking-[.12em] text-white/35">Smart steps</p>
                <p className="mt-1 flex items-center gap-1 font-display text-xl text-white"><Zap className="size-3 text-[#f1a9ce]" /> Tracked</p>
              </div>
            </div>

            <div className="mt-4 flex justify-between text-[10px] font-medium text-white/80">
              <span>Total</span>
              <span>$21.00</span>
            </div>
            <div className="mt-3 rounded-full bg-white py-2.5 text-center text-[9px] font-semibold text-[#19151b]">
              Checkout direct
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-1 right-2 w-[39%] min-w-[145px] rotate-2 overflow-hidden rounded-[1.9rem] border-[6px] border-[#211b23] bg-[#161318] shadow-[0_28px_70px_-22px_rgba(67,34,75,.7)] sm:right-5 sm:w-[34%]">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#26202a,#1c171f)] px-3 py-3 text-white">
          <div className="absolute right-0 top-0 size-20 bg-[radial-gradient(circle,rgba(218,126,185,.18),transparent_70%)]" />
          <div className="relative flex justify-between">
            <span className="text-[8px] font-medium">Ordering flow preview</span>
            <ShoppingBag className="size-3" />
          </div>
          <p className="relative mt-2 font-display text-base leading-none">Order smarter.</p>
          <p className="relative mt-1 text-[7px] text-white/45">Powered by a conversion-first flow</p>
        </div>
        <div className="space-y-2 bg-[#fdf8fb] p-2.5">
          {items.slice(0, 3).map((item, index) => (
            <div key={item.name} className="flex items-center gap-2 rounded-xl bg-white p-2 shadow-soft">
              <span className="grid size-7 place-items-center rounded-lg bg-[#faecf4] text-sm">{item.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[7px] font-medium text-[#251f27]">{item.name}</span>
                <span className="text-[7px] text-primary">{item.price}</span>
              </span>
              {index === 0 ? <Sparkles className="size-3 text-[#b75a92]" /> : <Plus className="size-3 text-primary" />}
            </div>
          ))}
          <div className="rounded-full bg-[#211b23] py-2 text-center text-[8px] font-semibold text-white">
            View order · $21
          </div>
        </div>
      </div>
    </div>
  );
}

export function RestaurantOffer() {
  const track = useTrackEvent();

  return (
    <section
      id="restaurant-packages"
      className="relative overflow-hidden border-y border-[#e6c3d7]/10 bg-[#161318] px-5 py-20 text-white sm:px-8 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(218,126,185,.14),transparent_30%),radial-gradient(circle_at_84%_70%,rgba(137,116,255,.11),transparent_34%)]"
      />
      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e5a4ca]/20 bg-[#e5a4ca]/8 px-3 py-1.5 text-[10px] uppercase tracking-[.18em] text-[#f0b8d7]">
            <Sparkles className="size-3" /> AI-ready restaurant websites
          </span>
          <h2 className="mt-5 font-display text-4xl leading-[1.02] text-white sm:text-6xl">
            Choose how your restaurant should sell online.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/52">
            Start with a polished presence, add a complete ordering system, or build the full marketing engine around your brand.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {RESTAURANT_PACKAGES.map((p) => (
            <article
              key={p.key}
              className={
                p.popular
                  ? "relative flex flex-col rounded-[1.8rem] border border-[#e8a8cd]/35 bg-[linear-gradient(145deg,rgba(255,255,255,.095),rgba(255,255,255,.045))] p-7 shadow-[0_28px_80px_-40px_rgba(220,126,184,.65)] backdrop-blur-xl"
                  : "relative flex flex-col rounded-[1.8rem] border border-white/10 bg-white/[.045] p-7 backdrop-blur-xl transition-transform hover:-translate-y-1"
              }
            >
              {p.popular && (
                <span className="absolute right-5 top-5 rounded-full border border-[#efb8d7]/20 bg-[#efb8d7]/10 px-3 py-1 text-[10px] uppercase tracking-[.16em] text-[#f4c5df]">
                  Recommended
                </span>
              )}
              <p className="text-sm font-medium text-white/78">{p.name}</p>
              <h3 className="mt-2 font-display text-3xl text-white">{p.focus}</h3>
              <p className="mt-5 font-display text-5xl text-[#f0b1d3]">{usd(p.priceCents)}</p>
              <p className="text-xs uppercase tracking-[.15em] text-white/36">one-time build</p>
              <p className="mt-2 text-sm font-medium text-white/72">
                + {usd(p.careCents)}/month maintenance after launch
              </p>
              {p.key === "advanced" && (
                <span className="mt-2 w-fit rounded-full border border-[#efb8d7]/20 bg-[#efb8d7]/10 px-3 py-1 text-[10px] uppercase tracking-[.14em] text-[#f4c5df]">
                  Premium maintenance
                </span>
              )}
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-white/52">
                    <Check className="mt-0.5 size-4 shrink-0 text-[#f0b1d3]" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="grow" />
              <Link
                to="/restaurant"
                onClick={() =>
                  track("restaurant_package_selected", { package: p.key, location: "homepage" })
                }
                className={
                  p.popular
                    ? "mt-8 inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-white px-5 text-xs font-semibold uppercase tracking-[.14em] text-[#1d181f]"
                    : "mt-8 inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[.035] px-5 text-xs uppercase tracking-[.14em] text-white"
                }
              >
                Choose {p.name} <ArrowRight className="size-4" />
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-white/45">
          Need more? Choose from 8 smart ordering features — <strong className="text-[#f0b1d3]">$50 each</strong> — confirmed and added to the final project invoice at the end of the build.
        </p>
        <div className="mx-auto mt-8 max-w-4xl rounded-[1.5rem] border border-white/10 bg-white/[.045] p-6 backdrop-blur-xl">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <strong className="text-base text-white">Website Care & Hosting</strong>
            <span className="font-display text-2xl text-[#f0b1d3]">$99–$149<span className="font-sans text-sm text-white/55">/month</span></span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            Basic and Moderate include maintenance at $99/month after launch. Advanced includes premium maintenance at $149/month. Care is billed separately from the one-time website build and confirmed before activation.
          </p>
        </div>
      </div>
    </section>
  );
}
