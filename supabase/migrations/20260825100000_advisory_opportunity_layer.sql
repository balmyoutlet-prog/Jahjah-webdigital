
-- =====================================================================
-- Jahjah WebDigital — Advisor-style diagnosis, business snapshot inputs,
-- and opportunity scenario modeling.
-- Additive migration. All new columns are nullable/defaulted; nothing
-- existing changes shape or behaviour.
-- =====================================================================

-- ===== PROSPECTS: advisory/diagnosis + private business snapshot =====
-- These business-snapshot columns are financial inputs a prospect
-- voluntarily supplies on their private, tokenized study page. They live
-- on `prospects`, which already ships with ZERO anon/authenticated
-- policies — service-role only, same as every other private CRM field.
ALTER TABLE public.prospects ADD COLUMN identified_gap text;
ALTER TABLE public.prospects ADD COLUMN recommended_tier public.package_tier;
ALTER TABLE public.prospects ADD COLUMN recommended_reasoning text;
ALTER TABLE public.prospects ADD COLUMN recommended_features text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.prospects ADD COLUMN monthly_sales_range text;
ALTER TABLE public.prospects ADD COLUMN monthly_sales_exact numeric;
ALTER TABLE public.prospects ADD COLUMN avg_order_value numeric;
ALTER TABLE public.prospects ADD COLUMN monthly_volume numeric;
ALTER TABLE public.prospects ADD COLUMN gross_margin_pct numeric;
ALTER TABLE public.prospects ADD COLUMN primary_goal text;

ALTER TABLE public.prospects ADD COLUMN scenario_conservative_monthly numeric;
ALTER TABLE public.prospects ADD COLUMN scenario_expected_monthly numeric;
ALTER TABLE public.prospects ADD COLUMN scenario_high_monthly numeric;
ALTER TABLE public.prospects ADD COLUMN scenario_is_range boolean NOT NULL DEFAULT true;
ALTER TABLE public.prospects ADD COLUMN scenario_assumptions jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.prospects ADD COLUMN study_opened_at timestamptz;
ALTER TABLE public.prospects ADD COLUMN snapshot_submitted_at timestamptz;
ALTER TABLE public.prospects ADD COLUMN recommendation_viewed_at timestamptz;

-- ===== INDUSTRY PLAYBOOKS (admin-configurable advisory assumptions) =====
-- Every percentage/feature list here is an editable assumption, not a
-- researched fact — unlike the sourced statistics in `evidenceItems`.
-- Keyed to the same category keys used by `industrySolutions` in
-- src/lib/site-data.ts (falls back to 'general' when a category has no
-- specific playbook yet).
CREATE TABLE public.industry_playbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  conservative_pct numeric NOT NULL DEFAULT 3,
  expected_pct numeric NOT NULL DEFAULT 6,
  high_pct numeric NOT NULL DEFAULT 10,
  recommended_features text[] NOT NULL DEFAULT '{}',
  messaging_angle text,
  default_tier public.package_tier NOT NULL DEFAULT 'medium',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- Assumption percentages and recommended-feature lists are shown to
-- prospects as part of their study, so public read is appropriate —
-- same trust model as `packages`/`addons`. Only service-role can write.
GRANT SELECT ON public.industry_playbooks TO anon, authenticated;
GRANT ALL ON public.industry_playbooks TO service_role;
ALTER TABLE public.industry_playbooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "playbooks public read" ON public.industry_playbooks FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER industry_playbooks_updated BEFORE UPDATE ON public.industry_playbooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.industry_playbooks (key, label, conservative_pct, expected_pct, high_pct, recommended_features, messaging_angle, default_tier, sort_order) VALUES
  ('restaurants', 'Restaurants & Cafés', 3, 6, 10,
   ARRAY['Digital menu','Google & Maps discovery','WhatsApp / order flow','Location & hours','Offers','Analytics'],
   'Customers should be able to go from search to menu to a decision to an order without friction.', 'medium', 1),
  ('beauty', 'Beauty & Wellness', 4, 8, 14,
   ARRAY['Services menu','Portfolio / results gallery','Trust & reviews','Booking','WhatsApp','Location','Analytics'],
   'Customers should be able to go from seeing your work to trusting the service to booking.', 'medium', 2),
  ('retail', 'Retail & Fashion', 3, 6, 10,
   ARRAY['Collections','Product discovery','New arrivals','Campaign landing pages','WhatsApp / e-commerce','Analytics'],
   'Customers should be able to discover a product and act on it without leaving the journey.', 'medium', 3),
  ('ecommerce', 'E-commerce', 3, 7, 12,
   ARRAY['Product search','Cart & checkout','Order tracking','Reviews-ready','Campaign landing pages','Analytics'],
   'At catalogue scale, the priority is a fast path from discovery to checkout.', 'high', 4),
  ('professional', 'Professional Services', 3, 6, 10,
   ARRAY['Services overview','Credibility & team','FAQ','Lead capture','Appointment request','Analytics'],
   'Credibility has to be established before the first conversation happens.', 'medium', 5),
  ('clinics', 'Clinics & Practices', 3, 6, 10,
   ARRAY['Services & specialties','Credibility & team','FAQ','Appointment request','Location & hours','Analytics'],
   'Clear information and an easy way to request an appointment come first.', 'medium', 6),
  ('hospitality', 'Hotels & Hospitality', 3, 6, 10,
   ARRAY['Rooms / services','Gallery','Location','Booking / inquiry','Trust','FAQ'],
   'The site has to make people want to book, and make it easy to.', 'high', 7),
  ('growing-brands', 'Growing Brands', 3, 6, 10,
   ARRAY['Brand presentation','Lead capture','Analytics','Room to grow'],
   'A serious digital home for a business that has outgrown its old site.', 'medium', 8),
  ('general', 'General / Other', 3, 6, 10,
   ARRAY['Dedicated website','Clear conversion action','Google & Maps connection','Analytics'],
   'A dedicated digital destination connecting existing attention to a clear next step.', 'medium', 99)
ON CONFLICT (key) DO NOTHING;
