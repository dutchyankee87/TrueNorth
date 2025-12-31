// Script to drop all tables and re-apply the Drizzle schema
// Run with: npx tsx scripts/reset-db.ts

import postgres from "postgres";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

// Load .env.local
dotenv.config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

async function resetDatabase() {
  const sql = postgres(DATABASE_URL as string);

  console.log("🗑️  Dropping existing tables...");

  // Drop all tables in dependency order (children first, parents last)
  await sql`DROP TABLE IF EXISTS action_reflections CASCADE`;
  await sql`DROP TABLE IF EXISTS guidance_events CASCADE`;
  await sql`DROP TABLE IF EXISTS practice_events CASCADE`;
  await sql`DROP TABLE IF EXISTS daily_states CASCADE`;
  await sql`DROP TABLE IF EXISTS open_loops CASCADE`;
  await sql`DROP TABLE IF EXISTS domains CASCADE`;
  await sql`DROP TABLE IF EXISTS identity_anchors CASCADE`;
  await sql`DROP TABLE IF EXISTS personalized_rules CASCADE`;
  await sql`DROP TABLE IF EXISTS practices CASCADE`;
  await sql`DROP TABLE IF EXISTS profiles CASCADE`;

  console.log("✅ Tables dropped");

  // Read and execute the Drizzle migration
  console.log("📦 Applying Drizzle migration...");

  const migrationPath = join(process.cwd(), "drizzle", "0000_flowery_xavin.sql");
  const migrationSql = readFileSync(migrationPath, "utf-8");

  // Split by statement breakpoint and execute each statement
  const statements = migrationSql.split("--> statement-breakpoint");

  for (const statement of statements) {
    const trimmed = statement.trim();
    if (trimmed) {
      await sql.unsafe(trimmed);
    }
  }

  console.log("✅ Migration applied successfully!");
  console.log("🎉 Database reset complete");

  await sql.end();
}

resetDatabase().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});


