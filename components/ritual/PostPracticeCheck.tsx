"use client";

import { Button } from "@/components/shared";
import type { PostShift } from "@/lib/supabase/types";

interface PostPracticeCheckProps {
  onComplete: (shift: PostShift) => void;
}

const shiftOptions: { value: PostShift; label: string }[] = [
  { value: "notable", label: "Yes, notably" },
  { value: "slight", label: "Slightly" },
  { value: "none", label: "Not really" },
];

export function PostPracticeCheck({ onComplete }: PostPracticeCheckProps) {
  return (
    <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
      <div className="flex-1 flex flex-col justify-center items-center text-center max-w-md mx-auto w-full space-y-8">
        <p className="text-2xl font-medium text-text-primary">
          Did anything shift?
        </p>
      </div>

      <div className="mt-8 max-w-md mx-auto w-full space-y-3">
        {shiftOptions.map((option) => (
          <Button
            key={option.value}
            onClick={() => onComplete(option.value)}
            variant={option.value === "notable" ? "primary" : "secondary"}
            fullWidth
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
