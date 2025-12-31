import Anthropic from "@anthropic-ai/sdk";
import { STATE_GATE_PROMPT, PRACTICE_NAME_MAP } from "./prompts";
import type { MentalClarity, EmotionalState, PhysicalEnergy } from "@/lib/supabase/types";

export interface StateGateInput {
  mental: MentalClarity;
  emotional: EmotionalState;
  physical: PhysicalEnergy;
}

export interface StateGateResult {
  gateStatus: "open" | "soft_block" | "hard_block";
  recommendedPractice: string | null; // Practice name like "Coherence Breath"
  reasoning: string;
}

export async function evaluateStateGate(
  state: StateGateInput
): Promise<StateGateResult> {
  const anthropic = new Anthropic();

  const userMessage = `
Mental clarity: ${state.mental}
Emotional state: ${state.emotional}
Physical energy: ${state.physical}
`;

  const message = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
    system: STATE_GATE_PROMPT,
  });

  // Extract text content
  const textContent = message.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from state gate");
  }

  // Parse JSON response
  try {
    const parsed = JSON.parse(textContent.text);

    // Map the practice key to human-readable name
    const practiceName = parsed.recommended_practice
      ? PRACTICE_NAME_MAP[parsed.recommended_practice] || null
      : null;

    return {
      gateStatus: parsed.gate_status,
      recommendedPractice: practiceName,
      reasoning: parsed.reasoning,
    };
  } catch {
    // Fallback: if parsing fails, return safe defaults
    console.error("Failed to parse state gate response:", textContent.text);
    return {
      gateStatus: "soft_block",
      recommendedPractice: "Coherence Breath",
      reasoning: "Taking a moment to center before proceeding.",
    };
  }
}
