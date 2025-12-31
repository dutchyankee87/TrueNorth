import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { db, identityAnchors, openLoops, domains } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { existingSteps } = await request.json();

    // Fetch user context
    const [identity, loops, userDomains] = await Promise.all([
      db.select().from(identityAnchors).where(eq(identityAnchors.userId, user.id)).then(rows => rows[0]),
      db.select().from(openLoops).where(eq(openLoops.userId, user.id)),
      db.select().from(domains).where(eq(domains.userId, user.id)),
    ]);

    if (!identity) {
      return NextResponse.json({ error: "Identity not set" }, { status: 400 });
    }

    const openLoopsList = loops.filter(l => l.status === "open");

    const systemPrompt = `You are a guide helping someone become their future self. Generate 3 actionable next steps.

## User's Identity
- Core identity: ${identity.coreIdentity}
${identity.futureVision ? `- Vision: ${identity.futureVision}` : ""}
${identity.primaryConstraint ? `- Protecting: ${identity.primaryConstraint}` : ""}
${identity.decisionFilter ? `- Decision filter: ${identity.decisionFilter}` : ""}
${identity.currentPhase ? `- Current phase: ${identity.currentPhase}` : ""}

## Their Open Loops (${openLoopsList.length} total)
${openLoopsList.slice(0, 10).map(l => `- ${l.description}`).join("\n")}

## Domains
${userDomains.map(d => d.name).join(", ")}

## Already Suggested Steps
${existingSteps?.length ? existingSteps.join("\n") : "None yet"}

## Guidelines
- Each step should be specific and actionable
- Steps should align with their identity and vision
- Mix between: addressing open loops, advancing their vision, and self-care
- Keep each step to 1-2 sentences
- Don't repeat already suggested steps
- Use language that empowers, not pressures

Return ONLY a JSON array of 3 strings:
["First step...", "Second step...", "Third step..."]`;

    const anthropic = new Anthropic();

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-20250514",
      max_tokens: 512,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: "Generate 3 more next steps for me.",
        },
      ],
    });

    const textContent = message.content.find(block => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No response");
    }

    // Parse JSON response
    let steps: string[];
    try {
      let jsonText = textContent.text;
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
      steps = JSON.parse(jsonText.trim());
    } catch {
      console.error("Failed to parse steps:", textContent.text);
      return NextResponse.json({ error: "Failed to parse steps" }, { status: 500 });
    }

    return NextResponse.json({ steps });
  } catch (error) {
    console.error("Next steps error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate steps";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
