"use client";

import { useState, useEffect, useCallback } from "react";
import { COHERENCE_BREATHING_OVERLAYS } from "@/lib/llm/prompts";

interface CoherenceBreathingTimerProps {
  durationMinutes: number;
  breathPattern?: string; // "5-5" = 5s inhale, 5s exhale
  onComplete: (durationSeconds: number) => void;
  onExit: () => void;
  skippable?: boolean; // Show skip button at start
}

type BreathPhase = "inhale" | "exhale";

export function CoherenceBreathingTimer({
  durationMinutes,
  breathPattern = "5-5",
  onComplete,
  onExit,
  skippable = false,
}: CoherenceBreathingTimerProps) {
  // Parse breath pattern
  const [inhaleSeconds, exhaleSeconds] = breathPattern.split("-").map(Number);
  const breathCycleDuration = inhaleSeconds + exhaleSeconds;

  const [elapsed, setElapsed] = useState(0);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>("inhale");
  const [breathProgress, setBreathProgress] = useState(0); // 0-1 within current phase
  const [overlayText, setOverlayText] = useState<string | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const totalSeconds = durationMinutes * 60;
  const progress = Math.min(elapsed / totalSeconds, 1);

  // Handle completion
  const handleComplete = useCallback(() => {
    setIsComplete(true);
    onComplete(elapsed);
  }, [elapsed, onComplete]);

  // Main timer
  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 0.1; // 100ms intervals for smooth animation
        if (next >= totalSeconds) {
          handleComplete();
          return totalSeconds;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [totalSeconds, isComplete, handleComplete]);

  // Breath phase management
  useEffect(() => {
    if (isComplete) return;

    const cyclePosition = elapsed % breathCycleDuration;

    if (cyclePosition < inhaleSeconds) {
      setBreathPhase("inhale");
      setBreathProgress(cyclePosition / inhaleSeconds);
    } else {
      setBreathPhase("exhale");
      setBreathProgress((cyclePosition - inhaleSeconds) / exhaleSeconds);
    }
  }, [elapsed, breathCycleDuration, inhaleSeconds, exhaleSeconds, isComplete]);

  // Overlay text rotation (every 20-40 seconds)
  useEffect(() => {
    if (isComplete) return;

    // Start with delay so user can settle in
    const initialDelay = setTimeout(() => {
      showRandomOverlay();
    }, 10000); // First overlay after 10 seconds

    return () => clearTimeout(initialDelay);
  }, [isComplete]);

  useEffect(() => {
    if (isComplete || elapsed < 10) return;

    // Show overlay every 20-40 seconds
    const nextOverlayIn = Math.random() * 20000 + 20000; // 20-40 seconds
    const timeout = setTimeout(() => {
      showRandomOverlay();
    }, nextOverlayIn);

    return () => clearTimeout(timeout);
  }, [overlayText, isComplete, elapsed]);

  function showRandomOverlay() {
    const randomIndex = Math.floor(Math.random() * COHERENCE_BREATHING_OVERLAYS.length);
    setOverlayText(COHERENCE_BREATHING_OVERLAYS[randomIndex]);
    setOverlayVisible(true);

    // Hide after 4 seconds
    setTimeout(() => {
      setOverlayVisible(false);
    }, 4000);
  }

  // Calculate circle size based on breath phase
  const circleScale = breathPhase === "inhale"
    ? 1 + (breathProgress * 0.5) // Expands from 1 to 1.5
    : 1.5 - (breathProgress * 0.5); // Contracts from 1.5 to 1

  // Format remaining time
  const remainingSeconds = Math.max(0, totalSeconds - elapsed);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = Math.floor(remainingSeconds % 60);

  return (
    <div className="practice-mode">
      {/* Subtle progress indicator at top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-border">
        <div
          className="h-full bg-text-muted transition-all duration-100 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Main breathing visualization */}
      <div className="flex flex-col items-center justify-center min-h-screen px-8">
        {/* Breathing circle */}
        <div className="relative mb-12">
          <div
            className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 transition-transform duration-1000 ease-in-out"
            style={{ transform: `scale(${circleScale})` }}
          />

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-accent/50" />
          </div>
        </div>

        {/* Breath phase indicator */}
        <p className="text-lg text-text-secondary mb-4 tracking-wider uppercase">
          {breathPhase === "inhale" ? "Breathe in..." : "Breathe out..."}
        </p>

        {/* Overlay text (Dispenza-style prompts) */}
        <div
          className={`absolute inset-x-8 top-1/2 -translate-y-1/2 text-center fade-transition ${
            overlayVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-xl sm:text-2xl md:text-3xl font-light text-text-primary leading-relaxed italic">
            {overlayText}
          </p>
        </div>

        {/* Timer (subtle) */}
        <div className="absolute bottom-24 text-text-muted text-sm tabular-nums">
          {minutes}:{seconds.toString().padStart(2, "0")} remaining
        </div>
      </div>

      {/* Skip button (if skippable) or Exit button */}
      {skippable ? (
        <button
          onClick={onExit}
          className="absolute bottom-8 right-8 text-text-muted hover:text-text-secondary text-sm transition-colors"
        >
          Skip breathing →
        </button>
      ) : (
        <button
          onClick={onExit}
          className="absolute bottom-8 right-8 text-text-muted hover:text-text-secondary text-sm transition-colors"
        >
          Exit
        </button>
      )}

      {/* Breath guidance hint */}
      <p className="absolute bottom-8 left-8 text-text-muted text-sm">
        {inhaleSeconds}s in, {exhaleSeconds}s out
      </p>
    </div>
  );
}
