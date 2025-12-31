/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  StateCheckIn,
  ElevationOffer,
  PracticeExperience,
  PostPracticeCheck,
  GuidanceDisplay,
} from "@/components/ritual";
import type {
  MentalClarity,
  EmotionalState,
  PhysicalEnergy,
  Practice,
  GuidanceEvent,
  PostShift,
} from "@/lib/supabase/types";

type RitualStep =
  | "loading"
  | "check_existing"
  | "check_in"
  | "elevation_offer"
  | "practice"
  | "post_practice"
  | "guidance"
  | "complete";

interface StateCheckInData {
  mental: MentalClarity;
  emotional: EmotionalState;
  physical: PhysicalEnergy;
  contextDump: string | null;
}

interface StateGateResponse {
  gateStatus: "open" | "soft_block" | "hard_block";
  reasoning: string;
  practice: Practice | null;
}

export default function RitualPage() {
  const router = useRouter();
  const [step, setStep] = useState<RitualStep>("loading");
  const [stateData, setStateData] = useState<StateCheckInData | null>(null);
  const [gateResponse, setGateResponse] = useState<StateGateResponse | null>(null);
  const [dailyStateId, setDailyStateId] = useState<string | null>(null);
  const [practiceEventId, setPracticeEventId] = useState<string | null>(null);
  const [postShift, setPostShift] = useState<PostShift | null>(null);
  const [guidance, setGuidance] = useState<GuidanceEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for existing guidance on mount
  useEffect(() => {
    async function checkExisting() {
      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0];

      const { data: existingGuidance } = await (supabase
        .from("guidance_events") as any)
        .select("*")
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59`)
        .single();

      if (existingGuidance) {
        setGuidance(existingGuidance);
        setStep("guidance");
      } else {
        setStep("check_in");
      }
    }

    checkExisting();
  }, []);

  // Handle state check-in submission
  async function handleCheckInComplete(data: StateCheckInData) {
    setStateData(data);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Not authenticated");
        return;
      }

      // Save daily state
      const today = new Date().toISOString().split("T")[0];
      const { data: dailyState, error: stateError } = await (supabase
        .from("daily_states") as any)
        .insert({
          user_id: user.id,
          date: today,
          mental_clarity: data.mental,
          emotional_state: data.emotional,
          physical_energy: data.physical,
          context_dump: data.contextDump,
        })
        .select()
        .single();

      if (stateError) {
        // Might already exist for today
        const { data: existing } = await (supabase
          .from("daily_states") as any)
          .select("*")
          .eq("user_id", user.id)
          .eq("date", today)
          .single();

        if (existing) {
          setDailyStateId(existing.id);
        } else {
          setError("Failed to save state");
          return;
        }
      } else if (dailyState) {
        setDailyStateId(dailyState.id);
      }

      // Evaluate state gate
      const response = await fetch("/api/state-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mental: data.mental,
          emotional: data.emotional,
          physical: data.physical,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "State gate evaluation failed");
        return;
      }

      setGateResponse(result.data);

      // If practice recommended, show offer
      if (result.data.practice && result.data.gateStatus !== "open") {
        setStep("elevation_offer");
      } else {
        // Skip to guidance
        await fetchGuidance(dailyState?.id || dailyStateId!);
      }
    } catch (err) {
      console.error("Check-in error:", err);
      setError("Something went wrong");
    }
  }

  // Handle practice acceptance
  async function handleAcceptPractice() {
    if (!gateResponse?.practice || !dailyStateId) return;

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Create practice event
      const { data: practiceEvent } = await (supabase
        .from("practice_events") as any)
        .insert({
          user_id: user.id,
          daily_state_id: dailyStateId,
          practice_id: gateResponse.practice.id,
          pre_state: stateData,
        })
        .select()
        .single();

      if (practiceEvent) {
        setPracticeEventId(practiceEvent.id);
      }

      setStep("practice");
    } catch (err) {
      console.error("Practice start error:", err);
    }
  }

  // Handle practice skip
  async function handleSkipPractice() {
    if (!dailyStateId) return;

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Create skipped practice event
      const { data: practiceEvent } = await (supabase
        .from("practice_events") as any)
        .insert({
          user_id: user.id,
          daily_state_id: dailyStateId,
          practice_id: gateResponse?.practice?.id || null,
          skipped: true,
        })
        .select()
        .single();

      if (practiceEvent) {
        setPracticeEventId(practiceEvent.id);
      }

      await fetchGuidance(dailyStateId);
    } catch (err) {
      console.error("Skip practice error:", err);
    }
  }

  // Handle practice completion
  function handlePracticeComplete() {
    setStep("post_practice");
  }

  // Handle post-practice check
  async function handlePostPracticeComplete(shift: PostShift) {
    setPostShift(shift);

    if (!practiceEventId || !dailyStateId) return;

    try {
      const supabase = createClient();

      // Update practice event
      await (supabase
        .from("practice_events") as any)
        .update({
          completed: true,
          post_shift: shift,
        })
        .eq("id", practiceEventId);

      await fetchGuidance(dailyStateId, practiceEventId, shift);
    } catch (err) {
      console.error("Post-practice error:", err);
    }
  }

  // Fetch guidance from API
  async function fetchGuidance(
    stateId: string,
    practiceId?: string,
    shift?: PostShift
  ) {
    try {
      const response = await fetch("/api/guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyStateId: stateId,
          practiceEventId: practiceId,
          postShift: shift,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to generate guidance");
        return;
      }

      setGuidance(result.data);
      setStep("guidance");
    } catch (err) {
      console.error("Guidance fetch error:", err);
      setError("Failed to get guidance");
    }
  }

  // Handle guidance acknowledgment
  function handleAcknowledge() {
    setStep("complete");
    router.push("/");
  }

  // Render based on step
  if (step === "loading" || step === "check_existing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary px-6">
        <div className="max-w-md mx-auto text-center">
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary px-6">
        <div className="max-w-md mx-auto text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setStep("check_in");
            }}
            className="text-accent hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (step === "check_in") {
    return <StateCheckIn onComplete={handleCheckInComplete} />;
  }

  if (step === "elevation_offer" && gateResponse?.practice) {
    return (
      <ElevationOffer
        practice={gateResponse.practice}
        reasoning={gateResponse.reasoning}
        onAccept={handleAcceptPractice}
        onSkip={handleSkipPractice}
      />
    );
  }

  if (step === "practice" && gateResponse?.practice) {
    return (
      <PracticeExperience
        practice={gateResponse.practice}
        onComplete={handlePracticeComplete}
        onSkip={handleSkipPractice}
      />
    );
  }

  if (step === "post_practice") {
    return <PostPracticeCheck onComplete={handlePostPracticeComplete} />;
  }

  if (step === "guidance" && guidance) {
    return (
      <GuidanceDisplay
        type={guidance.guidance_type}
        text={guidance.guidance_text}
        reasoning={guidance.reasoning}
        practiceCompleted={postShift === "notable" || postShift === "slight"}
        onAcknowledge={handleAcknowledge}
      />
    );
  }

  return null;
}
