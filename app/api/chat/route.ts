import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { db, identityAnchors, openLoops, guidanceEvents } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { messages } = await request.json();

    // Fetch user context for personalization
    const [identity, loops, recentGuidance] = await Promise.all([
      db.select().from(identityAnchors).where(eq(identityAnchors.userId, user.id)).then(rows => rows[0]),
      db.select().from(openLoops).where(eq(openLoops.userId, user.id)).limit(10),
      db.select().from(guidanceEvents).where(eq(guidanceEvents.userId, user.id)).orderBy(desc(guidanceEvents.createdAt)).limit(5),
    ]);

    const systemPrompt = `You are a thoughtful AI assistant integrated into Coherence OS, a personal operating system focused on clarity and intentional action.

${identity ? `## User Context
- Core identity: ${identity.coreIdentity}
${identity.primaryConstraint ? `- Primary constraint: ${identity.primaryConstraint}` : ""}
${identity.decisionFilter ? `- Decision filter: ${identity.decisionFilter}` : ""}
${identity.currentPhase ? `- Current phase: ${identity.currentPhase}` : ""}
${identity.antiPatterns?.length ? `- Anti-patterns to avoid: ${identity.antiPatterns.join(", ")}` : ""}` : ""}

${loops.length > 0 ? `## Current Open Loops
${loops.map(l => `- ${l.description}`).join("\n")}` : ""}

${recentGuidance.length > 0 ? `## Recent Guidance Given
${recentGuidance.map(g => `- ${g.guidanceType}: ${g.guidanceText}`).join("\n")}` : ""}

## Your Role
- Be concise and direct
- Help the user think clearly about their priorities and decisions
- Reference their identity and open loops when relevant
- Don't be preachy or overly motivational
- Ask clarifying questions when needed
- Help them close open loops and maintain focus`;

    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      stream: true,
    });

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
