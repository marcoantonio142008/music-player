"use client";

import { useState } from "react";
import { useAudioStore } from "@/lib/audioStore";
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
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
        isActive
          ? "bg-accent-violet/10"
          : "hover:bg-white/[0.04]"
      }`}
      onClick={() => play(song)}
    >
      {/* Index / Playing indicator */}
      <div className="w-6 text-center flex-shrink-0">
        {isActive && isPlaying ? (
          <div className="flex items-end justify-center gap-[2px] h-3">
            {[0.6, 1, 0.4].map((h, i) => (
              <div
                key={i}
                className="w-[2px] bg-accent-violet rounded-full animate-pulse"
                style={{
                  height: `${h * 12}px`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        ) : (
          <span className="text-xs text-text-muted">
            {index + 1}
          </span>
        )}
      </div>

      {/* Cover / Placeholder */}
      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
        {song.coverUrl ? (
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent-violet to-accent-pink flex items-center justify-center">
            <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
      </div>

      {/* Title + Artist */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isActive ? "text-accent-violet" : "text-text-primary"
          }`}
        >
          {song.title}
        </p>
        <p className="text-xs text-text-secondary truncate">
          {song.artist}
        </p>
      </div>

      {/* Duration */}
      <span className="text-xs text-text-muted mr-1 hidden sm:block">
        {formatTime(song.duration)}
      </span>

      {/* Action buttons - always visible */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {/* Favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(song.id);
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            song.liked
              ? "text-accent-pink"
              : "text-text-muted hover:text-accent-pink"
          }`}
        >
          <svg className="w-4 h-4" fill={song.liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Add to playlist */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPlaylistMenu(!showPlaylistMenu);
            }}
            className="p-1.5 rounded-lg text-text-muted hover:text-accent-violet transition-colors"
            title="Agregar a álbum"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
          className="p-1.5 rounded-lg text-text-muted hover:text-red-400 transition-colors"
          title="Eliminar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
