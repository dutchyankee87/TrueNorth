export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enum types
export type MentalClarity = "yes" | "somewhat" | "no";
export type EmotionalState = "nothing" | "minor" | "significant";
export type PhysicalEnergy = "good" | "ok" | "low";
export type LoopStatus = "open" | "closed" | "archived";
export type CommitmentType = "promise" | "decision" | "waiting" | "follow_up" | "vague_pull";
export type LoopSource = "manual" | "context_extraction" | "integration" | "system_inquiry";
export type GuidanceType = "next_action" | "pause" | "close_loop" | "embody";
export type TargetDeficit = "mental" | "emotional" | "physical" | "general";
export type ExecutionStatus = "yes" | "partial" | "no";
export type PostShift = "notable" | "slight" | "none";
export type RuleType = "practice_preference" | "timing_pattern" | "domain_threshold" | "anti_pattern_trigger";
export type PostMeditationState = "expanded" | "calm" | "neutral" | "distracted";
export type EmbodimentShift = "deep" | "moderate" | "slight" | "none";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          onboarding_completed: boolean;
          timezone: string;
        };
        Insert: {
          id: string;
          created_at?: string;
          onboarding_completed?: boolean;
          timezone?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          onboarding_completed?: boolean;
          timezone?: string;
        };
      };
      identity_anchors: {
        Row: {
          id: string;
          user_id: string;
          core_identity: string;
          primary_constraint: string | null;
          decision_filter: string | null;
          anti_patterns: string[] | null;
          current_phase: string | null;
          // Vision fields (Joe Dispenza inspired)
          future_vision: string | null;
          leaving_behind: string[] | null;
          elevated_emotions: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          core_identity: string;
          primary_constraint?: string | null;
          decision_filter?: string | null;
          anti_patterns?: string[] | null;
          current_phase?: string | null;
          future_vision?: string | null;
          leaving_behind?: string[] | null;
          elevated_emotions?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          core_identity?: string;
          primary_constraint?: string | null;
          decision_filter?: string | null;
          anti_patterns?: string[] | null;
          current_phase?: string | null;
          future_vision?: string | null;
          leaving_behind?: string[] | null;
          elevated_emotions?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      domains: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          identity_weight: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          identity_weight?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          identity_weight?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      open_loops: {
        Row: {
          id: string;
          user_id: string;
          domain_id: string | null;
          description: string;
          source: LoopSource;
          commitment_type: CommitmentType | null;
          external_party: string | null;
          deadline: string | null;
          cognitive_pull: number;
          context_dump_mentions: number;
          last_mentioned: string | null;
          status: LoopStatus;
          created_at: string;
          closed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          domain_id?: string | null;
          description: string;
          source?: LoopSource;
          commitment_type?: CommitmentType | null;
          external_party?: string | null;
          deadline?: string | null;
          cognitive_pull?: number;
          context_dump_mentions?: number;
          last_mentioned?: string | null;
          status?: LoopStatus;
          created_at?: string;
          closed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          domain_id?: string | null;
          description?: string;
          source?: LoopSource;
          commitment_type?: CommitmentType | null;
          external_party?: string | null;
          deadline?: string | null;
          cognitive_pull?: number;
          context_dump_mentions?: number;
          last_mentioned?: string | null;
          status?: LoopStatus;
          created_at?: string;
          closed_at?: string | null;
        };
      };
      practices: {
        Row: {
          id: string;
          name: string;
          duration_seconds: number;
          target_deficit: TargetDeficit;
          instructions: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          duration_seconds: number;
          target_deficit: TargetDeficit;
          instructions: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          duration_seconds?: number;
          target_deficit?: TargetDeficit;
          instructions?: Json;
          created_at?: string;
        };
      };
      daily_states: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          mental_clarity: MentalClarity;
          emotional_state: EmotionalState;
          physical_energy: PhysicalEnergy;
          context_dump: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          mental_clarity: MentalClarity;
          emotional_state: EmotionalState;
          physical_energy: PhysicalEnergy;
          context_dump?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          mental_clarity?: MentalClarity;
          emotional_state?: EmotionalState;
          physical_energy?: PhysicalEnergy;
          context_dump?: string | null;
          created_at?: string;
        };
      };
      practice_events: {
        Row: {
          id: string;
          user_id: string;
          daily_state_id: string;
          practice_id: string | null;
          completed: boolean;
          skipped: boolean;
          pre_state: Json | null;
          post_shift: PostShift | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          daily_state_id: string;
          practice_id?: string | null;
          completed?: boolean;
          skipped?: boolean;
          pre_state?: Json | null;
          post_shift?: PostShift | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          daily_state_id?: string;
          practice_id?: string | null;
          completed?: boolean;
          skipped?: boolean;
          pre_state?: Json | null;
          post_shift?: PostShift | null;
          created_at?: string;
        };
      };
      guidance_events: {
        Row: {
          id: string;
          user_id: string;
          daily_state_id: string;
          practice_event_id: string | null;
          guidance_type: GuidanceType;
          referenced_loop_id: string | null;
          guidance_text: string;
          reasoning: string | null;
          effective_state: Json | null;
          confidence_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          daily_state_id: string;
          practice_event_id?: string | null;
          guidance_type: GuidanceType;
          referenced_loop_id?: string | null;
          guidance_text: string;
          reasoning?: string | null;
          effective_state?: Json | null;
          confidence_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          daily_state_id?: string;
          practice_event_id?: string | null;
          guidance_type?: GuidanceType;
          referenced_loop_id?: string | null;
          guidance_text?: string;
          reasoning?: string | null;
          effective_state?: Json | null;
          confidence_score?: number | null;
          created_at?: string;
        };
      };
      action_reflections: {
        Row: {
          id: string;
          guidance_event_id: string;
          executed: ExecutionStatus | null;
          clarity_delta: number | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          guidance_event_id: string;
          executed?: ExecutionStatus | null;
          clarity_delta?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          guidance_event_id?: string;
          executed?: ExecutionStatus | null;
          clarity_delta?: number | null;
          note?: string | null;
          created_at?: string;
        };
      };
      personalized_rules: {
        Row: {
          id: string;
          user_id: string;
          rule_type: RuleType;
          rule_content: Json;
          confidence: number;
          sample_size: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          rule_type: RuleType;
          rule_content: Json;
          confidence?: number;
          sample_size?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          rule_type?: RuleType;
          rule_content?: Json;
          confidence?: number;
          sample_size?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      meditation_sessions: {
        Row: {
          id: string;
          user_id: string;
          did_future_self_viz: boolean;
          coherence_duration_seconds: number;
          breath_pattern: string;
          post_meditation_state: PostMeditationState | null;
          hrv_data: Json | null;
          coherence_score: number | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          did_future_self_viz?: boolean;
          coherence_duration_seconds: number;
          breath_pattern?: string;
          post_meditation_state?: PostMeditationState | null;
          hrv_data?: Json | null;
          coherence_score?: number | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          did_future_self_viz?: boolean;
          coherence_duration_seconds?: number;
          breath_pattern?: string;
          post_meditation_state?: PostMeditationState | null;
          hrv_data?: Json | null;
          coherence_score?: number | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      embodiment_events: {
        Row: {
          id: string;
          user_id: string;
          meditation_session_id: string;
          embodiment_text: string;
          target_emotion: string | null;
          target_duration_seconds: number;
          completed: boolean;
          skipped: boolean;
          actual_duration_seconds: number | null;
          felt_shift: EmbodimentShift | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meditation_session_id: string;
          embodiment_text: string;
          target_emotion?: string | null;
          target_duration_seconds?: number;
          completed?: boolean;
          skipped?: boolean;
          actual_duration_seconds?: number | null;
          felt_shift?: EmbodimentShift | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meditation_session_id?: string;
          embodiment_text?: string;
          target_emotion?: string | null;
          target_duration_seconds?: number;
          completed?: boolean;
          skipped?: boolean;
          actual_duration_seconds?: number | null;
          felt_shift?: EmbodimentShift | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Helper types for easier access
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type IdentityAnchor = Database["public"]["Tables"]["identity_anchors"]["Row"];
export type Domain = Database["public"]["Tables"]["domains"]["Row"];
export type OpenLoop = Database["public"]["Tables"]["open_loops"]["Row"];
export type Practice = Database["public"]["Tables"]["practices"]["Row"];
export type DailyState = Database["public"]["Tables"]["daily_states"]["Row"];
export type PracticeEvent = Database["public"]["Tables"]["practice_events"]["Row"];
export type GuidanceEvent = Database["public"]["Tables"]["guidance_events"]["Row"];
export type ActionReflection = Database["public"]["Tables"]["action_reflections"]["Row"];
export type PersonalizedRule = Database["public"]["Tables"]["personalized_rules"]["Row"];
export type MeditationSession = Database["public"]["Tables"]["meditation_sessions"]["Row"];
export type EmbodimentEvent = Database["public"]["Tables"]["embodiment_events"]["Row"];

// Practice instruction type
export interface PracticeInstruction {
  offset: number;
  text: string;
  duration: number;
}
