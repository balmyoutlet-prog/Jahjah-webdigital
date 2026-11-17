import { ArrowRight, HeartHandshake, MousePointerClick, Repeat2, Search, ShoppingBag, UtensilsCrossed } from "lucide-react";
const heroImage = "/images/restaurant/jahjah-restaurant-ai-hero.webp";
const orderingImage = "/images/restaurant/jahjah-digital-menu-ordering.webp";

const valueChips = ["Mobile ordering", "Smart menu", "Direct customer relationship"];

const journey = [
  { label: "Discovered", icon: Search },
  { label: "Menu explored", icon: UtensilsCrossed },
  { label: "Order placed", icon: ShoppingBag },
  { label: "Customer returns", icon: Repeat2 },
];

const benefits = [
  {
    title: "Own the customer journey",
    body: "Bring discovery, menu browsing and ordering together in an experience shaped around your restaurant.",
    icon: HeartHandshake,
  },
  {
    title: "Reduce ordering friction",
    body: "Give guests a clear, mobile-first route from the dish they want to the order they are ready to place.",
    icon: MousePointerClick,
  },
  {
    title: "Build repeat business",
    body: "Create a memorable direct channel customers can return to without depending on a marketplace listing.",
    icon: Repeat2,
  },
];

const stripLabels = ["Browse visually", "Choose quickly", "Order directly", "Come back easily"];

export function RestaurantHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-2xl pb-12 lg:pb-10" aria-label="Premium restaurant website and mobile digital ordering experience">
      <div className="overflow-hidden rounded-[1.6rem] border border-primary/15 bg-card p-1.5 shadow-lift sm:rounded-[2rem] sm:p-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-surface sm:aspect-[3/2] sm:rounded-[1.6rem]">
          <img
            src={heroImage}
            alt="Restaurant ordering website displayed across desktop, phone and tablet screens"
            width={1536}
            height={1024}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-[62%_center] sm:object-center"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card/75 to-transparent" aria-hidden="true" />
        </div>
      </div>
      <div className="absolute inset-x-3 bottom-0 grid grid-cols-3 gap-1.5 sm:inset-x-8 sm:gap-2">
        {valueChips.map((chip) => (
          <span key={chip} className="flex min-h-12 items-center justify-center rounded-xl border border-primary/15 bg-card/95 px-2 text-center text-[10px] font-medium leading-tight text-foreground shadow-soft backdrop-blur-md sm:min-h-14 sm:px-3 sm:text-xs">
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

export function RestaurantOrderingJourney() {
  return (
    <section className="border-y border-primary/10 bg-card px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div>
            <p className="eyebrow text-primary">From menu to confirmed order</p>
            <h2 className="display mt-4 max-w-xl text-4xl sm:text-6xl">Make every step feel easy.</h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              A visual menu, clear choices and a direct order path help customers move from appetite to action without unnecessary detours.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-4">
              {stripLabels.map((label, index) => (
                <div key={label} className="flex items-center gap-3 border-t border-primary/15 pt-3">
                  <span className="font-display text-xl text-primary">0{index + 1}</span>
                  <span className="text-xs font-medium text-foreground sm:text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <figure className="overflow-hidden rounded-[1.6rem] border border-primary/15 bg-surface p-1.5 shadow-lift sm:rounded-[2rem] sm:p-2">
            <div className="aspect-[4/3] overflow-hidden rounded-[1.25rem] sm:aspect-[3/2] sm:rounded-[1.6rem]">
              <img
                src={orderingImage}
                alt="Customer browsing a visual digital restaurant menu on a phone beside a meal"
                width={1536}
                height={1024}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-center"
              />
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}

export function RestaurantGrowthSection({ onCtaClick }: { onCtaClick?: () => void }) {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="eyebrow text-primary">The direct ordering journey</p>
          <h2 className="display mt-4 text-4xl sm:text-6xl">A website that turns attention into repeat orders.</h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <div className="overflow-hidden rounded-[1.6rem] border border-primary/15 bg-card p-5 shadow-soft sm:p-8">
            <ol className="grid gap-3 sm:grid-cols-4" aria-label="Direct ordering customer journey">
              {journey.map(({ label, icon: Icon }, index) => (
                <li key={label} className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:block">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="size-4" aria-hidden="true" /></span>
                  <span className="min-w-0 text-sm font-medium text-foreground sm:mt-3 sm:block">{label}</span>
                  {index < journey.length - 1 && <ArrowRight className="size-4 shrink-0 text-primary/50 sm:absolute sm:right-3 sm:top-3" aria-hidden="true" />}
                </li>
              ))}
            </ol>

            <div className="mt-8 border-t border-primary/10 pt-7">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Sales growth potential</p>
                  <p className="mt-1 text-xs text-muted-foreground">Illustrative growth journey — results vary.</p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[.12em] text-primary">Direct channel</span>
              </div>
              <svg viewBox="0 0 720 230" role="img" aria-labelledby="growth-chart-title growth-chart-desc" className="mt-5 h-auto w-full overflow-visible">
                <title id="growth-chart-title">Sales growth potential</title>
                <desc id="growth-chart-desc">An illustrative line rising gradually across the customer journey from discovery to repeat ordering.</desc>
                <defs>
                  <linearGradient id="journey-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path d="M24 200 C116 194 139 170 214 164 C305 156 317 121 405 113 C497 104 536 68 696 28 L696 214 L24 214 Z" fill="url(#journey-area)" />
                <path d="M24 200 C116 194 139 170 214 164 C305 156 317 121 405 113 C497 104 536 68 696 28" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
                {[{x:24,y:200},{x:214,y:164},{x:405,y:113},{x:696,y:28}].map((point) => <circle key={point.x} cx={point.x} cy={point.y} r="6" fill="var(--card)" stroke="var(--primary)" strokeWidth="4" />)}
                <line x1="24" y1="214" x2="696" y2="214" stroke="var(--border)" strokeWidth="2" />
              </svg>
            </div>
          </div>

          <div className="grid gap-3">
            {benefits.map(({ title, body, icon: Icon }) => (
              <article key={title} className="rounded-[1.25rem] border border-primary/12 bg-card p-5 shadow-soft sm:p-6">
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <h3 className="mt-4 text-base font-medium text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>

        <a href="#builder" onClick={onCtaClick} className="mt-8 inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-foreground px-7 text-xs font-semibold uppercase tracking-[.15em] text-primary-foreground shadow-lift">
          Build My Ordering Website <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}