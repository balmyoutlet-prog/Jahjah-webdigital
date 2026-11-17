-- =====================================================================
-- Jahjah WebDigital — Private website concept engine, hot-lead
-- engagement scoring, and prospect→payment/referral linkage.
-- Additive only. Nothing existing changes shape or behaviour.
-- =====================================================================

-- ===== PROSPECTS: brand facts, private concept, preview state =====
-- Brand facts are admin-verified (never an automated "AI fact-check" —
-- see the platform's no-fabrication rule), so a logo/color is only ever
-- shown to the prospect once brand_verified is explicitly set true.
ALTER TABLE public.prospects ADD COLUMN logo_url text;
ALTER TABLE public.prospects ADD COLUMN brand_colors jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.prospects ADD COLUMN brand_verified boolean NOT NULL DEFAULT false;

-- The private two-direction concept itself, generated deterministically
-- from verified prospect fields + the industry playbook (see
-- src/lib/leads/concept.ts) — never free-text-invented content.
ALTER TABLE public.prospects ADD COLUMN concept_data jsonb;
ALTER TABLE public.prospects ADD COLUMN concept_generated_at timestamptz;

ALTER TABLE public.prospects ADD COLUMN preview_expires_at timestamptz;
ALTER TABLE public.prospects ADD COLUMN preview_extended_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.prospects ADD COLUMN preview_auto_extended boolean NOT NULL DEFAULT false;

ALTER TABLE public.prospects ADD COLUMN direction_selected text;
ALTER TABLE public.prospects ADD CONSTRAINT prospects_direction_selected_check
  CHECK (direction_selected IS NULL OR direction_selected IN ('a', 'b'));

ALTER TABLE public.prospects ADD COLUMN edit_request_types text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.prospects ADD COLUMN edit_request_note text;
ALTER TABLE public.prospects ADD COLUMN owner_attention_required boolean NOT NULL DEFAULT false;
ALTER TABLE public.prospects ADD COLUMN owner_attention_reason text;

-- Configurable-weight engagement score (see engagement_scoring_config
-- below) — 0-100, recomputed each time a tracked engagement event fires.
ALTER TABLE public.prospects ADD COLUMN engagement_score integer NOT NULL DEFAULT 0;

-- Referral loop: every prospect gets a shareable code once they have a
-- real launched project; a prospect can also arrive already attributed
-- to another prospect's code.
ALTER TABLE public.prospects ADD COLUMN referral_code text;
ALTER TABLE public.prospects ADD COLUMN referred_by_code text;
ALTER TABLE public.prospects ADD CONSTRAINT prospects_referral_code_unique UNIQUE (referral_code);

-- ===== PROJECTS: link a paid project back to the prospect/campaign
-- that originated it, and to a referral code, so the CEO dashboard and
-- hot-lead scoring can trace discovery -> payment end to end. =====
ALTER TABLE public.projects ADD COLUMN source_prospect_id uuid REFERENCES public.prospects(id);
ALTER TABLE public.companies ADD COLUMN referred_by_code text;
-- The paying customer's own shareable referral code, surfaced on their
-- dashboard only after a real successful launch (see the referral UI
-- gating in code — this column existing early is harmless, nothing reads
-- it until the customer's project is published).
ALTER TABLE public.companies ADD COLUMN referral_code text;
ALTER TABLE public.companies ADD CONSTRAINT companies_referral_code_unique UNIQUE (referral_code);

-- ===== ENGAGEMENT SCORING WEIGHTS (admin-configurable, single row) =====
-- Same trust model as `prospects`: zero anon/authenticated policies,
-- service-role only, gated by requireAdmin() in the server functions
-- that read/write it.
CREATE TABLE public.engagement_scoring_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  preview_opened_pts integer NOT NULL DEFAULT 10,
  return_visit_pts integer NOT NULL DEFAULT 15,
  viewed_both_directions_pts integer NOT NULL DEFAULT 15,
  viewed_pricing_pts integer NOT NULL DEFAULT 15,
  growth_study_completed_pts integer NOT NULL DEFAULT 20,
  direction_selected_pts integer NOT NULL DEFAULT 30,
  payment_started_pts integer NOT NULL DEFAULT 25,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.engagement_scoring_config ENABLE ROW LEVEL SECURITY;
INSERT INTO public.engagement_scoring_config DEFAULT VALUES;

CREATE TRIGGER engagement_scoring_config_updated BEFORE UPDATE ON public.engagement_scoring_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== One additional industry vertical named in this pass =====
INSERT INTO public.industry_playbooks (key, label, conservative_pct, expected_pct, high_pct, recommended_features, messaging_angle, default_tier, sort_order) VALUES
  ('gym', 'Gyms & Fitness Studios', 3, 6, 11,
   ARRAY['Programs','Membership plans','Trainers','Class schedule','Trial session request','WhatsApp','Location','Analytics'],
   'Interest has to convert into a booked trial session, not just a follow.', 'medium', 10)
ON CONFLICT (key) DO NOTHING;
