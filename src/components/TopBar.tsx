"use client";

import SearchBar from "./SearchBar";

interface TopBarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function TopBar({ currentView, onViewChange }: TopBarProps) {
  const tabs = [
    { id: "inicio", label: "INICIO" },
    { id: "biblioteca", label: "BIBLIOTECA" },
  ];

  const openFilePicker = () => {
    document.querySelector<HTMLInputElement>('input[type="file"]')?.click();
  };

  return (
    <header className="flex h-16 flex-none items-center gap-3 border-b border-white/[.07] bg-bg-secondary px-4 md:px-6">
      {/* Tabs */}
      <nav className="hidden items-center gap-1 sm:flex" aria-label="Vistas">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            aria-current={currentView === tab.id ? "page" : undefined}
            className={`rounded-lg px-2.5 py-1.5 text-[12px] font-medium tracking-[.06em] transition-[color,background-color] duration-150 ease-[cubic-bezier(.22,1,.36,1)] active:scale-[.99] ${
              currentView === tab.id
                ? "bg-white/[.06] text-text-primary"
                : "text-text-muted hover:bg-white/[.045] hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Search */}
      <div className="min-w-0 max-w-[380px] flex-1">
        <SearchBar />
      </div>

      {/* Import — the primary visual entry point for adding music */}
      <div className="ml-auto flex flex-none items-center">
        <button
          type="button"
          onClick={openFilePicker}
          className="inline-flex h-9 flex-none items-center gap-[7px] whitespace-nowrap rounded-xl border border-white/[.13] px-3.5 text-[13px] font-medium text-text-primary transition-[background-color,border-color] duration-150 ease-[cubic-bezier(.22,1,.36,1)] hover:border-white/[.2] hover:bg-white/[.06] active:scale-[.99]"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="hidden sm:inline">Importar</span>
        </button>
      </div>
    </header>
  );
}
