-- Restaurant special-offer applications submitted from the public /restaurant page.
CREATE TABLE public.restaurant_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  business_name text NOT NULL,
  contact_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  current_website text,
  instagram_url text,
  google_maps_url text,
  country text NOT NULL,
  city text,
  package_key text NOT NULL CHECK (package_key IN ('basic','moderate','advanced')),
  package_price_cents integer NOT NULL,
  extras text[] NOT NULL DEFAULT '{}',
  extras_total_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','won','lost')),
  admin_notes text,
  session_id text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- All access flows through server functions: the public submit handler is
-- rate-limited + validated, and admin review handlers verify has_role('admin')
-- before using the service role. No anon/authenticated grants or policies —
-- the Data API stays fully locked for this table.
GRANT ALL ON public.restaurant_applications TO service_role;

ALTER TABLE public.restaurant_applications ENABLE ROW LEVEL SECURITY;

CREATE INDEX restaurant_applications_created_idx
  ON public.restaurant_applications (created_at DESC);
CREATE INDEX restaurant_applications_status_idx
  ON public.restaurant_applications (status);

CREATE TRIGGER restaurant_applications_updated
  BEFORE UPDATE ON public.restaurant_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();