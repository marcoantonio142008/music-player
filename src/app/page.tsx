"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAudioStore } from "@/lib/audioStore";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import InicioView from "@/components/InicioView";
import BibliotecaView from "@/components/BibliotecaView";
import Player from "@/components/Player";
import MobileNav from "@/components/MobileNav";
import PlaylistDrawer from "@/components/PlaylistDrawer";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function Home() {
  const addSongs = useAudioStore((s) => s.addSongs);
  const loadFromDB = useAudioStore((s) => s.loadFromDB);
  const [currentView, setCurrentView] = useState("inicio");
  const [bibliotecaSubView, setBibliotecaSubView] = useState("all");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  useKeyboardShortcuts();

  // Load songs from IndexedDB on mount
  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        addSongs(Array.from(files));
      }
      e.target.value = "";
    },
    [addSongs]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("audio/")
      );
      if (files.length > 0) {
        addSongs(files);
      }
    },
    [addSongs]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleSelectPlaylist = (id: string) => {
    setCurrentView("biblioteca");
    setSelectedPlaylistId(id);
    setBibliotecaSubView(`playlist-${id}`);
  };

  const handleSelectQuickAccess = (id: string) => {
    setCurrentView("biblioteca");
    setSelectedPlaylistId(null);
    setBibliotecaSubView(id);
  };

  return (
    <div
      className="flex h-dvh overflow-hidden bg-bg-primary"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Sidebar - desktop only */}
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setSelectedPlaylistId(null);
          setBibliotecaSubView("all");
        }}
        onSelectPlaylist={handleSelectPlaylist}
        onSelectQuickAccess={handleSelectQuickAccess}
      />

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar currentView={currentView} onViewChange={(view) => {
          setCurrentView(view);
          setSelectedPlaylistId(null);
          setBibliotecaSubView("all");
        }} />

        <main className="flex-1 overflow-y-auto px-4 py-6 pb-32 md:px-6 md:py-7 md:pb-32">
          {currentView === "inicio" && <InicioView />}
          {currentView === "biblioteca" && (
            <BibliotecaView
              subView={bibliotecaSubView}
              onSubViewChange={(view) => {
                setBibliotecaSubView(view);
                if (!view.startsWith("playlist-")) {
                  setSelectedPlaylistId(null);
                }
              }}
              selectedPlaylistId={selectedPlaylistId}
            />
          )}
        </main>
      </div>

      {/* Player */}
      <Player />

      {/* Mobile bottom nav */}
      <MobileNav
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setSelectedPlaylistId(null);
          setBibliotecaSubView("all");
        }}
        onOpenDrawer={() => setDrawerOpen(true)}
        onSelectQuickAccess={handleSelectQuickAccess}
      />

      {/* Mobile playlist drawer */}
      <PlaylistDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelectPlaylist={handleSelectPlaylist}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Floating import button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="fixed right-4 bottom-24 z-40 grid h-[52px] w-[52px] place-items-center rounded-full bg-text-primary text-bg-primary shadow-[0_10px_30px_-12px_rgba(0,0,0,.85)] transition-transform duration-150 ease-[cubic-bezier(.22,1,.36,1)] hover:scale-105 active:scale-[.99] md:right-6 md:bottom-6"
        title="Importar música"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {/* Drag & drop overlay hint */}
      <div
        className={`pointer-events-none fixed inset-0 z-30 flex items-center justify-center bg-bg-primary/85 backdrop-blur-sm transition-opacity duration-150 ${
          isDragging ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/[.13] px-10 py-12 text-center">
          <svg
            className="mb-4 h-12 w-12 text-text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-[13px] text-text-muted">Arrastrá archivos de audio aquí</p>
        </div>
      </div>
    </div>
  );
}
