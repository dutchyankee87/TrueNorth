import Anthropic from "@anthropic-ai/sdk";
import { IDENTITY_EXTRACTION_PROMPT, VISION_EXTRACTION_PROMPT, DOMAINS_EXTRACTION_PROMPT } from "./prompts";

// Types for extracted identity data
export interface ExtractedIdentity {
  coreIdentity: string;
  primaryConstraint: string | null;
  decisionFilter: string | null;
  antiPatterns: string[];
  currentPhase: string | null;
  confidence: number;
}

export interface ExtractedVision {
  futureVision: string;
  leavingBehind: string[];
  elevatedEmotions: string[];
  confidence: number;
}

export interface ExtractedDomain {
  name: string;
  reason: string;
}

export interface ExtractedDomains {
  domains: ExtractedDomain[];
  confidence: number;
}

/**
 * Extract structured identity data from a user's brain dump about who they are now.
 * Uses Claude Sonnet for nuanced understanding of personal identity.
 */
export async function extractIdentity(brainDump: string): Promise<ExtractedIdentity> {
  const anthropic = new Anthropic();

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: brainDump,
      },
    ],
    system: IDENTITY_EXTRACTION_PROMPT,
  });

  // Extract text content
  const textContent = message.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from identity extraction");
  }

  // Parse JSON response (strip markdown code blocks if present)
  try {
    let jsonText = textContent.text.trim();
    
    // Remove markdown code block wrapper if present (```json ... ```)
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    
    const parsed = JSON.parse(jsonText);
    
    return {
      coreIdentity: parsed.coreIdentity || "",
      primaryConstraint: parsed.primaryConstraint || null,
      decisionFilter: parsed.decisionFilter || null,
      antiPatterns: parsed.antiPatterns || [],
      currentPhase: parsed.currentPhase || null,
      confidence: parsed.confidence || 0.5,
    };
  } catch (error) {
    console.error("Failed to parse identity extraction response:", textContent.text);
    throw new Error("Failed to extract identity from brain dump");
  }
}

/**
 * Extract structured vision data from a user's brain dump about who they're becoming.
 * Uses Claude Sonnet for understanding transformation and aspirational identity.
 */
export async function extractVision(brainDump: string): Promise<ExtractedVision> {
  const anthropic = new Anthropic();

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: brainDump,
      },
    ],
    system: VISION_EXTRACTION_PROMPT,
  });

  // Extract text content
  const textContent = message.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from vision extraction");
  }

  // Parse JSON response (strip markdown code blocks if present)
  try {
    let jsonText = textContent.text.trim();
    
    // Remove markdown code block wrapper if present (```json ... ```)
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    
    const parsed = JSON.parse(jsonText);
    
    return {
      futureVision: parsed.futureVision || "",
      leavingBehind: parsed.leavingBehind || [],
      elevatedEmotions: parsed.elevatedEmotions || [],
      confidence: parsed.confidence || 0.5,
    };
  } catch (error) {
    console.error("Failed to parse vision extraction response:", textContent.text);
    throw new Error("Failed to extract vision from brain dump");
  }
}

/**
 * Extract domains (areas of responsibility) from combined brain dumps.
 * Uses Claude Haiku for faster extraction of simpler structured data.
 */
export async function extractDomains(combinedBrainDump: string): Promise<ExtractedDomains> {
  const anthropic = new Anthropic();

  const message = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: combinedBrainDump,
      },
    ],
    system: DOMAINS_EXTRACTION_PROMPT,
  });

  const textContent = message.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from domains extraction");
  }

  try {
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    
    const parsed = JSON.parse(jsonText);
    
    return {
      domains: parsed.domains || [],
      confidence: parsed.confidence || 0.5,
    };
  } catch (error) {
    console.error("Failed to parse domains extraction response:", textContent.text);
    throw new Error("Failed to extract domains from brain dump");
  }
}

// Types for extracted loops
export interface ExtractedLoop {
  description: string;
  commitmentType: "promise" | "decision" | "waiting" | "follow_up" | "vague_pull";
  externalParty: string | null;
  cognitivePull: number;
}

export interface ExtractedLoops {
  loops: ExtractedLoop[];
  confidence: number;
}

/**
 * Extract open loops from a brain dump about what's on the user's mind.
 * Uses Claude Haiku for faster extraction.
 */
export async function extractLoops(brainDump: string): Promise<ExtractedLoops> {
  const anthropic = new Anthropic();

  const systemPrompt = `You are extracting open loops (cognitive load items) from a user's brain dump about what's on their mind.

An open loop is:
- A commitment made to another person
- A decision that's blocking other work
- Something unresolved pulling cognitive attention
- A "waiting for" item

An open loop is NOT:
- An idea they might pursue someday
- A recurring responsibility (that's a domain)
- Something they "should" do but haven't committed to

INPUT: User's brain dump about what's pulling on them

OUTPUT (JSON only, no other text):
{
  "loops": [
    {
      "description": "Clear, actionable description of the loop",
      "commitmentType": "promise" | "decision" | "waiting" | "follow_up" | "vague_pull",
      "externalParty": "Person/org involved or null",
      "cognitivePull": 1-5 (how much mental weight)
    }
  ],
  "confidence": 0.0-1.0
}

GUIDELINES:
- Extract 3-8 loops maximum
- Be specific: "Send proposal to Sarah" not "Work stuff"
- Higher cognitivePull (4-5) for urgent deadlines or external commitments
- Lower cognitivePull (1-2) for vague concerns
- Only extract actual commitments or tensions, not wishlist items`;

  const message = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: brainDump,
      },
    ],
    system: systemPrompt,
  });

  const textContent = message.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from loops extraction");
  }

  try {
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    
    const parsed = JSON.parse(jsonText);
    
    return {
      loops: parsed.loops || [],
      confidence: parsed.confidence || 0.5,
    };
  } catch (error) {
    console.error("Failed to parse loops extraction response:", textContent.text);
    throw new Error("Failed to extract loops from brain dump");
  }
}

