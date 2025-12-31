"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared";

interface ExtractedLoop {
  description: string;
  category: string;
  type: "task" | "decision" | "commitment" | "worry" | "idea";
  impact: number;
  confidence: number;
  ease: number;
  iceScore: number;
  reasoning: string;
}

interface IdentityInsight {
  type: "identity" | "vision" | "emotion" | "release";
  content: string;
  reasoning: string;
}

interface ExtractionResult {
  loops: ExtractedLoop[];
  identityInsights: IdentityInsight[];
  summary: string;
  topPriority: string;
}

const typeColors: Record<string, string> = {
  task: "bg-blue-100 text-blue-700",
  decision: "bg-purple-100 text-purple-700",
  commitment: "bg-orange-100 text-orange-700",
  worry: "bg-red-100 text-red-700",
  idea: "bg-green-100 text-green-700",
};

const typeIcons: Record<string, string> = {
  task: "✓",
  decision: "?",
  commitment: "🤝",
  worry: "⚡",
  idea: "💡",
};

const insightTypeConfig: Record<string, { icon: string; color: string; label: string }> = {
  identity: { icon: "🌟", color: "bg-accent/10 text-accent border-accent/20", label: "Identity" },
  vision: { icon: "🔭", color: "bg-purple-100 text-purple-700 border-purple-200", label: "Vision" },
  emotion: { icon: "💚", color: "bg-green-100 text-green-700 border-green-200", label: "Emotion" },
  release: { icon: "🍃", color: "bg-orange-100 text-orange-700 border-orange-200", label: "Release" },
};

// Speech recognition type declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function BrainDumpPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingLoops, setSavingLoops] = useState<Set<number>>(new Set());
  const [savedLoops, setSavedLoops] = useState<Set<number>>(new Set());
  const [applyingInsights, setApplyingInsights] = useState(false);
  const [insightsApplied, setInsightsApplied] = useState(false);

  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            }
          }

          if (finalTranscript) {
            setContent((prev) => prev + finalTranscript);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  function toggleListening() {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }

  async function handleSubmit() {
    if (!content.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/brain-dump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process");
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  }

  async function saveLoop(loop: ExtractedLoop, index: number) {
    if (savingLoops.has(index) || savedLoops.has(index)) return;

    setSavingLoops((prev) => new Set(prev).add(index));

    try {
      const response = await fetch("/api/loops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: loop.description,
          category: loop.category,
          cognitivePull: Math.ceil(loop.iceScore / 20), // Convert to 1-5 scale
        }),
      });

      if (response.ok) {
        setSavedLoops((prev) => new Set(prev).add(index));
      }
    } catch (err) {
      console.error("Failed to save loop:", err);
    } finally {
      setSavingLoops((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  }

  async function saveAllLoops() {
    if (!result) return;

    const unsavedIndexes = result.loops
      .map((_, i) => i)
      .filter((i) => !savedLoops.has(i));

    for (const index of unsavedIndexes) {
      await saveLoop(result.loops[index], index);
    }
  }

  async function applyIdentityInsights() {
    if (!result || result.identityInsights.length === 0 || applyingInsights) return;

    setApplyingInsights(true);

    try {
      // Fetch current identity first
      const identityResponse = await fetch("/api/identity");
      const identityData = await identityResponse.json();
      const currentIdentity = identityData.identity;

      // Build update object from insights
      const updates: Record<string, unknown> = {};
      const newLeavingBehind: string[] = currentIdentity?.leavingBehind || [];
      const newEmotions: string[] = currentIdentity?.elevatedEmotions || [];

      const availableEmotions = [
        "Gratitude", "Joy", "Love", "Freedom", "Abundance", "Peace",
        "Empowerment", "Confidence", "Creativity", "Connection", "Clarity", "Trust",
      ];

      for (const insight of result.identityInsights) {
        switch (insight.type) {
          case "identity":
            // Append to core identity if new
            if (currentIdentity?.coreIdentity) {
              const current = currentIdentity.coreIdentity.toLowerCase();
              if (!current.includes(insight.content.toLowerCase())) {
                updates.coreIdentity = `${currentIdentity.coreIdentity}, ${insight.content}`;
              }
            } else {
              updates.coreIdentity = insight.content;
            }
            break;
          case "vision":
            // Append to future vision
            if (currentIdentity?.futureVision) {
              updates.futureVision = `${currentIdentity.futureVision}\n\n${insight.content}`;
            } else {
              updates.futureVision = insight.content;
            }
            break;
          case "emotion":
            // Add matching emotions
            for (const emotion of availableEmotions) {
              if (insight.content.toLowerCase().includes(emotion.toLowerCase()) && !newEmotions.includes(emotion)) {
                newEmotions.push(emotion);
              }
            }
            break;
          case "release":
            // Add to leaving behind
            if (!newLeavingBehind.includes(insight.content)) {
              newLeavingBehind.push(insight.content);
            }
            break;
        }
      }

      if (newLeavingBehind.length > (currentIdentity?.leavingBehind?.length || 0)) {
        updates.leavingBehind = newLeavingBehind;
      }
      if (newEmotions.length > (currentIdentity?.elevatedEmotions?.length || 0)) {
        updates.elevatedEmotions = newEmotions;
      }

      // Only save if there are updates
      if (Object.keys(updates).length > 0) {
        const response = await fetch("/api/onboarding/identity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            coreIdentity: updates.coreIdentity || currentIdentity?.coreIdentity || "",
            primaryConstraint: currentIdentity?.primaryConstraint || "",
            decisionFilter: currentIdentity?.decisionFilter || "",
            antiPatterns: currentIdentity?.antiPatterns?.join(", ") || "",
            currentPhase: currentIdentity?.currentPhase || "",
            futureVision: updates.futureVision || currentIdentity?.futureVision || "",
            leavingBehind: updates.leavingBehind || currentIdentity?.leavingBehind || [],
            elevatedEmotions: updates.elevatedEmotions || currentIdentity?.elevatedEmotions || [],
          }),
        });

        if (response.ok) {
          setInsightsApplied(true);
        }
      } else {
        setInsightsApplied(true);
      }
    } catch (err) {
      console.error("Failed to apply insights:", err);
    } finally {
      setApplyingInsights(false);
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 50) return "text-green-600";
    if (score >= 30) return "text-yellow-600";
    return "text-text-muted";
  }

  function reset() {
    setContent("");
    setResult(null);
    setError(null);
    setSavedLoops(new Set());
    setInsightsApplied(false);
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-sm border-b border-border px-4 py-3 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-lg font-semibold text-text-primary">Brain Dump</h1>
          <p className="text-sm text-text-muted">
            Get everything out of your head
          </p>
        </div>
      </header>

      <div className="px-4 py-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {!result ? (
            <>
              {/* Input area */}
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write or speak everything on your mind... tasks, worries, ideas, commitments, decisions. You can also share thoughts about who you're becoming, your vision, or what you're letting go of."
                    className="w-full min-h-[200px] sm:min-h-[280px] lg:min-h-[320px] px-4 py-4 pr-14 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-base leading-relaxed"
                    disabled={isProcessing}
                  />

                  {/* Microphone button */}
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      disabled={isProcessing}
                      className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isListening
                          ? "bg-red-500 text-white animate-pulse"
                          : "bg-bg-secondary text-text-secondary hover:bg-bg-primary hover:text-text-primary"
                      }`}
                      title={isListening ? "Stop recording" : "Start recording"}
                    >
                      {isListening ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="6" width="12" height="12" rx="1" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>

                {/* Recording indicator */}
                {isListening && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    Listening... speak freely
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  fullWidth
                  disabled={!content.trim() || isProcessing}
                >
                  {isProcessing ? "Processing..." : "Extract & Prioritize"}
                </Button>
              </div>

              {/* Tips */}
              <div className="mt-8 p-4 bg-bg-secondary rounded-xl">
                <h3 className="text-sm font-medium text-text-primary mb-2">
                  Tips for a good brain dump
                </h3>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Don&apos;t filter - write everything, even small things</li>
                  <li>• Include worries and &quot;what ifs&quot;</li>
                  <li>• Mention deadlines or people involved</li>
                  <li>• Share identity shifts or vision thoughts too</li>
                  <li>• It&apos;s okay to be messy and unorganized</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Results */}
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-white rounded-xl border border-border p-5">
                  <p className="text-text-secondary text-sm mb-3">Summary</p>
                  <p className="text-text-primary">{result.summary}</p>
                </div>

                {/* Top Priority */}
                <div className="bg-accent/10 rounded-xl border border-accent/20 p-5">
                  <p className="text-accent text-sm font-medium mb-2">
                    Top Priority
                  </p>
                  <p className="text-text-primary font-medium">
                    {result.topPriority}
                  </p>
                </div>

                {/* Identity Insights */}
                {result.identityInsights && result.identityInsights.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-medium text-text-muted">
                        Identity Insights ({result.identityInsights.length})
                      </h2>
                      {!insightsApplied && (
                        <button
                          onClick={applyIdentityInsights}
                          disabled={applyingInsights}
                          className="text-sm text-accent hover:underline disabled:opacity-50"
                        >
                          {applyingInsights ? "Applying..." : "Apply to profile"}
                        </button>
                      )}
                      {insightsApplied && (
                        <span className="text-sm text-green-600">✓ Applied</span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {result.identityInsights.map((insight, index) => {
                        const config = insightTypeConfig[insight.type];
                        return (
                          <div
                            key={index}
                            className={`rounded-xl border p-4 ${config.color}`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-xl">{config.icon}</span>
                              <div className="flex-1">
                                <span className="text-xs font-medium uppercase tracking-wide">
                                  {config.label}
                                </span>
                                <p className="mt-1 font-medium">{insight.content}</p>
                                <p className="mt-2 text-xs opacity-70">{insight.reasoning}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {insightsApplied && (
                      <button
                        onClick={() => router.push("/identity")}
                        className="mt-3 text-sm text-accent hover:underline"
                      >
                        View updated identity →
                      </button>
                    )}
                  </div>
                )}

                {/* Extracted loops */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium text-text-muted">
                      Open Loops ({result.loops.length})
                    </h2>
                    <button
                      onClick={saveAllLoops}
                      className="text-sm text-accent hover:underline"
                      disabled={savedLoops.size === result.loops.length}
                    >
                      Save all to loops
                    </button>
                  </div>

                  <div className="space-y-3">
                    {result.loops.map((loop, index) => (
                      <div
                        key={index}
                        className={`bg-white rounded-xl border p-3 sm:p-4 transition-all ${
                          savedLoops.has(index)
                            ? "border-green-300 bg-green-50/50"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  typeColors[loop.type]
                                }`}
                              >
                                {typeIcons[loop.type]} {loop.type}
                              </span>
                              <span className="text-xs text-text-muted">
                                {loop.category}
                              </span>
                            </div>
                            <p className="text-text-primary font-medium">
                              {loop.description}
                            </p>
                            <p className="text-xs text-text-muted mt-2">
                              {loop.reasoning}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <div
                              className={`text-2xl font-bold ${getScoreColor(
                                loop.iceScore
                              )}`}
                            >
                              {loop.iceScore.toFixed(0)}
                            </div>
                            <div className="text-xs text-text-muted mt-1">
                              I:{loop.impact} C:{loop.confidence} E:{loop.ease}
                            </div>
                          </div>
                        </div>

                        {!savedLoops.has(index) && (
                          <button
                            onClick={() => saveLoop(loop, index)}
                            disabled={savingLoops.has(index)}
                            className="mt-3 text-sm text-accent hover:underline disabled:opacity-50"
                          >
                            {savingLoops.has(index) ? "Saving..." : "Save to loops"}
                          </button>
                        )}
                        {savedLoops.has(index) && (
                          <p className="mt-3 text-sm text-green-600">✓ Saved</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button onClick={reset} variant="secondary" fullWidth>
                    New Dump
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
