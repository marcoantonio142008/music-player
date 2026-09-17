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

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary" onDrop={handleDrop} onDragOver={handleDragOver}>
      {/* Sidebar - desktop only */}
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setSelectedPlaylistId(null);
        }}
        onSelectPlaylist={handleSelectPlaylist}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar currentView={currentView} onViewChange={(view) => {
          setCurrentView(view);
          setSelectedPlaylistId(null);
          setBibliotecaSubView("all");
        }} />

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-28 md:pb-28">
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
        className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-40 gradient-btn w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-accent-violet/20"
        title="Importar música"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Drag & drop overlay hint */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-30 opacity-0 transition-opacity">
        <div className="text-center text-text-muted">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm">Arrastrá archivos de audio aquí</p>
        </div>
      </div>
    </div>
  );
}
