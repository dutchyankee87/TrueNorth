CREATE TABLE "action_reflections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guidance_event_id" uuid,
	"executed" text,
	"clarity_delta" integer,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "action_reflections_guidance_event_id_unique" UNIQUE("guidance_event_id")
);
--> statement-breakpoint
CREATE TABLE "daily_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"date" date NOT NULL,
	"mental_clarity" text NOT NULL,
	"emotional_state" text NOT NULL,
	"physical_energy" text NOT NULL,
	"context_dump" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "daily_states_user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"identity_weight" numeric(3, 2) DEFAULT '0.5',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "domains_user_id_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
CREATE TABLE "guidance_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"daily_state_id" uuid,
	"practice_event_id" uuid,
	"guidance_type" text NOT NULL,
	"referenced_loop_id" uuid,
	"guidance_text" text NOT NULL,
	"reasoning" text,
	"effective_state" jsonb,
	"confidence_score" numeric(3, 2),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "identity_anchors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"core_identity" text NOT NULL,
	"primary_constraint" text,
	"decision_filter" text,
	"anti_patterns" text[],
	"current_phase" text,
	"future_vision" text,
	"leaving_behind" text[],
	"elevated_emotions" text[],
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "identity_anchors_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "open_loops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"domain_id" uuid,
	"description" text NOT NULL,
	"source" text DEFAULT 'manual',
	"commitment_type" text,
	"external_party" text,
	"deadline" timestamp with time zone,
	"cognitive_pull" integer DEFAULT 3,
	"context_dump_mentions" integer DEFAULT 0,
	"last_mentioned" timestamp with time zone,
	"status" text DEFAULT 'open',
	"created_at" timestamp with time zone DEFAULT now(),
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "personalized_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"rule_type" text NOT NULL,
	"rule_content" jsonb NOT NULL,
	"confidence" numeric(3, 2) DEFAULT '0.5',
	"sample_size" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "practice_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"daily_state_id" uuid,
	"practice_id" uuid,
	"completed" boolean DEFAULT false,
	"skipped" boolean DEFAULT false,
	"pre_state" jsonb,
	"post_shift" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "practices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"duration_seconds" integer NOT NULL,
	"target_deficit" text NOT NULL,
	"instructions" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"onboarding_completed" boolean DEFAULT false,
	"timezone" text DEFAULT 'Europe/Amsterdam'
);
--> statement-breakpoint
ALTER TABLE "action_reflections" ADD CONSTRAINT "action_reflections_guidance_event_id_guidance_events_id_fk" FOREIGN KEY ("guidance_event_id") REFERENCES "public"."guidance_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_states" ADD CONSTRAINT "daily_states_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domains" ADD CONSTRAINT "domains_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guidance_events" ADD CONSTRAINT "guidance_events_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guidance_events" ADD CONSTRAINT "guidance_events_daily_state_id_daily_states_id_fk" FOREIGN KEY ("daily_state_id") REFERENCES "public"."daily_states"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guidance_events" ADD CONSTRAINT "guidance_events_practice_event_id_practice_events_id_fk" FOREIGN KEY ("practice_event_id") REFERENCES "public"."practice_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guidance_events" ADD CONSTRAINT "guidance_events_referenced_loop_id_open_loops_id_fk" FOREIGN KEY ("referenced_loop_id") REFERENCES "public"."open_loops"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity_anchors" ADD CONSTRAINT "identity_anchors_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "open_loops" ADD CONSTRAINT "open_loops_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "open_loops" ADD CONSTRAINT "open_loops_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personalized_rules" ADD CONSTRAINT "personalized_rules_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_events" ADD CONSTRAINT "practice_events_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_events" ADD CONSTRAINT "practice_events_daily_state_id_daily_states_id_fk" FOREIGN KEY ("daily_state_id") REFERENCES "public"."daily_states"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_events" ADD CONSTRAINT "practice_events_practice_id_practices_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practices"("id") ON DELETE set null ON UPDATE no action;