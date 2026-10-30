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
    <div className="flex w-full items-center gap-2">
      {/* Search input */}
      <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/[.07] bg-bg-secondary px-3 transition-colors duration-150 ease-[cubic-bezier(.22,1,.36,1)] focus-within:border-white/[.13]">
        <svg
          className="h-3.5 w-3.5 flex-none text-text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por título, artista o álbum"
          aria-label="Buscar"
          className="h-full w-full min-w-0 bg-transparent text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            aria-label="Limpiar búsqueda"
            className="grid h-5 w-5 flex-none place-items-center rounded text-text-muted transition-colors duration-150 hover:text-text-primary"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Microphone button */}
      {isSupported ? (
        <button
          onClick={isListening ? stopListening : startListening}
          aria-pressed={isListening}
          className={`grid h-9 w-9 flex-none place-items-center rounded-xl transition-[color,background-color] duration-150 ease-[cubic-bezier(.22,1,.36,1)] active:scale-95 ${
            isListening
              ? "bg-white/[.08] text-accent"
              : "text-text-secondary hover:bg-white/[.055] hover:text-text-primary"
          }`}
          title={isListening ? "Detener búsqueda por voz" : "Buscar por voz"}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          </svg>
        </button>
      ) : (
        <div
          className="grid h-9 w-9 flex-none place-items-center rounded-xl text-text-muted"
          title="Búsqueda por voz no soportada en este navegador"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            <path d="M3 3l18 18" />
          </svg>
        </div>
      )}
    </div>
  );
}
