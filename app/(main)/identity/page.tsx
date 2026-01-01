"use client";

import { useEffect, useState, useRef } from "react";
import { Button, Card } from "@/components/shared";

// Type for identity anchor data from the database
interface IdentityAnchor {
  id: string;
  coreIdentity: string;
  primaryConstraint: string | null;
  decisionFilter: string | null;
  antiPatterns: string[] | null;
  currentPhase: string | null;
  futureVision: string | null;
  leavingBehind: string[] | null;
  elevatedEmotions: string[] | null;
}

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

// Pillar icons
const pillarIcons: Record<string, string> = {
  founder: "🚀",
  father: "👨‍👧‍👦",
  athlete: "💪",
  husband: "💑",
  freelancer: "💼",
  creator: "🎨",
  leader: "👑",
  mentor: "🎓",
  builder: "🔨",
  investor: "📈",
  writer: "✍️",
  speaker: "🎤",
  default: "⭐",
};

function getPillarIcon(pillar: string): string {
  const lowerPillar = pillar.toLowerCase();
  for (const [key, icon] of Object.entries(pillarIcons)) {
    if (lowerPillar.includes(key)) {
      return icon;
    }
  }
  return pillarIcons.default;
}

export default function IdentityPage() {
  // State for the identity data
  const [identity, setIdentity] = useState<IdentityAnchor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceDump, setVoiceDump] = useState("");
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Form state (mirrors identity but for editing)
  const [formData, setFormData] = useState({
    coreIdentity: "",
    primaryConstraint: "",
    decisionFilter: "",
    antiPatterns: "",
    currentPhase: "",
    futureVision: "",
    leavingBehind: ["", "", ""],
    elevatedEmotions: [] as string[],
  });

  // Available elevated emotions for selection
  const availableEmotions = [
    "Gratitude", "Joy", "Love", "Freedom", "Abundance", "Peace",
    "Empowerment", "Confidence", "Creativity", "Connection", "Clarity", "Trust",
  ];

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
            setVoiceDump((prev) => prev + finalTranscript);
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

  // Fetch identity data on mount
  useEffect(() => {
    fetchIdentity();
  }, []);

  async function fetchIdentity() {
    try {
      const response = await fetch("/api/identity");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load identity");
        return;
      }

      if (data.identity) {
        setIdentity(data.identity);
        // Populate form with existing data
        setFormData({
          coreIdentity: data.identity.coreIdentity || "",
          primaryConstraint: data.identity.primaryConstraint || "",
          decisionFilter: data.identity.decisionFilter || "",
          antiPatterns: data.identity.antiPatterns?.join(", ") || "",
          currentPhase: data.identity.currentPhase || "",
          futureVision: data.identity.futureVision || "",
          leavingBehind: data.identity.leavingBehind?.length
            ? [...data.identity.leavingBehind, "", "", ""].slice(0, Math.max(3, data.identity.leavingBehind.length))
            : ["", "", ""],
          elevatedEmotions: data.identity.elevatedEmotions || [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch identity:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coreIdentity: formData.coreIdentity,
          primaryConstraint: formData.primaryConstraint,
          decisionFilter: formData.decisionFilter,
          antiPatterns: formData.antiPatterns,
          currentPhase: formData.currentPhase,
          futureVision: formData.futureVision,
          leavingBehind: formData.leavingBehind.filter(item => item.trim()),
          elevatedEmotions: formData.elevatedEmotions,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to save");
        return;
      }

      // Refresh data and exit edit mode
      await fetchIdentity();
      setIsEditing(false);
    } catch (err) {
      console.error("Save error:", err);
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function toggleEmotion(emotion: string) {
    if (formData.elevatedEmotions.includes(emotion)) {
      setFormData({
        ...formData,
        elevatedEmotions: formData.elevatedEmotions.filter(e => e !== emotion),
      });
    } else {
      setFormData({
        ...formData,
        elevatedEmotions: [...formData.elevatedEmotions, emotion],
      });
    }
  }

  function updateLeavingBehind(index: number, value: string) {
    const updated = [...formData.leavingBehind];
    updated[index] = value;
    setFormData({ ...formData, leavingBehind: updated });
  }

  function addLeavingBehind() {
    setFormData({
      ...formData,
      leavingBehind: [...formData.leavingBehind, ""],
    });
  }

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

  async function processVoiceDump() {
    if (!voiceDump.trim() || isProcessingVoice) return;

    setIsProcessingVoice(true);
    setError(null);

    try {
      const response = await fetch("/api/identity/voice-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceInput: voiceDump,
          currentIdentity: identity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process");
      }

      // Apply the updates to form data
      if (data.updates) {
        setFormData(prev => ({
          ...prev,
          ...data.updates,
          leavingBehind: data.updates.leavingBehind || prev.leavingBehind,
          elevatedEmotions: data.updates.elevatedEmotions || prev.elevatedEmotions,
        }));
        setIsEditing(true);
        setShowVoiceInput(false);
        setVoiceDump("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsProcessingVoice(false);
    }
  }

  // Parse identity pillars
  const identityPillars = identity?.coreIdentity
    ? identity.coreIdentity
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  // No identity yet - prompt to complete onboarding
  if (!identity && !isEditing) {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 bg-bg-primary safe-area-top safe-area-bottom">
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <h1 className="text-2xl font-semibold text-text-primary mb-4">
            Identity not set
          </h1>
          <p className="text-text-secondary mb-8">
            Complete onboarding to define who you&apos;re becoming.
          </p>
          <Button onClick={() => window.location.href = "/onboarding"}>
            Start Onboarding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary safe-area-top safe-area-bottom pb-24 lg:pb-8">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">
              Identity & Vision
            </h1>
            <p className="text-text-secondary mt-1">
              Who you&apos;re becoming and where you&apos;re headed
            </p>
          </div>
          <div className="flex gap-2">
            {speechSupported && !isEditing && (
              <Button variant="secondary" onClick={() => setShowVoiceInput(!showVoiceInput)}>
                {showVoiceInput ? "Cancel" : "🎤 Voice"}
              </Button>
            )}
            {!isEditing && !showVoiceInput && (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Voice Input Mode */}
        {showVoiceInput && (
          <Card className="mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-text-primary mb-2">
                  Voice Update
                </h3>
                <p className="text-sm text-text-secondary">
                  Speak freely about who you&apos;re becoming, what&apos;s changed, or new aspects of your identity.
                  The system will extract and update your profile.
                </p>
              </div>

              <div className="relative">
                <textarea
                  value={voiceDump}
                  onChange={(e) => setVoiceDump(e.target.value)}
                  placeholder="Speak or type about your identity... e.g., 'I'm also becoming a mentor now, and I want to focus more on creativity...'"
                  rows={4}
                  className="w-full px-4 py-3 pr-14 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
                  }`}
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
              </div>

              {isListening && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Listening...
                </div>
              )}

              <Button
                onClick={processVoiceDump}
                disabled={!voiceDump.trim() || isProcessingVoice}
                fullWidth
              >
                {isProcessingVoice ? "Processing..." : "Update Identity"}
              </Button>
            </div>
          </Card>
        )}

        {/* Edit Mode */}
        {isEditing ? (
          <div className="space-y-8">
            {/* Core Identity Section */}
            <Card>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Core Identity
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Who are you becoming? (comma-separated roles)
                  </label>
                  <textarea
                    value={formData.coreIdentity}
                    onChange={(e) => setFormData({ ...formData, coreIdentity: e.target.value })}
                    placeholder="e.g., Founder, Father, Athlete, Creator"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Separate each identity pillar with a comma
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Primary constraint
                  </label>
                  <input
                    value={formData.primaryConstraint}
                    onChange={(e) => setFormData({ ...formData, primaryConstraint: e.target.value })}
                    placeholder="What you're protecting"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Decision filter
                  </label>
                  <input
                    value={formData.decisionFilter}
                    onChange={(e) => setFormData({ ...formData, decisionFilter: e.target.value })}
                    placeholder="Your rule for saying yes"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Anti-patterns (comma-separated)
                  </label>
                  <input
                    value={formData.antiPatterns}
                    onChange={(e) => setFormData({ ...formData, antiPatterns: e.target.value })}
                    placeholder="Behaviors to avoid"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Current phase
                  </label>
                  <input
                    value={formData.currentPhase}
                    onChange={(e) => setFormData({ ...formData, currentPhase: e.target.value })}
                    placeholder="Where you are in your journey"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </Card>

            {/* Vision Section */}
            <Card>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Vision for the Future
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    What are you creating?
                  </label>
                  <textarea
                    value={formData.futureVision}
                    onChange={(e) => setFormData({ ...formData, futureVision: e.target.value })}
                    placeholder="Describe your future as if it's already happening..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    What are you leaving behind?
                  </label>
                  <div className="space-y-2">
                    {formData.leavingBehind.map((item, index) => (
                      <input
                        key={index}
                        value={item}
                        onChange={(e) => updateLeavingBehind(index, e.target.value)}
                        placeholder="Old pattern or identity..."
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    ))}
                    <button
                      type="button"
                      onClick={addLeavingBehind}
                      className="text-text-secondary hover:text-text-primary text-sm"
                    >
                      + Add another
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Elevated emotions to cultivate
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableEmotions.map((emotion) => {
                      const isSelected = formData.elevatedEmotions.includes(emotion);
                      return (
                        <button
                          key={emotion}
                          type="button"
                          onClick={() => toggleEmotion(emotion)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-accent text-white"
                              : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
                          }`}
                        >
                          {emotion}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            {/* Save/Cancel buttons */}
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving || !formData.coreIdentity.trim()}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>
        ) : !showVoiceInput && (
          /* View Mode */
          <div className="space-y-6">
            {/* Identity Pillars Visual Grid */}
            <Card>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Who I&apos;m Becoming
              </h2>
              {identityPillars.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {identityPillars.map((pillar, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 rounded-xl text-center space-y-2"
                    >
                      <span className="text-2xl">{getPillarIcon(pillar)}</span>
                      <p className="text-text-primary font-medium text-sm">
                        {pillar}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary">No identity pillars defined yet.</p>
              )}
            </Card>

            {/* Identity Details */}
            <Card>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Identity Details
              </h2>
              <div className="space-y-4">
                {identity?.primaryConstraint && (
                  <div>
                    <p className="text-sm text-text-muted">Protecting</p>
                    <p className="text-text-primary">{identity.primaryConstraint}</p>
                  </div>
                )}
                {identity?.decisionFilter && (
                  <div>
                    <p className="text-sm text-text-muted">Decision filter</p>
                    <p className="text-text-primary">{identity.decisionFilter}</p>
                  </div>
                )}
                {identity?.antiPatterns && identity.antiPatterns.length > 0 && (
                  <div>
                    <p className="text-sm text-text-muted">Anti-patterns</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {identity.antiPatterns.map((pattern, i) => (
                        <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {identity?.currentPhase && (
                  <div>
                    <p className="text-sm text-text-muted">Current phase</p>
                    <p className="text-text-primary">{identity.currentPhase}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Vision Card */}
            {(identity?.futureVision || identity?.leavingBehind?.length || identity?.elevatedEmotions?.length) && (
              <Card>
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Vision for the Future
                </h2>
                <div className="space-y-4">
                  {identity?.futureVision && (
                    <div>
                      <p className="text-sm text-text-muted">What I&apos;m creating</p>
                      <p className="text-text-primary whitespace-pre-wrap">{identity.futureVision}</p>
                    </div>
                  )}
                  {identity?.leavingBehind && identity.leavingBehind.length > 0 && (
                    <div>
                      <p className="text-sm text-text-muted">Leaving behind</p>
                      <ul className="mt-1 space-y-1">
                        {identity.leavingBehind.map((item, i) => (
                          <li key={i} className="text-text-primary flex items-start gap-2">
                            <span className="text-text-muted">—</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {identity?.elevatedEmotions && identity.elevatedEmotions.length > 0 && (
                    <div>
                      <p className="text-sm text-text-muted">Elevated emotions</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {identity.elevatedEmotions.map((emotion, i) => (
                          <span key={i} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                            {emotion}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


