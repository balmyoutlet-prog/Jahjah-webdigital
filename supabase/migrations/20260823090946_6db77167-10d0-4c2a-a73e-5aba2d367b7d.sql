
-- ===== ENUMS =====
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
CREATE TYPE public.package_tier AS ENUM ('basic', 'medium', 'high');
CREATE TYPE public.project_status AS ENUM ('draft', 'awaiting_payment', 'active', 'published');
CREATE TYPE public.order_kind AS ENUM ('package', 'upgrade', 'extra_trial');
CREATE TYPE public.order_status AS ENUM ('awaiting_payment_integration', 'pending', 'paid', 'failed', 'cancelled');
CREATE TYPE public.generation_status AS ENUM ('queued', 'completed', 'failed');
CREATE TYPE public.domain_status AS ENUM ('unchecked', 'provider_not_connected', 'available', 'unavailable', 'selected');

-- ===== UTIL =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ===== PROFILES =====
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===== ROLES =====
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== PACKAGES (public catalogue) =====
CREATE TABLE public.packages (
  tier public.package_tier PRIMARY KEY,
  name text NOT NULL,
  price_cents integer NOT NULL,
  tagline text NOT NULL,
  max_pages integer NOT NULL,
  max_sections integer NOT NULL,
  included_trials integer NOT NULL DEFAULT 2,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.packages TO anon, authenticated;
GRANT ALL ON public.packages TO service_role;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packages public read" ON public.packages FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.packages (tier, name, price_cents, tagline, max_pages, max_sections, features, sort_order) VALUES
('basic', 'Basic', 29900, 'A polished professional website for your business.', 3, 7,
 '["Controlled premium template","Core business sections","Mobile responsive","Contact & WhatsApp","Instagram + Google Maps integration","Basic SEO foundation","2 included design trials"]'::jsonb, 1),
('medium', 'Medium', 49900, 'Richer sections and stronger visual customisation.', 6, 12,
 '["Everything in Basic","Richer section library","Stronger visual customisation","Advanced layouts and interactions","Enhanced SEO and content structure","Custom colour and type direction","2 included design trials"]'::jsonb, 2),
('high', 'High-End / Luxury', 69900, 'Cinematic visual direction and editorial presentation.', 10, 18,
 '["Everything in Medium","Premium cinematic visual direction","Advanced editorial sections","Richer motion and interactions","Luxury presentation detailing","Highest customisation tier on the platform","2 included design trials"]'::jsonb, 3);

-- ===== COMPANIES: one per account =====
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  owner_name text NOT NULL,
  contact_email text NOT NULL,
  phone text NOT NULL,
  country text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  instagram_url text,
  maps_url text,
  existing_website text,
  whatsapp text,
  address text,
  opening_hours text,
  logo_url text,
  visual_direction text,
  primary_color text,
  accent_color text,
  font_style text,
  identity_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own company read" ON public.companies FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own company insert" ON public.companies FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "own company update" ON public.companies FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER companies_updated BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== PROJECTS: one per company =====
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
  tier public.package_tier NOT NULL DEFAULT 'basic',
  status public.project_status NOT NULL DEFAULT 'draft',
  paid boolean NOT NULL DEFAULT false,
  trials_used integer NOT NULL DEFAULT 0,
  extra_trials_purchased integer NOT NULL DEFAULT 0,
  selected_generation_id uuid,
  published_at timestamptz,
  published_domain text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own project read" ON public.projects FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER projects_updated BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== ORDERS =====
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  kind public.order_kind NOT NULL,
  tier public.package_tier,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status public.order_status NOT NULL DEFAULT 'awaiting_payment_integration',
  provider text,
  provider_reference text,
  description text NOT NULL,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders read" ON public.orders FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ===== GENERATIONS (trials) =====
CREATE TABLE public.generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_number integer NOT NULL,
  tier public.package_tier NOT NULL,
  direction_key text NOT NULL,
  status public.generation_status NOT NULL DEFAULT 'completed',
  spec jsonb NOT NULL DEFAULT '{}'::jsonb,
  billable boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, trial_number)
);
GRANT SELECT ON public.generations TO authenticated;
GRANT ALL ON public.generations TO service_role;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own generations read" ON public.generations FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ===== DOMAIN REQUESTS =====
CREATE TABLE public.domain_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain text NOT NULL,
  status public.domain_status NOT NULL DEFAULT 'provider_not_connected',
  provider text,
  provider_response jsonb,
  checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.domain_requests TO authenticated;
GRANT ALL ON public.domain_requests TO service_role;
ALTER TABLE public.domain_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own domains read" ON public.domain_requests FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ===== AUDIT LOGS =====
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  event text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit read own or admin" ON public.audit_logs FOR SELECT TO authenticated
  USING (actor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_orders_owner ON public.orders(owner_id);
CREATE INDEX idx_generations_project ON public.generations(project_id);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);
