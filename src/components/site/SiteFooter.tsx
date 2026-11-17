import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { INSTAGRAM_URL } from "@/lib/site-data";
import { useContextualWhatsAppUrl } from "@/hooks/use-contextual-whatsapp";
import { CarePlanNote } from "./PricingCommitment";
import { useTrackEvent } from "@/hooks/use-track-event";

export function SiteFooter() {
  const track = useTrackEvent();
  const whatsappUrl = useContextualWhatsAppUrl();
  return (
    <footer className="border-t border-primary/10 bg-[#f8e9e7]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div><BrandMark /><p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">Restaurant websites, digital menus, direct ordering, WhatsApp ordering and reservations — built to help restaurants sell more directly. Business websites too.</p><p className="mt-3 text-xs uppercase tracking-[0.18em] text-primary">Lebanon-based · Built worldwide</p></div>
          <nav aria-label="Solutions"><p className="eyebrow text-primary">Solutions</p><div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground"><Link to="/restaurant-digital-menu">Restaurant digital menus</Link><Link to="/restaurant-online-ordering">Direct online ordering</Link><Link to="/qr-menu">QR menus</Link><Link to="/whatsapp-ordering">WhatsApp ordering</Link><Link to="/restaurant">Full restaurant system</Link><Link to="/restaurant-ordering-readiness-score">Restaurant ordering readiness score</Link><Link to="/restaurants/lebanon">Restaurant systems Lebanon</Link><Link to="/restaurants/dubai">Restaurant systems Dubai</Link><Link to="/restaurants/saudi-arabia">Restaurant systems Saudi Arabia</Link><Link to="/restaurants/qatar">Restaurant systems Qatar</Link><Link to="/restaurants/kuwait">Restaurant systems Kuwait</Link><Link to="/packages">Company website packages</Link><Link to="/website-design">Website design</Link><Link to="/google-business-profile">Google Business Profile &amp; Maps</Link><Link to="/google-ads">Google Ads &amp; keywords</Link><Link to="/google-merchant-center">Google Merchant Center &amp; Shopping</Link><Link to="/seo-services">SEO services</Link><Link to="/ar" lang="ar">منيو إلكتروني وتصميم مواقع — بالعربي</Link><Link to="/work">Live restaurant projects</Link><Link to="/guides/whatsapp-ordering-vs-delivery-apps">WhatsApp ordering vs delivery apps</Link><Link to="/guides/qr-menu-vs-pdf-menu">QR menu vs PDF menu</Link><Link to="/guides/restaurant-upselling-online">How online upselling works</Link><Link to="/process">How we build</Link></div></nav>
          <div><p className="eyebrow text-primary">Start your project</p><div className="mt-4 flex flex-col gap-3"><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_click", { location: "footer" })} className="inline-flex items-center gap-2 text-sm text-foreground"><MessageCircle className="size-4 text-[#159447]" /> WhatsApp +961 71 466 516</a><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" onClick={() => track("instagram_click", { location: "footer" })} className="inline-flex items-center gap-2 text-sm text-foreground"><Instagram className="size-4 text-primary" /> @jahjah.webdigital.lb</a><Link to="/free-restaurant-demo" onClick={() => track("demo_cta_click", { location: "footer" })} className="mt-2 inline-flex min-h-12 w-fit items-center rounded-full bg-foreground px-5 text-xs uppercase tracking-[0.15em] text-white">Request a restaurant demo</Link></div></div>
        </div>
        <div className="mt-10"><CarePlanNote /></div>
        <div className="mt-12 flex flex-col gap-3 border-t border-primary/10 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()}{" "}
            <Link to="/" className="font-semibold text-foreground underline decoration-primary/35 underline-offset-4 transition-colors hover:text-primary">Jahjah WebDigital</Link>{" "}
            · <a href="https://jahjahwebdigital.com/" className="underline decoration-primary/25 underline-offset-4 transition-colors hover:text-primary">jahjahwebdigital.com</a>
          </p>
          <p><Link to="/terms">Terms</Link> · <Link to="/privacy">Privacy</Link></p>
        </div>
      </div>
    </footer>
  );
}
