"use client";

import { useState, useEffect, useCallback } from "react";
import type { Practice, PracticeInstruction } from "@/lib/supabase/types";

interface PracticeExperienceProps {
  practice: Practice;
  onComplete: () => void;
  onSkip: () => void;
}

export function PracticeExperience({
  practice,
  onComplete,
  onSkip,
}: PracticeExperienceProps) {
  const instructions = practice.instructions as unknown as PracticeInstruction[];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  const currentInstruction = instructions[currentIndex];
  const isLastInstruction = currentIndex === instructions.length - 1;

  const advanceToNext = useCallback(() => {
    if (isLastInstruction) {
      onComplete();
      return;
    }

    // Fade out
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsVisible(true);
    }, 300);
  }, [isLastInstruction, onComplete]);

  // Auto-advance based on instruction duration
  useEffect(() => {
    if (!currentInstruction) return;

    const timer = setTimeout(() => {
      advanceToNext();
    }, currentInstruction.duration * 1000);

    return () => clearTimeout(timer);
  }, [currentIndex, currentInstruction, advanceToNext]);

  // Track elapsed time for subtle progress
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle tap to advance
  function handleTap() {
    advanceToNext();
  }

  // Calculate progress (subtle)
  const progress = Math.min(elapsed / practice.duration_seconds, 1);

  return (
    <div
      className="practice-mode cursor-pointer"
      onClick={handleTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          handleTap();
        }
      }}
    >
      {/* Subtle progress indicator at top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-border">
        <div
          className="h-full bg-text-muted transition-all duration-1000 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Instruction text */}
      <div
        className={`px-8 text-center fade-transition ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-xl sm:text-2xl md:text-3xl font-medium text-text-primary leading-relaxed">
          {currentInstruction?.text}
        </p>
      </div>

      {/* Skip button (subtle, bottom corner) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSkip();
        }}
        className="absolute bottom-8 right-8 text-text-muted hover:text-text-secondary text-sm transition-colors"
      >
        Skip
      </button>

      {/* Tap hint (fades after first tap) */}
      {currentIndex === 0 && (
        <p className="absolute bottom-8 left-8 text-text-muted text-sm">
          Tap anywhere to continue
        </p>
      )}
    </div>
  );
}
