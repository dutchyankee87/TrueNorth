"use client";

import { Button } from "@/components/shared";
import type { Practice } from "@/lib/supabase/types";

interface ElevationOfferProps {
  practice: Practice;
  reasoning: string;
  onAccept: () => void;
  onSkip: () => void;
}

export function ElevationOffer({
  practice,
  reasoning,
  onAccept,
  onSkip,
}: ElevationOfferProps) {
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
      <div className="flex-1 flex flex-col justify-center items-center text-center max-w-md mx-auto w-full space-y-8">
        {/* Context */}
        <p className="text-text-secondary text-lg">
          {reasoning}
        </p>

        {/* Practice Offer */}
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-text-primary">
            {practice.name}
          </h1>
          <p className="text-text-muted">
            {formatDuration(practice.duration_seconds)}
          </p>
        </div>

        {/* Description based on target deficit */}
        <p className="text-text-secondary">
          {practice.target_deficit === "emotional" &&
            "A brief practice to release what you're holding."}
          {practice.target_deficit === "physical" &&
            "A quick reset to reconnect with your body."}
          {practice.target_deficit === "mental" &&
            "A moment to let the mental noise settle."}
          {practice.target_deficit === "general" &&
            "A centering practice to restore coherence."}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-8 max-w-md mx-auto w-full space-y-3">
        <Button onClick={onAccept} fullWidth>
          Begin practice
        </Button>
        <Button onClick={onSkip} variant="ghost" fullWidth>
          Skip for now
        </Button>
      </div>
    </div>
  );
}
