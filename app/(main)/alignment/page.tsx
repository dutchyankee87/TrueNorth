"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card } from "@/components/shared";

interface Identity {
  coreIdentity: string;
  futureVision: string | null;
  elevatedEmotions: string[] | null;
  leavingBehind: string[] | null;
  primaryConstraint: string | null;
  decisionFilter: string | null;
  currentPhase: string | null;
}

interface Guidance {
  id: string;
  guidanceType: "next_action" | "pause" | "close_loop";
  guidanceText: string;
  reasoning: string | null;
  createdAt: string;
}

export default function AlignmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [todaysGuidance, setTodaysGuidance] = useState<Guidance | null>(null);
  const [recentGuidance, setRecentGuidance] = useState<Guidance[]>([]);
  const [openLoopsCount, setOpenLoopsCount] = useState(0);

  // Next steps carousel state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [additionalSteps, setAdditionalSteps] = useState<string[]>([]);

  useEffect(() => {
    fetchAlignmentData();
  }, []);

  async function fetchAlignmentData() {
    try {
      const response = await fetch("/api/alignment");
      const data = await response.json();

      if (response.ok) {
        setIdentity(data.identity);
        setTodaysGuidance(data.todaysGuidance);
        setRecentGuidance(data.recentGuidance || []);
        setOpenLoopsCount(data.openLoopsCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch alignment data:", err);
    } finally {
      setLoading(false);
    }
  }

  // Parse identity pillars from coreIdentity text
  const identityPillars = identity?.coreIdentity
    ? identity.coreIdentity
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .slice(0, 6)
    : [];

  // Combine today's guidance with additional generated steps
  const allSteps = [
    todaysGuidance?.guidanceText,
    ...recentGuidance.slice(1, 4).map((g) => g.guidanceText),
    ...additionalSteps,
  ].filter(Boolean) as string[];

  const generateMoreSteps = useCallback(async () => {
    if (isGeneratingMore) return;
    setIsGeneratingMore(true);

    try {
      const response = await fetch("/api/alignment/next-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          existingSteps: allSteps,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.steps) {
          setAdditionalSteps((prev) => [...prev, ...data.steps]);
        }
      }
    } catch (err) {
      console.error("Failed to generate more steps:", err);
    } finally {
      setIsGeneratingMore(false);
    }
  }, [allSteps, isGeneratingMore]);

  function nextStep() {
    const newIndex = currentStepIndex + 1;
    setCurrentStepIndex(newIndex);

    // Generate more steps when nearing the end
    if (newIndex >= allSteps.length - 2 && !isGeneratingMore) {
      generateMoreSteps();
    }
  }

  function prevStep() {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }

  // Get icon for guidance type
  function getGuidanceIcon(type: string) {
    switch (type) {
      case "next_action":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        );
      case "pause":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "close_loop":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  // No identity yet
  if (!identity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg-primary">
        <div className="text-center max-w-md space-y-4">
          <h1 className="text-2xl font-semibold text-text-primary">
            Define your vision first
          </h1>
          <p className="text-text-secondary">
            Complete the onboarding to set your identity and vision. Then the
            system can guide you toward becoming who you&apos;re meant to be.
          </p>
          <Button onClick={() => router.push("/onboarding")}>
            Start Onboarding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary safe-area-top safe-area-bottom pb-24 lg:pb-8">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Alignment
          </h1>
          <p className="text-text-secondary mt-1">
            Who you&apos;re becoming and your next step
          </p>
        </div>

        {/* Identity Pillars Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide">
              Who You&apos;re Becoming
            </h2>
            <Link
              href="/identity"
              className="text-sm text-accent hover:underline"
            >
              Edit
            </Link>
          </div>

          {/* Pillar Grid */}
          {identityPillars.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {identityPillars.map((pillar, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 rounded-xl text-center"
                >
                  <p className="text-text-primary font-medium text-sm">
                    {pillar}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-text-secondary text-center py-4">
                Define who you&apos;re becoming in your{" "}
                <Link href="/identity" className="text-accent hover:underline">
                  identity settings
                </Link>
              </p>
            </Card>
          )}

          {/* Additional Identity Context */}
          <div className="flex flex-wrap gap-3">
            {identity.currentPhase && (
              <div className="px-3 py-1.5 bg-bg-secondary rounded-full">
                <span className="text-xs text-text-muted">Phase: </span>
                <span className="text-xs text-text-primary font-medium">{identity.currentPhase}</span>
              </div>
            )}
            {identity.primaryConstraint && (
              <div className="px-3 py-1.5 bg-bg-secondary rounded-full">
                <span className="text-xs text-text-muted">Protecting: </span>
                <span className="text-xs text-text-primary font-medium">{identity.primaryConstraint}</span>
              </div>
            )}
          </div>

          {/* Elevated emotions */}
          {identity.elevatedEmotions && identity.elevatedEmotions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-text-muted">Cultivating:</span>
              {identity.elevatedEmotions.map((emotion, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs font-medium"
                >
                  {emotion}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Next Steps Carousel */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide">
            Your Next Steps
          </h2>

          {allSteps.length > 0 ? (
            <Card className="border-2 border-accent/30 bg-white overflow-hidden">
              <div className="space-y-4">
                {/* Step indicator */}
                <div className="flex items-center justify-between text-sm text-text-muted">
                  <span>Step {currentStepIndex + 1}</span>
                  <div className="flex items-center gap-1">
                    {allSteps.slice(0, Math.min(allSteps.length, 5)).map((_, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          i === currentStepIndex % 5 ? "bg-accent" : "bg-bg-tertiary"
                        }`}
                      />
                    ))}
                    {allSteps.length > 5 && (
                      <span className="text-xs ml-1">+{allSteps.length - 5}</span>
                    )}
                  </div>
                </div>

                {/* Current step */}
                <div className="min-h-[80px] flex items-center">
                  <p className="text-lg text-text-primary font-medium leading-relaxed">
                    {allSteps[currentStepIndex] || "No more steps available"}
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <button
                    onClick={prevStep}
                    disabled={currentStepIndex === 0}
                    className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <button
                    onClick={nextStep}
                    disabled={currentStepIndex >= allSteps.length - 1 && !isGeneratingMore}
                    className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGeneratingMore ? (
                      <>
                        <span className="animate-pulse">Generating...</span>
                      </>
                    ) : (
                      <>
                        Next
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-6 space-y-3">
                <p className="text-text-secondary">
                  No guidance yet today
                </p>
                <Button onClick={() => router.push("/ritual")}>
                  Begin Daily Ritual
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* What you're releasing */}
        {identity.leavingBehind && identity.leavingBehind.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide">
              Releasing
            </h2>
            <div className="p-4 bg-bg-secondary rounded-xl">
              <ul className="space-y-2">
                {identity.leavingBehind.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="text-text-muted">—</span>
                    <span className="line-through opacity-70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Link to Open Loops */}
        <Link href="/loops">
          <div className="p-4 bg-bg-secondary rounded-xl hover:bg-bg-tertiary transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Open loops</p>
                <p className="text-text-primary font-medium">{openLoopsCount} items need attention</p>
              </div>
              <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Dispenza-inspired footer */}
        <div className="text-center pt-4">
          <p className="text-sm text-text-muted italic">
            &quot;The best way to predict your future is to create it —
            not from the known, but from the unknown.&quot;
          </p>
        </div>
      </div>
    </div>
  );
}


