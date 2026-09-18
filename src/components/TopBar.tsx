"use client";

import { useAudioStore } from "@/lib/audioStore";

interface TopBarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function TopBar({ currentView, onViewChange }: TopBarProps) {
  const searchQuery = useAudioStore((s) => s.searchQuery);
  const setSearchQuery = useAudioStore((s) => s.setSearchQuery);

  const tabs = [
    { id: "inicio", label: "INICIO" },
    { id: "biblioteca", label: "BIBLIOTECA" },
  ];

  return (
    <header className="flex items-center gap-4 px-6 py-4 border-b border-accent-violet/10 bg-bg-primary/50 glass sticky top-0 z-40">
      {/* Tabs */}
      <nav className="hidden sm:flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all ${
              currentView === tab.id
                ? "text-accent-violet bg-accent-violet/10"
                : "text-text-muted hover:text-text-secondary hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Search */}
      <div className="flex-1 max-w-md ml-auto">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
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
            placeholder="Buscar"
            className="w-full pl-10 pr-4 py-2.5 purple-glass rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-violet/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
