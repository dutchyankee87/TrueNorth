/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbodiment } from "@/lib/llm/embodiment-engine";
import type { MeditationExtractionResult } from "@/lib/llm/meditation-extraction";

interface EmbodimentRequestBody {
  meditationSessionId: string;
  extractionResult: MeditationExtractionResult;
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

    const body: EmbodimentRequestBody = await request.json();
    const { meditationSessionId, extractionResult } = body;

    if (!meditationSessionId || !extractionResult) {
      return NextResponse.json(
        { error: "Missing meditationSessionId or extractionResult" },
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

    // Fetch user's high cognitive pull open loops
    const { data: openLoops } = await (supabase
      .from("open_loops") as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "open")
      .gte("cognitive_pull", 3)
      .order("cognitive_pull", { ascending: false })
      .limit(5);

    // Generate embodiment guidance
    const embodimentResult = await generateEmbodiment({
      identityAnchor: identityAnchor || null,
      extractionResult,
      openLoops: openLoops || [],
    });

    // Create the embodiment event
    const { data: embodimentEvent, error: insertError } = await (supabase
      .from("embodiment_events") as any)
      .insert({
        user_id: user.id,
        meditation_session_id: meditationSessionId,
        embodiment_text: embodimentResult.embodimentText,
        target_emotion: embodimentResult.targetEmotion,
        target_duration_seconds: embodimentResult.suggestedDurationMinutes * 60,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create embodiment event:", insertError);
      return NextResponse.json(
        { error: "Failed to create embodiment event" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        embodiment: embodimentResult,
        embodimentEventId: embodimentEvent.id,
      },
    });
  } catch (error) {
    console.error("Embodiment generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
