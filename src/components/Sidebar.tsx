"use client";

import { useAudioStore } from "@/lib/audioStore";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onSelectPlaylist?: (id: string) => void;
  onSelectQuickAccess?: (id: string) => void;
}

export default function Sidebar({ currentView, onViewChange, onSelectPlaylist, onSelectQuickAccess }: SidebarProps) {
  const songs = useAudioStore((s) => s.songs);
  const playlists = useAudioStore((s) => s.playlists);
  const favorites = songs.filter((s) => s.liked);

  const navItems = [
    {
      id: "inicio",
      label: "Inicio",
      count: undefined,
      icon: (
        <svg className="h-[15px] w-[15px] flex-none" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </svg>
      ),
    },
    {
      id: "biblioteca",
      label: "Biblioteca",
      count: songs.length,
      icon: (
        <svg className="h-[15px] w-[15px] flex-none" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
        </svg>
      ),
    },
  ];

  const quickAccess = [
    { id: "all", label: "Todas mis canciones", count: songs.length },
    { id: "favorites", label: "Favoritos", count: favorites.length },
  ];

  return (
    <aside className="hidden w-[236px] flex-shrink-0 flex-col gap-[22px] overflow-y-auto border-r border-white/[.07] bg-bg-secondary px-3 pt-[18px] pb-3 md:flex">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2">
        <div
          className="grid h-[26px] w-[26px] place-items-center gap-[2px] rounded-lg border border-white/[.13] bg-bg-card"
          aria-hidden="true"
        >
          <span className="flex h-[11px] items-end gap-[2px]">
            <i className="block h-[6px] w-[2px] rounded-[1px] bg-text-secondary" />
            <i className="block h-[11px] w-[2px] rounded-[1px] bg-text-primary" />
            <i className="block h-[8px] w-[2px] rounded-[1px] bg-text-secondary" />
          </span>
        </div>
        <span className="text-[13.5px] font-semibold tracking-[-.01em] text-text-primary">
          Mi Música
        </span>
      </div>

      {/* Main navigation */}
      <nav className="flex flex-col gap-px" aria-label="Navegación principal">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            aria-current={currentView === item.id ? "page" : undefined}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] transition-[color,background-color] duration-150 ease-[cubic-bezier(.22,1,.36,1)] active:scale-[.99] ${
              currentView === item.id
                ? "bg-white/[.06] text-text-primary"
                : "text-text-secondary hover:bg-white/[.045] hover:text-text-primary"
            }`}
          >
            {item.icon}
            {item.label}
            {item.count !== undefined && (
              <span className="ml-auto font-mono text-[11px] text-text-muted">{item.count}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Quick access */}
      <div className="flex flex-col gap-px">
        <p className="px-2.5 pb-2 text-[10.5px] font-medium uppercase tracking-[.09em] text-text-muted">
          Colecciones
        </p>
        {quickAccess.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectQuickAccess?.(item.id)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] text-text-secondary transition-[color,background-color] duration-150 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-white/[.045] hover:text-text-primary active:scale-[.99]"
          >
            <span className="truncate">{item.label}</span>
            <span className="ml-auto font-mono text-[11px] text-text-muted">{item.count}</span>
          </button>
        ))}
      </div>

      {/* Playlists */}
      {playlists.length > 0 && (
        <div className="flex flex-col gap-px">
          <p className="px-2.5 pb-2 text-[10.5px] font-medium uppercase tracking-[.09em] text-text-muted">
            Playlists
          </p>
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => onSelectPlaylist?.(playlist.id)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] text-text-secondary transition-[color,background-color] duration-150 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-white/[.045] hover:text-text-primary active:scale-[.99]"
            >
              <svg className="h-[15px] w-[15px] flex-none opacity-75" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="truncate">{playlist.name}</span>
              <span className="ml-auto font-mono text-[11px] text-text-muted">{playlist.songIds.length}</span>
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto border-t border-white/[.07] px-2.5 pt-2.5 text-[11.5px] leading-snug text-text-muted">
        Todo local. Nada sale de tu equipo.
      </div>
    </aside>
  );
}
