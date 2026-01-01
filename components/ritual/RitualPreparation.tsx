"use client";

import { Button } from "@/components/shared";

interface RitualPreparationProps {
  onDoBreathing: () => void;
  onSkipToCheckIn: () => void;
}

export function RitualPreparation({
  onDoBreathing,
  onSkipToCheckIn,
}: RitualPreparationProps) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary safe-area-top safe-area-bottom">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md mx-auto text-center space-y-8">
          {/* Greeting */}
          <div className="space-y-3">
            <p className="text-text-muted text-sm uppercase tracking-wide">
              Daily Ritual
            </p>
            <h1 className="text-3xl font-semibold text-text-primary">
              Before we begin
            </h1>
          </div>

          {/* Philosophy */}
          <div className="space-y-4 text-text-secondary">
            <p className="text-lg leading-relaxed">
              The quality of your decisions flows from the quality of your state.
            </p>
            <p className="leading-relaxed">
              For best results, arrive here already having meditated, feeling coherent and elevated.
              If you haven&apos;t, we can do a brief breathing practice together.
            </p>
          </div>

          {/* State check */}
          <div className="p-6 bg-bg-secondary rounded-2xl space-y-4">
            <p className="text-text-primary font-medium">
              How are you arriving?
            </p>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <span className="text-xl">🧘</span>
                <p className="text-sm text-text-secondary">
                  I&apos;ve already meditated and feel centered
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">💨</span>
                <p className="text-sm text-text-secondary">
                  I could use a few minutes to center myself
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">⚡</span>
                <p className="text-sm text-text-secondary">
                  I&apos;m in a rush but want to check in
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button onClick={onDoBreathing} fullWidth>
              Do Coherence Breathing (3 min)
            </Button>
            <Button onClick={onSkipToCheckIn} variant="ghost" fullWidth>
              I&apos;m ready, continue
            </Button>
          </div>

          {/* Gentle reminder */}
          <p className="text-xs text-text-muted pt-4">
            There&apos;s no judgment here. Some days we have time to prepare,
            other days we don&apos;t. The practice meets you where you are.
          </p>
        </div>
      </div>
    </div>
  );
}
