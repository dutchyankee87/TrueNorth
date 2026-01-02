"use client";

import { useState, useEffect, useRef } from "react";
import { useDeepgramVoice } from "@/lib/hooks/useDeepgramVoice";

interface PostMeditationDumpProps {
  onComplete: (content: string) => void;
  onSkip: () => void;
}

export function PostMeditationDump({ onComplete, onSkip }: PostMeditationDumpProps) {
  const [content, setContent] = useState("");
  const [showVoiceHint, setShowVoiceHint] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Deepgram voice
  const {
    isRecording,
    isProcessing: isTranscribing,
    toggleRecording,
  } = useDeepgramVoice({
    onTranscript: (transcript) => {
      setContent((prev) => (prev ? prev + " " + transcript : transcript));
    },
  });

  const isListening = isRecording || isTranscribing;

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();

    // Hide voice hint after 5 seconds
    const timer = setTimeout(() => setShowVoiceHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

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
              <span className="text-sm">
                {isRecording ? "Recording..." : "Transcribing..."}
              </span>
            </div>
          )}
        </div>

        {/* Voice button */}
        <div className="mb-6">
          <button
            onClick={toggleRecording}
            className={`flex items-center justify-center gap-3 w-full py-4 rounded-lg border transition-colors ${
              isListening
                ? "bg-accent/10 border-accent text-accent"
                : "bg-bg-secondary border-border text-text-secondary hover:text-text-primary hover:border-text-muted"
            }`}
          >
            {isRecording ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : isTranscribing ? (
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            ) : (
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
            )}
            <span>
              {isRecording ? "Stop recording" : isTranscribing ? "Transcribing..." : "Speak your insights"}
            </span>
          </button>

          {showVoiceHint && !content && (
            <p className="text-center text-text-muted text-sm mt-2">
              Voice often captures what the thinking mind misses
            </p>
          )}
        </div>

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
