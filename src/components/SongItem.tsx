"use client";

import { useState } from "react";
import { useAudioStore } from "@/lib/audioStore";
import { placeholderTint } from "@/lib/accent";
import type { Song } from "@/lib/types";
import AddToPlaylistMenu from "./AddToPlaylistMenu";

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface SongItemProps {
  song: Song;
  index: number;
}

export default function SongItem({ song, index }: SongItemProps) {
  const currentSong = useAudioStore((s) => s.currentSong);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const play = useAudioStore((s) => s.play);
  const toggleFavorite = useAudioStore((s) => s.toggleFavorite);
  const removeSong = useAudioStore((s) => s.removeSong);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

  const isActive = currentSong?.id === song.id;

  return (
    <div
      className="group relative grid cursor-pointer grid-cols-[24px_40px_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/[.07] px-[10px] py-2 transition-[background-color] duration-150 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-white/[.035] active:scale-[.998] md:grid-cols-[30px_44px_minmax(0,2fr)_minmax(0,1fr)_56px]"
      onClick={() => play(song)}
    >
      {/* Index / Playing indicator */}
      <div className="grid place-items-center">
        {isActive && isPlaying ? (
          <span className="eq" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        ) : (
          <>
            <span className="font-mono text-[11px] text-text-muted group-hover:hidden">
              {index + 1}
            </span>
            <svg
              className="hidden h-[11px] w-[11px] text-text-primary group-hover:block"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </>
        )}
      </div>

      {/* Cover / Placeholder */}
      <div className="relative h-10 w-10 flex-none overflow-hidden rounded-lg bg-bg-card md:h-11 md:w-11">
        {song.coverUrl ? (
          <img
            src={song.coverUrl}
            alt={song.title}
            className="h-full w-full object-cover saturate-[.9]"
          />
        ) : (
          <div
            className="grid h-full w-full place-items-center text-text-secondary"
            style={{ background: placeholderTint(song.title) }}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
      </div>

      {/* Title + Artist */}
      <div className="min-w-0">
        <p className={`truncate text-[13.5px] font-medium ${isActive ? "text-accent" : "text-text-primary"}`}>
          {song.title}
        </p>
        <p className="truncate text-[11.5px] text-text-muted">{song.artist}</p>
      </div>

      {/* Album */}
      <p className="hidden min-w-0 truncate text-[12px] text-text-muted md:block">{song.album}</p>

      {/* Duration */}
      <span className="hidden text-right font-mono text-[11.5px] text-text-muted md:block">
        {formatTime(song.duration)}
      </span>

      {/* Actions — inline on touch, revealed on hover from md up */}
      <div className="flex items-center gap-0.5 md:pointer-events-none md:absolute md:top-1/2 md:right-1.5 md:z-20 md:-translate-y-1/2 md:rounded-lg md:bg-bg-card md:px-1 md:py-0.5 md:opacity-0 md:transition-opacity md:duration-150 md:ease-[cubic-bezier(.22,1,.36,1)] md:group-focus-within:pointer-events-auto md:group-focus-within:opacity-100 md:group-hover:pointer-events-auto md:group-hover:opacity-100">
        {/* Favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(song.id);
          }}
          aria-label="Favorito"
          aria-pressed={song.liked}
          className={`grid h-[26px] w-[26px] place-items-center rounded-lg transition-colors duration-150 ${
            song.liked
              ? "text-accent"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <svg
            className="h-4 w-4"
            fill={song.liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Add to playlist */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPlaylistMenu(!showPlaylistMenu);
            }}
            aria-label="Agregar a álbum"
            className="grid h-[26px] w-[26px] place-items-center rounded-lg text-text-muted transition-colors duration-150 hover:text-text-primary"
            title="Agregar a álbum"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          {showPlaylistMenu && (
            <AddToPlaylistMenu
              songId={song.id}
              onClose={() => setShowPlaylistMenu(false)}
            />
          )}
        </div>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`¿Eliminar "${song.title}"?`)) {
              removeSong(song.id);
            }
          }}
          aria-label="Eliminar"
          className="grid h-[26px] w-[26px] place-items-center rounded-lg text-text-muted transition-colors duration-150 hover:text-red-400"
          title="Eliminar"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
