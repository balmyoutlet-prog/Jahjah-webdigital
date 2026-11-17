import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Instagram, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ShowUsYourBusiness } from "@/components/site/ShowUsYourBusiness";
import { useContextualWhatsAppUrl } from "@/hooks/use-contextual-whatsapp";
import { useTrackEvent } from "@/hooks/use-track-event";
import { INSTAGRAM_URL } from "@/lib/site-data";
import { canonicalFor } from "@/lib/seo";

const title = "Contact Jahjah WebDigital | Restaurant Digital Menu & Ordering";
const description =
  "Talk to Jahjah WebDigital on WhatsApp about a restaurant digital menu, QR menu, direct online ordering, WhatsApp ordering or reservations. Or request a free demo built around your restaurant.";

export const Route = createFileRoute("/restaurant-contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonicalFor("/restaurant-contact") },
    ],
    links: [{ rel: "canonical", href: canonicalFor("/restaurant-contact") }],
  }),
  component: Page,
});

function Page() {
  const whatsappUrl = useContextualWhatsAppUrl();
  const track = useTrackEvent();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="px-5 pb-24 pt-32 sm:px-8 sm:pt-44">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="eyebrow text-primary">Restaurant owners & hospitality teams</p>
            <h1 className="display mx-auto mt-5 max-w-4xl text-5xl sm:text-7xl">
              Talk to us about your restaurant.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
              Send your restaurant name and Instagram on WhatsApp. We look at your current menu and
              how customers order today, then show you what we would build.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { location: "restaurant_contact_card" })}
              className="rounded-2xl border border-[#25D366]/40 bg-[#25D366]/10 p-6 text-center"
            >
              <MessageCircle className="mx-auto size-6 text-[#159447]" />
              <strong className="mt-4 block">Talk about my restaurant</strong>
              <span className="mt-1 block text-xs text-muted-foreground">
                WhatsApp · +961 71 466 516
              </span>
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("instagram_click", { location: "restaurant_contact_card" })}
              className="rounded-2xl border border-border bg-surface p-6 text-center"
            >
              <Instagram className="mx-auto size-6 text-primary" />
              <strong className="mt-4 block">Instagram DM</strong>
              <span className="mt-1 block text-xs text-muted-foreground">
                @jahjah.webdigital.lb
              </span>
            </a>
          </div>
          <div className="mt-14">
            <div className="mb-6 text-center">
              <p className="eyebrow text-primary">Or request your demo</p>
              <h2 className="display mt-3 text-4xl">Show us your restaurant.</h2>
            </div>
            <div className="mx-auto max-w-2xl">
              <ShowUsYourBusiness />
            </div>
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/work"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[.16em] text-primary"
            >
              Open our live restaurant ordering websites <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
