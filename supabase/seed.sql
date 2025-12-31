-- Seed Data: Elevation Practices
-- Run this after schema.sql

INSERT INTO public.practices (name, duration_seconds, target_deficit, instructions) VALUES
(
  'Coherence Breath',
  60,
  'general',
  '[
    {"offset": 0, "text": "Close your eyes.", "duration": 3},
    {"offset": 3, "text": "Breathe slowly into your heart area.", "duration": 20},
    {"offset": 23, "text": "Bring to mind something you are genuinely grateful for.", "duration": 5},
    {"offset": 28, "text": "Feel it, do not just think it.", "duration": 25},
    {"offset": 53, "text": "When ready, open your eyes.", "duration": 7}
  ]'::jsonb
),
(
  'Release and Reset',
  90,
  'emotional',
  '[
    {"offset": 0, "text": "Close your eyes.", "duration": 3},
    {"offset": 3, "text": "Take a breath and notice where in your body you are holding tension.", "duration": 15},
    {"offset": 18, "text": "Whatever is pulling at you — you do not need to solve it right now.", "duration": 10},
    {"offset": 28, "text": "Just acknowledge it is there.", "duration": 10},
    {"offset": 38, "text": "Take a deep breath in...", "duration": 5},
    {"offset": 43, "text": "And as you exhale, let your body release just 10% of that tension.", "duration": 15},
    {"offset": 58, "text": "Again. Breathe in...", "duration": 5},
    {"offset": 63, "text": "And release another 10%.", "duration": 12},
    {"offset": 75, "text": "When ready, open your eyes.", "duration": 15}
  ]'::jsonb
),
(
  'Body Activation',
  60,
  'physical',
  '[
    {"offset": 0, "text": "Stand up if you can.", "duration": 5},
    {"offset": 5, "text": "Take three deep breaths, filling your lungs completely.", "duration": 15},
    {"offset": 20, "text": "Roll your shoulders back. Shake out your hands.", "duration": 15},
    {"offset": 35, "text": "Take one more deep breath —", "duration": 5},
    {"offset": 40, "text": "As you exhale, imagine sending energy down through your legs into the ground.", "duration": 12},
    {"offset": 52, "text": "Notice if anything shifted.", "duration": 8}
  ]'::jsonb
),
(
  'Clarity Drop',
  90,
  'mental',
  '[
    {"offset": 0, "text": "Close your eyes.", "duration": 3},
    {"offset": 3, "text": "Notice any thoughts that arise, but do not follow them.", "duration": 10},
    {"offset": 13, "text": "Just notice... and let them pass.", "duration": 30},
    {"offset": 43, "text": "Each thought is like a cloud moving across the sky.", "duration": 7},
    {"offset": 50, "text": "You are the sky, not the clouds.", "duration": 30},
    {"offset": 80, "text": "When ready, open your eyes. See if there is a bit more space now.", "duration": 10}
  ]'::jsonb
);
