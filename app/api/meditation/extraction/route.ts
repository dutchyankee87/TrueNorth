/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractFromMeditation } from "@/lib/llm/meditation-extraction";

interface ExtractionRequestBody {
  content: string;
  meditationSessionId: string;
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
    const { content, meditationSessionId } = body;

    if (!content || !meditationSessionId) {
      return NextResponse.json(
        { error: "Missing content or meditationSessionId" },
        { status: 400 }
      );
    }

    // Verify the meditation session belongs to this user
    const { data: session, error: sessionError } = await (supabase
      .from("meditation_sessions") as any)
      .select("*")
      .eq("id", meditationSessionId)
      .eq("user_id", user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Meditation session not found" },
        { status: 404 }
      );
    }

    // Fetch user's identity anchor
    const { data: identityAnchor } = await (supabase
      .from("identity_anchors") as any)
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Fetch user's open loops
    const { data: openLoops } = await (supabase
      .from("open_loops") as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "open")
      .order("cognitive_pull", { ascending: false });

    // Extract insights from the post-meditation brain dump
    const extractionResult = await extractFromMeditation({
      content,
      identityAnchor: identityAnchor || null,
      openLoops: openLoops || [],
    });

    return NextResponse.json({
      success: true,
      data: {
        extraction: extractionResult,
        meditationSessionId,
      },
    });
  } catch (error) {
    console.error("Meditation extraction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
