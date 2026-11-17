
-- =====================================================================
-- Jahjah WebDigital — Lead Generation, CRM, Outreach & Payments layer
-- Additive migration: extends the existing packages/companies/projects/
-- orders schema. Nothing below drops or rewrites existing tables.
-- =====================================================================

-- ===== ENUMS =====
CREATE TYPE public.prospect_stage AS ENUM (
  'new_lead',
  'qualified',
  'ready_for_outreach',
  'contacted',
  'replied',
  'interested',
  'form_submitted',
  'package_selected',
  'payment_pending',
  'payment_submitted',
  'payment_verified',
  'website_in_production',
  'client_review',
  'published',
  'lost'
);

CREATE TYPE public.website_status AS ENUM ('no_website', 'weak_website', 'good_website', 'unknown');

CREATE TYPE public.payment_submission_status AS ENUM ('pending', 'verified', 'rejected', 'clarification_requested');

-- ===== PROSPECTS (Lead Discovery + CRM) =====
CREATE TABLE public.prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  category text,
  city text,
  country text NOT NULL DEFAULT 'Lebanon',
  instagram_url text,
  instagram_followers integer,
  google_maps_url text,
  google_rating numeric(2,1),
  google_reviews_count integer,
  website_url text,
  website_status public.website_status NOT NULL DEFAULT 'unknown',
  phone text,
  whatsapp text,
  email text,
  description text,
  lead_source text NOT NULL DEFAULT 'manual',
  opportunity_score integer NOT NULL DEFAULT 0,
  score_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  stage public.prospect_stage NOT NULL DEFAULT 'new_lead',
  audit_result jsonb,
  audited_at timestamptz,
  public_token uuid NOT NULL DEFAULT gen_random_uuid(),
  next_follow_up_date date,
  notes text,
  discovered_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  linked_owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (public_token)
);
-- No RLS policies are granted to anon/authenticated on purpose: this table
-- holds private prospecting/CRM data. All access goes through server
-- functions that verify the admin role and then use the service-role
-- client. The public "/for/:token" page is served by a server function
-- that whitelists a small set of non-sensitive columns explicitly.
GRANT ALL ON public.prospects TO service_role;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER prospects_updated BEFORE UPDATE ON public.prospects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_prospects_stage ON public.prospects(stage);
CREATE INDEX idx_prospects_score ON public.prospects(opportunity_score DESC);
CREATE INDEX idx_prospects_category ON public.prospects(category);
CREATE INDEX idx_prospects_country_city ON public.prospects(country, city);
CREATE INDEX idx_prospects_token ON public.prospects(public_token);

-- ===== PROSPECT ACTIVITY / TIMELINE =====
CREATE TABLE public.prospect_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type text NOT NULL,
  message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.prospect_activities TO service_role;
ALTER TABLE public.prospect_activities ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_prospect_activities_prospect ON public.prospect_activities(prospect_id, created_at DESC);

-- ===== ADD-ONS (admin-configurable pricing) =====
CREATE TABLE public.addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- Prices are public (shown on the pricing/checkout pages) but only the
-- service role (i.e. admin server functions) may write, same pattern as
-- the existing `packages` table.
GRANT SELECT ON public.addons TO anon, authenticated;
GRANT ALL ON public.addons TO service_role;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addons public read active" ON public.addons FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "addons admin read all" ON public.addons FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER addons_updated BEFORE UPDATE ON public.addons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.addons (key, name, description, price_cents, sort_order) VALUES
  ('extra_language', 'Extra language', 'Add another language to your website (beyond the primary one).', 9900, 1),
  ('advanced_booking', 'Advanced booking system', 'Appointment/table booking with availability rules.', 19900, 2),
  ('advanced_ordering', 'Advanced ordering flow', 'Cart-style ordering with order summary and WhatsApp/email handoff.', 19900, 3),
  ('admin_dashboard', 'Admin dashboard', 'A simple back-office to manage content, menu items or bookings.', 24900, 4),
  ('advanced_analytics', 'Advanced analytics setup', 'Goal and event tracking wired into analytics.', 7900, 5),
  ('product_upload', 'Product/catalogue upload service', 'We upload and format your products or menu items for you.', 9900, 6),
  ('additional_pages', 'Additional page (each)', 'One extra page beyond your package limit.', 4900, 7),
  ('advanced_seo', 'Advanced SEO package', 'Deeper keyword-led SEO structure and metadata.', 12900, 8),
  ('premium_animations', 'Premium animations', 'Extra motion and micro-interactions across the site.', 9900, 9),
  ('advanced_forms', 'Advanced custom forms', 'Multi-step or conditional forms beyond the standard contact form.', 7900, 10),
  ('custom_integration', 'Custom integration', 'Connect a specific third-party tool or system you already use.', 24900, 11),
  ('extra_revision', 'Additional design revision', 'One extra revision round beyond what your package includes.', 4900, 12),
  ('maintenance_plan', 'Monthly maintenance', 'Ongoing updates, backups and small edits (billed separately).', 4900, 13);

-- ===== ORDER ADD-ONS (line items attached to an order) =====
CREATE TABLE public.order_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  addon_key text NOT NULL,
  name text NOT NULL,
  price_cents integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.order_addons TO authenticated;
GRANT ALL ON public.order_addons TO service_role;
ALTER TABLE public.order_addons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own order addons read" ON public.order_addons FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_addons.order_id AND o.owner_id = auth.uid())
  );

-- ===== PROJECT: selected add-ons snapshot before checkout =====
ALTER TABLE public.projects ADD COLUMN selected_addons text[] NOT NULL DEFAULT '{}';

-- ===== COMPANIES: onboarding extensions =====
ALTER TABLE public.companies ADD COLUMN preferred_language text;
ALTER TABLE public.companies ADD COLUMN requirements text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.companies ADD COLUMN photo_urls text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.companies ADD COLUMN city text;

-- ===== PAYMENT SUBMISSIONS (Whish Money — manual verification) =====
CREATE TABLE public.payment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method text NOT NULL DEFAULT 'whish',
  payer_name text NOT NULL,
  payer_phone text NOT NULL,
  reference text,
  receipt_path text,
  status public.payment_submission_status NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payment_submissions TO authenticated;
GRANT ALL ON public.payment_submissions TO service_role;
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own payment submissions read" ON public.payment_submissions FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own payment submissions insert" ON public.payment_submissions FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.owner_id = auth.uid())
  );
-- Deliberately no UPDATE policy for authenticated: verification/rejection is
-- only performed by admin server functions using the service-role client,
-- after an explicit has_role() check — never a client-writable status flip.

CREATE INDEX idx_payment_submissions_order ON public.payment_submissions(order_id);
CREATE INDEX idx_payment_submissions_status ON public.payment_submissions(status);

-- ===== AUDIT LOG helper events already covered by public.audit_logs =====
-- (reused as-is for prospect/addon/payment admin actions)

-- ===== STORAGE BUCKETS =====
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('brand-assets', 'brand-assets', true, 8388608, ARRAY['image/png','image/jpeg','image/webp','image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('payment-receipts', 'payment-receipts', false, 8388608, ARRAY['image/png','image/jpeg','image/webp','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- brand-assets: public read (used on the generated website), owner can only
-- write inside a folder prefixed with their own user id.
CREATE POLICY "brand assets public read" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'brand-assets');
CREATE POLICY "brand assets owner insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'brand-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "brand assets owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'brand-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "brand assets owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'brand-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

-- payment-receipts: private. Owner can upload/read their own folder only;
-- admins can read everything via a dedicated policy. No public access.
CREATE POLICY "receipts owner insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "receipts owner read" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-receipts'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin'))
  );

-- ===== OWNER BOOTSTRAP =====
-- The platform ships with no self-service "become admin" flow (by design —
-- admin access must never be publicly grantable). Instead, the founder's own
-- account is granted the admin role automatically: once now for an account
-- that may already exist, and going forward on signup for that exact email.
DO $$
DECLARE _uid uuid;
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE email = 'jihan.jahjah1990@gmail.com' LIMIT 1;
  IF _uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'admin') ON CONFLICT DO NOTHING;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
  ON CONFLICT DO NOTHING;
  IF NEW.email = 'jihan.jahjah1990@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
