-- Coherence OS Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users (handled by Supabase Auth, but we extend it)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  timezone TEXT DEFAULT 'Europe/Amsterdam'
);

-- 2. Identity Anchor (who the user is becoming + their vision for transformation)
-- Includes Joe Dispenza-inspired vision fields for conscious transformation
CREATE TABLE public.identity_anchors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Core identity fields
  core_identity TEXT NOT NULL,
  primary_constraint TEXT,
  decision_filter TEXT,
  anti_patterns TEXT[],
  current_phase TEXT,
  
  -- Vision fields (Joe Dispenza inspired)
  future_vision TEXT,              -- Who they're becoming, what they're creating
  leaving_behind TEXT[],           -- Old patterns/identities they're releasing
  elevated_emotions TEXT[],        -- Emotions they want to feel more fully
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Domains (areas of responsibility)
CREATE TABLE public.domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  identity_weight DECIMAL(3,2) DEFAULT 0.5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 4. Open Loops (cognitive load items — NOT tasks)
CREATE TABLE public.open_loops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  source TEXT DEFAULT 'manual',
  commitment_type TEXT,
  external_party TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  cognitive_pull INTEGER DEFAULT 3 CHECK (cognitive_pull BETWEEN 1 AND 5),
  context_dump_mentions INTEGER DEFAULT 0,
  last_mentioned TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Elevation Practices
CREATE TABLE public.practices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  target_deficit TEXT NOT NULL,
  instructions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Daily State Check-ins
CREATE TABLE public.daily_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mental_clarity TEXT NOT NULL CHECK (mental_clarity IN ('yes', 'somewhat', 'no')),
  emotional_state TEXT NOT NULL CHECK (emotional_state IN ('nothing', 'minor', 'significant')),
  physical_energy TEXT NOT NULL CHECK (physical_energy IN ('good', 'ok', 'low')),
  context_dump TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 7. Practice Events (when user does an elevation practice)
CREATE TABLE public.practice_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  daily_state_id UUID REFERENCES public.daily_states(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES public.practices(id) ON DELETE SET NULL,
  completed BOOLEAN DEFAULT FALSE,
  skipped BOOLEAN DEFAULT FALSE,
  pre_state JSONB,
  post_shift TEXT CHECK (post_shift IN ('notable', 'slight', 'none')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Guidance Events (the system's daily output)
CREATE TABLE public.guidance_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  daily_state_id UUID REFERENCES public.daily_states(id) ON DELETE CASCADE,
  practice_event_id UUID REFERENCES public.practice_events(id) ON DELETE SET NULL,
  guidance_type TEXT NOT NULL CHECK (guidance_type IN ('next_action', 'pause', 'close_loop')),
  referenced_loop_id UUID REFERENCES public.open_loops(id) ON DELETE SET NULL,
  guidance_text TEXT NOT NULL,
  reasoning TEXT,
  effective_state JSONB,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Action Reflections (end-of-day feedback)
CREATE TABLE public.action_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guidance_event_id UUID REFERENCES public.guidance_events(id) ON DELETE CASCADE,
  executed TEXT CHECK (executed IN ('yes', 'partial', 'no')),
  clarity_delta INTEGER CHECK (clarity_delta BETWEEN -2 AND 2),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(guidance_event_id)
);

-- 10. Personalized Rules (learned patterns)
CREATE TABLE public.personalized_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL,
  rule_content JSONB NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0.5,
  sample_size INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_open_loops_user_status ON public.open_loops(user_id, status);
CREATE INDEX idx_daily_states_user_date ON public.daily_states(user_id, date);
CREATE INDEX idx_guidance_events_user_date ON public.guidance_events(user_id, created_at);
CREATE INDEX idx_practice_events_user ON public.practice_events(user_id, created_at);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_loops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guidance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can view own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own identity" ON public.identity_anchors FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own domains" ON public.domains FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own loops" ON public.open_loops FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own states" ON public.daily_states FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own practice events" ON public.practice_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own guidance" ON public.guidance_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own reflections" ON public.action_reflections FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.guidance_events WHERE id = guidance_event_id)
);
CREATE POLICY "Users can manage own rules" ON public.personalized_rules FOR ALL USING (auth.uid() = user_id);

-- Function to increment context dump mentions
CREATE OR REPLACE FUNCTION increment_context_dump_mentions(loop_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.open_loops
  SET
    context_dump_mentions = context_dump_mentions + 1,
    last_mentioned = NOW()
  WHERE id = loop_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
