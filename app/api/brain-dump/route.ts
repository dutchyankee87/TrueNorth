import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { db, domains, identityAnchors } from "@/lib/db";
import { eq } from "drizzle-orm";

interface ExtractedLoop {
  description: string;
  category: string;
  type: "task" | "decision" | "commitment" | "worry" | "idea";
  // ICE scoring (1-10 each)
  impact: number;      // How much will this move the needle on my goals?
  confidence: number;  // How sure am I that this will work/matter?
  ease: number;        // How easy is this to do?
  iceScore: number;    // Combined score (impact * confidence * ease) / 10
  reasoning: string;   // Brief explanation of the scores
}

interface IdentityInsight {
  type: "identity" | "vision" | "emotion" | "release";
  content: string;
  reasoning: string;
}

interface ExtractionResult {
  loops: ExtractedLoop[];
  identityInsights: IdentityInsight[];
  summary: string;
  topPriority: string; // The single most important thing to focus on
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Fetch user's domains and identity for context
    const [userDomains, identity] = await Promise.all([
      db.select().from(domains).where(eq(domains.userId, user.id)),
      db.select().from(identityAnchors).where(eq(identityAnchors.userId, user.id)).then(rows => rows[0]),
    ]);

    const domainNames = userDomains.map(d => d.name);

    const systemPrompt = `You are an expert at extracting actionable items AND identity insights from brain dumps.

${identity ? `## User Context
- Core identity: ${identity.coreIdentity}
${identity.primaryConstraint ? `- Primary constraint: ${identity.primaryConstraint}` : ""}
${identity.decisionFilter ? `- Decision filter: ${identity.decisionFilter}` : ""}
${identity.currentPhase ? `- Current phase: ${identity.currentPhase}` : ""}
${identity.futureVision ? `- Future vision: ${identity.futureVision}` : ""}
${identity.elevatedEmotions?.length ? `- Elevated emotions: ${identity.elevatedEmotions.join(", ")}` : ""}` : ""}

${domainNames.length > 0 ? `## User's Domains
${domainNames.map(d => `- ${d}`).join("\n")}` : ""}

## Your Task
Extract TWO types of information from the brain dump:

### 1. Open Loops (tasks, decisions, commitments, worries, ideas)
Use ICE scoring framework:
- **Impact (1-10)**: How much will completing this move the needle?
- **Confidence (1-10)**: How certain is the outcome/importance?
- **Ease (1-10)**: How easy is this to complete?
- **ICE Score** = (Impact × Confidence × Ease) / 10

### 2. Identity Insights
Look for statements about:
- **identity**: Who they are becoming, new roles, identity shifts (e.g., "I'm becoming a mentor", "I see myself as a leader now")
- **vision**: Future aspirations, what they're creating (e.g., "I want to build...", "My vision is...")
- **emotion**: Emotions they want to cultivate or are experiencing (e.g., "I feel more confident", "I want to cultivate peace")
- **release**: Things they're letting go of, old patterns (e.g., "I'm done with...", "Letting go of...")

Return JSON in this exact format:
{
  "loops": [
    {
      "description": "Clear, actionable description",
      "category": "Domain name or new category",
      "type": "task" | "decision" | "commitment" | "worry" | "idea",
      "impact": 8,
      "confidence": 7,
      "ease": 9,
      "iceScore": 50.4,
      "reasoning": "Brief explanation of why these scores"
    }
  ],
  "identityInsights": [
    {
      "type": "identity" | "vision" | "emotion" | "release",
      "content": "The extracted insight",
      "reasoning": "Why this was identified as an identity insight"
    }
  ],
  "summary": "1-2 sentence summary of what's on their mind",
  "topPriority": "The single most important thing to focus on first and why"
}

Be thorough - extract everything. Combine duplicates. Make vague items specific and actionable.
Not every brain dump will have identity insights - that's okay. Only include them if genuinely present.`;

    const anthropic = new Anthropic();

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Here's my brain dump:\n\n${content}`,
        },
      ],
    });

    const textContent = message.content.find(block => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No response from extraction");
    }

    // Parse the JSON response
    let result: ExtractionResult;
    try {
      // Extract JSON from potential markdown code blocks
      let jsonText = textContent.text;
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
      result = JSON.parse(jsonText.trim());

      // Ensure identityInsights exists
      if (!result.identityInsights) {
        result.identityInsights = [];
      }
    } catch {
      console.error("Failed to parse extraction:", textContent.text);
      return NextResponse.json({ error: "Failed to parse extraction" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Brain dump error:", error);
    const message = error instanceof Error ? error.message : "Failed to process brain dump";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
