import { useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Instagram, MessageCircle } from "lucide-react";
import { INSTAGRAM_URL, needOptions } from "@/lib/site-data";
import { WHATSAPP_URL } from "@/lib/whatsapp";
import { submitContactInquiry } from "@/lib/contact.functions";
import { useTrackEvent, getSessionId, getUtm, getLandingPage } from "@/hooks/use-track-event";

const fieldClass =
  "w-full rounded-none border-0 border-b border-border bg-transparent px-0 py-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-0 transition-colors";
const labelClass = "eyebrow block mb-2";

/** Reuses the exact session id, UTM cache and landing page already used by
 *  first-party analytics, so a visitor's page views and their eventual
 *  inquiry line up under the same session in the admin dashboard. */
function getAttribution() {
  if (typeof window === "undefined") return {};
  try {
    const utm = getUtm();
    return {
      sessionId: getSessionId(),
      referrer: document.referrer || "",
      landingPage: getLandingPage(),
      utmSource: utm.utmSource || "",
      utmMedium: utm.utmMedium || "",
      utmCampaign: utm.utmCampaign || "",
    };
  } catch {
    return {};
  }
}

export function ContactForm() {
  const mountedAt = useRef(Date.now());
  const started = useRef(false);
  const submit = useServerFn(submitContactInquiry);
  const track = useTrackEvent();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (form: HTMLFormElement) => {
      const data = new FormData(form);
      return submit({
        data: {
          name: String(data.get("name") ?? ""),
          company: String(data.get("company") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          country: String(data.get("country") ?? ""),
          website: String(data.get("website") ?? ""),
          industry: String(data.get("industry") ?? ""),
          need: String(data.get("need") ?? ""),
          budgetRange: String(data.get("budgetRange") ?? ""),
          launchTiming: String(data.get("launchTiming") ?? ""),
          details: String(data.get("details") ?? ""),
          heardAbout: String(data.get("heardAbout") ?? ""),
          consent: data.get("consent") === "on",
          ...getAttribution(),
          company_website: String(data.get("company_website") ?? ""),
          elapsedMs: Date.now() - mountedAt.current,
        },
      });
    },
    onSuccess: () => {
      setErrorMessage(null);
      track("questionnaire_submitted", { form: "project_questionnaire" });
      track("contact_form_submit", { form: "project_questionnaire" });
    },
    onError: (e) =>
      setErrorMessage(
        e instanceof Error
          ? e.message
          : "Something went wrong sending your brief. Please try again or message us directly.",
      ),
  });

  function markStarted() {
    if (started.current) return;
    started.current = true;
    track("questionnaire_started", { form: "project_questionnaire" });
    track("contact_form_start", { form: "project_questionnaire" });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    mutation.mutate(e.currentTarget);
  }

  if (mutation.isSuccess) {
    return (
      <div className="space-y-6 py-6 text-center sm:py-10">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
        <div>
          <h3 className="font-display text-2xl">Your project brief is in.</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your questionnaire is now saved in our private client-inquiries dashboard. We reply to
            serious inquiries as quickly as possible.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { location: "contact_success" })}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp us
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("instagram_click", { location: "contact_success" })}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Instagram className="h-4 w-4" aria-hidden="true" /> Message on Instagram
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} onFocus={markStarted} className="space-y-8" noValidate>
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden">
        <label htmlFor="company_website">Leave this field empty</label>
        <input
          id="company_website"
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="Name" id="name">
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            className={fieldClass}
            placeholder="Your full name"
          />
        </Field>
        <Field label="Company / Brand" id="company">
          <input
            id="company"
            name="company"
            required
            autoComplete="organization"
            className={fieldClass}
            placeholder="Company or brand name"
          />
        </Field>
        <Field label="Email" id="email">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
            placeholder="you@company.com"
          />
        </Field>
        <Field label="Phone / WhatsApp (optional)" id="phone">
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={fieldClass}
            placeholder="+961…"
          />
        </Field>
        <Field label="Country" id="country">
          <input
            id="country"
            name="country"
            required
            autoComplete="country-name"
            className={fieldClass}
            placeholder="Where you are based"
          />
        </Field>
        <Field label="Business / Industry" id="industry">
          <input
            id="industry"
            name="industry"
            required
            className={fieldClass}
            placeholder="Restaurant, retail, beauty, real estate…"
          />
        </Field>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="website">
            Current website <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="website"
            name="website"
            type="url"
            className={fieldClass}
            placeholder="https://"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="need">
            What do you need?
          </label>
          <select
            id="need"
            name="need"
            required
            defaultValue=""
            className={`${fieldClass} appearance-none`}
          >
            <option value="" disabled>
              Select an option
            </option>
            {needOptions.map((o) => (
              <option key={o} value={o} className="bg-surface text-foreground">
                {o}
              </option>
            ))}
          </select>
        </div>

        <Field label="Approximate budget (optional)" id="budgetRange">
          <select
            id="budgetRange"
            name="budgetRange"
            defaultValue=""
            className={`${fieldClass} appearance-none`}
          >
            <option value="">Not decided yet</option>
            <option value="Under $500">Under $500</option>
            <option value="$500–$1,000">$500–$1,000</option>
            <option value="$1,000–$2,500">$1,000–$2,500</option>
            <option value="$2,500+">$2,500+</option>
          </select>
        </Field>
        <Field label="Preferred launch timing (optional)" id="launchTiming">
          <select
            id="launchTiming"
            name="launchTiming"
            defaultValue=""
            className={`${fieldClass} appearance-none`}
          >
            <option value="">Flexible</option>
            <option value="As soon as possible">As soon as possible</option>
            <option value="2–4 weeks">2–4 weeks</option>
            <option value="1–2 months">1–2 months</option>
            <option value="3+ months">3+ months</option>
          </select>
        </Field>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="details">
            Project goals / details
          </label>
          <textarea
            id="details"
            name="details"
            required
            minLength={10}
            rows={5}
            className={`${fieldClass} resize-y`}
            placeholder="Tell us what you want the website to achieve, what is not working today, and anything we should know."
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="heardAbout">
            How did you hear about us?{" "}
            <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="heardAbout"
            name="heardAbout"
            className={fieldClass}
            placeholder="Instagram, Google, referral, existing client…"
          />
        </div>
      </div>

      <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
        <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 accent-current" />
        <span>
          I agree that Jahjah WebDigital may use these details to respond to my project inquiry. See
          the{" "}
          <a href="/privacy" className="text-foreground underline underline-offset-4">
            Privacy Policy
          </a>
          .
        </span>
      </label>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-sm border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="group inline-flex items-center justify-center gap-3 rounded-full bg-primary px-8 py-4 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-all duration-500 hover:opacity-90 disabled:opacity-60"
        >
           {mutation.isPending ? "Sending…" : "Send my brief for review"}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </button>
         <a
           href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
           onClick={() => track("whatsapp_click", { location: "contact_form" })}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-8 py-4 text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-primary hover:text-primary"
        >
           <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask on WhatsApp
        </a>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
         Submitting saves your brief in our private inquiries inbox. WhatsApp is an optional contact channel.
      </p>
    </form>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}
