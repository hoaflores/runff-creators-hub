CREATE TABLE public.runff_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text NOT NULL UNIQUE,
  title text NOT NULL,
  event_date date,
  day_label text,
  month_label text,
  city text,
  state text,
  organizer text,
  modality text[] NOT NULL DEFAULT '{}',
  image_url text,
  event_url text,
  status text,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX runff_events_event_date_idx ON public.runff_events (event_date);
GRANT SELECT ON public.runff_events TO anon;
GRANT SELECT ON public.runff_events TO authenticated;
GRANT ALL ON public.runff_events TO service_role;
ALTER TABLE public.runff_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "runff_events_public_read" ON public.runff_events FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.creators_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  whatsapp text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  social_profile text NOT NULL,
  follower_range text,
  running_connection text NOT NULL,
  event_interest text,
  motivation text,
  consent boolean NOT NULL DEFAULT false,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  landing_variant text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX creators_leads_created_at_idx ON public.creators_leads (created_at DESC);
GRANT ALL ON public.creators_leads TO service_role;
ALTER TABLE public.creators_leads ENABLE ROW LEVEL SECURITY;