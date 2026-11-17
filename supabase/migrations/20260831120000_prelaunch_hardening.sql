-- Pre-launch hardening:
--   1. Zero-cost, DB-backed rate limiting for unauthenticated endpoints.
--   2. A dedicated table for real /contact submissions (replaces the
--      clipboard-only flow).
--   3. A real domain/publish state machine — a domain row reaching
--      "selected" (customer picked it) never implies the site is live.

-- ===== RATE LIMITING =====
-- Fixed-window counter, keyed by caller (IP + endpoint). Deliberately
-- simple and free — no external service. `check_rate_limit` is a single
-- atomic UPSERT so concurrent requests can't race past the limit.
CREATE TABLE public.rate_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  count integer NOT NULL DEFAULT 0
);
GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies granted to authenticated/anon — only the service-role server
-- client (which bypasses RLS) ever touches this table.

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO public.rate_limits (key, window_start, count)
  VALUES (p_key, now(), 1)
  ON CONFLICT (key) DO UPDATE SET
    count = CASE
      WHEN public.rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
        THEN 1
      ELSE public.rate_limits.count + 1
    END,
    window_start = CASE
      WHEN public.rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
        THEN now()
      ELSE public.rate_limits.window_start
    END
  RETURNING count INTO v_count;
  RETURN v_count <= p_limit;
END;
$$;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO service_role;

CREATE INDEX idx_rate_limits_window ON public.rate_limits(window_start);

-- ===== CONTACT / LEAD INQUIRIES =====
-- Real server-side persistence for the /contact form. Kept separate from
-- `prospects` (the outbound-discovery CRM) since this is inbound, already
-- has an owner-supplied email, and needs its own light triage status.
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL,
  email text NOT NULL,
  country text NOT NULL,
  current_website text,
  need text NOT NULL,
  details text NOT NULL,
  source text NOT NULL DEFAULT 'contact_form',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'archived')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inquiries admin read" ON public.inquiries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "inquiries admin update" ON public.inquiries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
-- Inserts happen only through the public server function using the
-- service-role client, which bypasses RLS — no anon/authenticated INSERT
-- policy is granted, so this table cannot be written to directly.

CREATE INDEX idx_inquiries_created ON public.inquiries(created_at DESC);
CREATE INDEX idx_inquiries_status ON public.inquiries(status);

-- ===== REAL DOMAIN / PUBLISH STATE MACHINE =====
-- A domain row reaching "selected" is the customer's *request*, not proof
-- of anything. Add the explicit states a domain must actually pass through
-- before a project may ever be marked published.
ALTER TYPE public.domain_status ADD VALUE IF NOT EXISTS 'requested';
ALTER TYPE public.domain_status ADD VALUE IF NOT EXISTS 'verified';
ALTER TYPE public.domain_status ADD VALUE IF NOT EXISTS 'dns_pending';
ALTER TYPE public.domain_status ADD VALUE IF NOT EXISTS 'dns_configured';
ALTER TYPE public.domain_status ADD VALUE IF NOT EXISTS 'tls_active';
ALTER TYPE public.domain_status ADD VALUE IF NOT EXISTS 'live';
ALTER TYPE public.domain_status ADD VALUE IF NOT EXISTS 'failed';

-- A customer can ask us to launch even when no registrar/DNS/deploy
-- automation is connected. That request is real work for an admin to
-- action — it is never, by itself, a published site.
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'launch_requested';

ALTER TABLE public.domain_requests
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS dns_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS tls_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS live_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS failure_reason text,
  ADD COLUMN IF NOT EXISTS last_check_result jsonb;
