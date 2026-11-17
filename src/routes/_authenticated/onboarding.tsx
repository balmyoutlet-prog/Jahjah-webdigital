import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Check, Loader2, UploadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTrackEvent } from "@/hooks/use-track-event";
import { getWorkspace, registerCompany } from "@/lib/platform.functions";
import {
  BUSINESS_CATEGORIES,
  MONTHLY_CARE_PRICE_CENTS,
  PREFERRED_LANGUAGES,
  REQUIREMENT_OPTIONS,
  TIER_LABEL,
  TIER_ORDER,
  TIER_PRICE_CENTS,
  usd,
  type Tier,
} from "@/lib/platform";

export const Route = createFileRoute("/_authenticated/onboarding")({
  validateSearch: z.object({
    tier: z.enum(["basic", "medium", "high"]).optional(),
    prospect: z.string().uuid().optional(),
  }),
  component: OnboardingPage,
});

const STEPS = [
  "About your business",
  "Your online presence",
  "Your brand",
  "What do you need?",
  "Choose your package",
] as const;

function OnboardingPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchWorkspace = useServerFn(getWorkspace);
  const submit = useServerFn(registerCompany);

  const { data: workspace, isLoading } = useQuery({
    queryKey: ["workspace"],
    queryFn: () => fetchWorkspace({}),
  });

  const [step, setStep] = useState(0);
  const [tier, setTier] = useState<Tier>(search.tier ?? "medium");
  const [sourceProspectToken, setSourceProspectToken] = useState<string | undefined>(
    search.prospect,
  );
  const [form, setForm] = useState({
    name: "",
    owner_name: "",
    contact_email: "",
    phone: "",
    country: "",
    city: "",
    category: BUSINESS_CATEGORIES[0]!,
    description: "",
    instagram_url: "",
    maps_url: "",
    existing_website: "",
    preferred_language: "english" as (typeof PREFERRED_LANGUAGES)[number]["key"],
  });
  const [requirements, setRequirements] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  // Signed, short-lived preview URLs for private brand-assets uploads.
  const [previewUrls, setPreviewUrls] = useState<{ logo: string[]; photos: string[] }>({
    logo: [],
    photos: [],
  });
  const [uploading, setUploading] = useState<"logo" | "photos" | null>(null);
  const [terms, setTerms] = useState(false);

  useEffect(() => {
    if (!search.tier) {
      const stored = sessionStorage.getItem("jwd_tier");
      if (stored === "basic" || stored === "medium" || stored === "high") setTier(stored);
    }
    if (!search.prospect) {
      const stored = sessionStorage.getItem("jwd_prospect_token");
      if (stored) setSourceProspectToken(stored);
    }
  }, [search.tier, search.prospect]);

  useEffect(() => {
    if (workspace?.project) navigate({ to: "/dashboard" });
  }, [workspace, navigate]);

  const track = useTrackEvent();
  useEffect(() => {
    track("onboarding_started");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mutation = useMutation({
    mutationFn: () =>
      submit({
        data: {
          ...form,
          tier,
          requirements,
          logo_url: logoUrl,
          photo_urls: photoUrls,
          terms_accepted: true as const,
          source_prospect_token: sourceProspectToken,
        },
      }),
    onSuccess: async () => {
      sessionStorage.removeItem("jwd_tier");
      sessionStorage.removeItem("jwd_prospect_token");
      await queryClient.invalidateQueries({ queryKey: ["workspace"] });
      track("onboarding_completed", { tier });
      toast.success("Company registered. Welcome to your workspace.");
      navigate({ to: "/dashboard" });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Could not register your company."),
  });

  async function uploadFiles(files: FileList | null, kind: "logo" | "photos") {
    if (!files || files.length === 0) return;
    setUploading(kind);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in.");

      const uploaded: string[] = [];
      const previews: string[] = [];
      for (const file of Array.from(files)) {
        const path = `${user.id}/${kind}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error } = await supabase.storage
          .from("brand-assets")
          .upload(path, file, { upsert: true });
        if (error) throw error;
        // Bucket is private: persist the object path, preview via a signed URL.
        const { data: signed, error: signErr } = await supabase.storage
          .from("brand-assets")
          .createSignedUrl(path, 60 * 60 * 24 * 7);
        if (signErr) throw signErr;
        uploaded.push(`brand-assets:${path}`);
        previews.push(signed.signedUrl);
      }
      if (kind === "logo") {
        setLogoUrl(uploaded[0]!);
        setPreviewUrls((prev) => ({ ...prev, logo: previews }));
      } else {
        setPhotoUrls((prev) => [...prev, ...uploaded]);
        setPreviewUrls((prev) => ({ ...prev, photos: [...prev.photos, ...previews] }));
      }
      toast.success(kind === "logo" ? "Logo uploaded." : `${uploaded.length} photo(s) uploaded.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  }

  function toggleRequirement(item: string) {
    setRequirements((prev) =>
      prev.includes(item) ? prev.filter((r) => r !== item) : [...prev, item],
    );
  }

  function validateStep(i: number): boolean {
    if (i === 0) {
      if (
        !form.name.trim() ||
        !form.owner_name.trim() ||
        !form.contact_email.trim() ||
        !form.phone.trim() ||
        !form.country.trim()
      ) {
        toast.error("Please complete the required fields before continuing.");
        return false;
      }
      if (form.description.trim().length < 20) {
        toast.error("Tell us a bit more about your business (min. 20 characters).");
        return false;
      }
    }
    return true;
  }

  function next() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  const progressPct = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  if (isLoading) return <CenterNote>Loading your workspace…</CenterNote>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link to="/" className="font-display text-xl">
            Jahjah <span className="text-champagne">WebDigital</span>
          </Link>
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </span>
        </div>
        <div className="h-1 w-full bg-border">
          <div
            className="h-full bg-champagne transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl md:text-5xl">Let's set up your project</h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Five quick steps. Nothing here is wasted — every answer shapes the website we design for
          you.
        </p>

        <form
          className="mt-12 space-y-10"
          onSubmit={(e) => {
            e.preventDefault();
            if (step < STEPS.length - 1) {
              next();
              return;
            }
            if (!terms) {
              toast.error("Please confirm the ownership and terms declaration.");
              return;
            }
            mutation.mutate();
          }}
        >
          {step === 0 && (
            <section className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  label="Business name"
                  required
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                />
                <Field
                  label="Owner / authorised person"
                  required
                  value={form.owner_name}
                  onChange={(v) => setForm({ ...form, owner_name: v })}
                />
                <Field
                  label="Business email"
                  type="email"
                  required
                  value={form.contact_email}
                  onChange={(v) => setForm({ ...form, contact_email: v })}
                />
                <Field
                  label="WhatsApp / phone"
                  required
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                />
                <Field
                  label="Country"
                  required
                  value={form.country}
                  onChange={(v) => setForm({ ...form, country: v })}
                />
                <Field
                  label="City"
                  value={form.city}
                  onChange={(v) => setForm({ ...form, city: v })}
                />
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Industry / category
                  </span>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input-luxe"
                  >
                    {BUSINESS_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-surface">
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  What does your business do? (min. 20 characters)
                </span>
                <textarea
                  required
                  minLength={20}
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-luxe"
                />
              </label>
            </section>
          )}

          {step === 1 && (
            <section className="grid gap-6 sm:grid-cols-2">
              <Field
                label="Instagram URL"
                value={form.instagram_url}
                onChange={(v) => setForm({ ...form, instagram_url: v })}
                placeholder="https://instagram.com/yourbusiness"
              />
              <Field
                label="Google Maps URL"
                value={form.maps_url}
                onChange={(v) => setForm({ ...form, maps_url: v })}
                placeholder="https://maps.app.goo.gl/…"
              />
              <Field
                label="Current website (if any)"
                value={form.existing_website}
                onChange={(v) => setForm({ ...form, existing_website: v })}
                placeholder="https://"
              />
            </section>
          )}

          {step === 2 && (
            <section className="space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <UploadField
                  label="Logo"
                  hint="PNG, JPG, WEBP or SVG — up to 8MB."
                  busy={uploading === "logo"}
                  previewUrls={previewUrls.logo}
                  onFiles={(f) => uploadFiles(f, "logo")}
                />
                <UploadField
                  label="Business photos"
                  hint="Add a few photos — products, food, space, team."
                  busy={uploading === "photos"}
                  previewUrls={previewUrls.photos}
                  multiple
                  onFiles={(f) => uploadFiles(f, "photos")}
                />
              </div>
              <div>
                <span className="mb-3 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Preferred website language
                </span>
                <div className="grid gap-3 sm:grid-cols-4">
                  {PREFERRED_LANGUAGES.map((l) => (
                    <button
                      key={l.key}
                      type="button"
                      onClick={() => setForm({ ...form, preferred_language: l.key })}
                      className={`rounded-sm border p-3 text-sm transition-colors ${
                        form.preferred_language === l.key
                          ? "border-champagne bg-surface text-champagne"
                          : "border-border bg-surface/30 hover:border-champagne/40"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Brand colours can be fine-tuned inside your workspace once your project is created.
              </p>
            </section>
          )}

          {step === 3 && (
            <section>
              <p className="mb-4 text-sm text-muted-foreground">
                Select everything relevant — this shapes what we build first.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {REQUIREMENT_OPTIONS.map((opt) => {
                  const active = requirements.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleRequirement(opt)}
                      className={`flex items-center justify-between rounded-sm border px-4 py-3 text-left text-sm transition-colors ${
                        active
                          ? "border-champagne bg-surface text-champagne"
                          : "border-border bg-surface/30 hover:border-champagne/40"
                      }`}
                    >
                      {opt}
                      {active && <Check className="size-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="space-y-8">
              <div className="grid gap-3 sm:grid-cols-3">
                {TIER_ORDER.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`rounded-sm border p-4 text-left transition-colors ${
                      tier === t
                        ? "border-champagne bg-surface"
                        : "border-border bg-surface/30 hover:border-champagne/40"
                    }`}
                  >
                    <span className="block font-display text-xl">{TIER_LABEL[t]}</span>
                    <span className="mt-1 block text-sm text-champagne">
                      {usd(TIER_PRICE_CENTS[t])} one-time build
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      + {usd(MONTHLY_CARE_PRICE_CENTS)}/month after launch
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                You can add optional extras and choose your payment method after your project is
                created. Features outside your package are $50 each and are added to the final project invoice. Upgrade later and pay only the difference.
              </p>

              <label className="flex items-start gap-3 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="mt-0.5 size-4 accent-[var(--champagne)]"
                />
                <span>
                  I confirm I own or officially represent this business, that this account will hold
                  one company only, and I accept the{" "}
                  <Link to="/terms" className="text-champagne underline underline-offset-4">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-champagne underline underline-offset-4">
                    Privacy Policy
                  </Link>
                  , including the no-resale and no-source-code-export policy.
                </span>
              </label>
            </section>
          )}

          <div className="flex items-center justify-between border-t border-border pt-6">
            <button
              type="button"
              onClick={back}
              disabled={step === 0}
              className="rounded-sm border border-border px-6 py-3 text-sm transition-colors hover:border-champagne/40 disabled:opacity-40"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-sm bg-champagne px-8 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {step < STEPS.length - 1
                ? "Continue"
                : mutation.isPending
                  ? "Creating…"
                  : "Create my project"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <input
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="input-luxe"
      />
    </label>
  );
}

function UploadField({
  label,
  hint,
  onFiles,
  busy,
  previewUrls,
  multiple,
}: {
  label: string;
  hint: string;
  onFiles: (files: FileList | null) => void;
  busy: boolean;
  previewUrls: string[];
  multiple?: boolean;
}) {
  return (
    <div>
      <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border bg-surface/30 px-4 py-6 text-center transition-colors hover:border-champagne/40">
        {busy ? (
          <Loader2 className="size-5 animate-spin text-champagne" />
        ) : (
          <UploadCloud className="size-5 text-muted-foreground" />
        )}
        <span className="text-xs text-muted-foreground">
          {busy ? "Uploading…" : "Click to upload"}
        </span>
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </label>
      <p className="mt-2 text-[11px] text-muted-foreground">{hint}</p>
      {previewUrls.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {previewUrls.map((u) => (
            <img
              key={u}
              src={u}
              alt=""
              className="size-14 rounded-sm border border-border object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CenterNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
