"use client";

import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { useAudioStore } from "@/lib/audioStore";
import { useCallback } from "react";

export default function SearchBar() {
  const searchQuery = useAudioStore((s) => s.searchQuery);
  const setSearchQuery = useAudioStore((s) => s.setSearchQuery);

  const handleVoiceResult = useCallback(
    (text: string) => {
      setSearchQuery(text);
    },
    [setSearchQuery]
  );

  const { isListening, isSupported, startListening, stopListening } =
    useVoiceSearch(handleVoiceResult);

  return (
    <div className="relative flex items-center gap-3">
      {/* Search input */}
      <div className="relative flex-1">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar canción..."
          className="w-full pl-12 pr-4 py-3.5 bg-bg-card rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-violet/50 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Microphone button */}
      {isSupported ? (
        <button
          onClick={isListening ? stopListening : startListening}
          className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
            isListening
              ? "bg-accent-pink/20 text-accent-pink mic-listening"
              : "bg-bg-card text-text-secondary hover:text-text-primary hover:bg-bg-card/80"
          }`}
          title={isListening ? "Detener búsqueda por voz" : "Buscar por voz"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>
      ) : (
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-bg-card text-text-muted"
          title="Búsqueda por voz no soportada en este navegador"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
