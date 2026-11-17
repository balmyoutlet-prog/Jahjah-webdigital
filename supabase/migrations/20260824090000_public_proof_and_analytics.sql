
-- =====================================================================
-- Jahjah WebDigital — verified case studies, dynamic trust milestones,
-- and first-party funnel analytics for the public site.
-- Additive migration. Nothing below alters existing tables' behaviour.
-- Ships with zero seeded rows in case_studies/case_study_metrics/
-- milestones — nothing becomes public until an admin explicitly
-- verifies and publishes it.
-- =====================================================================

-- ===== CASE STUDIES (verified project write-ups) =====
CREATE TABLE public.case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text,
  live_url text,
  public boolean NOT NULL DEFAULT false,
  verified boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.case_studies TO service_role;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
-- Public may only ever see rows that are BOTH published and verified.
CREATE POLICY "case studies public read" ON public.case_studies FOR SELECT TO anon, authenticated
  USING (public = true AND verified = true);
CREATE POLICY "case studies admin read all" ON public.case_studies FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER case_studies_updated BEFORE UPDATE ON public.case_studies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== CASE STUDY METRICS (verified numbers only) =====
CREATE TABLE public.case_study_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id uuid NOT NULL REFERENCES public.case_studies(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_unit text,
  comparison_value numeric,
  period_start date,
  period_end date,
  source text,
  verified boolean NOT NULL DEFAULT false,
  public boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.case_study_metrics TO service_role;
ALTER TABLE public.case_study_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "case study metrics public read" ON public.case_study_metrics FOR SELECT TO anon, authenticated
  USING (
    public = true AND verified = true
    AND EXISTS (SELECT 1 FROM public.case_studies cs WHERE cs.id = case_study_id AND cs.public = true AND cs.verified = true)
  );
CREATE POLICY "case study metrics admin read all" ON public.case_study_metrics FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER case_study_metrics_updated BEFORE UPDATE ON public.case_study_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== TRUST MILESTONES (admin-controlled, only shown when verified+enabled) =====
CREATE TABLE public.trust_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  value text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trust_milestones TO anon, authenticated;
GRANT ALL ON public.trust_milestones TO service_role;
ALTER TABLE public.trust_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestones public read enabled" ON public.trust_milestones FOR SELECT TO anon, authenticated
  USING (enabled = true);
CREATE POLICY "milestones admin read all" ON public.trust_milestones FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trust_milestones_updated BEFORE UPDATE ON public.trust_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== FIRST-PARTY FUNNEL ANALYTICS =====
-- Minimal, first-party, no cookies: a random per-tab session id generated
-- client-side and kept in sessionStorage. No PII is collected here.
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  session_id text,
  path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Insert-only for the public (fire-and-forget beacons); reading is
-- admin-only. No update/delete policy for anyone but service_role.
GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analytics events public insert" ON public.analytics_events FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "analytics events admin read" ON public.analytics_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_analytics_events_name_created ON public.analytics_events(event_name, created_at DESC);
CREATE INDEX idx_analytics_events_session ON public.analytics_events(session_id);
