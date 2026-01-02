"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Identity {
  coreIdentity: string;
  futureVision: string | null;
  currentPhase: string | null;
}

interface Guidance {
  id: string;
  guidanceType: "next_action" | "pause" | "close_loop";
  guidanceText: string;
  reasoning: string | null;
  createdAt: string;
}

export default function AlignmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [todaysGuidance, setTodaysGuidance] = useState<Guidance | null>(null);
  const [openLoopsCount, setOpenLoopsCount] = useState(0);

  useEffect(() => {
    fetchAlignmentData();
  }, []);

  async function fetchAlignmentData() {
    try {
      const response = await fetch("/api/alignment");
      const data = await response.json();

      if (response.ok) {
        setIdentity(data.identity);
        setTodaysGuidance(data.todaysGuidance);
        setOpenLoopsCount(data.openLoopsCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch alignment data:", err);
    } finally {
      setLoading(false);
    }
  }

  // Get the primary identity (first one)
  const primaryIdentity = identity?.coreIdentity
    ?.split(/[,\n]/)[0]
    ?.trim() || null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#FAFAF9]">
        <div className="text-center max-w-sm">
          <p className="text-stone-400 text-sm tracking-wide uppercase mb-3">
            Before you begin
          </p>
          <h1 className="text-2xl text-stone-900 font-light mb-4">
            Define who you're becoming
          </h1>
          <p className="text-stone-500 mb-8 leading-relaxed">
            The system needs to understand your identity before it can guide you.
          </p>
          <button
            onClick={() => router.push("/onboarding")}
            className="px-8 py-3 bg-stone-900 text-white text-sm tracking-wide rounded-full hover:bg-stone-800 transition-colors"
          >
            Begin Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] safe-area-top safe-area-bottom">
      <div className="max-w-lg mx-auto px-6 py-12 pb-32 lg:pb-12">

        {/* Header - Minimal */}
        <header className="mb-16">
          <p className="text-stone-400 text-xs tracking-[0.2em] uppercase mb-2">
            Daily Alignment
          </p>
          <h1 className="text-3xl text-stone-900 font-light tracking-tight">
            Your compass
          </h1>
        </header>

        {/* Identity Anchor - Single line reminder */}
        {primaryIdentity && (
          <section className="mb-16">
            <div className="flex items-baseline justify-between">
              <p className="text-stone-400 text-sm">
                Becoming{" "}
                <span className="text-stone-700 font-medium">{primaryIdentity}</span>
                {identity.currentPhase && (
                  <span className="text-stone-400"> · {identity.currentPhase}</span>
                )}
              </p>
              <Link
                href="/identity"
                className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
              >
                Edit
              </Link>
            </div>
          </section>
        )}

        {/* Today's Guidance - The Hero */}
        <section className="mb-16">
          {todaysGuidance ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  todaysGuidance.guidanceType === "next_action"
                    ? "bg-emerald-500"
                    : todaysGuidance.guidanceType === "pause"
                    ? "bg-amber-500"
                    : "bg-sky-500"
                }`} />
                <p className="text-stone-400 text-xs tracking-[0.15em] uppercase">
                  {todaysGuidance.guidanceType === "next_action" && "Your next step"}
                  {todaysGuidance.guidanceType === "pause" && "Pause"}
                  {todaysGuidance.guidanceType === "close_loop" && "Close this loop"}
                </p>
              </div>

              <p className="text-2xl md:text-3xl text-stone-900 font-light leading-relaxed tracking-tight">
                {todaysGuidance.guidanceText}
              </p>

              {todaysGuidance.reasoning && (
                <p className="text-stone-500 text-sm leading-relaxed border-l-2 border-stone-200 pl-4">
                  {todaysGuidance.reasoning}
                </p>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-stone-400 mb-6">No guidance yet today</p>
              <button
                onClick={() => router.push("/ritual")}
                className="px-8 py-3 bg-stone-900 text-white text-sm tracking-wide rounded-full hover:bg-stone-800 transition-colors"
              >
                Begin Daily Ritual
              </button>
            </div>
          )}
        </section>

        {/* Open Loops - Subtle link */}
        <section className="mb-16">
          <Link href="/loops" className="group block">
            <div className="flex items-center justify-between py-4 border-t border-stone-200">
              <div>
                <p className="text-stone-900 font-medium">
                  {openLoopsCount} open loop{openLoopsCount !== 1 ? "s" : ""}
                </p>
                <p className="text-stone-400 text-sm">
                  Items holding your attention
                </p>
              </div>
              <svg
                className="w-5 h-5 text-stone-300 group-hover:text-stone-500 group-hover:translate-x-1 transition-all"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </Link>
        </section>

        {/* Vision Preview - Collapsed */}
        {identity.futureVision && (
          <section className="border-t border-stone-200 pt-8">
            <p className="text-stone-400 text-xs tracking-[0.15em] uppercase mb-4">
              Where you're headed
            </p>
            <p className="text-stone-600 leading-relaxed line-clamp-3">
              {identity.futureVision}
            </p>
            <Link
              href="/identity"
              className="inline-block mt-4 text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              Read more
            </Link>
          </section>
        )}

      </div>
    </div>
  );
}


