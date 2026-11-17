import { useRef, useState, type ChangeEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GuideLayout,
  GuideSection,
  guideHead,
  type GuideMeta,
} from "@/components/site/GuideLayout";
import { RESTAURANT_PACKAGES } from "@/lib/restaurant";
import { useTrackEvent } from "@/hooks/use-track-event";

const meta: GuideMeta = {
  path: "/guides/whatsapp-ordering-vs-delivery-apps",
  title:
    "WhatsApp Ordering vs Delivery Apps for Restaurants (+ Commission Calculator) | Jahjah WebDigital",
  description:
    "Delivery apps find you new customers and charge you on every repeat order. See when WhatsApp or direct ordering makes sense, and calculate what commission costs your restaurant each month.",
  headline: "WhatsApp ordering vs delivery apps: what each one really costs your restaurant",
  published: "2026-10-07",
  faqs: [
    {
      q: "Is WhatsApp ordering better than delivery apps?",
      a: "They do different jobs. Delivery apps are strong at bringing new customers and handling delivery logistics. WhatsApp or direct ordering is cheaper for customers who already know you, because there is no commission on each order and you keep their contact details.",
    },
    {
      q: "How do I move customers from the apps to direct ordering?",
      a: "Put your own ordering link where existing customers already see you: Instagram bio, packaging inserts, receipts, table QR codes and your Google Business Profile. Check your marketplace contract for any rules about marketing to customers who ordered through it.",
    },
    {
      q: "What does a WhatsApp ordering system cost?",
      a: "With Jahjah WebDigital, WhatsApp ordering is part of the Menu & Ordering System: $699 one-time plus $99/month Website Care & Hosting after launch, with no per-order commission.",
    },
  ],
};

export const Route = createFileRoute("/guides/whatsapp-ordering-vs-delivery-apps")({
  head: () => guideHead(meta),
  component: Page,
});

const ORDERING_PACKAGE = RESTAURANT_PACKAGES.find((p) => p.key === "moderate")!;

function money(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function CommissionCalculator() {
  const track = useTrackEvent();
  const tracked = useRef(false);
  const [orders, setOrders] = useState(400);
  const [avg, setAvg] = useState(18);
  const [rate, setRate] = useState(25);
  const [shift, setShift] = useState(20);

  const monthlyCommission = orders * avg * (rate / 100);
  const savedPerMonth = monthlyCommission * (shift / 100);
  const build = ORDERING_PACKAGE.priceCents / 100;
  const care = ORDERING_PACKAGE.careCents / 100;
  const netPerMonth = savedPerMonth - care;
  const paybackMonths = netPerMonth > 0 ? build / netPerMonth : null;

  const onChange = (set: (n: number) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    set(Number(e.target.value) || 0);
    if (!tracked.current) {
      tracked.current = true;
      track("calculator_used", { calculator: "commission" });
    }
  };

  const fields = [
    { label: "App orders per month", value: orders, set: setOrders, min: 0, step: 10 },
    { label: "Average order value (USD)", value: avg, set: setAvg, min: 0, step: 1 },
    { label: "Commission rate in your contract (%)", value: rate, set: setRate, min: 0, step: 1 },
    {
      label: "Share of those orders you could move direct (%)",
      value: shift,
      set: setShift,
      min: 0,
      step: 5,
    },
  ];

  return (
    <div className="mt-8 rounded-[1.5rem] border border-primary/20 bg-surface p-5 sm:p-7">
      <p className="eyebrow text-primary">Commission calculator</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Use the numbers from your own app statements. The defaults are only an example.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.label} className="block text-sm">
            <span className="text-foreground">{f.label}</span>
            <input
              type="number"
              inputMode="decimal"
              min={f.min}
              step={f.step}
              value={f.value}
              onChange={onChange(f.set)}
              className="input-luxe mt-1.5 w-full"
            />
          </label>
        ))}
      </div>
      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-background p-4">
          <dt className="text-xs uppercase tracking-[.12em] text-muted-foreground">
            Commission you pay now
          </dt>
          <dd className="mt-1 font-display text-3xl text-foreground">
            {money(monthlyCommission)}
            <span className="text-sm">/mo</span>
          </dd>
        </div>
        <div className="rounded-xl bg-background p-4">
          <dt className="text-xs uppercase tracking-[.12em] text-muted-foreground">
            Kept if {shift}% moves direct
          </dt>
          <dd className="mt-1 font-display text-3xl text-primary">
            {money(savedPerMonth)}
            <span className="text-sm">/mo</span>
          </dd>
        </div>
        <div className="rounded-xl bg-background p-4">
          <dt className="text-xs uppercase tracking-[.12em] text-muted-foreground">
            Ordering system pays back in
          </dt>
          <dd className="mt-1 font-display text-3xl text-foreground">
            {paybackMonths === null
              ? "—"
              : paybackMonths < 1
                ? "< 1 month"
                : `${paybackMonths.toFixed(1)} months`}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Payback compares commission kept with the {money(build)} one-time Menu &amp; Ordering System
        and its {money(care)}/month care plan. It ignores delivery costs, payment fees and marketing
        — direct delivery still needs drivers or a delivery partner. This is arithmetic on your
        inputs, not a forecast.
      </p>
    </div>
  );
}

function Page() {
  return (
    <GuideLayout
      meta={meta}
      eyebrow="Restaurant guide · Ordering channels"
      intro="Delivery apps are the best way most restaurants have to reach new customers. They are also the most expensive way to serve customers who already love you. Here is how to use each channel for what it does well — and how to work out what the apps really cost you."
      service={{ to: "/whatsapp-ordering", label: "How our WhatsApp ordering system works →" }}
      proof={{
        url: "https://alafandichicken.com/",
        label: "Try a live ordering site",
        slug: "al-afandi-chicken-dubai",
      }}
    >
      <GuideSection title="What the apps are good at — and what they cost">
        <p>
          Marketplaces bring hungry people who have never heard of you, handle the app, the payments
          and often the delivery. In return, they take a <strong>percentage of every order</strong>,
          show your competitors next to you, and keep the customer relationship. The rate is in your
          contract and statements — it is usually the single biggest digital cost a restaurant has.
        </p>
        <p>
          That trade is often worth it for a <strong>first order</strong>. It is much harder to
          justify on the fifth order from the same regular who would happily order from you
          directly.
        </p>
      </GuideSection>

      <GuideSection title="Work out your own number">
        <p>
          Put in your own figures. The point is not the exact result — it is seeing what one month
          of commission looks like next to a one-time build.
        </p>
        <CommissionCalculator />
      </GuideSection>

      <GuideSection title="Why a plain WhatsApp chat isn't enough">
        <p>
          Many restaurants already take orders on WhatsApp — and know the pain: “what sizes do you
          have?”, “is the spicy one available?”, “which branch?”, “send the location again”. Every
          order is a conversation, staff are tied to the phone, and nobody suggests the drink or
          dessert.
        </p>
        <ul>
          <li>
            <strong>Structured WhatsApp ordering</strong> gives customers a real menu and cart
            first.
          </li>
          <li>
            When they tap send, WhatsApp opens with the complete order already written — items,
            options, branch and details.
          </li>
          <li>
            Staff confirm instead of interviewing, and an add-on step before checkout grows the
            basket.
          </li>
        </ul>
      </GuideSection>

      <GuideSection title="A simple channel plan">
        <ul>
          <li>
            <strong>New customers:</strong> keep the apps if they bring them. Make your listing and
            photos excellent.
          </li>
          <li>
            <strong>Returning customers:</strong> give them your own ordering link everywhere they
            already see you — Instagram bio, packaging, receipts, table QR codes and Google.
          </li>
          <li>
            <strong>Dine-in guests:</strong> a QR menu that can order, so the same menu works at the
            table and at home.
          </li>
          <li>
            <strong>Measure:</strong> track how many orders come direct each month. That is the
            number that pays back the system.
          </li>
        </ul>
        <p>
          Before promoting direct ordering to customers who came through an app, check your
          marketplace contract for any rules on that. Then see how it looks in practice on{" "}
          <Link to="/work" className="text-primary underline underline-offset-4">
            our live restaurant projects
          </Link>
          .
        </p>
      </GuideSection>
    </GuideLayout>
  );
}
