"use client";

import { useEffect, useRef } from "react";
import { useAudioStore } from "@/lib/audioStore";
import AudioVisualizer from "./AudioVisualizer";

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
  const volume = useAudioStore((s) => s.volume);
  const setVolume = useAudioStore((s) => s.setVolume);
  const isMuted = useAudioStore((s) => s.isMuted);
  const toggleMute = useAudioStore((s) => s.toggleMute);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "metadata";
    }
    const audio = audioRef.current;

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
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    if (audio.src !== currentSong.url) {
      audio.src = currentSong.url;
      audio.load();
    }
    if (isPlaying) audio.play().catch(() => {});
  }, [currentSong?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying, currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-accent-violet/15 bg-bg-player glass shadow-[0_-10px_40px_-15px_rgba(167,139,250,0.35)]">
      {isVisualizerOpen && (
        <div className="px-6 pt-4 bg-bg-player border-b border-accent-violet/10">
          <AudioVisualizer />
        </div>
      )}

      <div
        ref={progressBarRef}
        className="h-1.5 bg-accent-violet/10 cursor-pointer group relative"
        onClick={handleProgressClick}
        onMouseMove={handleProgressDrag}
      >
        <div
          className="h-full transition-all duration-150"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #a78bfa, #c084fc)",
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 animate-song-change">
            {currentSong.coverUrl ? (
              <img src={currentSong.coverUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-accent-violet to-accent-pink flex items-center justify-center">
                <svg className="w-5 h-5 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-semibold truncate ${currentSong.title.length > 25 ? "animate-marquee" : ""}`}>
              {currentSong.title}
            </p>
            <p className="text-xs text-text-secondary truncate">{currentSong.artist}</p>
          </div>
          <button
            onClick={() => toggleFavorite(currentSong.id)}
            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
              currentSong.liked ? "text-accent-pink" : "text-text-muted hover:text-accent-pink"
            }`}
          >
            <svg className="w-4 h-4" fill={currentSong.liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPlaybackMode(playbackMode === "shuffle" ? "none" : "shuffle");
            }}
            className={`p-2 rounded-lg transition-colors hidden sm:block ${
              playbackMode === "shuffle" ? "text-accent-violet" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button onClick={previous} className="p-2 text-text-secondary hover:text-text-primary transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button onClick={togglePlay} className="gradient-btn w-10 h-10 rounded-full flex items-center justify-center text-white">
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button onClick={next} className="p-2 text-text-secondary hover:text-text-primary transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>

          <button
            onClick={() => {
              const modes: Array<"none" | "repeat" | "repeat-one"> = ["none", "repeat", "repeat-one"];
              const idx = modes.indexOf(playbackMode as "none" | "repeat" | "repeat-one");
              setPlaybackMode(modes[(idx + 1) % modes.length]);
            }}
            className={`p-2 rounded-lg transition-colors hidden sm:block relative ${
              playbackMode !== "none" ? "text-accent-violet" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {playbackMode === "repeat-one" && (
              <span className="absolute -top-0.5 -right-0.5 text-[7px] font-bold text-accent-violet">1</span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="text-[11px] text-text-muted font-mono hidden sm:block">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <button
            onClick={toggleVisualizer}
            className={`p-2 rounded-lg transition-colors hidden sm:block ${
              isVisualizerOpen ? "text-accent-cyan" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </button>

          <div className="hidden sm:flex items-center gap-1">
            <button onClick={toggleMute} className="p-2 text-text-muted hover:text-text-primary transition-colors">
              {isMuted || volume === 0 ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
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
              className="gradient-slider w-20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
