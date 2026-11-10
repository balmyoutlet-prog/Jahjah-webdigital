import type { Metadata, Viewport } from "next";
import { getDictionary, type Locale } from "@/content/dictionary";
import { SITE_URL, GSC_VERIFICATION, PREVIEW_MODE } from "@/lib/site";

export const viewport: Viewport = { themeColor: "#f6f4f0", width: "device-width", initialScale: 1 };

export function buildMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale).meta;
  const path = locale === "ar" ? "/ar" : "/";
  return {
    metadataBase: new URL(SITE_URL),
    title: t.title,
    description: t.description,
    applicationName: "DOS Design Studio",
    alternates: {
      canonical: path,
      languages: { en: "/", ar: "/ar", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      url: path,
      siteName: "DOS Design Studio",
      title: t.title,
      description: t.description,
      locale: locale === "ar" ? "ar_AE" : "en_US",
      alternateLocale: locale === "ar" ? ["en_US"] : ["ar_AE"],
      images: [{ url: `/og/dos-og-${locale}.jpg`, width: 1200, height: 630, alt: t.ogAlt }],
    },
    twitter: { card: "summary_large_image", title: t.title, description: t.description, images: [`/og/dos-og-${locale}.jpg`] },
    icons: { icon: [{ url: "/brand/favicon.png", type: "image/png" }], apple: "/brand/apple-touch-icon.png" },
    // While in preview, keep search engines out even if a preview URL leaks.
    robots: PREVIEW_MODE ? { index: false, follow: false } : { index: true, follow: true },
    verification: GSC_VERIFICATION ? { google: GSC_VERIFICATION } : undefined,
  };
}
