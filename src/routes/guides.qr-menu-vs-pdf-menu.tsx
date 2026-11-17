import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GuideLayout,
  GuideSection,
  guideHead,
  type GuideMeta,
} from "@/components/site/GuideLayout";

const meta: GuideMeta = {
  path: "/guides/qr-menu-vs-pdf-menu",
  title: "QR Menu vs PDF Menu: What Changes for Your Restaurant | Jahjah WebDigital",
  description:
    "A PDF behind a QR code is still a printed menu. Compare PDF menus with ordering QR menus on readability, price updates, ordering, upselling, languages and data — plus the common digital menu mistakes to avoid.",
  headline: "QR menu vs PDF menu: what actually changes for your restaurant",
  published: "2026-10-07",
  faqs: [
    {
      q: "Is a PDF behind a QR code a digital menu?",
      a: "Technically yes, but it behaves like a printed menu: guests pinch and zoom, nothing can be ordered, and every price change means editing and re-uploading the file.",
    },
    {
      q: "Do guests need an app to use a QR menu?",
      a: "No. A QR code opens a normal web page in the phone's browser.",
    },
    {
      q: "What does an ordering QR menu cost?",
      a: "With Jahjah WebDigital, the Menu & Ordering System is $699 one-time plus $99/month Website Care & Hosting after launch. No commission per order.",
    },
  ],
};

export const Route = createFileRoute("/guides/qr-menu-vs-pdf-menu")({
  head: () => guideHead(meta),
  component: Page,
});

function Page() {
  return (
    <GuideLayout
      meta={meta}
      eyebrow="Restaurant guide · Digital menus"
      intro="Most “digital menus” are a PDF behind a QR code. It looks modern on the table sticker, but for the guest it is a printed menu on a small screen — and for you it is a missed chance to take the order and suggest the extras."
      service={{ to: "/qr-menu", label: "How our ordering QR menu works →" }}
      proof={{
        url: "https://sweetspotlebanon.today/",
        label: "Browse a live digital menu",
        slug: "sweet-spot-lebanon",
      }}
    >
      <GuideSection title="The difference in one minute">
        <ul>
          <li>
            <strong>Reading:</strong> a PDF needs pinch-and-zoom; a menu page is designed for the
            phone.
          </li>
          <li>
            <strong>Prices:</strong> a PDF must be edited, exported and re-uploaded; a menu page is
            updated once and is correct on the website, the QR code and your Instagram link.
          </li>
          <li>
            <strong>Ordering:</strong> a PDF ends with “call the waiter”; an ordering menu ends with
            a cart.
          </li>
          <li>
            <strong>Upselling:</strong> a PDF can't suggest anything; an ordering menu offers the
            side, drink or dessert before checkout.
          </li>
          <li>
            <strong>Languages:</strong> a PDF needs one file per language; a menu page switches
            between Arabic and English.
          </li>
          <li>
            <strong>Learning:</strong> a PDF tells you nothing; a menu page shows which items are
            viewed and ordered.
          </li>
        </ul>
      </GuideSection>

      <GuideSection title="Digital menu mistakes that cost orders">
        <ul>
          <li>
            <strong>Old PDFs still online.</strong> Guests and Google keep finding last year's
            prices. Remove or redirect every old menu link.
          </li>
          <li>
            <strong>No photos on best-sellers.</strong> The dishes you most want to sell deserve the
            best photo and the top of the category.
          </li>
          <li>
            <strong>Hidden options.</strong> Sizes, spice level and extras should be choices on the
            item — not questions staff have to ask.
          </li>
          <li>
            <strong>No next step.</strong> Every menu should end in an action: order, reserve, or
            message you on WhatsApp.
          </li>
          <li>
            <strong>Different menus everywhere.</strong> The QR menu, website, Google menu link and
            ordering page should all be the same source. Our free{" "}
            <Link
              to="/restaurant-menu-sync-checker"
              className="text-primary underline underline-offset-4"
            >
              Menu Sync Checker
            </Link>{" "}
            helps you find the mismatches.
          </li>
        </ul>
      </GuideSection>

      <GuideSection title="When a simple menu page is enough">
        <p>
          If you don't take orders from the table and rarely change prices, a fast, well-designed
          menu page with click-to-call and WhatsApp may be all you need — that is our $299 landing
          page. If guests order at the table, for takeaway or for delivery, an ordering menu pays
          for itself in staff time and bigger baskets.
        </p>
      </GuideSection>
    </GuideLayout>
  );
}
