"use client";

import { useState, useEffect, useCallback } from "react";
import { FUTURE_SELF_VISUALIZATION_PROMPTS } from "@/lib/llm/prompts";

interface FutureSelfVisualizationProps {
  futureVision: string | null;
  elevatedEmotions: string[];
  onComplete: () => void;
  onSkip: () => void;
}

export function FutureSelfVisualization({
  futureVision,
  elevatedEmotions,
  onComplete,
  onSkip,
}: FutureSelfVisualizationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Build prompts - use standard prompts plus personalized ones
  const prompts = [...FUTURE_SELF_VISUALIZATION_PROMPTS];

  // Insert personalized vision prompt after the third standard prompt if vision exists
  if (futureVision && prompts.length > 3) {
    prompts.splice(3, 0, futureVision);
  }

  // Add elevated emotions prompt if available
  if (elevatedEmotions.length > 0) {
    const emotionsList = elevatedEmotions.slice(0, 3).join(", ");
    prompts.splice(
      prompts.length - 1,
      0,
      `Feel ${emotionsList} flowing through you. This is your natural state.`
    );
  }

  const currentPrompt = prompts[currentIndex];
  const isLastPrompt = currentIndex === prompts.length - 1;

  const advanceToNext = useCallback(() => {
    if (isLastPrompt) {
      onComplete();
      return;
    }

    // Fade out
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsVisible(true);
    }, 500);
  }, [isLastPrompt, onComplete]);

  // Auto-advance every 8 seconds (longer for contemplation)
  useEffect(() => {
    const timer = setTimeout(() => {
      advanceToNext();
    }, 8000);

    return () => clearTimeout(timer);
  }, [currentIndex, advanceToNext]);

  // Handle tap to advance
  function handleTap() {
    advanceToNext();
  }

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
      {/* Subtle progress dots */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-2">
        {prompts.map((_, idx) => (
          <div
            key={idx}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              idx === currentIndex ? "bg-text-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Prompt text */}
      <div
        className={`px-8 text-center fade-transition ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ transition: "opacity 500ms ease-in-out" }}
      >
        <p className="text-xl sm:text-2xl md:text-3xl font-light text-text-primary leading-relaxed max-w-2xl">
          {currentPrompt}
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
        Skip to breathing
      </button>

      {/* Tap hint */}
      {currentIndex === 0 && (
        <p className="absolute bottom-8 left-8 text-text-muted text-sm">
          Tap to continue
        </p>
      )}
    </div>
  );
}
