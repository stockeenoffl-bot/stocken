-- ============================================================================
-- Zonal Edge - Live Sync + Alice Blue session storage
-- Run ONCE in the Supabase SQL editor (after supabase_schema.sql).
--
--  live_state      Everything the admin publishes (per-market analysis, zones,
--                  drawings, chart view, flash alert). Readable by everyone,
--                  writable by admins only. Streamed to users via Supabase
--                  Realtime, so a publish reaches every browser in ~1 second.
--
--  broker_session  The single daily Alice Blue userSession. Only the server
--                  (service role) can touch it - NO policies = no client access.
-- ============================================================================

-- 0) Admin check that understands every admin-type role -------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'analyst')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1) Live state ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.live_state (
    key         TEXT PRIMARY KEY,                       -- 'market:NIFTY 50', 'market:SENSEX', 'alert'
    value       JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by  TEXT
);

ALTER TABLE public.live_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read live state" ON public.live_state;
CREATE POLICY "Anyone can read live state"
    ON public.live_state FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can write live state" ON public.live_state;
CREATE POLICY "Admins can write live state"
    ON public.live_state FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Stream changes to browsers
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.live_state;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

-- 2) Alice Blue session (server only) -----------------------------------------
CREATE TABLE IF NOT EXISTS public.broker_session (
    id            INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    user_id       TEXT NOT NULL,
    user_session  TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.broker_session ENABLE ROW LEVEL SECURITY;
-- Intentionally NO policies: only the service-role key (server) can read/write.
REVOKE ALL ON public.broker_session FROM anon, authenticated;
