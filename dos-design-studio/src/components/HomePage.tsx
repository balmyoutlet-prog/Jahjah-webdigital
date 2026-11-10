import { getDictionary, type Locale } from "@/content/dictionary";
import { SITE_URL, BRAND, PREVIEW_MODE, TEAM, WHATSAPP } from "@/lib/site";
import Intro, { introGuardScript } from "./Intro";
import Nav from "./Nav";
import Hero from "./Hero";
import Studio from "./Studio";
import PlanToSpace from "./PlanToSpace";
import Expertise from "./Expertise";
import Designers from "./Designers";
import StyleExplorer from "./StyleExplorer";
import Work from "./Work";
import GlobalMap from "./GlobalMap";
import Inquiry from "./Inquiry";
import Footer from "./Footer";
import ClientInit from "./ClientInit";
import Analytics from "./Analytics";

export default function HomePage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const url = locale === "ar" ? `${SITE_URL}/ar` : `${SITE_URL}/`;

  // Only verifiable facts: name, URL, Instagram, people and served markets. No address, ratings or reviews.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#studio`,
        name: BRAND.name,
        url: `${SITE_URL}/`,
        sameAs: [BRAND.instagram],
        logo: `${SITE_URL}${BRAND.logoFull}`,
        slogan: BRAND.tagline,
        contactPoint: [
          WHATSAPP.architecture && { "@type": "ContactPoint", contactType: "Architecture inquiries", telephone: `+${WHATSAPP.architecture}`, availableLanguage: ["en", "ar"] },
          WHATSAPP.interiors && { "@type": "ContactPoint", contactType: "Interior design inquiries", telephone: `+${WHATSAPP.interiors}`, availableLanguage: ["en", "ar"] },
        ].filter(Boolean),
        description: t.meta.description,
        areaServed: ["Lebanon", "Saudi Arabia", "United Arab Emirates", "Qatar"].map((name) => ({ "@type": "Country", name })),
        knowsAbout: ["Architecture", "Interior architecture", "Interior design", "Villa design", "Residential architecture"],
        employee: [
          { "@type": "Person", name: TEAM.interiors.name, jobTitle: "Interior Architecture & Design" },
          { "@type": "Person", name: TEAM.architecture.name, jobTitle: "Architecture" },
        ],
      },
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: BRAND.name, inLanguage: ["en", "ar"], publisher: { "@id": `${SITE_URL}/#studio` } },
      { "@type": "WebPage", url, name: t.meta.title, inLanguage: locale, isPartOf: { "@id": `${SITE_URL}/#website` } },
    ],
  };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: introGuardScript }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <a className="skip" href="#main">{t.skipToContent}</a>
      <Intro skipLabel={t.skipIntro} />
      <Nav t={t.nav} />
      <main id="main">
        <Hero t={t.hero} />
        <Studio t={t.studio} />
        <PlanToSpace t={t.plan} />
        <Expertise t={t.expertise} />
        <Designers t={t.designers} locale={locale} />
        <StyleExplorer t={t.styles} locale={locale} />
        <Work t={t.work} locale={locale} />
        <GlobalMap t={t.global} />
        <Inquiry t={t.inquiry} locale={locale} />
      </main>
      <Footer t={t.footer} nav={t.nav} locale={locale} />
      {PREVIEW_MODE && <div className="preview-ribbon" role="note">{t.preview}</div>}
      <ClientInit />
      <Analytics locale={locale} />
    </>
  );
}
