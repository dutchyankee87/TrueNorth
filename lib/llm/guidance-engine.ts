import Anthropic from "@anthropic-ai/sdk";
import { GUIDANCE_ENGINE_PROMPT } from "./prompts";
import type {
  IdentityAnchor,
  OpenLoop,
  PersonalizedRule,
  GuidanceType,
} from "@/lib/supabase/types";
import type { StateGateInput } from "./state-gate";

export interface GuidanceInput {
  identityAnchor: IdentityAnchor | null;
  personalizedRules: PersonalizedRule[];
  effectiveState: StateGateInput & { postPracticeShift?: string | null };
  openLoops: OpenLoop[];
  contextDump: string | null;
  postEmbodimentContext?: string | null; // Context from completed embodiment practice
}

export interface GuidanceResult {
  decision: GuidanceType;
  output: string;
  referencedLoopId: string | null;
  reasoning: string;
  confidence: number;
}

function formatIdentityAnchor(anchor: IdentityAnchor | null): string {
  if (!anchor) {
    return "No identity anchor set yet.";
  }

  const parts = [
    `Core identity: ${anchor.core_identity}`,
    anchor.primary_constraint && `Primary constraint: ${anchor.primary_constraint}`,
    anchor.decision_filter && `Decision filter: ${anchor.decision_filter}`,
    anchor.anti_patterns?.length && `Anti-patterns to avoid: ${anchor.anti_patterns.join(", ")}`,
    anchor.current_phase && `Current phase: ${anchor.current_phase}`,
  ].filter(Boolean);

  return parts.join("\n");
}

function formatOpenLoops(loops: OpenLoop[]): string {
  if (loops.length === 0) {
    return "No open loops captured yet.";
  }

  return loops
    .map((loop) => {
      const parts = [
        `- ${loop.description}`,
        loop.commitment_type && `  Type: ${loop.commitment_type}`,
        loop.external_party && `  External party: ${loop.external_party}`,
        loop.deadline && `  Deadline: ${loop.deadline}`,
        `  Cognitive pull: ${loop.cognitive_pull}/5`,
        loop.context_dump_mentions > 0 && `  Mentioned ${loop.context_dump_mentions} times in context dumps`,
        `  ID: ${loop.id}`,
      ].filter(Boolean);
      return parts.join("\n");
    })
    .join("\n\n");
}

function formatEffectiveState(state: GuidanceInput["effectiveState"]): string {
  const parts = [
    `Mental clarity: ${state.mental}`,
    `Emotional state: ${state.emotional}`,
    `Physical energy: ${state.physical}`,
  ];

  if (state.postPracticeShift) {
    parts.push(`Post-practice shift: ${state.postPracticeShift}`);
  }

  return parts.join("\n");
}

function formatPersonalizedRules(rules: PersonalizedRule[]): string {
  if (rules.length === 0) {
    return "No personalized rules learned yet.";
  }

  return rules
    .map((rule) => `- ${rule.rule_type}: ${JSON.stringify(rule.rule_content)} (confidence: ${rule.confidence})`)
    .join("\n");
}

export async function generateGuidance(input: GuidanceInput): Promise<GuidanceResult> {
  const anthropic = new Anthropic();

  // Build the prompt with user context
  const prompt = GUIDANCE_ENGINE_PROMPT
    .replace("{identity_anchor}", formatIdentityAnchor(input.identityAnchor))
    .replace("{personalized_rules}", formatPersonalizedRules(input.personalizedRules))
    .replace("{effective_state}", formatEffectiveState(input.effectiveState))
    .replace("{open_loops}", formatOpenLoops(input.openLoops))
    .replace("{context_dump}", input.contextDump || "No additional context provided.")
    .replace("{post_embodiment_context}", input.postEmbodimentContext || "N/A - no embodiment practice completed.");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: "Generate today's guidance based on the context provided.",
      },
    ],
    system: prompt,
  });

  // Extract text content
  const textContent = message.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from guidance engine");
  }

  // Parse JSON response
  try {
    const parsed = JSON.parse(textContent.text);

    // Map decision string to GuidanceType
    const decisionMap: Record<string, GuidanceType> = {
      NEXT_ACTION: "next_action",
      PAUSE: "pause",
      CLOSE_LOOP: "close_loop",
      EMBODY: "embody",
    };

    return {
      decision: decisionMap[parsed.decision] || "pause",
      output: parsed.output,
      referencedLoopId: parsed.referenced_loop_id || null,
      reasoning: parsed.reasoning,
      confidence: parsed.confidence || 0.5,
    };
  } catch {
    // Fallback: if parsing fails, return safe default (PAUSE)
    console.error("Failed to parse guidance response:", textContent.text);
    return {
      decision: "pause",
      output: "Take a moment. The system couldn't determine clear guidance right now.",
      referencedLoopId: null,
      reasoning: "Parsing error; defaulting to pause for safety.",
      confidence: 0.3,
    };
  }
}
