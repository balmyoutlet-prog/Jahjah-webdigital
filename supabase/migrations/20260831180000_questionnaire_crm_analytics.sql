-- Client questionnaire + CRM/analytics upgrade.
--
-- The /contact page became a full project questionnaire and the admin
-- inquiries inbox became a real CRM stage (new/contacted/qualified/won/
-- lost/archived) before a migration for it existed — this migration brings
-- the `inquiries` table (added in 20260831120000_prelaunch_hardening.sql)
-- up to what that code already expects. No new tables: reuses `inquiries`
-- and `analytics_events` exactly as they already exist.

ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS budget_range text,
  ADD COLUMN IF NOT EXISTS launch_timing text,
  ADD COLUMN IF NOT EXISTS heard_about text,
  ADD COLUMN IF NOT EXISTS session_id text,
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS landing_page text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text;

-- `industry` is asked for on the new questionnaire but existing rows (from
-- before this field existed) won't have it — backfill so NOT NULL isn't
-- needed and old rows stay readable rather than blank-looking in admin.
UPDATE public.inquiries SET industry = 'Not specified' WHERE industry IS NULL;

-- Widen the status lifecycle from the original (new/contacted/archived) to
-- the full CRM stage set the admin inbox now uses.
ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_status_check;
ALTER TABLE public.inquiries
  ADD CONSTRAINT inquiries_status_check
  CHECK (status IN ('new', 'contacted', 'qualified', 'won', 'lost', 'archived'));

CREATE INDEX IF NOT EXISTS idx_inquiries_session ON public.inquiries(session_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_utm_source ON public.inquiries(utm_source);

-- analytics_events already accepts any event_name (text, not an enum) and
-- an open `properties` jsonb bag — no schema change needed to add
-- page_view / start_project_click / whatsapp_click / instagram_click /
-- questionnaire_started / questionnaire_submitted / device category, etc.
-- Only the application-level allow-list in analytics.functions.ts changes.
