"use client";

import { useEffect, useState, useRef } from "react";

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

// Speech recognition types
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

const ELEVATED_EMOTIONS = [
  "Gratitude", "Joy", "Love", "Freedom", "Abundance", "Peace",
  "Empowerment", "Confidence", "Creativity", "Connection", "Clarity", "Trust",
];

export default function IdentityPage() {
  const [identity, setIdentity] = useState<IdentityAnchor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Voice input
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceDump, setVoiceDump] = useState("");
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Form state
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

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

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
        setFormData({
          coreIdentity: data.identity.coreIdentity || "",
          primaryConstraint: data.identity.primaryConstraint || "",
          decisionFilter: data.identity.decisionFilter || "",
          antiPatterns: data.identity.antiPatterns?.join(", ") || "",
          currentPhase: data.identity.currentPhase || "",
          futureVision: data.identity.futureVision || "",
          leavingBehind: data.identity.leavingBehind?.length
            ? [...data.identity.leavingBehind, "", ""].slice(0, Math.max(3, data.identity.leavingBehind.length))
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

      await fetchIdentity();
      setEditingSection(null);
    } catch (err) {
      console.error("Save error:", err);
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function toggleEmotion(emotion: string) {
    setFormData(prev => ({
      ...prev,
      elevatedEmotions: prev.elevatedEmotions.includes(emotion)
        ? prev.elevatedEmotions.filter(e => e !== emotion)
        : [...prev.elevatedEmotions, emotion],
    }));
  }

  function updateLeavingBehind(index: number, value: string) {
    const updated = [...formData.leavingBehind];
    updated[index] = value;
    setFormData({ ...formData, leavingBehind: updated });
  }

  function toggleListening() {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
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
      if (!response.ok) throw new Error(data.error || "Failed to process");

      if (data.updates) {
        setFormData(prev => ({
          ...prev,
          ...data.updates,
          leavingBehind: data.updates.leavingBehind || prev.leavingBehind,
          elevatedEmotions: data.updates.elevatedEmotions || prev.elevatedEmotions,
        }));
        setEditingSection("all");
        setShowVoiceModal(false);
        setVoiceDump("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsProcessingVoice(false);
    }
  }

  const identityPillars = identity?.coreIdentity
    ? identity.coreIdentity.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 0)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!identity && editingSection !== "all") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#FAFAF9]">
        <div className="text-center max-w-sm">
          <p className="text-stone-400 text-sm tracking-wide uppercase mb-3">
            Identity not set
          </p>
          <h1 className="text-2xl text-stone-900 font-light mb-4">
            Who are you becoming?
          </h1>
          <p className="text-stone-500 mb-8 leading-relaxed">
            Complete onboarding to define your identity and vision.
          </p>
          <button
            onClick={() => window.location.href = "/onboarding"}
            className="px-8 py-3 bg-stone-900 text-white text-sm tracking-wide rounded-full hover:bg-stone-800 transition-colors"
          >
            Start Onboarding
          </button>
        </div>
      </div>
    );
  }

  const isEditing = editingSection !== null;

  return (
    <div className="min-h-screen bg-[#FAFAF9] safe-area-top safe-area-bottom">
      <div className="max-w-2xl mx-auto px-6 py-12 pb-32 lg:pb-12">

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-stone-400 text-xs tracking-[0.2em] uppercase mb-2">
                Identity & Vision
              </p>
              <h1 className="text-3xl text-stone-900 font-light tracking-tight">
                Who you're becoming
              </h1>
            </div>
            <div className="flex gap-2">
              {speechSupported && !isEditing && (
                <button
                  onClick={() => setShowVoiceModal(true)}
                  className="p-3 rounded-full border border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700 transition-colors"
                  title="Voice update"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                </button>
              )}
              {!isEditing && (
                <button
                  onClick={() => setEditingSection("all")}
                  className="px-5 py-2.5 rounded-full border border-stone-200 text-stone-600 text-sm hover:border-stone-300 hover:text-stone-800 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Error message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Voice Modal */}
        {showVoiceModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl text-stone-900 font-medium">Voice Update</h2>
                  <p className="text-stone-500 text-sm mt-1">
                    Speak freely about your evolving identity
                  </p>
                </div>
                <button
                  onClick={() => { setShowVoiceModal(false); setVoiceDump(""); }}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="relative mb-4">
                <textarea
                  value={voiceDump}
                  onChange={(e) => setVoiceDump(e.target.value)}
                  placeholder="I'm becoming more focused on..."
                  rows={4}
                  className="w-full px-4 py-4 pr-14 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                  }`}
                >
                  {isListening ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
              </div>

              {isListening && (
                <p className="text-red-500 text-sm mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Listening...
                </p>
              )}

              <button
                onClick={processVoiceDump}
                disabled={!voiceDump.trim() || isProcessingVoice}
                className="w-full py-3 bg-stone-900 text-white text-sm tracking-wide rounded-full hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessingVoice ? "Processing..." : "Update Identity"}
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {isEditing ? (
          /* Edit Mode */
          <div className="space-y-12">

            {/* Identity Pillars */}
            <section>
              <label className="block text-stone-400 text-xs tracking-[0.15em] uppercase mb-3">
                Identity Pillars
              </label>
              <textarea
                value={formData.coreIdentity}
                onChange={(e) => setFormData({ ...formData, coreIdentity: e.target.value })}
                placeholder="Founder, Father, Athlete, Creator..."
                rows={2}
                className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none text-lg"
              />
              <p className="text-stone-400 text-xs mt-2">Separate with commas</p>
            </section>

            {/* Current Phase */}
            <section>
              <label className="block text-stone-400 text-xs tracking-[0.15em] uppercase mb-3">
                Current Phase
              </label>
              <input
                value={formData.currentPhase}
                onChange={(e) => setFormData({ ...formData, currentPhase: e.target.value })}
                placeholder="Where you are in your journey..."
                className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </section>

            {/* Future Vision */}
            <section>
              <label className="block text-stone-400 text-xs tracking-[0.15em] uppercase mb-3">
                Your Vision
              </label>
              <textarea
                value={formData.futureVision}
                onChange={(e) => setFormData({ ...formData, futureVision: e.target.value })}
                placeholder="Describe your future as if it's already happening..."
                rows={5}
                className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none leading-relaxed"
              />
            </section>

            {/* Elevated Emotions */}
            <section>
              <label className="block text-stone-400 text-xs tracking-[0.15em] uppercase mb-4">
                Emotions to Cultivate
              </label>
              <div className="flex flex-wrap gap-2">
                {ELEVATED_EMOTIONS.map((emotion) => {
                  const isSelected = formData.elevatedEmotions.includes(emotion);
                  return (
                    <button
                      key={emotion}
                      type="button"
                      onClick={() => toggleEmotion(emotion)}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        isSelected
                          ? "bg-stone-900 text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {emotion}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Leaving Behind */}
            <section>
              <label className="block text-stone-400 text-xs tracking-[0.15em] uppercase mb-3">
                Leaving Behind
              </label>
              <div className="space-y-3">
                {formData.leavingBehind.map((item, index) => (
                  <input
                    key={index}
                    value={item}
                    onChange={(e) => updateLeavingBehind(index, e.target.value)}
                    placeholder="Old pattern or identity..."
                    className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, leavingBehind: [...formData.leavingBehind, ""] })}
                  className="text-stone-400 hover:text-stone-600 text-sm transition-colors"
                >
                  + Add another
                </button>
              </div>
            </section>

            {/* Constraints & Filters */}
            <section className="border-t border-stone-200 pt-10">
              <p className="text-stone-400 text-xs tracking-[0.15em] uppercase mb-6">
                Guardrails
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-stone-500 text-sm mb-2">
                    Primary Constraint
                  </label>
                  <input
                    value={formData.primaryConstraint}
                    onChange={(e) => setFormData({ ...formData, primaryConstraint: e.target.value })}
                    placeholder="What you're protecting..."
                    className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-stone-500 text-sm mb-2">
                    Decision Filter
                  </label>
                  <input
                    value={formData.decisionFilter}
                    onChange={(e) => setFormData({ ...formData, decisionFilter: e.target.value })}
                    placeholder="Your rule for saying yes..."
                    className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-stone-500 text-sm mb-2">
                    Anti-patterns
                  </label>
                  <input
                    value={formData.antiPatterns}
                    onChange={(e) => setFormData({ ...formData, antiPatterns: e.target.value })}
                    placeholder="Behaviors to avoid (comma-separated)..."
                    className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
                  />
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving || !formData.coreIdentity.trim()}
                className="px-8 py-3 bg-stone-900 text-white text-sm tracking-wide rounded-full hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setEditingSection(null);
                  // Reset form to current identity
                  if (identity) {
                    setFormData({
                      coreIdentity: identity.coreIdentity || "",
                      primaryConstraint: identity.primaryConstraint || "",
                      decisionFilter: identity.decisionFilter || "",
                      antiPatterns: identity.antiPatterns?.join(", ") || "",
                      currentPhase: identity.currentPhase || "",
                      futureVision: identity.futureVision || "",
                      leavingBehind: identity.leavingBehind?.length
                        ? [...identity.leavingBehind, "", ""].slice(0, Math.max(3, identity.leavingBehind.length))
                        : ["", "", ""],
                      elevatedEmotions: identity.elevatedEmotions || [],
                    });
                  }
                }}
                disabled={saving}
                className="px-8 py-3 text-stone-500 text-sm hover:text-stone-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-12">

            {/* Identity Pillars */}
            <section>
              <p className="text-stone-400 text-xs tracking-[0.15em] uppercase mb-6">
                Identity Pillars
              </p>
              {identityPillars.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {identityPillars.map((pillar, index) => (
                    <span
                      key={index}
                      className="px-5 py-2.5 bg-stone-100 text-stone-800 rounded-full text-sm font-medium"
                    >
                      {pillar}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-stone-400">Not defined yet</p>
              )}
            </section>

            {/* Current Phase */}
            {identity?.currentPhase && (
              <section>
                <p className="text-stone-400 text-xs tracking-[0.15em] uppercase mb-3">
                  Current Phase
                </p>
                <p className="text-stone-800 text-lg">{identity.currentPhase}</p>
              </section>
            )}

            {/* Vision */}
            {identity?.futureVision && (
              <section className="border-t border-stone-200 pt-10">
                <p className="text-stone-400 text-xs tracking-[0.15em] uppercase mb-4">
                  Your Vision
                </p>
                <p className="text-stone-700 text-lg leading-relaxed whitespace-pre-wrap">
                  {identity.futureVision}
                </p>
              </section>
            )}

            {/* Elevated Emotions */}
            {identity?.elevatedEmotions && identity.elevatedEmotions.length > 0 && (
              <section>
                <p className="text-stone-400 text-xs tracking-[0.15em] uppercase mb-4">
                  Cultivating
                </p>
                <div className="flex flex-wrap gap-2">
                  {identity.elevatedEmotions.map((emotion, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm"
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Leaving Behind */}
            {identity?.leavingBehind && identity.leavingBehind.length > 0 && (
              <section>
                <p className="text-stone-400 text-xs tracking-[0.15em] uppercase mb-4">
                  Leaving Behind
                </p>
                <ul className="space-y-2">
                  {identity.leavingBehind.map((item, i) => (
                    <li key={i} className="text-stone-500 flex items-start gap-3">
                      <span className="text-stone-300">—</span>
                      <span className="line-through decoration-stone-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Guardrails */}
            {(identity?.primaryConstraint || identity?.decisionFilter || identity?.antiPatterns?.length) && (
              <section className="border-t border-stone-200 pt-10">
                <p className="text-stone-400 text-xs tracking-[0.15em] uppercase mb-6">
                  Guardrails
                </p>
                <div className="space-y-6">
                  {identity.primaryConstraint && (
                    <div>
                      <p className="text-stone-400 text-sm mb-1">Protecting</p>
                      <p className="text-stone-800">{identity.primaryConstraint}</p>
                    </div>
                  )}
                  {identity.decisionFilter && (
                    <div>
                      <p className="text-stone-400 text-sm mb-1">Decision Filter</p>
                      <p className="text-stone-800">{identity.decisionFilter}</p>
                    </div>
                  )}
                  {identity.antiPatterns && identity.antiPatterns.length > 0 && (
                    <div>
                      <p className="text-stone-400 text-sm mb-2">Anti-patterns</p>
                      <div className="flex flex-wrap gap-2">
                        {identity.antiPatterns.map((pattern, i) => (
                          <span key={i} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-sm">
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

