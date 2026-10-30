"use client";

import { useAudioStore } from "@/lib/audioStore";

interface MobileNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onOpenDrawer: () => void;
  onSelectQuickAccess?: (id: string) => void;
}

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export default function MobileNav({ currentView, onViewChange, onOpenDrawer, onSelectQuickAccess }: MobileNavProps) {
  const playlists = useAudioStore((s) => s.playlists);
  const songs = useAudioStore((s) => s.songs);
  const favorites = songs.filter((s) => s.liked);

  const items = [
    {
      id: "inicio",
      label: "Inicio",
      badge: undefined as number | undefined,
      icon: (
        <svg className="h-5 w-5" {...iconProps}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </svg>
      ),
    },
    {
      id: "biblioteca",
      label: "Biblioteca",
      badge: undefined as number | undefined,
      icon: (
        <svg className="h-5 w-5" {...iconProps}>
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
        </svg>
      ),
    },
    {
      id: "playlists",
      label: "Álbumes",
      badge: playlists.length > 0 ? playlists.length : undefined,
      icon: (
        <svg className="h-5 w-5" {...iconProps}>
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: "favorites",
      label: "Favoritos",
      badge: favorites.length > 0 ? favorites.length : undefined,
      icon: (
        <svg
          className="h-5 w-5"
          {...iconProps}
          fill={currentView === "biblioteca" ? "currentColor" : "none"}
        >
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-40 border-t border-white/[.07] bg-bg-secondary/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around py-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === "playlists") {
                onOpenDrawer();
              } else if (item.id === "favorites") {
                onSelectQuickAccess?.("favorites");
              } else {
                onViewChange(item.id);
              }
            }}
            className={`relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-colors duration-150 ease-[cubic-bezier(.22,1,.36,1)] ${
              currentView === item.id
                ? "text-accent"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
            {item.badge && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white/[.14] px-1 font-mono text-[9px] font-medium text-text-primary">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
