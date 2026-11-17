import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GuideLayout,
  GuideSection,
  guideHead,
  type GuideMeta,
} from "@/components/site/GuideLayout";

const meta: GuideMeta = {
  path: "/guides/restaurant-upselling-online",
  title: "How Restaurant Upselling Works Online — Raise Average Order Value | Jahjah WebDigital",
  description:
    "How online upselling and cross-selling raise a restaurant's average order value: complete-your-meal steps, combos, item options and order-again — with live examples and the UX mistakes that kill ordering.",
  headline: "How restaurant upselling works online — and how to raise your average order value",
  published: "2026-10-07",
  faqs: [
    {
      q: "What is the difference between upselling and cross-selling?",
      a: "Upselling moves the guest to a bigger or better version of what they chose (a meal instead of a sandwich, a large instead of a regular). Cross-selling adds something that goes with it (fries, a drink, a dessert).",
    },
    {
      q: "Where should upsells appear in an online order?",
      a: "At the moment of decision: options on the item itself, and one short “complete your meal” step after the main item and before checkout. Not as pop-ups that block the order.",
    },
    {
      q: "Can I see this working?",
      a: "Yes. Al Afandi Chicken Dubai has a dedicated “complete your meal” step in its live ordering flow, built by Jahjah WebDigital.",
    },
  ],
};

export const Route = createFileRoute("/guides/restaurant-upselling-online")({
  head: () => guideHead(meta),
  component: Page,
});

function Page() {
  return (
    <GuideLayout
      meta={meta}
      eyebrow="Restaurant guide · Average order value"
      intro="In the restaurant, a good waiter asks “would you like fries with that?”. Online, nobody asks — unless the menu does. Upselling online is simply putting that question in the right place, once, without slowing the order down."
      service={{
        to: "/restaurant-online-ordering",
        label: "How our direct ordering system works →",
      }}
      proof={{
        url: "https://alafandichicken.com/",
        label: "See a live “complete your meal” step",
        slug: "al-afandi-chicken-dubai",
      }}
    >
      <GuideSection title="Four upsells that work online">
        <ul>
          <li>
            <strong>Options on the item.</strong> Size, spice level, extra cheese — chosen on the
            item page with the price change visible.
          </li>
          <li>
            <strong>Make it a meal.</strong> Offer the combo version of a single item at the moment
            it goes into the cart.
          </li>
          <li>
            <strong>Complete your meal.</strong> One short step before checkout with two to four
            sides, drinks or desserts that match what is in the cart.
          </li>
          <li>
            <strong>Order again.</strong> Returning customers see what they had last time — the
            fastest route to a repeat order.
          </li>
        </ul>
        <p>
          Al Afandi Chicken Dubai's live flow is a good example:{" "}
          <em>choose your meal → add what goes with it → choose the branch → send or pay</em>.
          Afandi Chicken shows family meals, combos and an “order again” shortcut. You can try both
          from{" "}
          <Link to="/work" className="text-primary underline underline-offset-4">
            our live work
          </Link>
          .
        </p>
      </GuideSection>

      <GuideSection title="Ordering UX mistakes that cost you the whole order">
        <ul>
          <li>
            <strong>Too many pop-ups.</strong> One add-on step converts; three interruptions make
            people leave.
          </li>
          <li>
            <strong>Forced sign-up.</strong> Ask for name and phone at checkout, not an account
            before they can see the menu.
          </li>
          <li>
            <strong>Choosing the branch too late.</strong> If an item or delivery area depends on
            the branch, ask early — not after the cart is full.
          </li>
          <li>
            <strong>Slow photos.</strong> Huge images on mobile data make the menu feel broken.
            Compress them.
          </li>
          <li>
            <strong>No language choice.</strong> In the Gulf and Lebanon, Arabic and English should
            both be one tap away.
          </li>
        </ul>
      </GuideSection>

      <GuideSection title="How to measure it">
        <p>
          Track average order value on direct orders before and after the add-on step goes live, and
          how often the suggested items are added. Keep the suggestions that get added, replace the
          ones that don't. Results depend on your menu, prices and customers — the goal is to make
          the useful suggestion easy, not to push every guest.
        </p>
      </GuideSection>
    </GuideLayout>
  );
}
