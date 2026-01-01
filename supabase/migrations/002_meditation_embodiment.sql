-- Migration: Add Meditation Sessions and Embodiment Events
-- Joe Dispenza-aligned transformation integration

-- 1. Meditation Sessions (coherence practice)
CREATE TABLE IF NOT EXISTS public.meditation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Pre-meditation
  did_future_self_viz BOOLEAN DEFAULT FALSE,

  -- Coherence breathing
  coherence_duration_seconds INTEGER NOT NULL,
  breath_pattern TEXT DEFAULT '5-5',

  -- Post-meditation state (self-reported)
  post_meditation_state TEXT CHECK (post_meditation_state IN ('expanded', 'calm', 'neutral', 'distracted')),

  -- Reserved for HeartMath/HRV integration
  hrv_data JSONB,
  coherence_score DECIMAL(3,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Embodiment Events (EMBODY guidance type)
CREATE TABLE IF NOT EXISTS public.embodiment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  meditation_session_id UUID REFERENCES public.meditation_sessions(id) ON DELETE CASCADE,

  -- The embodiment guidance
  embodiment_text TEXT NOT NULL,
  target_emotion TEXT,
  target_duration_seconds INTEGER DEFAULT 900,

  -- Outcome
  completed BOOLEAN DEFAULT FALSE,
  skipped BOOLEAN DEFAULT FALSE,
  actual_duration_seconds INTEGER,
  felt_shift TEXT CHECK (felt_shift IN ('deep', 'moderate', 'slight', 'none')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add columns to daily_states (if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_states' AND column_name = 'meditation_session_id') THEN
    ALTER TABLE public.daily_states ADD COLUMN meditation_session_id UUID REFERENCES public.meditation_sessions(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_states' AND column_name = 'post_meditation_dump') THEN
    ALTER TABLE public.daily_states ADD COLUMN post_meditation_dump TEXT;
  END IF;
END $$;

-- 4. Update guidance_events constraint for 'embody' type
ALTER TABLE public.guidance_events DROP CONSTRAINT IF EXISTS guidance_events_guidance_type_check;
ALTER TABLE public.guidance_events ADD CONSTRAINT guidance_events_guidance_type_check
  CHECK (guidance_type IN ('next_action', 'pause', 'close_loop', 'embody'));

-- 5. Add columns to guidance_events (if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guidance_events' AND column_name = 'meditation_session_id') THEN
    ALTER TABLE public.guidance_events ADD COLUMN meditation_session_id UUID REFERENCES public.meditation_sessions(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guidance_events' AND column_name = 'embodiment_event_id') THEN
    ALTER TABLE public.guidance_events ADD COLUMN embodiment_event_id UUID REFERENCES public.embodiment_events(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user ON public.meditation_sessions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_embodiment_events_user ON public.embodiment_events(user_id, created_at);

-- 7. RLS
ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embodiment_events ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies (drop if exists first to avoid errors)
DROP POLICY IF EXISTS "Users can manage own meditation sessions" ON public.meditation_sessions;
DROP POLICY IF EXISTS "Users can manage own embodiment events" ON public.embodiment_events;

CREATE POLICY "Users can manage own meditation sessions" ON public.meditation_sessions
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own embodiment events" ON public.embodiment_events
  FOR ALL USING (auth.uid() = user_id);
