// Script to apply RLS policies and triggers after Drizzle migration
// Run with: npx tsx scripts/apply-rls.ts

import postgres from "postgres";
import * as dotenv from "dotenv";

// Load .env.local
dotenv.config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

async function applyRLS() {
  const sql = postgres(DATABASE_URL as string);

  console.log("🔒 Enabling Row Level Security...");

  // Enable RLS on all tables
  await sql`ALTER TABLE profiles ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE identity_anchors ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE domains ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE open_loops ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE daily_states ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE practice_events ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE guidance_events ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE action_reflections ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE personalized_rules ENABLE ROW LEVEL SECURITY`;

  console.log("📋 Creating RLS policies...");

  // Drop existing policies first (in case of re-run)
  await sql`DROP POLICY IF EXISTS "Users can view own profile" ON profiles`;
  await sql`DROP POLICY IF EXISTS "Users can manage own identity" ON identity_anchors`;
  await sql`DROP POLICY IF EXISTS "Users can manage own domains" ON domains`;
  await sql`DROP POLICY IF EXISTS "Users can manage own loops" ON open_loops`;
  await sql`DROP POLICY IF EXISTS "Users can manage own states" ON daily_states`;
  await sql`DROP POLICY IF EXISTS "Users can manage own practice events" ON practice_events`;
  await sql`DROP POLICY IF EXISTS "Users can manage own guidance" ON guidance_events`;
  await sql`DROP POLICY IF EXISTS "Users can manage own reflections" ON action_reflections`;
  await sql`DROP POLICY IF EXISTS "Users can manage own rules" ON personalized_rules`;

  // Create RLS policies (users can only access their own data)
  await sql`CREATE POLICY "Users can view own profile" ON profiles FOR ALL USING (auth.uid() = id)`;
  await sql`CREATE POLICY "Users can manage own identity" ON identity_anchors FOR ALL USING (auth.uid() = user_id)`;
  await sql`CREATE POLICY "Users can manage own domains" ON domains FOR ALL USING (auth.uid() = user_id)`;
  await sql`CREATE POLICY "Users can manage own loops" ON open_loops FOR ALL USING (auth.uid() = user_id)`;
  await sql`CREATE POLICY "Users can manage own states" ON daily_states FOR ALL USING (auth.uid() = user_id)`;
  await sql`CREATE POLICY "Users can manage own practice events" ON practice_events FOR ALL USING (auth.uid() = user_id)`;
  await sql`CREATE POLICY "Users can manage own guidance" ON guidance_events FOR ALL USING (auth.uid() = user_id)`;
  await sql`CREATE POLICY "Users can manage own reflections" ON action_reflections FOR ALL USING (
    auth.uid() = (SELECT user_id FROM guidance_events WHERE id = guidance_event_id)
  )`;
  await sql`CREATE POLICY "Users can manage own rules" ON personalized_rules FOR ALL USING (auth.uid() = user_id)`;

  console.log("⚡ Creating triggers and functions...");

  // Function to create profile on user signup
  await sql`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO public.profiles (id)
      VALUES (new.id);
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER
  `;

  // Drop and recreate trigger
  await sql`DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`;
  await sql`
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()
  `;

  // Function to increment context dump mentions
  await sql`
    CREATE OR REPLACE FUNCTION increment_context_dump_mentions(loop_id UUID)
    RETURNS void AS $$
    BEGIN
      UPDATE public.open_loops
      SET
        context_dump_mentions = context_dump_mentions + 1,
        last_mentioned = NOW()
      WHERE id = loop_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER
  `;

  console.log("📇 Creating indexes...");

  await sql`CREATE INDEX IF NOT EXISTS idx_open_loops_user_status ON open_loops(user_id, status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_daily_states_user_date ON daily_states(user_id, date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_guidance_events_user_date ON guidance_events(user_id, created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_practice_events_user ON practice_events(user_id, created_at)`;

  console.log("✅ RLS, triggers, and indexes applied!");

  await sql.end();
}

applyRLS().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});




