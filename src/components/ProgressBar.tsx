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
        <div className="absolute w-full h-1 bg-bg-card rounded-full group-hover:h-1.5 transition-all" />

        {/* Filled track */}
        <div
          className="absolute h-1 rounded-full group-hover:h-1.5 transition-all progress-smooth"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
          }}
        />

        {/* Thumb */}
        <div
          className="absolute w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      <span className="text-xs text-text-muted font-mono min-w-[40px]">
        {formatTime(duration)}
      </span>
    </div>
  );
}
