"use client";

interface ActionOptInProps {
  onWantAction: () => void;
  onComplete: () => void;
}

export function ActionOptIn({ onWantAction, onComplete }: ActionOptInProps) {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-text-muted text-sm uppercase tracking-wider mb-4">
          Embodiment complete
        </p>

        <h1 className="text-2xl font-medium text-text-primary mb-4">
          From this state...
        </h1>

        <p className="text-text-secondary mb-12 leading-relaxed">
          You&apos;ve done the inner work. The feeling is in your body.
          Would you like action guidance, or is today about being, not doing?
        </p>

        <div className="space-y-4">
          <button
            onClick={onWantAction}
            className="w-full py-4 bg-bg-secondary border border-border rounded-lg text-text-primary hover:border-text-muted transition-colors"
          >
            <span className="font-medium">Get action guidance</span>
            <p className="text-text-muted text-sm mt-1">
              Channel this state into movement
            </p>
          </button>

          <button
            onClick={onComplete}
            className="w-full py-4 bg-text-primary text-bg-primary rounded-lg font-medium hover:bg-text-secondary transition-colors"
          >
            I&apos;m complete for today
          </button>

          <p className="text-text-muted text-sm">
            Sometimes embodiment is enough.
          </p>
        </div>
      </div>
    </div>
  );
}
