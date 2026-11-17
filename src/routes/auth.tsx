import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MONTHLY_CARE_PRICE_CENTS, TIER_LABEL, TIER_PRICE_CENTS, usd, type Tier } from "@/lib/platform";

const searchSchema = z.object({
  tier: z.enum(["basic", "medium", "high"]).optional(),
  mode: z.enum(["signin", "signup"]).optional(),
  // Carries a CRM prospect's own public_token through signup, so the
  // resulting project can be linked back to the lead that produced the
  // payment (see registerCompany's source_prospect_token).
  prospect: z.string().uuid().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Jahjah WebDigital Platform" },
      {
        name: "description",
        content: "Create your account or sign in to build and manage your company website.",
      },
      { property: "og:title", content: "Sign in — Jahjah WebDigital Platform" },
      {
        property: "og:description",
        content: "Access your Jahjah WebDigital workspace to build your company website.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { tier, mode, prospect } = Route.useSearch();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(mode !== "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);

  const nextSearch = { ...(tier ? { tier } : {}), ...(prospect ? { prospect } : {}) };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/onboarding", search: nextSearch });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, tier, prospect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSignup && !terms) {
      toast.error("Please accept the Terms of Service to continue.");
      return;
    }
    setBusy(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
            data: { full_name: fullName, terms_accepted_at: new Date().toISOString() },
          },
        });
        if (error) throw error;
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          navigate({ to: "/onboarding", search: nextSearch });
        } else {
          toast.success("Check your inbox to confirm your email, then sign in.");
          setIsSignup(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/onboarding", search: nextSearch });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  // Native Supabase OAuth. Portable by construction: redirectTo always
  // resolves to whichever origin this page is actually served from (a Vercel
  // preview URL, localhost, or the production domain), never a hardcoded host.
  async function handleGoogle() {
    if (isSignup && !terms) {
      toast.error("Please accept the Terms of Service to continue.");
      return;
    }
    setBusy(true);
    try {
      if (tier) sessionStorage.setItem("jwd_tier", tier);
      if (prospect) sessionStorage.setItem("jwd_prospect_token", prospect);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/onboarding` },
      });
      if (error) {
        toast.error("Google sign-in failed. Please try again.");
        setBusy(false);
      }
      // On success the browser navigates away to Google's consent screen —
      // there is nothing further to do here; onboarding.tsx picks the
      // stashed tier/prospect back up from sessionStorage on return.
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between border-r border-border bg-surface/40 p-12 lg:flex">
        <Link to="/" className="font-display text-2xl tracking-tight">
          Jahjah <span className="text-champagne">WebDigital</span>
        </Link>
        <div>
          <h2 className="font-display text-5xl leading-[1.05]">
            One account.
            <br />
            One company.
            <br />
            <span className="text-champagne">One exceptional website.</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            Register your business, define your identity and generate your website inside our
            platform. Fixed one-time pricing, two design trials included, and a studio team behind
            every build.
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Beirut, Lebanon · Worldwide delivery
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <Link to="/" className="font-display text-xl lg:hidden">
            Jahjah <span className="text-champagne">WebDigital</span>
          </Link>
          {tier && (
            <div className="mt-6 rounded-sm border border-champagne/30 bg-surface px-4 py-3 text-sm">
              Selected package: <span className="text-champagne">{TIER_LABEL[tier as Tier]}</span> —{" "}
              {usd(TIER_PRICE_CENTS[tier as Tier])} one-time build · +{usd(MONTHLY_CARE_PRICE_CENTS)}/month after launch
            </div>
          )}
          <h1 className="mt-8 font-display text-4xl">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignup
              ? "Start your project in a few minutes."
              : "Sign in to continue your project."}
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-sm border border-border bg-surface px-5 py-3 text-sm transition-colors hover:border-champagne/40 disabled:opacity-60"
          >
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-4 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <Field label="Full name">
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-luxe"
                  autoComplete="name"
                />
              </Field>
            )}
            <Field label="Email">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-luxe"
                autoComplete="email"
              />
            </Field>
            <Field label="Password">
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-luxe"
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </Field>

            {isSignup && (
              <label className="flex items-start gap-3 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="mt-0.5 size-4 accent-[var(--champagne)]"
                />
                <span>
                  I accept the{" "}
                  <Link to="/terms" className="text-champagne underline underline-offset-4">
                    Terms of Service
                  </Link>{" "}
                  and confirm I am registering my own business. Resale or redistribution of the
                  delivered website is not permitted.
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-sm bg-champagne px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setIsSignup((v) => !v)}
            className="mt-6 w-full text-center text-xs text-muted-foreground transition-colors hover:text-champagne"
          >
            {isSignup ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
