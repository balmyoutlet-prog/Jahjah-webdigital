import type { MetadataRoute } from "next";
import { SITE_URL, PREVIEW_MODE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (PREVIEW_MODE) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return { rules: [{ userAgent: "*", allow: "/" }], sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL };
}
