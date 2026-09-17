"use client";

import { useEffect } from "react";
import { useAudioStore } from "@/lib/audioStore";

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const store = useAudioStore.getState();

      switch (e.code) {
        case "Space":
          e.preventDefault();
          store.togglePlay();
          break;
        case "ArrowRight":
          if (e.shiftKey) {
            store.next();
          } else if (store.currentSong) {
            store.seek(Math.min(store.currentTime + 5, store.currentSong.duration));
          }
          break;
        case "ArrowLeft":
          if (e.shiftKey) {
            store.previous();
          } else {
            store.seek(Math.max(store.currentTime - 5, 0));
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          store.setVolume(Math.min(store.volume + 0.05, 1));
          break;
        case "ArrowDown":
          e.preventDefault();
          store.setVolume(Math.max(store.volume - 0.05, 0));
          break;
        case "KeyN":
          store.next();
          break;
        case "KeyP":
          store.previous();
          break;
        case "KeyM":
          store.toggleMute();
          break;
        case "KeyV":
          store.toggleVisualizer();
          break;
        case "KeyL":
          if (store.currentSong) {
            store.toggleFavorite(store.currentSong.id);
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
