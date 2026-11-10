import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { en: `${SITE_URL}/`, ar: `${SITE_URL}/ar`, "x-default": `${SITE_URL}/` };
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1, alternates: { languages } },
    { url: `${SITE_URL}/ar`, changeFrequency: "monthly", priority: 0.9, alternates: { languages } },
  ];
}
