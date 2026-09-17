"use client";

import { useAudioStore } from "@/lib/audioStore";

interface MobileNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onOpenDrawer: () => void;
}

export default function MobileNav({ currentView, onViewChange, onOpenDrawer }: MobileNavProps) {
  const playlists = useAudioStore((s) => s.playlists);
  const songs = useAudioStore((s) => s.songs);
  const favorites = songs.filter((s) => s.liked);

  const items = [
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
    {
      id: "playlists",
      label: "Álbumes",
      badge: playlists.length > 0 ? playlists.length : undefined,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: "favorites",
      label: "Favoritos",
      badge: favorites.length > 0 ? favorites.length : undefined,
      icon: (
        <svg className="w-5 h-5" fill={currentView === "favorites" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary/95 backdrop-blur-xl border-t border-white/5 px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around py-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === "playlists") {
                onOpenDrawer();
              } else if (item.id === "favorites") {
                onViewChange("biblioteca");
              } else {
                onViewChange(item.id);
              }
            }}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors ${
              currentView === item.id
                ? "text-accent-violet"
                : "text-text-muted"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
            {item.badge && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent-pink text-[9px] font-bold text-white flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
