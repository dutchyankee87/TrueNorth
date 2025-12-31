"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared";

// Consolidated onboarding flow (6 steps):
// 1. welcome - Introduction
// 2. identity - "Who you are now" brain dump
// 3. vision - "Who you're becoming" brain dump  
// 4. loops - "What's on your mind" brain dump
// 5. review - Confirm all extracted data
// 6. complete - Ready to begin
type OnboardingStep = "welcome" | "identity" | "vision" | "loops" | "review" | "complete";

// Types for extracted data
interface ExtractedIdentity {
  coreIdentity: string;
  primaryConstraint: string | null;
  decisionFilter: string | null;
  antiPatterns: string[];
  currentPhase: string | null;
}

interface ExtractedVision {
  futureVision: string;
  leavingBehind: string[];
  elevatedEmotions: string[];
}

interface ExtractedDomain {
  name: string;
  reason: string;
}

interface ExtractedLoop {
  description: string;
  commitmentType: string;
  externalParty: string | null;
  cognitivePull: number;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Brain dump text for each step
  const [identityDump, setIdentityDump] = useState("");
  const [visionDump, setVisionDump] = useState("");
  const [loopsDump, setLoopsDump] = useState("");

  // Extracted data (all editable in review step)
  const [identity, setIdentity] = useState<ExtractedIdentity | null>(null);
  const [vision, setVision] = useState<ExtractedVision | null>(null);
  const [domains, setDomains] = useState<ExtractedDomain[]>([]);
  const [loops, setLoops] = useState<ExtractedLoop[]>([]);

  // Process identity brain dump and move to vision
  async function handleIdentityNext() {
    if (!identityDump.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "identity", brainDump: identityDump }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Failed to process");
        return;
      }

      setIdentity(result.extracted);
      setStep("vision");
    } catch (err) {
      console.error("Identity extraction error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Process vision brain dump, extract domains, and move to loops
  async function handleVisionNext() {
    if (!visionDump.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Extract vision
      const visionRes = await fetch("/api/onboarding/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "vision", brainDump: visionDump }),
      });

      const visionResult = await visionRes.json();
      if (!visionRes.ok) {
        setError(visionResult.error || "Failed to process vision");
        return;
      }
      setVision(visionResult.extracted);

      // Extract domains from combined brain dumps
      const combinedDump = `${identityDump}\n\n${visionDump}`;
      const domainsRes = await fetch("/api/onboarding/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "domains", brainDump: combinedDump }),
      });

      const domainsResult = await domainsRes.json();
      if (domainsRes.ok && domainsResult.extracted?.domains) {
        setDomains(domainsResult.extracted.domains);
      }

      setStep("loops");
    } catch (err) {
      console.error("Vision extraction error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Process loops brain dump and move to review
  async function handleLoopsNext() {
    setLoading(true);
    setError(null);

    try {
      if (loopsDump.trim()) {
        const response = await fetch("/api/onboarding/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "loops", brainDump: loopsDump }),
        });

        const result = await response.json();
        if (response.ok && result.extracted?.loops) {
          setLoops(result.extracted.loops);
        }
      }

      setStep("review");
    } catch (err) {
      console.error("Loops extraction error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Save everything and complete onboarding
  async function handleComplete() {
    if (!identity) return;
    setLoading(true);
    setError(null);

    try {
      // Save identity + vision
      const identityRes = await fetch("/api/onboarding/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coreIdentity: identity.coreIdentity,
          primaryConstraint: identity.primaryConstraint || "",
          decisionFilter: identity.decisionFilter || "",
          antiPatterns: identity.antiPatterns.join(", "),
          currentPhase: identity.currentPhase || "",
          futureVision: vision?.futureVision || "",
          leavingBehind: vision?.leavingBehind || [],
          elevatedEmotions: vision?.elevatedEmotions || [],
        }),
      });

      if (!identityRes.ok) {
        const data = await identityRes.json();
        setError(data.error || "Failed to save identity");
        return;
      }

      // Save domains
      const domainNames = domains.map((d) => d.name).filter((n) => n.trim());
      if (domainNames.length > 0) {
        await fetch("/api/onboarding/domains", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domainNames }),
        });
      }

      // Save loops and complete
      const loopDescriptions = loops.map((l) => l.description).filter((d) => d.trim());
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loops: loopDescriptions }),
      });

      setStep("complete");
    } catch (err) {
      console.error("Save error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Error display component
  const ErrorMessage = () =>
    error ? (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
        {error}
      </div>
    ) : null;

  // ============ STEP: WELCOME ============
  if (step === "welcome") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-12 bg-bg-primary safe-area-top safe-area-bottom">
        <div className="flex-1 flex flex-col justify-center items-center text-center max-w-md mx-auto w-full space-y-8">
          <h1 className="text-3xl font-semibold text-text-primary">
            Welcome to Coherence OS
          </h1>
          <div className="space-y-4 text-text-secondary">
            <p>This is not a productivity tool.</p>
            <p>
              It&apos;s a practice that helps you make one good decision per day.
            </p>
            <p>
              Let&apos;s start by understanding who you are and where you&apos;re headed.
            </p>
          </div>
        </div>
        <div className="mt-8 max-w-md mx-auto w-full">
          <Button onClick={() => setStep("identity")} fullWidth>
            Begin
          </Button>
        </div>
      </div>
    );
  }

  // ============ STEP: IDENTITY BRAIN DUMP ============
  if (step === "identity") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 bg-bg-primary safe-area-top safe-area-bottom">
        <div className="flex-1 max-w-md mx-auto w-full space-y-6">
          {/* Progress indicator */}
          <div className="flex gap-2">
            <div className="h-1 flex-1 bg-accent rounded" />
            <div className="h-1 flex-1 bg-bg-tertiary rounded" />
            <div className="h-1 flex-1 bg-bg-tertiary rounded" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-text-primary">
              Who you are now
            </h2>
            <p className="text-text-secondary">
              Tell me about yourself. Write freely — I&apos;ll help organize it.
            </p>
          </div>

          <ErrorMessage />

          <div className="p-4 bg-bg-secondary rounded-xl">
            <p className="text-sm text-text-muted mb-2">You might mention:</p>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Your current role or focus</li>
              <li>• What matters most to you</li>
              <li>• What you&apos;re protecting (family, health, etc.)</li>
              <li>• Patterns you want to avoid</li>
            </ul>
          </div>

          <textarea
            value={identityDump}
            onChange={(e) => setIdentityDump(e.target.value)}
            placeholder="I'm currently working on... What's important to me is... I need to make sure I don't..."
            className="w-full min-h-[180px] px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            autoFocus
          />
        </div>

        <div className="mt-8 max-w-md mx-auto w-full">
          <Button
            onClick={handleIdentityNext}
            fullWidth
            disabled={!identityDump.trim() || loading}
          >
            {loading ? "Processing..." : "Continue"}
          </Button>
        </div>
      </div>
    );
  }

  // ============ STEP: VISION BRAIN DUMP ============
  if (step === "vision") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 bg-bg-primary safe-area-top safe-area-bottom">
        <div className="flex-1 max-w-md mx-auto w-full space-y-6">
          {/* Progress indicator */}
          <div className="flex gap-2">
            <div className="h-1 flex-1 bg-accent rounded" />
            <div className="h-1 flex-1 bg-accent rounded" />
            <div className="h-1 flex-1 bg-bg-tertiary rounded" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-text-primary">
              Who you&apos;re becoming
            </h2>
            <p className="text-text-secondary">
              Describe your future self — as if it&apos;s already happening.
            </p>
          </div>

          <ErrorMessage />

          <div className="p-4 bg-bg-secondary rounded-xl">
            <p className="text-sm text-text-muted mb-2">You might mention:</p>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• The life you&apos;re creating</li>
              <li>• How you spend your days</li>
              <li>• Old patterns you&apos;re leaving behind</li>
              <li>• How you want to feel</li>
            </ul>
          </div>

          <textarea
            value={visionDump}
            onChange={(e) => setVisionDump(e.target.value)}
            placeholder="I wake up feeling... My work is... I've let go of... I feel more..."
            className="w-full min-h-[180px] px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            autoFocus
          />
        </div>

        <div className="mt-8 max-w-md mx-auto w-full space-y-3">
          <Button
            onClick={handleVisionNext}
            fullWidth
            disabled={!visionDump.trim() || loading}
          >
            {loading ? "Processing..." : "Continue"}
          </Button>
          <button
            onClick={() => setStep("identity")}
            className="w-full text-center text-sm text-text-muted hover:text-text-secondary"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // ============ STEP: LOOPS BRAIN DUMP ============
  if (step === "loops") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 bg-bg-primary safe-area-top safe-area-bottom">
        <div className="flex-1 max-w-md mx-auto w-full space-y-6">
          {/* Progress indicator */}
          <div className="flex gap-2">
            <div className="h-1 flex-1 bg-accent rounded" />
            <div className="h-1 flex-1 bg-accent rounded" />
            <div className="h-1 flex-1 bg-accent rounded" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-text-primary">
              What&apos;s on your mind?
            </h2>
            <p className="text-text-secondary">
              Dump everything that&apos;s pulling on your attention right now.
            </p>
          </div>

          <ErrorMessage />

          <div className="p-4 bg-bg-secondary rounded-xl">
            <p className="text-sm text-text-muted mb-2">Things like:</p>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Commitments you&apos;ve made</li>
              <li>• Decisions you need to make</li>
              <li>• Things you&apos;re waiting on</li>
              <li>• Anything taking up mental space</li>
            </ul>
          </div>

          <textarea
            value={loopsDump}
            onChange={(e) => setLoopsDump(e.target.value)}
            placeholder="I need to... I promised... I'm waiting for... I keep thinking about..."
            className="w-full min-h-[180px] px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            autoFocus
          />
        </div>

        <div className="mt-8 max-w-md mx-auto w-full space-y-3">
          <Button onClick={handleLoopsNext} fullWidth disabled={loading}>
            {loading ? "Processing..." : "Continue"}
          </Button>
          <button
            onClick={() => setStep("vision")}
            className="w-full text-center text-sm text-text-muted hover:text-text-secondary"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // ============ STEP: REVIEW ALL EXTRACTED DATA ============
  if (step === "review") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 bg-bg-primary safe-area-top safe-area-bottom">
        <div className="flex-1 max-w-md mx-auto w-full space-y-6 overflow-y-auto pb-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-text-primary">
              Here&apos;s what I understood
            </h2>
            <p className="text-text-secondary">
              Edit anything that doesn&apos;t feel right.
            </p>
          </div>

          <ErrorMessage />

          {/* Identity Section */}
          {identity && (
            <div className="space-y-4 p-4 bg-white border border-border rounded-xl">
              <h3 className="font-medium text-text-primary">Who you are now</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-text-muted">Core identity</label>
                  <input
                    value={identity.coreIdentity}
                    onChange={(e) => setIdentity({ ...identity, coreIdentity: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                
                {identity.primaryConstraint && (
                  <div>
                    <label className="text-xs text-text-muted">Protecting</label>
                    <input
                      value={identity.primaryConstraint}
                      onChange={(e) => setIdentity({ ...identity, primaryConstraint: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                )}

                {identity.antiPatterns.length > 0 && (
                  <div>
                    <label className="text-xs text-text-muted">Avoiding</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {identity.antiPatterns.map((pattern, i) => (
                        <span key={i} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs flex items-center gap-1">
                          {pattern}
                          <button
                            onClick={() => setIdentity({
                              ...identity,
                              antiPatterns: identity.antiPatterns.filter((_, idx) => idx !== i),
                            })}
                            className="text-red-400 hover:text-red-600"
                          >×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vision Section */}
          {vision && (
            <div className="space-y-4 p-4 bg-white border border-border rounded-xl">
              <h3 className="font-medium text-text-primary">Who you&apos;re becoming</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-text-muted">Your vision</label>
                  <textarea
                    value={vision.futureVision}
                    onChange={(e) => setVision({ ...vision, futureVision: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  />
                </div>

                {vision.leavingBehind.length > 0 && (
                  <div>
                    <label className="text-xs text-text-muted">Leaving behind</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {vision.leavingBehind.map((item, i) => (
                        <span key={i} className="px-2 py-1 bg-bg-secondary text-text-secondary rounded text-xs flex items-center gap-1">
                          {item}
                          <button
                            onClick={() => setVision({
                              ...vision,
                              leavingBehind: vision.leavingBehind.filter((_, idx) => idx !== i),
                            })}
                            className="text-text-muted hover:text-text-primary"
                          >×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {vision.elevatedEmotions.length > 0 && (
                  <div>
                    <label className="text-xs text-text-muted">Cultivating</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {vision.elevatedEmotions.map((emotion, i) => (
                        <span key={i} className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">
                          {emotion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Domains Section */}
          {domains.length > 0 && (
            <div className="space-y-4 p-4 bg-white border border-border rounded-xl">
              <h3 className="font-medium text-text-primary">Your domains</h3>
              <div className="space-y-2">
                {domains.map((domain, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={domain.name}
                      onChange={(e) => {
                        const updated = [...domains];
                        updated[i] = { ...domain, name: e.target.value };
                        setDomains(updated);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <button
                      onClick={() => setDomains(domains.filter((_, idx) => idx !== i))}
                      className="text-text-muted hover:text-red-500 p-1"
                    >×</button>
                  </div>
                ))}
                <button
                  onClick={() => setDomains([...domains, { name: "", reason: "" }])}
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  + Add domain
                </button>
              </div>
            </div>
          )}

          {/* Loops Section */}
          {loops.length > 0 && (
            <div className="space-y-4 p-4 bg-white border border-border rounded-xl">
              <h3 className="font-medium text-text-primary">Open loops</h3>
              <div className="space-y-2">
                {loops.map((loop, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <input
                      value={loop.description}
                      onChange={(e) => {
                        const updated = [...loops];
                        updated[i] = { ...loop, description: e.target.value };
                        setLoops(updated);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <button
                      onClick={() => setLoops(loops.filter((_, idx) => idx !== i))}
                      className="text-text-muted hover:text-red-500 p-1 mt-1"
                    >×</button>
                  </div>
                ))}
                <button
                  onClick={() => setLoops([...loops, { description: "", commitmentType: "vague_pull", externalParty: null, cognitivePull: 3 }])}
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  + Add loop
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 max-w-md mx-auto w-full space-y-3">
          <Button onClick={handleComplete} fullWidth disabled={loading || !identity?.coreIdentity}>
            {loading ? "Saving..." : "Looks good, let's go"}
          </Button>
          <button
            onClick={() => setStep("loops")}
            className="w-full text-center text-sm text-text-muted hover:text-text-secondary"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // ============ STEP: COMPLETE ============
  if (step === "complete") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-12 bg-bg-primary safe-area-top safe-area-bottom">
        <div className="flex-1 flex flex-col justify-center items-center text-center max-w-md mx-auto w-full space-y-8">
          <h1 className="text-3xl font-semibold text-text-primary">
            You&apos;re ready
          </h1>
          <div className="space-y-4 text-text-secondary">
            <p>Each morning, check in with your state.</p>
            <p>The system will give you exactly one thing.</p>
            <p>Trust the process.</p>
          </div>
        </div>
        <div className="mt-8 max-w-md mx-auto w-full">
          <Button onClick={() => router.push("/ritual")} fullWidth>
            Begin your first ritual
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
