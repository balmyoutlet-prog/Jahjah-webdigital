import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { canonicalFor } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useTrackEvent } from "@/hooks/use-track-event";

const title = "Restaurant Launch Readiness Score | Free Pre-Opening Check | Jahjah WebDigital";
const description =
  "Free restaurant launch readiness score for new restaurants and branches. Check Google and Maps readiness, opening information, menu discoverability, reservations, ordering, branch consistency and measurement before launch.";

const questions = [
  "Can customers find an accurate opening date, location and hours from Google or your website?",
  "Is there a dedicated mobile page for the new restaurant or branch instead of relying only on social posts?",
  "Can Google and customers read your menu in normal web text instead of only a PDF or image?",
  "Do your website, Google profile, Instagram and booking links show the same address, phone and opening status?",
  "Is the correct next action already working: waitlist, reservation, direct order, WhatsApp or directions?",
  "Have you tested the full reservation or ordering flow on a real phone before launch?",
  "Can customers reach the right branch without being sent to another location's menu or contact details?",
  "Does the launch journey support the languages your target customers actually use?",
  "Are analytics and UTM tracking ready to show whether Google, Instagram or other channels drive actions?",
  "Do you have a post-opening plan for reviews, updated hours, menu changes and returning-customer follow-up?",
] as const;

type Answer = "yes" | "partial" | "no";
const answerScore: Record<Answer, number> = { yes: 10, partial: 5, no: 0 };

export const Route = createFileRoute("/restaurant-launch-readiness-score")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonicalFor("/restaurant-launch-readiness-score") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonicalFor("/restaurant-launch-readiness-score") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "Restaurant Launch Readiness Score",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              url: canonicalFor("/restaurant-launch-readiness-score"),
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
                  name: "What does the Restaurant Launch Readiness Score check?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "It checks ten practical parts of a restaurant or new-branch launch, including Google and Maps readiness, opening information, menu discoverability, mobile usability, reservations or ordering, branch consistency, languages and measurement.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does a low launch score mean my restaurant needs a complete rebuild?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "No. A restaurant may only need a few targeted fixes before opening, such as consistent contact details, a working reservation link or a clearer branch page.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can Jahjah WebDigital prepare a restaurant-specific launch demo?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Restaurant owners can request a free demo based on the real restaurant, branch, website or Instagram so the proposed launch journey reflects the actual business.",
                  },
                },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: LaunchScorePage,
});

function LaunchScorePage() {
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
      track("restaurant_launch_readiness_started", { answered });
      track("free_tool_start", { tool: "launch_readiness" });
    }
    if (complete && !completedTracked.current) {
      completedTracked.current = true;
      track("restaurant_launch_readiness_completed", { score });
      track("free_tool_complete", { tool: "launch_readiness" });
    }
  }, [answered, complete, score, track]);

  const band =
    score >= 80
      ? {
          title: "Launch foundation is strong",
          body: "Most launch-critical digital steps are in place. Focus next on final mobile testing, source attribution and keeping opening details consistent everywhere customers may discover you.",
        }
      : score >= 55
        ? {
            title: "Good base, launch gaps remain",
            body: "Several essentials are ready, but customers may still encounter inconsistent opening information, a weak branch path or a reservation or ordering step that needs testing.",
          }
        : {
            title: "Launch journey needs attention",
            body: "Important pre-opening steps are still missing or uncertain. Prioritize accurate Google and branch information, a readable menu and one working next action before driving launch traffic.",
          };

  const whatsapp = buildWhatsAppUrl(
    "Hello Jahjah WebDigital, I completed the Restaurant Launch Readiness Score and scored " +
      score +
      "/100. I'd like a free restaurant-specific launch demo.",
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="px-5 pb-16 pt-32 sm:px-8 sm:pb-24 sm:pt-44">
          <div className="mx-auto max-w-5xl text-center">
            <p className="eyebrow text-primary">Free pre-opening restaurant tool · 60 seconds</p>
            <h1 className="display mx-auto mt-5 max-w-4xl text-5xl leading-[.96] sm:text-7xl">
              How ready is your restaurant to be found, trusted and actionable on opening day?
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Answer ten practical questions about Google, location, menu, reservations, ordering and launch measurement.
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
                              onClick={() => setAnswers((current) => ({ ...current, [index]: value }))}
                              className={
                                "min-h-11 rounded-full border px-3 text-xs font-medium transition-colors " +
                                (active
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-background text-foreground hover:border-primary/45")
                              }
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
                <p className="eyebrow text-primary">Your launch score</p>
                <div className="mt-5 flex items-end gap-2">
                  <span className="display text-7xl text-foreground">{score}</span>
                  <span className="pb-2 text-sm text-muted-foreground">/ 100</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary/10">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: score + "%" }}
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
                        We can review your real launch page, Google presence, menu or Instagram.
                      </p>
                      <p className="flex gap-2 text-sm text-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        We can show one restaurant-specific launch journey before you decide anything.
                      </p>
                    </div>
                    <div className="mt-7 grid gap-3">
                      <Link
                        to="/free-restaurant-demo"
                        onClick={() =>
                          track("restaurant_offer_click", {
                            location: "restaurant_launch_readiness_score",
                            score,
                            completed: complete,
                          })
                        }
                        className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-xs font-semibold uppercase tracking-[.14em] text-white"
                      >
                        Get My Free Launch Demo <ArrowRight className="size-4" />
                      </Link>
                      <a
                        href={whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          track("whatsapp_click", {
                            location: "restaurant_launch_readiness_score",
                            score,
                          })
                        }
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
                  This is a practical self-assessment, not a guarantee of launch results, rankings, sales or performance.
                  Your result is based only on the answers you select.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="hairline px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <p className="eyebrow text-primary">What this score measures</p>
            <h2 className="display mt-5 max-w-4xl text-4xl sm:text-6xl">
              Google discovery, opening information, menu access, reservations or ordering and measurement — as one launch journey.
            </h2>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              A restaurant can have strong launch content and still send customers to conflicting hours, an unreadable menu,
              the wrong branch or a reservation link that is not ready. This score checks the practical path customers need
              before and immediately after opening.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
