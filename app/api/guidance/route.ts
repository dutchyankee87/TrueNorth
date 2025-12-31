/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { evaluateStateGate } from "@/lib/llm/state-gate";
import { generateGuidance } from "@/lib/llm/guidance-engine";
import type { MentalClarity, EmotionalState, PhysicalEnergy, PostShift } from "@/lib/supabase/types";

interface GuidanceRequestBody {
  dailyStateId: string;
  practiceEventId?: string;
  postShift?: PostShift;
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

    const body: GuidanceRequestBody = await request.json();
    const { dailyStateId, practiceEventId, postShift } = body;

    // Check if guidance already exists for today
    const today = new Date().toISOString().split("T")[0];
    const { data: existingGuidance } = await (supabase
      .from("guidance_events") as any)
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00`)
      .lt("created_at", `${today}T23:59:59`)
      .single();

    if (existingGuidance) {
      return NextResponse.json({
        success: true,
        data: existingGuidance,
        cached: true,
      });
    }

    // Fetch daily state
    const { data: dailyState, error: stateError } = await (supabase
      .from("daily_states") as any)
      .select("*")
      .eq("id", dailyStateId)
      .single();

    if (stateError || !dailyState) {
      return NextResponse.json(
        { error: "Daily state not found" },
        { status: 404 }
      );
    }

    // Fetch user context in parallel
    const [identityResult, rulesResult, loopsResult] = await Promise.all([
      (supabase.from("identity_anchors") as any)
        .select("*")
        .eq("user_id", user.id)
        .single(),
      (supabase.from("personalized_rules") as any)
        .select("*")
        .eq("user_id", user.id),
      (supabase.from("open_loops") as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "open"),
    ]);

    const identityAnchor = identityResult.data;
    const personalizedRules = rulesResult.data || [];
    const openLoops = loopsResult.data || [];

    // Build effective state
    const effectiveState = {
      mental: dailyState.mental_clarity as MentalClarity,
      emotional: dailyState.emotional_state as EmotionalState,
      physical: dailyState.physical_energy as PhysicalEnergy,
      postPracticeShift: postShift || null,
    };

    // Evaluate state gate (optional re-check after practice)
    const gateResult = await evaluateStateGate({
      mental: effectiveState.mental,
      emotional: effectiveState.emotional,
      physical: effectiveState.physical,
    });

    // If still hard blocked after practice, force PAUSE
    if (gateResult.gateStatus === "hard_block" && !postShift) {
      const pauseGuidance = {
        user_id: user.id,
        daily_state_id: dailyStateId,
        practice_event_id: practiceEventId || null,
        guidance_type: "pause" as const,
        guidance_text: "Recovery day. No decisions today. Rest, reflect, or do something restorative.",
        reasoning: gateResult.reasoning,
        effective_state: effectiveState,
        confidence_score: 0.95,
      };

      const { data: savedGuidance, error: saveError } = await (supabase
        .from("guidance_events") as any)
        .insert(pauseGuidance)
        .select()
        .single();

      if (saveError) {
        console.error("Failed to save guidance:", saveError);
        return NextResponse.json(
          { error: "Failed to save guidance" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: savedGuidance,
      });
    }

    // Generate full guidance
    const guidanceResult = await generateGuidance({
      identityAnchor,
      personalizedRules,
      effectiveState,
      openLoops,
      contextDump: dailyState.context_dump,
    });

    // Save guidance event
    const guidanceEvent = {
      user_id: user.id,
      daily_state_id: dailyStateId,
      practice_event_id: practiceEventId || null,
      guidance_type: guidanceResult.decision,
      referenced_loop_id: guidanceResult.referencedLoopId,
      guidance_text: guidanceResult.output,
      reasoning: guidanceResult.reasoning,
      effective_state: effectiveState,
      confidence_score: guidanceResult.confidence,
    };

    const { data: savedGuidance, error: saveError } = await (supabase
      .from("guidance_events") as any)
      .insert(guidanceEvent)
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save guidance:", saveError);
      return NextResponse.json(
        { error: "Failed to save guidance" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: savedGuidance,
    });
  } catch (error) {
    console.error("Guidance generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
