import Anthropic from "@anthropic-ai/sdk";
import { POST_MEDITATION_EXTRACTION_PROMPT } from "./prompts";
import type { IdentityAnchor, OpenLoop, CommitmentType } from "@/lib/supabase/types";

export interface MeditationExtractionInput {
  content: string; // The post-meditation brain dump
  identityAnchor: IdentityAnchor | null;
  openLoops: OpenLoop[];
}

export interface ExtractedLoop {
  description: string;
  commitmentType: CommitmentType;
  externalParty: string | null;
  cognitivePull: number;
  fromElevatedState: boolean;
  confidence: number;
}

export interface VisionUpdate {
  type: "addition" | "refinement" | "clarification";
  content: string;
  reasoning: string;
}

export interface IdentityInsight {
  type: "identity" | "becoming" | "integration";
  content: string;
  reasoning: string;
}

export interface EmbodimentSuggestion {
  emotion: string;
  context: string;
  suggestedDurationMinutes: number;
}

export interface MeditationExtractionResult {
  openLoops: ExtractedLoop[];
  visionUpdates: VisionUpdate[];
  emotionShifts: string[];
  patternsReleasing: string[];
  identityInsights: IdentityInsight[];
  embodimentSuggestion: EmbodimentSuggestion | null;
  summary: string;
  coherenceLevel: "deep" | "moderate" | "light";
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
        `  Cognitive pull: ${loop.cognitive_pull}/5`,
        `  ID: ${loop.id}`,
      ].filter(Boolean);
      return parts.join("\n");
    })
    .join("\n\n");
}

export async function extractFromMeditation(
  input: MeditationExtractionInput
): Promise<MeditationExtractionResult> {
  const anthropic = new Anthropic();

  // Get vision fields from identity anchor
  const futureVision = input.identityAnchor?.future_vision || "Not yet defined.";
  const elevatedEmotions = input.identityAnchor?.elevated_emotions?.join(", ") || "Not yet defined.";
  const leavingBehind = input.identityAnchor?.leaving_behind?.join(", ") || "Not yet defined.";

  // Build the prompt with user context
  const prompt = POST_MEDITATION_EXTRACTION_PROMPT
    .replace("{identity_anchor}", formatIdentityAnchor(input.identityAnchor))
    .replace("{future_vision}", futureVision)
    .replace("{elevated_emotions}", elevatedEmotions)
    .replace("{leaving_behind}", leavingBehind)
    .replace("{open_loops}", formatOpenLoops(input.openLoops));

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Post-meditation brain dump:\n\n${input.content}`,
      },
    ],
    system: prompt,
  });

  // Extract text content
  const textContent = message.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from meditation extraction");
  }

  // Parse JSON response
  try {
    const parsed = JSON.parse(textContent.text);

    return {
      openLoops: parsed.openLoops || [],
      visionUpdates: parsed.visionUpdates || [],
      emotionShifts: parsed.emotionShifts || [],
      patternsReleasing: parsed.patternsReleasing || [],
      identityInsights: parsed.identityInsights || [],
      embodimentSuggestion: parsed.embodimentSuggestion || null,
      summary: parsed.summary || "Meditation insights processed.",
      coherenceLevel: parsed.coherenceLevel || "moderate",
    };
  } catch {
    // Fallback: if parsing fails, return empty results
    console.error("Failed to parse meditation extraction response:", textContent.text);
    return {
      openLoops: [],
      visionUpdates: [],
      emotionShifts: [],
      patternsReleasing: [],
      identityInsights: [],
      embodimentSuggestion: null,
      summary: "Unable to parse meditation insights. Your reflections are still valuable.",
      coherenceLevel: "light",
    };
  }
}
