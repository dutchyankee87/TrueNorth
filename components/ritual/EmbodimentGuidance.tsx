"use client";

import { useState, useEffect, useRef } from "react";
import type { EmbodimentShift } from "@/lib/supabase/types";

interface EmbodimentGuidanceProps {
  text: string;
  emotion: string;
  durationMinutes: number;
  onComplete: (feltShift: EmbodimentShift, actualDurationSeconds: number) => void;
  onSkip: () => void;
}

export function EmbodimentGuidance({
  text,
  emotion,
  durationMinutes,
  onComplete,
  onSkip,
}: EmbodimentGuidanceProps) {
  const [phase, setPhase] = useState<"intro" | "timer" | "reflection">("intro");
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  const totalSeconds = durationMinutes * 60;
  const progress = Math.min(elapsed / totalSeconds, 1);

  // Timer logic
  useEffect(() => {
    if (phase !== "timer" || isPaused) return;

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const newElapsed = Math.floor((now - startTimeRef.current!) / 1000);
      setElapsed(newElapsed);

      if (newElapsed >= totalSeconds) {
        setPhase("reflection");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, isPaused, totalSeconds]);

  // Format time display
  const remaining = Math.max(0, totalSeconds - elapsed);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  function handleBegin() {
    setPhase("timer");
  }

  function handleEndEarly() {
    setPhase("reflection");
  }

  function handleShiftSelection(shift: EmbodimentShift) {
    onComplete(shift, elapsed);
  }

  // Intro phase - show the embodiment instruction
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6">
        <div className="max-w-xl text-center">
          {/* Emotion badge */}
          <div className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm mb-8 capitalize">
            {emotion}
          </div>

          {/* Main instruction */}
          <p className="text-2xl sm:text-3xl font-light text-text-primary leading-relaxed mb-12">
            {text}
          </p>

          {/* Duration */}
          <p className="text-text-muted mb-8">
            {durationMinutes} minutes of feeling
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleBegin}
              className="px-8 py-4 bg-text-primary text-bg-primary rounded-lg font-medium hover:bg-text-secondary transition-colors"
            >
              Begin embodiment
            </button>
            <button
              onClick={onSkip}
              className="px-8 py-4 text-text-muted hover:text-text-secondary transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Timer phase - immersive practice mode
  if (phase === "timer") {
    return (
      <div className="practice-mode">
        {/* Subtle progress indicator at top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-border">
          <div
            className="h-full bg-accent/50 transition-all duration-1000 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Central breathing/feeling cue */}
        <div className="flex flex-col items-center justify-center min-h-screen px-8">
          {/* Pulsing circle to represent feeling */}
          <div className="relative mb-12">
            <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-text-secondary text-sm uppercase tracking-wider">
                Feel it now
              </p>
            </div>
          </div>

          {/* Emotion reminder */}
          <p className="text-xl text-text-primary mb-2 capitalize">
            {emotion}
          </p>

          {/* Timer */}
          <p className="text-text-muted text-sm tabular-nums">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </p>
        </div>

        {/* End early button */}
        <button
          onClick={handleEndEarly}
          className="absolute bottom-8 right-8 text-text-muted hover:text-text-secondary text-sm transition-colors"
        >
          Complete now
        </button>

        {/* Pause/resume button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="absolute bottom-8 left-8 text-text-muted hover:text-text-secondary text-sm transition-colors"
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>
    );
  }

  // Reflection phase - ask about the shift
  if (phase === "reflection") {
    const actualMinutes = Math.floor(elapsed / 60);
    const actualSeconds = elapsed % 60;

    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="text-text-muted text-sm mb-2">
            {actualMinutes}:{actualSeconds.toString().padStart(2, "0")} of embodiment
          </p>

          <h1 className="text-2xl font-medium text-text-primary mb-8">
            How did it feel?
          </h1>

          <div className="space-y-3">
            <ShiftButton
              label="Deep shift"
              description="Something moved. I felt it fully."
              onClick={() => handleShiftSelection("deep")}
            />
            <ShiftButton
              label="Moderate shift"
              description="Present glimpses. Getting there."
              onClick={() => handleShiftSelection("moderate")}
            />
            <ShiftButton
              label="Slight shift"
              description="Touched it briefly. Mind was active."
              onClick={() => handleShiftSelection("slight")}
            />
            <ShiftButton
              label="No shift"
              description="Couldn't connect today. That's okay."
              onClick={() => handleShiftSelection("none")}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function ShiftButton({
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
