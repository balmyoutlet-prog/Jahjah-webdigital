import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";
import { useTrackEvent, getDeviceCategory } from "../hooks/use-track-event";
import { canonicalFor } from "../lib/seo";
import { INSTAGRAM_URL } from "../lib/site-data";
import { RESTAURANT_PACKAGES } from "../lib/restaurant";
import { WHATSAPP_NUMBER } from "../lib/whatsapp";
import { googleAdsHeadScripts } from "../lib/google-ads";

/** One sitewide entity so every page (and every AI/search crawler) gets the
 *  same, truthful description of who Jahjah WebDigital is and what it sells.
 *  Prices come from the same constants the pricing UI and server use. */
const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${canonicalFor("/")}#organization`,
  name: "Jahjah WebDigital",
  url: canonicalFor("/"),
  logo: canonicalFor("/favicon.png"),
  image: canonicalFor("/images/jahjah-webdigital-share.jpg"),
  description:
    "Jahjah WebDigital is a Lebanon-based studio that builds restaurant websites, digital and QR menus, direct online ordering, WhatsApp ordering, upselling and reservation systems for restaurants in Lebanon, the UAE, Saudi Arabia, Qatar and Kuwait, plus business websites, online stores and Google presence — Google Business Profile, Google Ads, Google Merchant Center and SEO — for businesses worldwide.",
  telephone: `+${WHATSAPP_NUMBER}`,
  address: { "@type": "PostalAddress", addressCountry: "LB" },
  areaServed: [
    { "@type": "Country", name: "Lebanon" },
    { "@type": "Country", name: "United Arab Emirates" },
    { "@type": "Country", name: "Saudi Arabia" },
    { "@type": "Country", name: "Qatar" },
    { "@type": "Country", name: "Kuwait" },
  ],
  sameAs: [INSTAGRAM_URL],
  knowsAbout: [
    "Restaurant website development",
    "Digital restaurant menus",
    "QR code menus",
    "Restaurant online ordering systems",
    "WhatsApp ordering for restaurants",
    "Restaurant reservations",
    "Table ordering",
    "Restaurant upselling and cross-selling",
    "Website design and development",
    "E-commerce websites",
    "Google Business Profile optimization",
    "Google Ads management",
    "Google Merchant Center and Google Shopping",
    "Search engine optimization",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Restaurant website and ordering packages",
    itemListElement: RESTAURANT_PACKAGES.map((p) => ({
      "@type": "Offer",
      name: `${p.name} — ${p.focus}`,
      description: p.pitch,
      price: (p.priceCents / 100).toFixed(0),
      priceCurrency: "USD",
      url: canonicalFor("/restaurant"),
    })),
  },
};

// Browser / Safari icon generated directly from the Jahjah WebDigital logo supplied by the owner.
// Keeping it inline prevents any platform default favicon from appearing after deploys or cache misses.
const JAHJAH_FAVICON = "/favicon.png?v=20260921";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
          <Link
            to="/work"
            className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            See live restaurant work
          </Link>
          <Link
            to="/free-restaurant-demo"
            className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Get a free demo
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Jahjah WebDigital — Restaurant Websites, Digital Menus & Ordering" },
      {
        name: "description",
        content:
          "Restaurant websites, digital menus, direct online ordering and WhatsApp ordering for restaurants in Lebanon, the UAE, Saudi Arabia, Qatar and Kuwait.",
      },
      { name: "author", content: "Jahjah WebDigital" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "theme-color", content: "#fff9f8" },
      { property: "og:site_name", content: "Jahjah WebDigital" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&display=swap",
      },
      { rel: "icon", href: JAHJAH_FAVICON, type: "image/png", sizes: "512x512" },
      { rel: "shortcut icon", href: "/favicon.ico?v=20260921", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=20260921", sizes: "180x180" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(ORGANIZATION_LD) },
      ...googleAdsHeadScripts(),
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const language = pathname === "/ar" || pathname.startsWith("/ar/") ? "ar" : "en";

  return (
    <html lang={language}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/** Fires one `page_view` per route change — the only place this needs to
 *  live, so every public page (including ones that track nothing else,
 *  like /terms or /privacy) gets a real view count. */
function usePageViewTracking() {
  const track = useTrackEvent();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    track("page_view", { device: getDeviceCategory() });
    const servicePaths = ["/restaurant", "/restaurant-digital-menu", "/restaurant-online-ordering", "/qr-menu", "/whatsapp-ordering", "/packages", "/website-design", "/google-business-profile", "/google-ads", "/google-merchant-center", "/seo-services", "/ar", "/marketing-system", "/custom-accounting-system", "/kitchen-display-dashboard"];
    const toolPaths = ["/restaurant-ordering-readiness-score", "/restaurant-launch-readiness-score", "/restaurant-google-menu-checker", "/restaurant-menu-sync-checker"];
    if (servicePaths.includes(pathname)) track("service_view", { service: pathname });
    if (pathname === "/work") track("work_view");
    if (pathname.startsWith("/guides/")) track("guide_view", { guide: pathname });
    if (toolPaths.includes(pathname)) track("free_tool_view", { tool: pathname });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  usePageViewTracking();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <FloatingWhatsApp />
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}
