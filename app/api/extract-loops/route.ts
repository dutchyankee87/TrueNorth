import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { CONTEXT_EXTRACTION_PROMPT } from "@/lib/llm/prompts";

interface ExtractionRequestBody {
  contextDump: string;
}

interface ExtractedLoop {
  description: string;
  commitment_type: string;
  external_party: string | null;
  inferred_deadline: string | null;
  inferred_domain: string | null;
  cognitive_pull: number;
  confidence: number;
  reasoning: string;
}

interface ExistingLoopMention {
  loop_id: string;
  mentioned: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: ExtractionRequestBody = await request.json();
    const { contextDump } = body;

    if (!contextDump || contextDump.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          extractedLoops: [],
          existingLoopMentions: [],
        },
      });
    }

    // Fetch existing open loops
    const { data: existingLoops } = await (supabase
      .from("open_loops") as unknown as { select: (cols: string) => { eq: (col: string, val: string) => { eq: (col: string, val: string) => Promise<{ data: Array<{ id: string; description: string }> | null }> } } })
      .select("id, description")
      .eq("user_id", user.id)
      .eq("status", "open");

    const existingLoopsText = existingLoops
      ?.map((loop: { id: string; description: string }) => `- ${loop.description} (ID: ${loop.id})`)
      .join("\n") || "No existing open loops.";

    // Build prompt
    const prompt = CONTEXT_EXTRACTION_PROMPT
      .replace("{context_dump}", contextDump)
      .replace("{existing_loops}", existingLoopsText);

    const anthropic = new Anthropic();

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: "Extract open loops from this context dump.",
        },
      ],
      system: prompt,
    });

    // Extract text content
    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json({
        success: true,
        data: {
          extractedLoops: [],
          existingLoopMentions: [],
        },
      });
    }

    // Parse JSON response
    try {
      const parsed = JSON.parse(textContent.text);

      // Filter to high-confidence extractions only
      const extractedLoops: ExtractedLoop[] = (parsed.extracted_loops || [])
        .filter((loop: ExtractedLoop) => loop.confidence >= 0.7);

      const existingLoopMentions: ExistingLoopMention[] = parsed.existing_loop_mentions || [];

      // Update mention counts for existing loops
      for (const mention of existingLoopMentions) {
        if (mention.mentioned) {
          await (supabase as unknown as { rpc: (fn: string, args: { loop_id: string }) => Promise<unknown> }).rpc("increment_context_dump_mentions", {
            loop_id: mention.loop_id,
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          extractedLoops,
          existingLoopMentions,
        },
      });
    } catch {
      console.error("Failed to parse extraction response:", textContent.text);
      return NextResponse.json({
        success: true,
        data: {
          extractedLoops: [],
          existingLoopMentions: [],
        },
      });
    }
  } catch (error) {
    console.error("Loop extraction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
