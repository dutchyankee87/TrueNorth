"use client";

import { useState } from "react";
import { Button } from "@/components/shared";
import type { GuidanceType } from "@/lib/supabase/types";

interface GuidanceDisplayProps {
  type: GuidanceType;
  text: string;
  reasoning: string | null;
  practiceCompleted?: boolean;
  onAcknowledge: () => void;
}

const typeLabels: Record<GuidanceType, string> = {
  next_action: "Next Action",
  pause: "Pause",
  close_loop: "Close Loop",
  embody: "Embody",
};

export function GuidanceDisplay({
  type,
  text,
  reasoning,
  practiceCompleted = false,
  onAcknowledge,
}: GuidanceDisplayProps) {
  const [showReasoning, setShowReasoning] = useState(false);

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
      <div className="flex-1 flex flex-col justify-center items-center text-center max-w-md mx-auto w-full space-y-8">
        {/* Practice acknowledgment */}
        {practiceCompleted && (
          <p className="text-text-secondary text-sm">
            You have the clarity for this now.
          </p>
        )}

        {/* Type label */}
        <span className="text-text-muted text-sm uppercase tracking-wider">
          {typeLabels[type]}
        </span>

        {/* Guidance text - the hero */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-medium text-text-primary leading-relaxed">
          {text}
        </h1>

        {/* Why this? */}
        {reasoning && (
          <div className="space-y-2">
            {!showReasoning ? (
              <button
                onClick={() => setShowReasoning(true)}
                className="text-text-muted hover:text-text-secondary text-sm transition-colors"
              >
                Why this?
              </button>
            ) : (
              <p className="text-text-secondary text-sm leading-relaxed fade-transition">
                {reasoning}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Acknowledge */}
      <div className="mt-8 max-w-md mx-auto w-full">
        <Button onClick={onAcknowledge} fullWidth>
          Got it
        </Button>
      </div>
    </div>
  );
}
