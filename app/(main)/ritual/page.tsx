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
  CoherenceBreathingTimer,
  FutureSelfVisualization,
  PostMeditationDump,
  ExtractionReview,
  EmbodimentGuidance,
  ActionOptIn,
} from "@/components/ritual";
import type { ConfirmedExtractions } from "@/components/ritual/ExtractionReview";
import type {
  MentalClarity,
  EmotionalState,
  PhysicalEnergy,
  Practice,
  GuidanceEvent,
  PostShift,
  PostMeditationState,
  EmbodimentShift,
  IdentityAnchor,
} from "@/lib/supabase/types";
import type { MeditationExtractionResult } from "@/lib/llm/meditation-extraction";
import type { EmbodimentResult } from "@/lib/llm/embodiment-engine";

// Meditation-first flow steps
type RitualStep =
  | "loading"
  | "check_existing"
  // New meditation flow
  | "meditation_setup" // Choose duration
  | "future_self_viz" // Optional visualization
  | "coherence_breathing" // Main meditation
  | "post_meditation_state" // How do you feel?
  | "post_meditation_dump" // Brain dump
  | "extraction_review" // Review AI extractions
  | "embodiment" // EMBODY guidance
  | "action_opt_in" // Want action guidance?
  // Existing action flow (optional after embodiment)
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

const MEDITATION_DURATIONS = [
  { minutes: 5, label: "5 minutes", description: "Quick centering" },
  { minutes: 10, label: "10 minutes", description: "Standard practice" },
  { minutes: 15, label: "15 minutes", description: "Deep coherence" },
  { minutes: 20, label: "20 minutes", description: "Extended practice" },
];

export default function RitualPage() {
  const router = useRouter();
  const [step, setStep] = useState<RitualStep>("loading");
  const [error, setError] = useState<string | null>(null);

  // Identity anchor for visualization
  const [identityAnchor, setIdentityAnchor] = useState<IdentityAnchor | null>(null);

  // Meditation flow state
  const [meditationDuration, setMeditationDuration] = useState(10);
  const [meditationSessionId, setMeditationSessionId] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<MeditationExtractionResult | null>(null);
  const [embodimentResult, setEmbodimentResult] = useState<EmbodimentResult | null>(null);
  const [embodimentEventId, setEmbodimentEventId] = useState<string | null>(null);

  // Legacy flow state (for action guidance path)
  const [stateData, setStateData] = useState<StateCheckInData | null>(null);
  const [gateResponse, setGateResponse] = useState<StateGateResponse | null>(null);
  const [dailyStateId, setDailyStateId] = useState<string | null>(null);
  const [practiceEventId, setPracticeEventId] = useState<string | null>(null);
  const [postShift, setPostShift] = useState<PostShift | null>(null);
  const [guidance, setGuidance] = useState<GuidanceEvent | null>(null);

  // Check for existing guidance/embodiment on mount
  useEffect(() => {
    async function checkExisting() {
      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0];

      // Check for existing guidance
      const { data: existingGuidance } = await (supabase
        .from("guidance_events") as any)
        .select("*")
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59`)
        .single();

      if (existingGuidance) {
        setGuidance(existingGuidance);
        setStep("guidance");
        return;
      }

      // Check for existing embodiment event (meditation completed but maybe no action guidance)
      const { data: existingEmbodiment } = await (supabase
        .from("embodiment_events") as any)
        .select("*")
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59`)
        .eq("completed", true)
        .single();

      if (existingEmbodiment) {
        // They already did embodiment today - offer action opt-in
        setStep("action_opt_in");
        return;
      }

      // Fetch identity anchor for visualization
      const { data: anchor } = await (supabase
        .from("identity_anchors") as any)
        .select("*")
        .single();

      if (anchor) {
        setIdentityAnchor(anchor);
      }

      // Start fresh meditation flow
      setStep("meditation_setup");
    }

    checkExisting();
  }, []);

  // --- MEDITATION FLOW HANDLERS ---

  async function handleMeditationSetup(minutes: number, skipViz: boolean) {
    setMeditationDuration(minutes);

    try {
      // Start meditation session
      const response = await fetch("/api/meditation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          coherenceDurationSeconds: minutes * 60,
          breathPattern: "5-5",
          didFutureSelfViz: !skipViz,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        setError(result.error || "Failed to start meditation");
        return;
      }

      setMeditationSessionId(result.data.id);

      if (skipViz) {
        setStep("coherence_breathing");
      } else {
        setStep("future_self_viz");
      }
    } catch (err) {
      console.error("Meditation setup error:", err);
      setError("Something went wrong");
    }
  }

  function handleFutureSelfComplete() {
    setStep("coherence_breathing");
  }

  function handleFutureSelfSkip() {
    setStep("coherence_breathing");
  }

  function handleBreathingComplete(durationSeconds: number) {
    // For now, go straight to post-meditation state question
    // Duration is already tracked in the session
    setStep("post_meditation_state");
  }

  function handleBreathingExit() {
    // User exited early - still go to post-meditation state
    setStep("post_meditation_state");
  }

  async function handlePostMeditationState(state: PostMeditationState) {
    if (!meditationSessionId) return;

    try {
      // Complete the meditation session with state
      await fetch("/api/meditation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          meditationSessionId,
          postMeditationState: state,
        }),
      });

      setStep("post_meditation_dump");
    } catch (err) {
      console.error("Post-meditation state error:", err);
      setStep("post_meditation_dump"); // Continue anyway
    }
  }

  async function handlePostMeditationDump(content: string) {
    if (!meditationSessionId) return;

    try {
      // Extract insights from the dump
      const response = await fetch("/api/meditation/extraction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          meditationSessionId,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        setError(result.error || "Failed to process insights");
        return;
      }

      setExtractionResult(result.data.extraction);
      setStep("extraction_review");
    } catch (err) {
      console.error("Extraction error:", err);
      setError("Failed to process your insights");
    }
  }

  function handleDumpSkip() {
    // Skip dump - generate embodiment directly
    generateEmbodiment(null);
  }

  async function handleExtractionConfirm(confirmed: ConfirmedExtractions) {
    // Save confirmed items to database
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    try {
      // Save confirmed loops
      if (confirmed.loops.length > 0) {
        for (const loop of confirmed.loops) {
          await (supabase.from("open_loops") as any).insert({
            user_id: user.id,
            description: loop.description,
            commitment_type: loop.commitmentType,
            external_party: loop.externalParty,
            cognitive_pull: loop.cognitivePull,
            source: "context_extraction",
          });
        }
      }

      // Update identity anchor with vision updates, emotions, patterns
      if (
        confirmed.visionUpdates.length > 0 ||
        confirmed.emotionShifts.length > 0 ||
        confirmed.patternsReleasing.length > 0
      ) {
        const { data: anchor } = await (supabase
          .from("identity_anchors") as any)
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (anchor) {
          const updates: Record<string, unknown> = {};

          // Merge new emotions with existing
          if (confirmed.emotionShifts.length > 0) {
            const existing = anchor.elevated_emotions || [];
            const merged = [...new Set([...existing, ...confirmed.emotionShifts])];
            updates.elevated_emotions = merged;
          }

          // Merge new patterns with existing
          if (confirmed.patternsReleasing.length > 0) {
            const existing = anchor.leaving_behind || [];
            const merged = [...new Set([...existing, ...confirmed.patternsReleasing])];
            updates.leaving_behind = merged;
          }

          // Apply vision refinements (just append for now)
          if (confirmed.visionUpdates.length > 0) {
            const visionAdditions = confirmed.visionUpdates
              .filter((v) => v.type === "addition")
              .map((v) => v.content)
              .join(" ");

            if (visionAdditions && anchor.future_vision) {
              updates.future_vision = anchor.future_vision + " " + visionAdditions;
            }
          }

          if (Object.keys(updates).length > 0) {
            await (supabase.from("identity_anchors") as any)
              .update(updates)
              .eq("user_id", user.id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to save confirmed extractions:", err);
    }

    // Continue to embodiment
    generateEmbodiment(extractionResult);
  }

  function handleExtractionSkip() {
    generateEmbodiment(extractionResult);
  }

  async function generateEmbodiment(extraction: MeditationExtractionResult | null) {
    if (!meditationSessionId) {
      setError("No meditation session found");
      return;
    }

    try {
      const response = await fetch("/api/embodiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meditationSessionId,
          extractionResult: extraction || {
            openLoops: [],
            visionUpdates: [],
            emotionShifts: [],
            patternsReleasing: [],
            identityInsights: [],
            embodimentSuggestion: null,
            summary: "Meditation completed without brain dump.",
            coherenceLevel: "moderate",
          },
        }),
      });

      const result = await response.json();
      if (!result.success) {
        setError(result.error || "Failed to generate embodiment");
        return;
      }

      setEmbodimentResult(result.data.embodiment);
      setEmbodimentEventId(result.data.embodimentEventId);
      setStep("embodiment");
    } catch (err) {
      console.error("Embodiment generation error:", err);
      setError("Failed to generate embodiment guidance");
    }
  }

  async function handleEmbodimentComplete(feltShift: EmbodimentShift, actualDurationSeconds: number) {
    if (!embodimentEventId) return;

    try {
      await fetch("/api/embodiment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embodimentEventId,
          feltShift,
          actualDurationSeconds,
          skipped: false,
        }),
      });

      setStep("action_opt_in");
    } catch (err) {
      console.error("Embodiment complete error:", err);
      setStep("action_opt_in"); // Continue anyway
    }
  }

  async function handleEmbodimentSkip() {
    if (embodimentEventId) {
      try {
        await fetch("/api/embodiment/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embodimentEventId,
            feltShift: "none",
            skipped: true,
          }),
        });
      } catch (err) {
        console.error("Embodiment skip error:", err);
      }
    }

    setStep("action_opt_in");
  }

  function handleWantAction() {
    // Go to traditional state check-in for action guidance
    setStep("check_in");
  }

  function handleComplete() {
    router.push("/");
  }

  // --- LEGACY ACTION FLOW HANDLERS ---

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
          meditation_session_id: meditationSessionId,
        })
        .select()
        .single();

      let currentDailyStateId: string | null = null;

      if (stateError) {
        // Might already exist for today
        const { data: existing } = await (supabase
          .from("daily_states") as any)
          .select("*")
          .eq("user_id", user.id)
          .eq("date", today)
          .single();

        if (existing) {
          currentDailyStateId = existing.id;
          setDailyStateId(existing.id);
        } else {
          setError("Failed to save state");
          return;
        }
      } else if (dailyState) {
        currentDailyStateId = dailyState.id;
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
        await fetchGuidance(currentDailyStateId!);
      }
    } catch (err) {
      console.error("Check-in error:", err);
      setError("Something went wrong");
    }
  }

  async function handleAcceptPractice() {
    if (!gateResponse?.practice || !dailyStateId) return;

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

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

  async function handleSkipPractice() {
    if (!dailyStateId) return;

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

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

  function handlePracticeComplete() {
    setStep("post_practice");
  }

  async function handlePostPracticeComplete(shift: PostShift) {
    setPostShift(shift);

    if (!practiceEventId || !dailyStateId) return;

    try {
      const supabase = createClient();

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
          postEmbodimentContext: embodimentResult
            ? `User completed embodiment practice focused on ${embodimentResult.targetEmotion}. They embodied: "${embodimentResult.targetOutcome}"`
            : null,
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

  function handleAcknowledge() {
    setStep("complete");
    router.push("/");
  }

  // --- RENDER ---

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
              setStep("meditation_setup");
            }}
            className="text-accent hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // --- MEDITATION FLOW ---

  if (step === "meditation_setup") {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-medium text-text-primary mb-2">
            Morning Practice
          </h1>
          <p className="text-text-secondary mb-8">
            How long would you like to meditate?
          </p>

          <div className="space-y-3 mb-8">
            {MEDITATION_DURATIONS.map((option) => (
              <button
                key={option.minutes}
                onClick={() => setMeditationDuration(option.minutes)}
                className={`w-full p-4 rounded-lg border transition-colors text-left ${
                  meditationDuration === option.minutes
                    ? "bg-bg-secondary border-text-muted"
                    : "bg-transparent border-border hover:border-text-muted"
                }`}
              >
                <span className="font-medium text-text-primary">{option.label}</span>
                <span className="text-text-muted text-sm ml-2">{option.description}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleMeditationSetup(meditationDuration, false)}
              className="w-full py-4 bg-text-primary text-bg-primary rounded-lg font-medium hover:bg-text-secondary transition-colors"
            >
              Begin with visualization
            </button>
            <button
              onClick={() => handleMeditationSetup(meditationDuration, true)}
              className="w-full py-4 text-text-muted hover:text-text-secondary transition-colors"
            >
              Skip to breathing
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "future_self_viz") {
    return (
      <FutureSelfVisualization
        futureVision={identityAnchor?.future_vision || null}
        elevatedEmotions={identityAnchor?.elevated_emotions || []}
        onComplete={handleFutureSelfComplete}
        onSkip={handleFutureSelfSkip}
      />
    );
  }

  if (step === "coherence_breathing") {
    return (
      <CoherenceBreathingTimer
        durationMinutes={meditationDuration}
        breathPattern="5-5"
        onComplete={handleBreathingComplete}
        onExit={handleBreathingExit}
      />
    );
  }

  if (step === "post_meditation_state") {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-medium text-text-primary mb-8">
            How do you feel?
          </h1>

          <div className="space-y-3">
            <StateButton
              label="Expanded"
              description="Open, spacious, connected to something larger"
              onClick={() => handlePostMeditationState("expanded")}
            />
            <StateButton
              label="Calm"
              description="Peaceful, centered, at ease"
              onClick={() => handlePostMeditationState("calm")}
            />
            <StateButton
              label="Neutral"
              description="Present but unchanged"
              onClick={() => handlePostMeditationState("neutral")}
            />
            <StateButton
              label="Distracted"
              description="Mind was busy, couldn't settle"
              onClick={() => handlePostMeditationState("distracted")}
            />
          </div>
        </div>
      </div>
    );
  }

  if (step === "post_meditation_dump") {
    return (
      <PostMeditationDump
        onComplete={handlePostMeditationDump}
        onSkip={handleDumpSkip}
      />
    );
  }

  if (step === "extraction_review" && extractionResult) {
    return (
      <ExtractionReview
        extraction={extractionResult}
        onConfirm={handleExtractionConfirm}
        onSkip={handleExtractionSkip}
      />
    );
  }

  if (step === "embodiment" && embodimentResult) {
    return (
      <EmbodimentGuidance
        text={embodimentResult.embodimentText}
        emotion={embodimentResult.targetEmotion}
        durationMinutes={embodimentResult.suggestedDurationMinutes}
        onComplete={handleEmbodimentComplete}
        onSkip={handleEmbodimentSkip}
      />
    );
  }

  if (step === "action_opt_in") {
    return (
      <ActionOptIn
        onWantAction={handleWantAction}
        onComplete={handleComplete}
      />
    );
  }

  // --- LEGACY ACTION FLOW ---

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

// Helper component
function StateButton({
  label,
  description,
  onClick,
}: {
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg bg-bg-secondary border border-border hover:border-text-muted transition-colors"
    >
      <p className="text-text-primary font-medium">{label}</p>
      <p className="text-text-muted text-sm">{description}</p>
    </button>
  );
}
