"use client";

import { useEffect, useRef } from "react";
import { useAudioStore } from "@/lib/audioStore";
import { getAudioElement } from "@/lib/audioElement";
import { placeholderTint, useAccentFromCover } from "@/lib/accent";
import AudioVisualizer from "./AudioVisualizer";
import NowPlaying from "./NowPlaying";

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function Player() {
  const currentSong = useAudioStore((s) => s.currentSong);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const currentTime = useAudioStore((s) => s.currentTime);
  const togglePlay = useAudioStore((s) => s.togglePlay);
  const next = useAudioStore((s) => s.next);
  const previous = useAudioStore((s) => s.previous);
  const playbackMode = useAudioStore((s) => s.playbackMode);
  const setPlaybackMode = useAudioStore((s) => s.setPlaybackMode);
  const toggleFavorite = useAudioStore((s) => s.toggleFavorite);
  const seek = useAudioStore((s) => s.seek);
  const isVisualizerOpen = useAudioStore((s) => s.isVisualizerOpen);
  const toggleVisualizer = useAudioStore((s) => s.toggleVisualizer);
  const toggleNowPlaying = useAudioStore((s) => s.toggleNowPlaying);
  const volume = useAudioStore((s) => s.volume);
  const setVolume = useAudioStore((s) => s.setVolume);
  const isMuted = useAudioStore((s) => s.isMuted);
  const toggleMute = useAudioStore((s) => s.toggleMute);

  const progressBarRef = useRef<HTMLDivElement>(null);

  useAccentFromCover(currentSong);

  useEffect(() => {
    const audio = getAudioElement();

    const handleTimeUpdate = () => {
      useAudioStore.getState().setProgress(audio.currentTime);
    };

    const handleEnded = () => {
      useAudioStore.getState().next();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    const audio = getAudioElement();
    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !currentSong) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seek(percentage * currentSong.duration);
  };

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    handleProgressClick(e);
  };

  if (!currentSong) return null;

  const duration = currentSong.duration || 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isShuffle = playbackMode === "shuffle";
  const isRepeat = playbackMode !== "none";

  const cycleRepeat = () => {
    const modes: Array<"none" | "repeat" | "repeat-one"> = ["none", "repeat", "repeat-one"];
    const idx = modes.indexOf(playbackMode as "none" | "repeat" | "repeat-one");
    setPlaybackMode(modes[(idx + 1) % modes.length]);
  };

  return (
    <>
      <NowPlaying />

      <div className="fixed bottom-0 left-0 right-0 z-[45] border-t border-white/[.07] bg-bg-player glass-player">
        {isVisualizerOpen && (
          <div className="border-b border-white/[.07] px-6 pt-4 pb-2">
            <AudioVisualizer />
          </div>
        )}

        <div
          ref={progressBarRef}
          className="group relative h-[3px] cursor-pointer bg-white/10"
          onClick={handleProgressClick}
          onMouseMove={handleProgressDrag}
        >
          <div
            className="progress-smooth h-full bg-accent"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-text-primary opacity-0 transition-opacity group-hover:opacity-100"
            style={{ left: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4 md:px-4">
          {/* Now playing — left */}
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={toggleNowPlaying}
              aria-label="Abrir vista de reproducción"
              className="relative h-[46px] w-[46px] flex-shrink-0 overflow-hidden rounded-lg bg-bg-card transition-shadow hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,.35)]"
            >
              {currentSong.coverUrl ? (
                <img
                  src={currentSong.coverUrl}
                  alt=""
                  className="h-full w-full object-cover saturate-[.9]"
                />
              ) : (
                <span
                  className="flex h-full w-full items-center justify-center text-text-muted"
                  style={{ background: placeholderTint(currentSong.title) }}
                >
                  <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </span>
              )}
            </button>

            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{currentSong.title}</p>
              <p className="truncate text-[11.5px] text-text-muted">{currentSong.artist}</p>
            </div>

            <button
              type="button"
              onClick={() => toggleFavorite(currentSong.id)}
              aria-label="Favorito"
              aria-pressed={currentSong.liked}
              className={`ml-auto grid h-[30px] w-[30px] flex-shrink-0 place-items-center rounded-lg transition-colors ${
                currentSong.liked
                  ? "text-accent"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <svg
                className="h-[15px] w-[15px]"
                fill={currentSong.liked ? "currentColor" : "none"}
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
          </div>

          {/* Transport — center */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPlaybackMode(isShuffle ? "none" : "shuffle")}
              aria-label="Aleatorio"
              aria-pressed={isShuffle}
              className={`hidden h-[34px] w-[34px] place-items-center rounded-lg transition-colors sm:grid ${
                isShuffle ? "text-accent" : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M3 6h4l10 12h4M3 18h4L17 6h4" />
                <path d="M18 3l3 3-3 3M18 15l3 3-3 3" />
              </svg>
            </button>

            <button
              type="button"
              onClick={previous}
              aria-label="Anterior"
              className="grid h-[34px] w-[34px] place-items-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 6h2v12H7zM18 6v12l-8-6z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
              className="mx-1 grid h-[42px] w-[42px] place-items-center rounded-full bg-text-primary text-bg-primary transition-transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <svg className="h-[17px] w-[17px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="ml-0.5 h-[17px] w-[17px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Siguiente"
              className="grid h-[34px] w-[34px] place-items-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17 6h-2v12h2zM6 6v12l8-6z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={cycleRepeat}
              aria-label="Repetir"
              aria-pressed={isRepeat}
              className={`relative hidden h-[34px] w-[34px] place-items-center rounded-lg transition-colors sm:grid ${
                isRepeat ? "text-accent" : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M17 3l3 3-3 3" />
                <path d="M20 6H8a4 4 0 0 0-4 4" />
                <path d="M7 21l-3-3 3-3" />
                <path d="M4 18h12a4 4 0 0 0 4-4" />
              </svg>
              {playbackMode === "repeat-one" && (
                <span className="absolute -top-0.5 -right-0.5 font-mono text-[7px] font-bold text-accent">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Time & volume — right */}
          <div className="hidden items-center justify-end gap-2.5 md:flex">
            <span className="whitespace-nowrap font-mono text-[11px] text-text-muted">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <button
              type="button"
              onClick={toggleVisualizer}
              aria-label="Visualizador"
              aria-pressed={isVisualizerOpen}
              className={`grid h-[34px] w-[34px] place-items-center rounded-lg transition-colors ${
                isVisualizerOpen
                  ? "text-accent"
                  : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M4 14v-4M8 18V6M12 15V9M16 19V5M20 13v-2" />
              </svg>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                className="grid h-[34px] w-[34px] place-items-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
              >
                {isMuted || volume === 0 ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M4 9h3l4-4v14l-4-4H4z" />
                    <path d="M16 9.5l5 5M21 9.5l-5 5" />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M4 9h3l4-4v14l-4-4H4z" />
                    <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />
                    <path d="M18 7a7 7 0 0 1 0 10" />
                  </svg>
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                aria-label="Volumen"
                className="slider-accent w-[76px]"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
