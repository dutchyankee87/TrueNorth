/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PostMeditationState } from "@/lib/supabase/types";

interface StartMeditationBody {
  action: "start";
  coherenceDurationSeconds: number;
  breathPattern?: string;
  didFutureSelfViz?: boolean;
}

interface CompleteMeditationBody {
  action: "complete";
  meditationSessionId: string;
  postMeditationState: PostMeditationState;
}

type MeditationRequestBody = StartMeditationBody | CompleteMeditationBody;

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

    const body: MeditationRequestBody = await request.json();

    if (body.action === "start") {
      // Create a new meditation session
      const { data: session, error: insertError } = await (supabase
        .from("meditation_sessions") as any)
        .insert({
          user_id: user.id,
          coherence_duration_seconds: body.coherenceDurationSeconds,
          breath_pattern: body.breathPattern || "5-5",
          did_future_self_viz: body.didFutureSelfViz || false,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Failed to create meditation session:", insertError);
        return NextResponse.json(
          { error: "Failed to start meditation session" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: session,
      });
    }

    if (body.action === "complete") {
      // Complete the meditation session
      const { data: session, error: updateError } = await (supabase
        .from("meditation_sessions") as any)
        .update({
          post_meditation_state: body.postMeditationState,
          completed_at: new Date().toISOString(),
        })
        .eq("id", body.meditationSessionId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error("Failed to complete meditation session:", updateError);
        return NextResponse.json(
          { error: "Failed to complete meditation session" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: session,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Meditation session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
