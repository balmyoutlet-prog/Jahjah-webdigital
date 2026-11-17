import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { canonicalFor } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useTrackEvent } from "@/hooks/use-track-event";

const title = "Restaurant Ordering Readiness Score | Free 60-Second Check | Jahjah WebDigital";
const description =
  "Free 60-second restaurant ordering readiness score. Check your menu, direct ordering, WhatsApp, reservations, bilingual experience, upselling and analytics.";

const questions = [
  "Can customers find your current menu easily from Google or Instagram?",
  "Is your menu designed for mobile instead of relying only on a PDF?",
  "Can customers start a direct order without opening an empty WhatsApp chat?",
  "Can customers clearly choose delivery, takeaway or dine-in when relevant?",
  "Can customers reserve a table online without unnecessary back-and-forth?",
  "Does your ordering flow suggest useful add-ons, drinks or sides?",
  "Can your menu support the languages your customers actually use?",
  "Can you identify repeat customers or capture contact details with consent?",
  "Can you see which pages, menu items or calls-to-action customers use?",
  "If you have multiple branches, can customers reach the correct branch/menu quickly?",
] as const;

type Answer = "yes" | "partial" | "no";

const answerScore: Record<Answer, number> = {
  yes: 10,
  partial: 5,
  no: 0,
};

export const Route = createFileRoute("/restaurant-ordering-readiness-score")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonicalFor("/restaurant-ordering-readiness-score") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonicalFor("/restaurant-ordering-readiness-score") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "Restaurant Ordering Readiness Score",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              url: canonicalFor("/restaurant-ordering-readiness-score"),
              description,
              provider: {
                "@type": "ProfessionalService",
                name: "Jahjah WebDigital",
                url: canonicalFor("/"),
              },
            },
            {
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What does the restaurant ordering readiness score check?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "It checks ten practical parts of a restaurant's public digital journey, including menu access, mobile usability, direct ordering, WhatsApp, reservations, upselling, languages, customer capture, analytics and multi-branch routing.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does a low score mean my restaurant needs a complete rebuild?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "No. The score is informational. A restaurant may only need a few targeted improvements to reduce friction in its digital customer journey.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can Jahjah WebDigital prepare a restaurant-specific demo?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Restaurant owners can request a free demo based on their restaurant name, website or Instagram so the proposed flow reflects their real business.",
                  },
                },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: Page,
});

function Page() {
  const track = useTrackEvent();
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const startedTracked = useRef(false);
  const completedTracked = useRef(false);

  const answered = Object.keys(answers).length;
  const score = useMemo(
    () => Object.values(answers).reduce((total, value) => total + answerScore[value], 0),
    [answers],
  );
  const complete = answered === questions.length;

  useEffect(() => {
    if (answered > 0 && !startedTracked.current) {
      startedTracked.current = true;
      track("restaurant_readiness_started", { answered });
      track("free_tool_start", { tool: "ordering_readiness" });
    }
    if (complete && !completedTracked.current) {
      completedTracked.current = true;
      track("restaurant_readiness_completed", { score });
      track("free_tool_complete", { tool: "ordering_readiness" });
    }
  }, [answered, complete, score, track]);

  const band = score >= 80
    ? {
        title: "Strong foundation",
        body: "Your restaurant already covers many important digital steps. The next opportunity is usually refinement: fewer steps, stronger menu merchandising, better attribution and more consistent branch/customer data.",
      }
    : score >= 55
      ? {
          title: "Good base, visible friction",
          body: "Some important pieces are working, but customers may still hit avoidable friction between discovery, menu browsing, ordering, reservations and follow-up.",
        }
      : {
          title: "High-friction customer journey",
          body: "There are several opportunities to simplify how customers discover your menu, choose an action and complete an order or reservation.",
        };

  const whatsapp = buildWhatsAppUrl(
    `Hello Jahjah WebDigital, I completed the Restaurant Ordering Readiness Score and scored ${score}/100. I'd like a free restaurant-specific demo.`,
  );

  function setAnswer(index: number, answer: Answer) {
    setAnswers((current) => ({ ...current, [index]: answer }));
  }

  function handleDemoClick() {
    track("restaurant_offer_click", {
      location: "ordering_readiness_score",
      score,
      completed: complete,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="px-5 pb-16 pt-32 sm:px-8 sm:pb-24 sm:pt-44">
          <div className="mx-auto max-w-5xl text-center">
            <p className="eyebrow text-primary">Free restaurant growth tool · 60 seconds</p>
            <h1 className="display mx-auto mt-5 max-w-4xl text-5xl leading-[.96] sm:text-7xl">
              How ready is your restaurant to turn digital visitors into direct customers?
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Answer ten practical questions about your menu, ordering, reservations and customer journey.
              No login and no payment required.
            </p>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_.58fr] lg:items-start">
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question} className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
                  <div className="flex gap-4">
                    <span className="display text-2xl text-primary/55">{String(index + 1).padStart(2, "0")}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-relaxed text-foreground sm:text-base">{question}</p>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {([
                          ["yes", "Yes"],
                          ["partial", "Partly"],
                          ["no", "No"],
                        ] as const).map(([value, label]) => {
                          const active = answers[index] === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setAnswer(index, value)}
                              className={`min-h-11 rounded-full border px-3 text-xs font-medium transition-colors ${
                                active
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-background text-foreground hover:border-primary/45"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="lg:sticky lg:top-28">
              <div className="rounded-3xl border border-primary/15 bg-[#fff8f7] p-6 shadow-soft sm:p-8">
                <p className="eyebrow text-primary">Your readiness score</p>
                <div className="mt-5 flex items-end gap-2">
                  <span className="display text-7xl text-foreground">{score}</span>
                  <span className="pb-2 text-sm text-muted-foreground">/ 100</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary/10">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {answered}/{questions.length} questions answered
                </p>

                {complete ? (
                  <div className="mt-7">
                    <p className="text-lg font-medium text-foreground">{band.title}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{band.body}</p>

                    <div className="mt-6 space-y-2">
                      <p className="flex gap-2 text-sm text-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        We can review your real website, menu or Instagram.
                      </p>
                      <p className="flex gap-2 text-sm text-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        We can show one restaurant-specific ordering direction before you decide anything.
                      </p>
                    </div>

                    <div className="mt-7 grid gap-3">
                      <Link
                        to="/free-restaurant-demo"
                        onClick={handleDemoClick}
                        className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-xs font-semibold uppercase tracking-[.14em] text-white"
                      >
                        Get My Free Restaurant Demo <ArrowRight className="size-4" />
                      </Link>
                      <a
                        href={whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track("whatsapp_click", { location: "ordering_readiness_score", score })}
                        className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-6 text-xs font-semibold uppercase tracking-[.14em] text-foreground"
                      >
                        <MessageCircle className="size-4 text-[#159447]" /> Send Score on WhatsApp
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="mt-7 text-sm leading-relaxed text-muted-foreground">
                    Complete all ten questions to get your result and recommended next step.
                  </p>
                )}

                <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
                  This is a practical self-assessment, not a guarantee of sales or performance. Your result is based only on the answers you select.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="hairline px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <p className="eyebrow text-primary">What this score measures</p>
            <h2 className="display mt-5 max-w-4xl text-4xl sm:text-6xl">
              Discovery, menu experience, ordering, reservations, upselling and measurement — as one customer journey.
            </h2>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              A restaurant can be active on Instagram and still make customers work too hard to view the menu,
              choose a branch, place an order or reserve a table. The score looks at the complete path rather than
              judging visual design alone.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
