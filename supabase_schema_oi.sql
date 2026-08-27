-- Add Options Data Tables

CREATE TABLE IF NOT EXISTS public.options_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    symbol TEXT NOT NULL,
    strike_price NUMERIC NOT NULL,
    call_oi NUMERIC DEFAULT 0,
    put_oi NUMERIC DEFAULT 0,
    call_change NUMERIC DEFAULT 0,
    put_change NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(symbol, strike_price)
);

CREATE TABLE IF NOT EXISTS public.options_change_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    symbol TEXT NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    dhb TEXT,
    change_call_oi NUMERIC DEFAULT 0,
    change_put_oi NUMERIC DEFAULT 0,
    diff_oi NUMERIC DEFAULT 0,
    direction_change NUMERIC DEFAULT 0,
    change_direction NUMERIC DEFAULT 0,
    total_call_ltp_chg NUMERIC DEFAULT 0,
    ce_pe_ltp_chg NUMERIC DEFAULT 0,
    put_ltp_chg NUMERIC DEFAULT 0,
    total_put_ltp NUMERIC DEFAULT 0,
    net_pcr NUMERIC DEFAULT 0,
    dhb_diff_oi TEXT,
    sentiment TEXT
);

-- Enable RLS
ALTER TABLE public.options_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options_change_history ENABLE ROW LEVEL SECURITY;

-- Policies for Options Data
DROP POLICY IF EXISTS "Anyone can view options data" ON public.options_data;
CREATE POLICY "Anyone can view options data" ON public.options_data FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage options data" ON public.options_data;
CREATE POLICY "Admins can manage options data" ON public.options_data FOR ALL USING (public.is_admin());

-- Policies for Options History
DROP POLICY IF EXISTS "Anyone can view options history" ON public.options_change_history;
CREATE POLICY "Anyone can view options history" ON public.options_change_history FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage options history" ON public.options_change_history;
CREATE POLICY "Admins can manage options history" ON public.options_change_history FOR ALL USING (public.is_admin());
