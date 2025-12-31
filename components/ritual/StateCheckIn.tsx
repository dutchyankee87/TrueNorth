"use client";

import { useState } from "react";
import { Button } from "@/components/shared";
import type { MentalClarity, EmotionalState, PhysicalEnergy } from "@/lib/supabase/types";

interface StateCheckInProps {
  onComplete: (state: {
    mental: MentalClarity;
    emotional: EmotionalState;
    physical: PhysicalEnergy;
    contextDump: string | null;
  }) => void;
}

interface OptionConfig<T> {
  value: T;
  label: string;
  subtext?: string;
}

const mentalOptions: OptionConfig<MentalClarity>[] = [
  { value: "yes", label: "Yes", subtext: "I can hold complex thought" },
  { value: "somewhat", label: "Somewhat", subtext: "Functional but not sharp" },
  { value: "no", label: "No", subtext: "Foggy, struggling to focus" },
];

const emotionalOptions: OptionConfig<EmotionalState>[] = [
  { value: "nothing", label: "Nothing", subtext: "Emotionally clear" },
  { value: "minor", label: "Minor pull", subtext: "Something small nagging" },
  { value: "significant", label: "Significant", subtext: "Major unresolved weight" },
];

const physicalOptions: OptionConfig<PhysicalEnergy>[] = [
  { value: "good", label: "Good", subtext: "Body feels ready" },
  { value: "ok", label: "Ok", subtext: "Manageable" },
  { value: "low", label: "Low", subtext: "Depleted, need rest" },
];

function OptionButton<T extends string>({
  option,
  selected,
  onSelect,
}: {
  option: OptionConfig<T>;
  selected: boolean;
  onSelect: (value: T) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.value)}
      className={`w-full min-h-[56px] sm:min-h-[64px] px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-left transition-all duration-200 active:scale-[0.98] ${
        selected
          ? "bg-text-primary text-white"
          : "bg-bg-secondary text-text-primary hover:bg-border"
      }`}
    >
      <span className="block font-medium">{option.label}</span>
      {option.subtext && (
        <span
          className={`block text-sm mt-0.5 ${
            selected ? "text-white/70" : "text-text-secondary"
          }`}
        >
          {option.subtext}
        </span>
      )}
    </button>
  );
}

export function StateCheckIn({ onComplete }: StateCheckInProps) {
  const [mental, setMental] = useState<MentalClarity | null>(null);
  const [emotional, setEmotional] = useState<EmotionalState | null>(null);
  const [physical, setPhysical] = useState<PhysicalEnergy | null>(null);
  const [contextDump, setContextDump] = useState("");
  const [showContextInput, setShowContextInput] = useState(false);

  const allAnswered = mental !== null && emotional !== null && physical !== null;

  function handleSubmit() {
    if (!allAnswered) return;
    onComplete({
      mental: mental!,
      emotional: emotional!,
      physical: physical!,
      contextDump: contextDump.trim() || null,
    });
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-10">
        {/* Mental Clarity */}
        <div className="space-y-4">
          <p className="text-lg text-text-primary font-medium">
            Do you have mental clarity right now?
          </p>
          <div className="space-y-3">
            {mentalOptions.map((option) => (
              <OptionButton
                key={option.value}
                option={option}
                selected={mental === option.value}
                onSelect={setMental}
              />
            ))}
          </div>
        </div>

        {/* Emotional State */}
        <div className="space-y-4">
          <p className="text-lg text-text-primary font-medium">
            Is something emotionally pulling at you?
          </p>
          <div className="space-y-3">
            {emotionalOptions.map((option) => (
              <OptionButton
                key={option.value}
                option={option}
                selected={emotional === option.value}
                onSelect={setEmotional}
              />
            ))}
          </div>
        </div>

        {/* Physical Energy */}
        <div className="space-y-4">
          <p className="text-lg text-text-primary font-medium">
            How is your physical energy?
          </p>
          <div className="space-y-3">
            {physicalOptions.map((option) => (
              <OptionButton
                key={option.value}
                option={option}
                selected={physical === option.value}
                onSelect={setPhysical}
              />
            ))}
          </div>
        </div>

        {/* Context Dump (Optional) */}
        <div className="space-y-4">
          {!showContextInput ? (
            <button
              type="button"
              onClick={() => setShowContextInput(true)}
              className="text-text-secondary hover:text-text-primary text-sm transition-colors"
            >
              + Anything else on your mind?
            </button>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm text-text-secondary">
                Anything else on your mind? (optional)
              </label>
              <textarea
                value={contextDump}
                onChange={(e) => setContextDump(e.target.value)}
                placeholder="Free-form thoughts, worries, things pulling at you..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Continue Button */}
      <div className="mt-8 max-w-md mx-auto w-full">
        <Button
          onClick={handleSubmit}
          fullWidth
          disabled={!allAnswered}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
