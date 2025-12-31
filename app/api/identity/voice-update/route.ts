import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

interface IdentityUpdates {
  coreIdentity?: string;
  primaryConstraint?: string;
  decisionFilter?: string;
  antiPatterns?: string;
  currentPhase?: string;
  futureVision?: string;
  leavingBehind?: string[];
  elevatedEmotions?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { voiceInput, currentIdentity } = await request.json();

    if (!voiceInput?.trim()) {
      return NextResponse.json({ error: "Voice input is required" }, { status: 400 });
    }

    const availableEmotions = [
      "Gratitude", "Joy", "Love", "Freedom", "Abundance", "Peace",
      "Empowerment", "Confidence", "Creativity", "Connection", "Clarity", "Trust",
    ];

    const systemPrompt = `You are an expert at extracting identity and vision information from natural speech.

## Current Identity (if any)
${currentIdentity ? `
- Core Identity: ${currentIdentity.coreIdentity || "Not set"}
- Primary Constraint: ${currentIdentity.primaryConstraint || "Not set"}
- Decision Filter: ${currentIdentity.decisionFilter || "Not set"}
- Anti-patterns: ${currentIdentity.antiPatterns?.join(", ") || "Not set"}
- Current Phase: ${currentIdentity.currentPhase || "Not set"}
- Future Vision: ${currentIdentity.futureVision || "Not set"}
- Leaving Behind: ${currentIdentity.leavingBehind?.join(", ") || "Not set"}
- Elevated Emotions: ${currentIdentity.elevatedEmotions?.join(", ") || "Not set"}
` : "No current identity set"}

## Available Elevated Emotions
${availableEmotions.join(", ")}

## Your Task
Extract any identity or vision updates from the user's voice input. Only include fields that were mentioned or implied. Merge new information with existing data where appropriate.

For coreIdentity: Extract roles/identities as comma-separated values (e.g., "Founder, Father, Athlete")
For elevatedEmotions: Only use values from the available list above
For leavingBehind: Extract as an array of strings

Return ONLY a JSON object with the updates:
{
  "coreIdentity": "Comma-separated identities if mentioned",
  "primaryConstraint": "What they're protecting if mentioned",
  "decisionFilter": "Their decision rule if mentioned",
  "antiPatterns": "Comma-separated behaviors to avoid if mentioned",
  "currentPhase": "Their current phase if mentioned",
  "futureVision": "Their vision if mentioned",
  "leavingBehind": ["Array", "of", "things", "to", "leave", "behind"],
  "elevatedEmotions": ["Array", "of", "emotions", "from", "available", "list"]
}

Only include fields that have updates. If merging with existing data, include the full merged value.`;

    const anthropic = new Anthropic();

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Here's what I said about my identity:\n\n${voiceInput}`,
        },
      ],
    });

    const textContent = message.content.find(block => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No response");
    }

    // Parse JSON response
    let updates: IdentityUpdates;
    try {
      let jsonText = textContent.text;
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
      updates = JSON.parse(jsonText.trim());
    } catch {
      console.error("Failed to parse updates:", textContent.text);
      return NextResponse.json({ error: "Failed to parse updates" }, { status: 500 });
    }

    // Filter elevated emotions to only include valid ones
    if (updates.elevatedEmotions) {
      updates.elevatedEmotions = updates.elevatedEmotions.filter(e =>
        availableEmotions.includes(e)
      );
    }

    return NextResponse.json({ updates });
  } catch (error) {
    console.error("Voice update error:", error);
    const message = error instanceof Error ? error.message : "Failed to process voice input";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
