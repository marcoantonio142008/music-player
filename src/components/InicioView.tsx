"use client";

import { useAudioStore } from "@/lib/audioStore";
import SongItem from "./SongItem";

export default function InicioView() {
  const songs = useAudioStore((s) => s.songs);
  const play = useAudioStore((s) => s.play);
  const favorites = songs.filter((s) => s.liked);
  const recentSongs = songs.slice(-8).reverse();

  return (
    <div className="space-y-8 stagger">
      {/* Greeting */}
      <div>
        <h1 className="text-4xl md:text-6xl font-extrabold italic leading-[1.08] pb-1 tracking-tight gradient-text">
          {getGreeting()}
        </h1>
        <p className="text-text-secondary text-sm mt-2">
          {songs.length === 0
            ? "No hay canciones cargadas"
            : `${songs.length} ${songs.length === 1 ? "canción" : "canciones"} en tu biblioteca`}
        </p>
      </div>

      {/* Quick play grid - Favoritos */}
      {favorites.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4 tracking-tight">Favoritos</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {favorites.slice(0, 6).map((song) => (
              <button
                key={song.id}
                onClick={() => play(song)}
                className="flex items-center gap-3 purple-glass rounded-xl p-2.5 transition-all text-left group hover:bg-white/5 card-lift"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  {song.coverUrl ? (
                    <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent-violet to-accent-pink flex items-center justify-center">
                      <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate">{song.title}</p>
                  <p className="text-xs text-text-secondary truncate">{song.artist}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-accent-violet/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <svg className="w-4 h-4 text-accent-violet ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Recently added */}
      {recentSongs.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4 tracking-tight">Agregadas recientemente</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {recentSongs.map((song) => (
              <button
                key={song.id}
                onClick={() => play(song)}
                className="flex flex-col items-center gap-2.5 flex-shrink-0 w-36 group card-lift"
              >
                <div className="w-36 h-36 rounded-xl overflow-hidden soft-shadow">
                  {song.coverUrl ? (
                    <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent-violet to-accent-pink flex items-center justify-center">
                      <svg className="w-10 h-10 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="w-full text-center">
                  <p className="text-sm font-medium text-text-primary truncate">{song.title}</p>
                  <p className="text-xs text-text-secondary truncate">{song.artist}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* All songs - using SongItem with full controls */}
      {songs.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4 tracking-tight">Todas tus canciones</h2>
          <div className="space-y-0.5">
            {songs.map((song, index) => (
              <SongItem key={song.id} song={song} index={index} />
            ))}
          </div>
        </section>
      )}

      {songs.length === 0 && <EmptyState />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 rounded-2xl purple-glass flex items-center justify-center mb-6 glow-violet">
        <span className="text-4xl font-bold gradient-text">M</span>
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">Tu biblioteca está vacía</h3>
      <p className="text-sm text-text-secondary max-w-xs mb-6">
        Importá tu música usando el botón abajo para comenzar a reproducir
      </p>
      <button
        onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
        className="gradient-btn px-6 py-3 rounded-full text-white font-medium flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Importar música
      </button>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}
