import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { canonicalFor } from "@/lib/seo";

const title = "Privacy Policy — Jahjah WebDigital";
const description =
  "What Jahjah WebDigital actually collects, why, and how it's stored: client inquiries, CRM/prospect data, first-party analytics, account data and payment submissions.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: canonicalFor("/privacy") },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: canonicalFor("/privacy") }],
  }),
  component: PrivacyPage,
});

const SECTIONS = [
  {
    title: "1. Who this covers",
    body: "This policy covers jahjahwebdigital.com and the Jahjah WebDigital client platform (sign-up, onboarding, dashboard and admin console). It describes what we actually collect today — nothing we might add later, and nothing we don't do.",
  },
  {
    title: "2. Project inquiries you send us",
    body: "When you submit the Start Your Project questionnaire, we store the details you provide: name, company or brand, email, optional phone/WhatsApp, country, optional current website, business/industry, the service you need, optional budget range and preferred launch timing, project goals/details, and optional referral source. We also store the submission timestamp plus first-party source/referrer/UTM information and the same random session id used for our own analytics when available. These inquiries are stored in a secured database table that only Jahjah WebDigital admins can read and are used to respond to and manage your project inquiry.",
  },
  {
    title: "3. Businesses we research for outreach (CRM / prospect data)",
    body: "Separately, we maintain a prospect database of businesses we research for potential outreach — business name, category, location, public social/Maps links, and, where relevant, a report on their public website (checked for basic technical signals like HTTPS, mobile support and SEO tags). If a prospect requests a private preview through a link we send, their own submitted business figures are stored against that same record. This is standard B2B outreach research, not data collected from ordinary site visitors.",
  },
  {
    title: "4. Account, authentication and business assets",
    body: "Creating an account uses Supabase Authentication for email/password sign-up and Google OAuth sign-in. We store your profile (name, email), your company's onboarding details, and any logo or photos you upload during onboarding in Supabase Storage. Files you upload for your own project are stored under a folder scoped to your account; publicly-used brand assets (like your logo) are served at a public URL because they appear on your generated website.",
  },
  {
    title: "5. Payment submissions",
    body: "Jahjah WebDigital's working payment method is Whish Money, a manual transfer you confirm yourself. When you submit a payment, we store the payer name and phone number, an optional reference, and your uploaded receipt (kept in a private storage bucket only you and our admin team can access) until an admin manually verifies or rejects it. We do not process card payments and do not store card numbers — if a card/Stripe environment variable exists in our infrastructure, it is not a live, working checkout unless this policy and the site say so.",
  },
  {
    title: "6. First-party session analytics",
    body: "We record a small set of first-party funnel events such as homepage views, portfolio clicks, questionnaire starts and questionnaire submissions. Events may include a random session id generated in browser sessionStorage, page path, referring page, and utm_source/utm_medium/utm_campaign values from the arrival link. We do not use third-party advertising trackers for these measurements and we do not set advertising cookies. The admin analytics dashboard uses this data to show real website activity and inquiry conversion; it does not display invented or seeded visitor numbers.",
  },
  {
    title: "7. Cookies and local storage",
    body: "We do not use tracking or advertising cookies. Supabase Authentication uses storage needed to keep signed-in users authenticated. The public site uses sessionStorage/localStorage only for functional first-party purposes described above (session id and UTM cache) — never to build an advertising profile or sell data to third parties.",
  },
  {
    title: "8. Spam and abuse protection",
    body: "Public forms include a hidden honeypot field, a minimum time-to-submit check, and a server-side rate limit keyed to the submitting connection's IP address. The rate-limit counter exists only to block automated abuse and is not used for marketing or profiling.",
  },
  {
    title: "9. Who can see your data",
    body: "Inquiry and admin data is visible only to Jahjah WebDigital admins through role-gated database access. Account users can access data tied to their own account where the platform permits it. We do not sell personal data. Supabase provides the database, authentication and storage infrastructure used by this platform.",
  },
  {
    title: "10. Data retention and your requests",
    body: "We keep inquiry, prospect and account data for as long as needed to run the business relationship or respond to your inquiry. To request access to, correction of, or deletion of your data, contact us through the project questionnaire, Instagram or WhatsApp links shown on the site.",
  },
  {
    title: "11. Changes to this policy",
    body: "If what we collect changes, this page will change with it — we do not keep a claim here that no longer matches what the platform actually does.",
  },
];

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-24">
        <p className="text-xs uppercase tracking-[0.3em] text-champagne-soft">Legal</p>
        <h1 className="mt-5 font-display text-5xl">Privacy Policy</h1>
        <p className="mt-6 text-sm text-muted-foreground">
          A plain description of what we collect and why — nothing more, nothing assumed.
        </p>
        <div className="mt-14 space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-2xl text-champagne">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
