-- Outreach pipeline: additive, admin-only (service role via server functions). No anon/authenticated access.
CREATE TABLE public.outreach_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL UNIQUE REFERENCES public.prospects(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'research_needed' CHECK (status IN ('research_needed','qualified','drafted','needs_approval','approved','sent','follow_up_due','replied','meeting','proposal','won','lost','do_not_contact')),
  signal_type text,
  signal_summary text,
  signal_date date,
  observation text,
  observation_verified boolean NOT NULL DEFAULT false,
  consequence text,
  solution_angle text,
  cta text NOT NULL DEFAULT 'Would you like me to send the 3 findings?',
  contact_route text,
  contact_route_type text CHECK (contact_route_type IS NULL OR contact_route_type IN ('email','phone','whatsapp_verified','instagram_dm','contact_form','other')),
  contact_verified boolean NOT NULL DEFAULT false,
  contact_role text,
  source_urls text[] NOT NULL DEFAULT '{}',
  proof_slug text,
  opted_in boolean NOT NULL DEFAULT false,
  email_first text,
  email_follow_up text,
  dm_first text,
  dm_follow_up text,
  preferred_channel text CHECK (preferred_channel IS NULL OR preferred_channel IN ('email','whatsapp','instagram_dm')),
  reply_classification text CHECK (reply_classification IS NULL OR reply_classification IN ('positive','neutral','negative','not_now')),
  follow_up_count integer NOT NULL DEFAULT 0,
  follow_up_eligible_at date,
  last_contacted_at timestamptz,
  last_channel text,
  replied_at timestamptz,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.outreach_records TO service_role;
ALTER TABLE public.outreach_records ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER outreach_records_updated BEFORE UPDATE ON public.outreach_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_outreach_records_status ON public.outreach_records(status);

-- Do Not Contact is permanent; a reply cancels follow-up eligibility.
CREATE OR REPLACE FUNCTION public.outreach_records_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status = 'do_not_contact' AND NEW.status <> 'do_not_contact' THEN
    RAISE EXCEPTION 'Do Not Contact is permanent for this prospect';
  END IF;
  IF NEW.replied_at IS NOT NULL OR NEW.status IN ('replied','meeting','proposal','won','lost','do_not_contact') THEN
    NEW.follow_up_eligible_at := NULL;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER outreach_records_guard BEFORE INSERT OR UPDATE ON public.outreach_records
  FOR EACH ROW EXECUTE FUNCTION public.outreach_records_guard();

CREATE TABLE public.outreach_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  actor_id uuid,
  event_type text NOT NULL,
  channel text,
  from_status text,
  to_status text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.outreach_events TO service_role;
ALTER TABLE public.outreach_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_outreach_events_prospect ON public.outreach_events(prospect_id, created_at DESC);

CREATE TABLE public.outreach_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  sending_domain text,
  domain_verified boolean NOT NULL DEFAULT false,
  sender_address text,
  reply_to text,
  reply_to_configured boolean NOT NULL DEFAULT false,
  inbound_tested boolean NOT NULL DEFAULT false,
  last_test_result text,
  last_test_at timestamptz,
  spf_status text NOT NULL DEFAULT 'unknown',
  dkim_status text NOT NULL DEFAULT 'unknown',
  dmarc_status text NOT NULL DEFAULT 'unknown',
  readiness_confirmed boolean NOT NULL DEFAULT false,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.outreach_settings TO service_role;
ALTER TABLE public.outreach_settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.outreach_settings (id, sending_domain, sender_address) VALUES (true, 'jahjahwebdigital.com', 'hello@jahjahwebdigital.com');