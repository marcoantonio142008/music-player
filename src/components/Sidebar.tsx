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
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "biblioteca",
      label: "Biblioteca",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
  ];

  const quickAccess = [
    { id: "all", label: "Todas mis canciones", count: songs.length },
    { id: "favorites", label: "Favoritos", count: favorites.length },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 purple-glass py-5 px-3 flex-shrink-0 overflow-y-auto rounded-r-2xl">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-violet to-accent-pink flex items-center justify-center glow-violet">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
        <span className="text-base font-bold text-text-primary tracking-tight">
          Mi Música
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 mb-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentView === item.id
                ? "bg-accent-violet/20 text-accent-violet"
                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div className="h-px bg-accent-violet/10 mx-3 mb-6" />

      {/* Quick Access */}
      <div className="px-3 mb-3">
        <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">
          Acceso rápido
        </h3>
      </div>
      <div className="flex flex-col gap-0.5 mb-6">
        {quickAccess.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectQuickAccess?.(item.id)}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
              currentView === "biblioteca"
                ? "bg-accent-violet/20 text-accent-violet"
                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
            }`}
          >
            <span className="truncate">{item.label}</span>
            <span className="text-xs text-text-muted ml-2">{item.count}</span>
          </button>
        ))}
      </div>

      {/* Playlists */}
      {playlists.length > 0 && (
        <>
          <div className="h-px bg-accent-violet/10 mx-3 mb-4" />
          <div className="px-3 mb-3">
            <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">
              Tus álbumes
            </h3>
          </div>
          <div className="flex flex-col gap-0.5">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => onSelectPlaylist?.(playlist.id)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="truncate">{playlist.name}</span>
                <span className="text-xs text-text-muted ml-auto">{playlist.songIds.length}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Import button at bottom */}
      <div className="mt-auto pt-4 px-3">
        <div className="h-px bg-accent-violet/10 mb-4" />
        <p className="text-[10px] text-text-muted text-center">
          {songs.length} {songs.length === 1 ? "canción" : "canciones"} en tu biblioteca
        </p>
      </div>
    </aside>
  );
}
