"use client";

import { useRef, useCallback } from "react";
import { useAudioStore } from "@/lib/audioStore";

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ProgressBar() {
  const currentTime = useAudioStore((s) => s.currentTime);
  const currentSong = useAudioStore((s) => s.currentSong);
  const seek = useAudioStore((s) => s.seek);

  const duration = currentSong?.duration || 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const barRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!barRef.current || !duration) return;
      const rect = barRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      seek(percentage * duration);
    },
    [duration, seek]
  );

  const handleDrag = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.buttons !== 1) return;
      handleClick(e);
    },
    [handleClick]
  );

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs text-text-muted font-mono min-w-[40px] text-right">
        {formatTime(currentTime)}
      </span>

      <div
        ref={barRef}
        className="relative flex-1 h-6 flex items-center cursor-pointer group"
        onClick={handleClick}
        onMouseMove={handleDrag}
      >
        {/* Track background */}
        <div className="absolute h-1 w-full rounded-full bg-white/[.07] transition-all group-hover:h-1.5" />

        {/* Filled track */}
        <div
          className="progress-smooth absolute h-1 rounded-full bg-accent transition-all group-hover:h-1.5"
          style={{ width: `${progress}%` }}
        />

        {/* Thumb */}
        <div
          className="absolute h-3 w-3 rounded-full bg-text-primary opacity-0 shadow-[0_2px_8px_rgba(0,0,0,.5)] transition-opacity group-hover:opacity-100"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      <span className="text-xs text-text-muted font-mono min-w-[40px]">
        {formatTime(duration)}
      </span>
    </div>
  );
}
