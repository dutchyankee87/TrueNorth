import Anthropic from "@anthropic-ai/sdk";
import { EMBODIMENT_GUIDANCE_PROMPT } from "./prompts";
import type { IdentityAnchor, OpenLoop } from "@/lib/supabase/types";
import type { MeditationExtractionResult, EmbodimentSuggestion } from "./meditation-extraction";

export interface EmbodimentInput {
  identityAnchor: IdentityAnchor | null;
  extractionResult: MeditationExtractionResult;
  openLoops: OpenLoop[]; // High cognitive pull loops
}

export interface EmbodimentResult {
  embodimentText: string;
  targetEmotion: string;
  targetOutcome: string;
  suggestedDurationMinutes: number;
  reasoning: string;
}

function formatVisionUpdates(updates: MeditationExtractionResult["visionUpdates"]): string {
  if (updates.length === 0) {
    return "No vision updates from this meditation.";
  }

  return updates
    .map((update) => `- [${update.type}] ${update.content}`)
    .join("\n");
}

function formatKeyLoops(loops: OpenLoop[]): string {
  if (loops.length === 0) {
    return "No high-priority open loops.";
  }

  // Only show top 3 highest cognitive pull loops
  return loops
    .sort((a, b) => (b.cognitive_pull || 0) - (a.cognitive_pull || 0))
    .slice(0, 3)
    .map((loop) => `- ${loop.description} (pull: ${loop.cognitive_pull}/5)`)
    .join("\n");
}

function formatEmbodimentSuggestion(suggestion: EmbodimentSuggestion | null): string {
  if (!suggestion) {
    return "No specific suggestion from extraction.";
  }

  return `Emotion: ${suggestion.emotion}\nContext: ${suggestion.context}\nDuration: ${suggestion.suggestedDurationMinutes} minutes`;
}

export async function generateEmbodiment(input: EmbodimentInput): Promise<EmbodimentResult> {
  const anthropic = new Anthropic();

  // Get vision fields from identity anchor
  const futureVision = input.identityAnchor?.future_vision || "Not yet defined.";
  const elevatedEmotions = input.identityAnchor?.elevated_emotions?.join(", ") || "Not yet defined.";

  // Build the prompt with user context
  const prompt = EMBODIMENT_GUIDANCE_PROMPT
    .replace("{future_vision}", futureVision)
    .replace("{elevated_emotions}", elevatedEmotions)
    .replace("{vision_updates}", formatVisionUpdates(input.extractionResult.visionUpdates))
    .replace("{key_loops}", formatKeyLoops(input.openLoops))
    .replace("{extraction_summary}", input.extractionResult.summary)
    .replace("{embodiment_suggestion}", formatEmbodimentSuggestion(input.extractionResult.embodimentSuggestion));

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: "Generate the embodiment guidance based on the meditation extraction and user context.",
      },
    ],
    system: prompt,
  });

  // Extract text content
  const textContent = message.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from embodiment engine");
  }

  // Parse JSON response
  try {
    const parsed = JSON.parse(textContent.text);

    return {
      embodimentText: parsed.embodimentText,
      targetEmotion: parsed.targetEmotion,
      targetOutcome: parsed.targetOutcome,
      suggestedDurationMinutes: parsed.suggestedDurationMinutes || 15,
      reasoning: parsed.reasoning,
    };
  } catch {
    // Fallback: create a generic but meaningful embodiment
    console.error("Failed to parse embodiment response:", textContent.text);

    // Use the extraction suggestion if available
    const suggestion = input.extractionResult.embodimentSuggestion;
    if (suggestion) {
      return {
        embodimentText: `Spend ${suggestion.suggestedDurationMinutes} minutes feeling the ${suggestion.emotion} of ${suggestion.context}.`,
        targetEmotion: suggestion.emotion,
        targetOutcome: suggestion.context,
        suggestedDurationMinutes: suggestion.suggestedDurationMinutes,
        reasoning: "Generated from meditation extraction.",
      };
    }

    // Ultimate fallback
    return {
      embodimentText: "Spend 15 minutes feeling the peace of having everything you need in this moment. Nothing to chase. Complete.",
      targetEmotion: "peace",
      targetOutcome: "Completeness in this moment",
      suggestedDurationMinutes: 15,
      reasoning: "A grounding practice when specific guidance wasn't clear.",
    };
  }
}
