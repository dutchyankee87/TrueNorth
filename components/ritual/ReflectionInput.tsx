"use client";

import { useState } from "react";
import { Button } from "@/components/shared";
import type { ExecutionStatus } from "@/lib/supabase/types";

interface ReflectionInputProps {
  guidanceText: string;
  onComplete: (reflection: {
    executed: ExecutionStatus;
    clarityDelta: number;
    note: string | null;
  }) => void;
}

const executionOptions: { value: ExecutionStatus; label: string }[] = [
  { value: "yes", label: "Yes, I did it" },
  { value: "partial", label: "Partially" },
  { value: "no", label: "No" },
];

const clarityOptions: { value: number; label: string }[] = [
  { value: 2, label: "Much clearer" },
  { value: 1, label: "Somewhat clearer" },
  { value: 0, label: "About the same" },
  { value: -1, label: "Less clear" },
  { value: -2, label: "Much less clear" },
];

export function ReflectionInput({
  guidanceText,
  onComplete,
}: ReflectionInputProps) {
  const [executed, setExecuted] = useState<ExecutionStatus | null>(null);
  const [clarityDelta, setClarityDelta] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  const canSubmit = executed !== null && clarityDelta !== null;

  function handleSubmit() {
    if (!canSubmit) return;
    onComplete({
      executed: executed!,
      clarityDelta: clarityDelta!,
      note: note.trim() || null,
    });
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-10">
        {/* Reminder of today's guidance */}
        <div className="text-center space-y-2">
          <p className="text-text-muted text-sm">Today&apos;s guidance was:</p>
          <p className="text-text-primary font-medium">{guidanceText}</p>
        </div>

        {/* Execution question */}
        <div className="space-y-4">
          <p className="text-lg text-text-primary font-medium">
            Did you follow through?
          </p>
          <div className="space-y-3">
            {executionOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setExecuted(option.value)}
                className={`w-full min-h-[56px] px-6 py-4 rounded-xl text-left transition-all duration-200 active:scale-[0.98] ${
                  executed === option.value
                    ? "bg-text-primary text-white"
                    : "bg-bg-secondary text-text-primary hover:bg-border"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clarity delta question */}
        <div className="space-y-4">
          <p className="text-lg text-text-primary font-medium">
            How do you feel compared to this morning?
          </p>
          <div className="space-y-3">
            {clarityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setClarityDelta(option.value)}
                className={`w-full min-h-[48px] px-6 py-3 rounded-xl text-left transition-all duration-200 active:scale-[0.98] ${
                  clarityDelta === option.value
                    ? "bg-text-primary text-white"
                    : "bg-bg-secondary text-text-primary hover:bg-border"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional note */}
        <div className="space-y-4">
          {!showNote ? (
            <button
              type="button"
              onClick={() => setShowNote(true)}
              className="text-text-secondary hover:text-text-primary text-sm transition-colors"
            >
              + Add a note
            </button>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm text-text-secondary">
                Any thoughts? (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What worked, what didn't, insights..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="mt-8 max-w-md mx-auto w-full">
        <Button onClick={handleSubmit} fullWidth disabled={!canSubmit}>
          Complete reflection
        </Button>
      </div>
    </div>
  );
}
