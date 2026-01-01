"use client";

import { useState } from "react";
import type { MeditationExtractionResult, ExtractedLoop, VisionUpdate, IdentityInsight } from "@/lib/llm/meditation-extraction";

interface ExtractionReviewProps {
  extraction: MeditationExtractionResult;
  onConfirm: (confirmedItems: ConfirmedExtractions) => void;
  onSkip: () => void;
}

export interface ConfirmedExtractions {
  loops: ExtractedLoop[];
  visionUpdates: VisionUpdate[];
  emotionShifts: string[];
  patternsReleasing: string[];
  identityInsights: IdentityInsight[];
}

export function ExtractionReview({
  extraction,
  onConfirm,
  onSkip,
}: ExtractionReviewProps) {
  // Track which items are confirmed (all start as confirmed)
  const [confirmedLoops, setConfirmedLoops] = useState<Set<number>>(
    new Set(extraction.openLoops.map((_, i) => i))
  );
  const [confirmedVisionUpdates, setConfirmedVisionUpdates] = useState<Set<number>>(
    new Set(extraction.visionUpdates.map((_, i) => i))
  );
  const [confirmedEmotions, setConfirmedEmotions] = useState<Set<number>>(
    new Set(extraction.emotionShifts.map((_, i) => i))
  );
  const [confirmedPatterns, setConfirmedPatterns] = useState<Set<number>>(
    new Set(extraction.patternsReleasing.map((_, i) => i))
  );
  const [confirmedInsights, setConfirmedInsights] = useState<Set<number>>(
    new Set(extraction.identityInsights.map((_, i) => i))
  );

  const toggleItem = (set: Set<number>, setFn: (s: Set<number>) => void, index: number) => {
    const newSet = new Set(set);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setFn(newSet);
  };

  function handleConfirm() {
    onConfirm({
      loops: extraction.openLoops.filter((_, i) => confirmedLoops.has(i)),
      visionUpdates: extraction.visionUpdates.filter((_, i) => confirmedVisionUpdates.has(i)),
      emotionShifts: extraction.emotionShifts.filter((_, i) => confirmedEmotions.has(i)),
      patternsReleasing: extraction.patternsReleasing.filter((_, i) => confirmedPatterns.has(i)),
      identityInsights: extraction.identityInsights.filter((_, i) => confirmedInsights.has(i)),
    });
  }

  const hasAnyItems =
    extraction.openLoops.length > 0 ||
    extraction.visionUpdates.length > 0 ||
    extraction.emotionShifts.length > 0 ||
    extraction.patternsReleasing.length > 0 ||
    extraction.identityInsights.length > 0;

  // If nothing was extracted, show a simpler message
  if (!hasAnyItems) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="text-xl text-text-primary mb-4">
            Your meditation was received.
          </p>
          <p className="text-text-secondary mb-8">
            {extraction.summary}
          </p>
          <button
            onClick={onSkip}
            className="px-8 py-4 bg-text-primary text-bg-primary rounded-lg font-medium hover:bg-text-secondary transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-text-primary mb-2">
            What emerged from coherence
          </h1>
          <p className="text-text-secondary">
            {extraction.summary}
          </p>
          <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm bg-bg-secondary text-text-muted">
            Coherence level: {extraction.coherenceLevel}
          </div>
        </div>

        {/* Open Loops */}
        {extraction.openLoops.length > 0 && (
          <Section title="Open Loops">
            {extraction.openLoops.map((loop, i) => (
              <ToggleCard
                key={i}
                isConfirmed={confirmedLoops.has(i)}
                onToggle={() => toggleItem(confirmedLoops, setConfirmedLoops, i)}
              >
                <p className="text-text-primary">{loop.description}</p>
                <p className="text-text-muted text-sm mt-1">
                  {loop.commitmentType} · Pull: {loop.cognitivePull}/5
                  {loop.externalParty && ` · ${loop.externalParty}`}
                </p>
              </ToggleCard>
            ))}
          </Section>
        )}

        {/* Vision Updates */}
        {extraction.visionUpdates.length > 0 && (
          <Section title="Vision Insights">
            {extraction.visionUpdates.map((update, i) => (
              <ToggleCard
                key={i}
                isConfirmed={confirmedVisionUpdates.has(i)}
                onToggle={() => toggleItem(confirmedVisionUpdates, setConfirmedVisionUpdates, i)}
              >
                <p className="text-text-primary">{update.content}</p>
                <p className="text-text-muted text-sm mt-1 capitalize">
                  {update.type}: {update.reasoning}
                </p>
              </ToggleCard>
            ))}
          </Section>
        )}

        {/* Patterns Releasing */}
        {extraction.patternsReleasing.length > 0 && (
          <Section title="Ready to Release">
            {extraction.patternsReleasing.map((pattern, i) => (
              <ToggleCard
                key={i}
                isConfirmed={confirmedPatterns.has(i)}
                onToggle={() => toggleItem(confirmedPatterns, setConfirmedPatterns, i)}
              >
                <p className="text-text-primary line-through decoration-text-muted/50">
                  {pattern}
                </p>
              </ToggleCard>
            ))}
          </Section>
        )}

        {/* Emotion Shifts */}
        {extraction.emotionShifts.length > 0 && (
          <Section title="Elevated Emotions">
            <div className="flex flex-wrap gap-2">
              {extraction.emotionShifts.map((emotion, i) => (
                <button
                  key={i}
                  onClick={() => toggleItem(confirmedEmotions, setConfirmedEmotions, i)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    confirmedEmotions.has(i)
                      ? "bg-accent/10 text-accent border border-accent/30"
                      : "bg-bg-secondary text-text-muted border border-border"
                  }`}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Identity Insights */}
        {extraction.identityInsights.length > 0 && (
          <Section title="Identity Insights">
            {extraction.identityInsights.map((insight, i) => (
              <ToggleCard
                key={i}
                isConfirmed={confirmedInsights.has(i)}
                onToggle={() => toggleItem(confirmedInsights, setConfirmedInsights, i)}
              >
                <p className="text-text-primary">{insight.content}</p>
                <p className="text-text-muted text-sm mt-1">
                  {insight.type}: {insight.reasoning}
                </p>
              </ToggleCard>
            ))}
          </Section>
        )}

        {/* Actions */}
        <div className="flex gap-4 mt-12">
          <button
            onClick={onSkip}
            className="flex-1 py-4 text-text-muted hover:text-text-secondary transition-colors"
          >
            Skip all
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-4 bg-text-primary text-bg-primary rounded-lg font-medium hover:bg-text-secondary transition-colors"
          >
            Save selected
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Components

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ToggleCard({
  isConfirmed,
  onToggle,
  children,
}: {
  isConfirmed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left p-4 rounded-lg border transition-colors ${
        isConfirmed
          ? "bg-bg-secondary border-border"
          : "bg-transparent border-border/50 opacity-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-1 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
            isConfirmed
              ? "bg-accent border-accent"
              : "bg-transparent border-text-muted"
          }`}
        >
          {isConfirmed && (
            <svg className="w-3 h-3 text-bg-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </button>
  );
}
