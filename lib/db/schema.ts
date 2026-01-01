import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  decimal,
  integer,
  date,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";

// Profiles (extends Supabase auth.users)
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  timezone: text("timezone").default("Europe/Amsterdam"),
});

// Identity Anchors
// Stores the user's core identity AND their vision for transformation (Joe Dispenza inspired)
export const identityAnchors = pgTable("identity_anchors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  
  // Core identity fields
  coreIdentity: text("core_identity").notNull(),
  primaryConstraint: text("primary_constraint"),
  decisionFilter: text("decision_filter"),
  antiPatterns: text("anti_patterns").array(),
  currentPhase: text("current_phase"),
  
  // Vision fields (Joe Dispenza inspired transformation work)
  // "Who I'm becoming" - the future self they're stepping into
  futureVision: text("future_vision"),
  // What they're consciously releasing - old patterns, identities, behaviors
  leavingBehind: text("leaving_behind").array(),
  // The elevated emotions they want to cultivate (gratitude, love, joy, freedom, etc.)
  elevatedEmotions: text("elevated_emotions").array(),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  unique().on(table.userId),
]);

// Domains
export const domains = pgTable("domains", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  identityWeight: decimal("identity_weight", { precision: 3, scale: 2 }).default("0.5"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  unique().on(table.userId, table.name),
]);

// Open Loops
export const openLoops = pgTable("open_loops", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  domainId: uuid("domain_id").references(() => domains.id, { onDelete: "set null" }),
  description: text("description").notNull(),
  source: text("source").default("manual"),
  commitmentType: text("commitment_type"),
  externalParty: text("external_party"),
  deadline: timestamp("deadline", { withTimezone: true }),
  cognitivePull: integer("cognitive_pull").default(3),
  contextDumpMentions: integer("context_dump_mentions").default(0),
  lastMentioned: timestamp("last_mentioned", { withTimezone: true }),
  status: text("status").default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
});

// Practices
export const practices = pgTable("practices", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  targetDeficit: text("target_deficit").notNull(),
  instructions: jsonb("instructions").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Daily States
export const dailyStates = pgTable("daily_states", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  mentalClarity: text("mental_clarity").notNull(),
  emotionalState: text("emotional_state").notNull(),
  physicalEnergy: text("physical_energy").notNull(),
  contextDump: text("context_dump"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  unique().on(table.userId, table.date),
]);

// Practice Events
export const practiceEvents = pgTable("practice_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  dailyStateId: uuid("daily_state_id").references(() => dailyStates.id, { onDelete: "cascade" }),
  practiceId: uuid("practice_id").references(() => practices.id, { onDelete: "set null" }),
  completed: boolean("completed").default(false),
  skipped: boolean("skipped").default(false),
  preState: jsonb("pre_state"),
  postShift: text("post_shift"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Guidance Events
export const guidanceEvents = pgTable("guidance_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  dailyStateId: uuid("daily_state_id").references(() => dailyStates.id, { onDelete: "cascade" }),
  practiceEventId: uuid("practice_event_id").references(() => practiceEvents.id, { onDelete: "set null" }),
  guidanceType: text("guidance_type").notNull(),
  referencedLoopId: uuid("referenced_loop_id").references(() => openLoops.id, { onDelete: "set null" }),
  guidanceText: text("guidance_text").notNull(),
  reasoning: text("reasoning"),
  effectiveState: jsonb("effective_state"),
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Action Reflections
export const actionReflections = pgTable("action_reflections", {
  id: uuid("id").primaryKey().defaultRandom(),
  guidanceEventId: uuid("guidance_event_id").references(() => guidanceEvents.id, { onDelete: "cascade" }),
  executed: text("executed"),
  clarityDelta: integer("clarity_delta"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  unique().on(table.guidanceEventId),
]);

// Personalized Rules
export const personalizedRules = pgTable("personalized_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  ruleType: text("rule_type").notNull(),
  ruleContent: jsonb("rule_content").notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).default("0.5"),
  sampleSize: integer("sample_size").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Meditation Sessions (Joe Dispenza coherence practice)
export const meditationSessions = pgTable("meditation_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),

  // Pre-meditation
  didFutureSelfViz: boolean("did_future_self_viz").default(false),

  // Coherence breathing
  coherenceDurationSeconds: integer("coherence_duration_seconds").notNull(),
  breathPattern: text("breath_pattern").default("5-5"), // inhale-exhale seconds

  // Post-meditation state (self-reported)
  postMeditationState: text("post_meditation_state"), // expanded, calm, neutral, distracted

  // Reserved for HeartMath/HRV integration
  hrvData: jsonb("hrv_data"),
  coherenceScore: decimal("coherence_score", { precision: 3, scale: 2 }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// Embodiment Events (EMBODY guidance type)
export const embodimentEvents = pgTable("embodiment_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  meditationSessionId: uuid("meditation_session_id").references(() => meditationSessions.id, { onDelete: "cascade" }),

  // The embodiment guidance
  embodimentText: text("embodiment_text").notNull(),
  targetEmotion: text("target_emotion"),
  targetDurationSeconds: integer("target_duration_seconds").default(900), // 15 minutes default

  // Outcome
  completed: boolean("completed").default(false),
  skipped: boolean("skipped").default(false),
  actualDurationSeconds: integer("actual_duration_seconds"),
  feltShift: text("felt_shift"), // deep, moderate, slight, none

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
