"use client";

import { useAudioStore } from "@/lib/audioStore";
import SongItem from "./SongItem";
import { useMemo } from "react";

export default function SongList() {
  const songs = useAudioStore((s) => s.songs);
  const searchQuery = useAudioStore((s) => s.searchQuery);

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;
    const q = searchQuery.toLowerCase();
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q)
    );
  }, [songs, searchQuery]);

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-6 grid h-14 w-14 place-items-center rounded-xl border border-white/[.07] bg-bg-card">
          <svg className="h-6 w-6 text-text-muted" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <h3 className="text-[15px] font-semibold tracking-[-.015em] text-text-primary">
          Tu biblioteca está vacía
        </h3>
        <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-text-muted">
          Importá tu música usando el botón de arriba para comenzar a reproducir
        </p>
      </div>
    );
  }

  if (filteredSongs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-[13px] text-text-muted">
          No se encontraron resultados para &ldquo;{searchQuery}&rdquo;
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-white/[.07]">
      {filteredSongs.map((song, index) => (
        <SongItem key={song.id} song={song} index={index} />
      ))}
    </div>
  );
}
