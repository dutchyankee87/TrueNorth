"use client";

import { useState, useEffect, useRef } from "react";

interface PostMeditationDumpProps {
  onComplete: (content: string) => void;
  onSkip: () => void;
}

// Speech recognition types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
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

interface ISpeechRecognition extends EventTarget {
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

type SpeechRecognitionConstructor = new () => ISpeechRecognition;

// Check if speech recognition is available
const getSpeechRecognition = (): SpeechRecognitionConstructor | null => {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
};

export function PostMeditationDump({ onComplete, onSkip }: PostMeditationDumpProps) {
  const [content, setContent] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showVoiceHint, setShowVoiceHint] = useState(true);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();

    // Hide voice hint after 5 seconds
    const timer = setTimeout(() => setShowVoiceHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) return;

    setHasSpeechRecognition(true);
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setContent((prev) => prev + " " + transcript.trim());
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  function toggleVoice() {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }

  function handleSubmit() {
    if (content.trim()) {
      onComplete(content.trim());
    }
  }

  const hasContent = content.trim().length > 0;
  const canSubmit = hasContent;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col px-6 py-12">
      {/* Header */}
      <div className="max-w-2xl mx-auto w-full mb-8">
        <h1 className="text-2xl font-medium text-text-primary mb-3">
          From this elevated state...
        </h1>
        <p className="text-text-secondary leading-relaxed">
          What wants to emerge? What became clear? What are you ready to release?
          Let it flow without editing.
        </p>
      </div>

      {/* Main content area */}
      <div className="flex-1 max-w-2xl mx-auto w-full flex flex-col">
        {/* Textarea */}
        <div className="flex-1 relative mb-6">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Speak or type freely..."
            className="w-full h-full min-h-[300px] resize-none bg-transparent text-text-primary text-lg leading-relaxed placeholder:text-text-muted focus:outline-none"
          />

          {/* Voice recording indicator */}
          {isListening && (
            <div className="absolute top-2 right-2 flex items-center gap-2 text-accent">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm">Listening...</span>
            </div>
          )}
        </div>

        {/* Voice button */}
        {hasSpeechRecognition && (
          <div className="mb-6">
            <button
              onClick={toggleVoice}
              className={`flex items-center justify-center gap-3 w-full py-4 rounded-lg border transition-colors ${
                isListening
                  ? "bg-accent/10 border-accent text-accent"
                  : "bg-bg-secondary border-border text-text-secondary hover:text-text-primary hover:border-text-muted"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <span>{isListening ? "Stop recording" : "Speak your insights"}</span>
            </button>

            {showVoiceHint && !content && (
              <p className="text-center text-text-muted text-sm mt-2">
                Voice often captures what the thinking mind misses
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onSkip}
            className="flex-1 py-4 text-text-muted hover:text-text-secondary transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex-1 py-4 rounded-lg font-medium transition-colors ${
              canSubmit
                ? "bg-text-primary text-bg-primary hover:bg-text-secondary"
                : "bg-bg-secondary text-text-muted cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
