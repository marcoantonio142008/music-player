"use client";

import { useEffect, useRef, useState } from "react";
import { useAudioStore } from "@/lib/audioStore";
import { placeholderTint, useAccentFromCover } from "@/lib/accent";

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const VIZ_BARS = [
  { height: "40%", delay: "-0.1s" },
  { height: "70%", delay: "-0.4s" },
  { height: "55%", delay: "-0.2s" },
  { height: "90%", delay: "-0.6s" },
  { height: "35%", delay: "-0.3s" },
  { height: "80%", delay: "-0.5s" },
  { height: "60%", delay: "-0.7s" },
  { height: "45%", delay: "-0.25s" },
  { height: "75%", delay: "-0.55s" },
  { height: "30%", delay: "-0.35s" },
  { height: "65%", delay: "-0.15s" },
  { height: "50%", delay: "-0.45s" },
  { height: "85%", delay: "-0.65s" },
  { height: "38%", delay: "-0.05s" },
  { height: "58%", delay: "-0.5s" },
  { height: "72%", delay: "-0.3s" },
];

export default function NowPlaying() {
  const currentSong = useAudioStore((s) => s.currentSong);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const currentTime = useAudioStore((s) => s.currentTime);
  const isOpen = useAudioStore((s) => s.isNowPlayingOpen);
  const closeNowPlaying = useAudioStore((s) => s.closeNowPlaying);
  const togglePlay = useAudioStore((s) => s.togglePlay);
  const next = useAudioStore((s) => s.next);
  const previous = useAudioStore((s) => s.previous);
  const seek = useAudioStore((s) => s.seek);
  const playbackMode = useAudioStore((s) => s.playbackMode);
  const setPlaybackMode = useAudioStore((s) => s.setPlaybackMode);
  const searchCover = useAudioStore((s) => s.searchCover);

  const trackRef = useRef<HTMLDivElement>(null);
  const [coverSearch, setCoverSearch] = useState<{
    songId: string;
    state: "idle" | "searching" | "empty";
  } | null>(null);

  useAccentFromCover(currentSong);

  // The verdict belongs to one song: switching tracks must not inherit it.
  const coverStatus =
    coverSearch && coverSearch.songId === currentSong?.id
      ? coverSearch.state
      : "idle";

  const handleSearchCover = async () => {
    if (!currentSong || coverStatus === "searching") return;
    const songId = currentSong.id;
    setCoverSearch({ songId, state: "searching" });
    // force: the user asked explicitly, so ignore the "already tried" flag.
    const found = await searchCover(songId, true);
    setCoverSearch({ songId, state: found ? "idle" : "empty" });
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNowPlaying();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeNowPlaying]);

  if (!isOpen || !currentSong) return null;

  const duration = currentSong.duration || 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const meta = [currentSong.artist, currentSong.album].filter(Boolean).join(" · ");
  const isShuffle = playbackMode === "shuffle";
  const isRepeat = playbackMode !== "none";

  const seekTo = (clientX: number) => {
    if (!trackRef.current || duration <= 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    seek(ratio * duration);
  };

  const cycleRepeat = () => {
    const modes: Array<"none" | "repeat" | "repeat-one"> = ["none", "repeat", "repeat-one"];
    const idx = modes.indexOf(playbackMode as "none" | "repeat" | "repeat-one");
    setPlaybackMode(modes[(idx + 1) % modes.length]);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sonando ahora"
      className="animate-np-in fixed inset-0 z-50 overflow-y-auto bg-bg-primary before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(60%_50%_at_30%_45%,color-mix(in_srgb,var(--accent)_9%,transparent),transparent_70%)]"
    >
      <button
        type="button"
        onClick={closeNowPlaying}
        aria-label="Cerrar"
        className="fixed top-5 right-5 z-10 grid h-[38px] w-[38px] place-items-center rounded-full border border-white/[.07] bg-white/[.03] text-text-secondary transition-colors hover:bg-white/[.08] hover:text-text-primary"
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
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div className="relative grid min-h-dvh grid-cols-1 content-center items-center gap-6 px-5 py-16 md:grid-cols-2 md:gap-[clamp(24px,6vw,80px)] md:px-[clamp(24px,5vw,72px)] md:py-[clamp(24px,5vw,72px)]">
        <div className="w-[min(300px,72vw)] justify-self-center md:w-[min(420px,100%)] md:justify-self-end">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-bg-card shadow-[0_30px_80px_-40px_rgba(0,0,0,.9)] after:absolute after:inset-0 after:rounded-2xl after:shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">
            {currentSong.coverUrl ? (
              <img
                src={currentSong.coverUrl}
                alt=""
                className="h-full w-full object-cover saturate-[.92]"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-text-muted"
                style={{ background: placeholderTint(currentSong.title) }}
              >
                <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
          </div>

          {!currentSong.coverUrl && (
            <button
              type="button"
              onClick={handleSearchCover}
              disabled={coverStatus === "searching"}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[10.5px] font-medium uppercase tracking-[.1em] text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary disabled:opacity-60"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              {coverStatus === "searching"
                ? "Buscando…"
                : coverStatus === "empty"
                  ? "Sin resultados"
                  : "Buscar portada"}
            </button>
          )}
        </div>

        <div className="w-full max-w-[440px] justify-self-center md:justify-self-start">
          <p className="text-[10.5px] font-medium uppercase tracking-[.1em] text-text-muted">
            Sonando ahora
          </p>
          <h2 className="mt-3 text-[clamp(26px,3.4vw,40px)] font-semibold leading-[1.08] tracking-[-.035em]">
            {currentSong.title}
          </h2>
          <p className="mt-2 text-[13px] text-text-secondary">{meta}</p>

          <div className="mt-7">
            <div
              ref={trackRef}
              role="slider"
              tabIndex={0}
              aria-label="Progreso"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(currentTime)}
              aria-valuetext={`${formatTime(currentTime)} de ${formatTime(duration)}`}
              onClick={(e) => seekTo(e.clientX)}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  seek(Math.max(0, currentTime - 5));
                }
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  seek(Math.min(duration, currentTime + 5));
                }
              }}
              className="relative h-[3px] cursor-pointer rounded-full bg-white/10"
            >
              <div
                className="progress-smooth h-full rounded-full bg-accent"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[11px] text-text-muted">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPlaybackMode(isShuffle ? "none" : "shuffle")}
              aria-label="Aleatorio"
              aria-pressed={isShuffle}
              className={`grid h-10 w-10 place-items-center rounded-lg transition-colors ${
                isShuffle ? "text-accent" : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
              }`}
            >
              <svg
                className="h-[18px] w-[18px]"
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
              className="grid h-10 w-10 place-items-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
            >
              <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 6h2v12H7zM18 6v12l-8-6z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
              className="mx-2 grid h-[52px] w-[52px] place-items-center rounded-full bg-text-primary text-bg-primary transition-transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Siguiente"
              className="grid h-10 w-10 place-items-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
            >
              <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17 6h-2v12h2zM6 6v12l8-6z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={cycleRepeat}
              aria-label="Repetir"
              aria-pressed={isRepeat}
              className={`relative grid h-10 w-10 place-items-center rounded-lg transition-colors ${
                isRepeat ? "text-accent" : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
              }`}
            >
              <svg
                className="h-[18px] w-[18px]"
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
                <span className="absolute top-1 right-1 font-mono text-[7px] font-bold text-accent">1</span>
              )}
            </button>
          </div>

          <div className="np-viz mt-6 flex h-[34px] items-end gap-[3px] opacity-85" aria-hidden="true">
            {VIZ_BARS.map((bar, i) => (
              <i
                key={i}
                className="block w-[3px] rounded-[2px] bg-accent"
                style={{ height: bar.height, animationDelay: bar.delay }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
