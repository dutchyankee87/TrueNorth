/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmbodimentShift } from "@/lib/supabase/types";

interface CompleteEmbodimentBody {
  embodimentEventId: string;
  feltShift: EmbodimentShift;
  actualDurationSeconds?: number;
  skipped?: boolean;
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

    const body: CompleteEmbodimentBody = await request.json();
    const { embodimentEventId, feltShift, actualDurationSeconds, skipped } = body;

    if (!embodimentEventId) {
      return NextResponse.json(
        { error: "Missing embodimentEventId" },
        { status: 400 }
      );
    }

    // Update the embodiment event
    const updateData: Record<string, unknown> = {
      felt_shift: feltShift,
      completed: !skipped,
      skipped: skipped || false,
    };

    if (actualDurationSeconds !== undefined) {
      updateData.actual_duration_seconds = actualDurationSeconds;
    }

    const { data: embodimentEvent, error: updateError } = await (supabase
      .from("embodiment_events") as any)
      .update(updateData)
      .eq("id", embodimentEventId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to complete embodiment event:", updateError);
      return NextResponse.json(
        { error: "Failed to complete embodiment event" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: embodimentEvent,
    });
  } catch (error) {
    console.error("Complete embodiment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
