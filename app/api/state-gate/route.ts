/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { evaluateStateGate } from "@/lib/llm/state-gate";
import type { MentalClarity, EmotionalState, PhysicalEnergy } from "@/lib/supabase/types";

interface StateGateRequestBody {
  mental: MentalClarity;
  emotional: EmotionalState;
  physical: PhysicalEnergy;
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

    const body: StateGateRequestBody = await request.json();
    const { mental, emotional, physical } = body;

    // Evaluate state gate
    const result = await evaluateStateGate({ mental, emotional, physical });

    // If a practice is recommended, fetch its details
    let practice = null;
    if (result.recommendedPractice) {
      const { data: practiceData } = await (supabase
        .from("practices") as any)
        .select("*")
        .eq("name", result.recommendedPractice)
        .single();

      practice = practiceData;
    }

    return NextResponse.json({
      success: true,
      data: {
        gateStatus: result.gateStatus,
        reasoning: result.reasoning,
        practice,
      },
    });
  } catch (error) {
    console.error("State gate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
