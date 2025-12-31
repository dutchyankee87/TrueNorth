"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/shared";

// Type for open loop data from the database
interface OpenLoop {
  id: string;
  description: string;
  source: string | null;
  commitmentType: string | null;
  externalParty: string | null;
  deadline: string | null;
  cognitivePull: number;
  status: string;
  createdAt: string;
  domain: {
    id: string;
    name: string;
  } | null;
}

export default function LoopsPage() {
  // State for loops data
  const [loops, setLoops] = useState<OpenLoop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch loops on mount
  useEffect(() => {
    fetchLoops();
  }, []);

  async function fetchLoops() {
    try {
      const response = await fetch("/api/loops");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load loops");
        return;
      }

      setLoops(data.loops || []);
    } catch (err) {
      console.error("Failed to fetch loops:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Extract unique categories from loops
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    loops.forEach((loop) => {
      if (loop.domain?.name) {
        categorySet.add(loop.domain.name);
      }
    });
    return Array.from(categorySet).sort();
  }, [loops]);

  // Filter loops by category
  const filteredLoops = useMemo(() => {
    if (selectedCategory === "all") {
      return loops;
    }
    return loops.filter((loop) => loop.domain?.name === selectedCategory);
  }, [loops, selectedCategory]);

  // Group loops by status
  const openLoops = filteredLoops.filter((l) => l.status === "open");
  const closedLoops = filteredLoops.filter((l) => l.status === "closed");

  // Helper to format relative time
  function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  // Helper to get cognitive pull indicator
  function getCognitivePullIndicator(pull: number) {
    // 1-5 scale, higher = more mental weight
    const dots = [];
    for (let i = 1; i <= 5; i++) {
      dots.push(
        <span
          key={i}
          className={`w-2 h-2 rounded-full ${
            i <= pull ? "bg-accent" : "bg-bg-tertiary"
          }`}
        />
      );
    }
    return <div className="flex gap-1">{dots}</div>;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary safe-area-top safe-area-bottom pb-24 lg:pb-8">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-text-primary">
            Open Loops
          </h1>
          <p className="text-text-secondary mt-1">
            Commitments, decisions, and things waiting on you
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === "all"
                    ? "bg-accent text-white"
                    : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
                }`}
              >
                All ({loops.filter(l => l.status === "open").length})
              </button>
              {categories.map((category) => {
                const count = loops.filter(
                  (l) => l.domain?.name === category && l.status === "open"
                ).length;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-accent text-white"
                        : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
                    }`}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Empty state */}
        {loops.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <p className="text-text-muted mb-2">No loops yet</p>
              <p className="text-text-secondary text-sm">
                Use Brain Dump to capture what&apos;s on your mind, or loops will be
                extracted from your daily check-ins.
              </p>
            </div>
          </Card>
        )}

        {/* Filtered empty state */}
        {loops.length > 0 && filteredLoops.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <p className="text-text-muted mb-2">No loops in this category</p>
              <button
                onClick={() => setSelectedCategory("all")}
                className="text-accent hover:underline text-sm"
              >
                Show all loops
              </button>
            </div>
          </Card>
        )}

        {/* Open Loops */}
        {openLoops.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">
              Open ({openLoops.length})
            </h2>
            <div className="space-y-3">
              {openLoops.map((loop) => (
                <Card key={loop.id}>
                  <div className="space-y-3">
                    {/* Main description */}
                    <p className="text-text-primary">{loop.description}</p>

                    {/* Metadata row */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {/* Domain badge */}
                      {loop.domain && (
                        <button
                          onClick={() => setSelectedCategory(loop.domain!.name)}
                          className={`px-2 py-0.5 rounded text-sm transition-colors ${
                            selectedCategory === loop.domain.name
                              ? "bg-accent/20 text-accent"
                              : "bg-bg-secondary text-text-secondary hover:bg-accent/10 hover:text-accent"
                          }`}
                        >
                          {loop.domain.name}
                        </button>
                      )}

                      {/* External party */}
                      {loop.externalParty && (
                        <span className="text-text-muted">
                          → {loop.externalParty}
                        </span>
                      )}

                      {/* Deadline */}
                      {loop.deadline && (
                        <span className="text-text-muted">
                          Due: {new Date(loop.deadline).toLocaleDateString()}
                        </span>
                      )}

                      {/* Cognitive pull */}
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-text-muted text-xs">Weight</span>
                        {getCognitivePullIndicator(loop.cognitivePull)}
                      </div>
                    </div>

                    {/* Created date */}
                    <p className="text-xs text-text-muted">
                      Added {formatRelativeTime(loop.createdAt)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Closed Loops */}
        {closedLoops.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">
              Closed ({closedLoops.length})
            </h2>
            <div className="space-y-3">
              {closedLoops.map((loop) => (
                <Card key={loop.id} className="opacity-60">
                  <div className="space-y-2">
                    <p className="text-text-secondary line-through">
                      {loop.description}
                    </p>
                    {loop.domain && (
                      <span className="px-2 py-0.5 bg-bg-secondary text-text-muted rounded text-sm">
                        {loop.domain.name}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Guidance note */}
        <div className="mt-12 p-4 bg-bg-secondary rounded-xl">
          <p className="text-sm text-text-secondary text-center">
            Loops are not tasks to check off. They represent cognitive tension —
            attention leaks that the system will help you close through the
            Daily Ritual.
          </p>
        </div>
      </div>
    </div>
  );
}

