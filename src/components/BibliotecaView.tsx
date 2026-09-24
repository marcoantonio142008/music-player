"use client";

import { useAudioStore } from "@/lib/audioStore";
import { useMemo } from "react";

interface BibliotecaViewProps {
  subView: string;
  onSubViewChange: (view: string) => void;
  selectedPlaylistId?: string | null;
}

export default function BibliotecaView({ subView, onSubViewChange, selectedPlaylistId }: BibliotecaViewProps) {
  const songs = useAudioStore((s) => s.songs);
  const playlists = useAudioStore((s) => s.playlists);
  const searchQuery = useAudioStore((s) => s.searchQuery);
  const play = useAudioStore((s) => s.play);
  const currentSong = useAudioStore((s) => s.currentSong);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const removeFromPlaylist = useAudioStore((s) => s.removeFromPlaylist);
  const deletePlaylist = useAudioStore((s) => s.deletePlaylist);

  const favorites = useMemo(() => songs.filter((s) => s.liked), [songs]);

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;
    const q = searchQuery.toLowerCase();
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q)
    );
  }, [songs, searchQuery]);

  // Get selected playlist
  const selectedPlaylist = useMemo(
    () => playlists.find((p) => p.id === selectedPlaylistId),
    [playlists, selectedPlaylistId]
  );

  const playlistSongs = useMemo(() => {
    if (!selectedPlaylist) return [];
    return selectedPlaylist.songIds
      .map((id) => songs.find((s) => s.id === id))
      .filter(Boolean) as typeof songs;
  }, [selectedPlaylist, songs]);

  // Group songs by artist
  const artists = useMemo(() => {
    const map = new Map<string, { name: string; songs: typeof songs; cover: string | null }>();
    songs.forEach((s) => {
      const existing = map.get(s.artist);
      if (existing) {
        existing.songs.push(s);
      } else {
        map.set(s.artist, { name: s.artist, songs: [s], cover: s.coverUrl });
      }
    });
    return Array.from(map.values());
  }, [songs]);

  // Group songs by album
  const albums = useMemo(() => {
    const map = new Map<string, { name: string; songs: typeof songs; cover: string | null }>();
    songs.forEach((s) => {
      const existing = map.get(s.album);
      if (existing) {
        existing.songs.push(s);
      } else {
        map.set(s.album, { name: s.album, songs: [s], cover: s.coverUrl });
      }
    });
    return Array.from(map.values());
  }, [songs]);

  const sidebarItems = [
    { id: "all", label: "Todas mis canciones", icon: "🎵" },
    { id: "favorites", label: "Favoritos", icon: "❤️" },
    { id: "artists", label: "Artistas", icon: "👤" },
    { id: "albums", label: "Álbumes", icon: "💿" },
    ...playlists.map((p) => ({ id: `playlist-${p.id}`, label: p.name, icon: "📁" })),
  ];

  // If viewing a specific playlist
  if (selectedPlaylist) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => onSubViewChange("all")}
            className="p-2 rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-text-primary">{selectedPlaylist.name}</h2>
            <p className="text-sm text-text-secondary">{playlistSongs.length} canciones</p>
          </div>
          <button
            onClick={() => {
              if (confirm(`¿Eliminar el álbum "${selectedPlaylist.name}"?`)) {
                deletePlaylist(selectedPlaylist.id);
                onSubViewChange("all");
              }
            }}
            className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {playlistSongs.length === 0 ? (
          <p className="text-sm text-text-secondary py-10 text-center">
            Este álbum está vacío. Agregá canciones desde la lista principal.
          </p>
        ) : (
          <div className="space-y-0.5">
            {playlistSongs.map((song, index) => (
              <div
                key={song.id}
                onClick={() => play(song)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group ${
                  currentSong?.id === song.id ? "bg-accent-violet/10" : "hover:bg-white/[0.04]"
                }`}
              >
                <span className="w-6 text-center text-xs text-text-muted">
                  {currentSong?.id === song.id && isPlaying ? (
                    <div className="flex items-end justify-center gap-[2px] h-3">
                      {[0.6, 1, 0.4].map((h, i) => (
                        <div
                          key={i}
                          className="w-[2px] bg-accent-violet rounded-full animate-pulse"
                          style={{ height: `${h * 12}px`, animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  ) : (
                    index + 1
                  )}
                </span>
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  {song.coverUrl ? (
                    <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent-violet to-accent-pink flex items-center justify-center">
                      <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate ${currentSong?.id === song.id ? "text-accent-violet" : "text-text-primary"}`}>
                    {song.title}
                  </p>
                  <p className="text-xs text-text-secondary truncate">{song.artist}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromPlaylist(selectedPlaylist.id, song.id);
                  }}
                  className="p-1.5 rounded-lg text-text-muted opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                  title="Quitar del álbum"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Sub-sidebar for library sections */}
      <div className="hidden lg:flex flex-col w-52 flex-shrink-0">
        <h2 className="text-xl font-bold text-text-primary mb-4">BIBLIOTECA</h2>
        <nav className="flex flex-col gap-0.5">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSubViewChange(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                subView === item.id
                  ? "bg-white/5 text-text-primary font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/[0.03]"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content area */}
      <div className="flex-1 min-w-0">
        {/* Mobile tabs */}
        <div className="flex lg:hidden gap-1 mb-4 overflow-x-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSubViewChange(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                subView === item.id
                  ? "bg-white/5 text-text-primary"
                  : "text-text-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* All songs view */}
        {(subView === "all" || subView === "favorites") && (
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-4">
              {subView === "favorites" ? "Favoritos" : "Todas mis canciones"}
            </h3>
            {subView === "favorites" && favorites.length === 0 ? (
              <p className="text-sm text-text-secondary py-10 text-center">
                No tenés canciones favoritas aún
              </p>
            ) : subView === "all" && filteredSongs.length === 0 ? (
              <p className="text-sm text-text-secondary py-10 text-center">
                {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : "No hay canciones"}
              </p>
            ) : (
              <div className="space-y-0.5">
                {(subView === "favorites" ? favorites : filteredSongs).map((song, index) => (
                  <div
                    key={song.id}
                    onClick={() => play(song)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group ${
                      currentSong?.id === song.id ? "bg-accent-violet/10" : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="w-6 text-center text-xs text-text-muted">
                      {currentSong?.id === song.id && isPlaying ? (
                        <div className="flex items-end justify-center gap-[2px] h-3">
                          {[0.6, 1, 0.4].map((h, i) => (
                            <div
                              key={i}
                              className="w-[2px] bg-accent-violet rounded-full animate-pulse"
                              style={{ height: `${h * 12}px`, animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      {song.coverUrl ? (
                        <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent-violet to-accent-pink flex items-center justify-center">
                          <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${currentSong?.id === song.id ? "text-accent-violet" : "text-text-primary"}`}>
                        {song.title}
                      </p>
                      <p className="text-xs text-text-secondary truncate">{song.artist}</p>
                    </div>
                    <span className="text-xs text-text-muted hidden sm:block">{song.album}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Artists view */}
        {subView === "artists" && (
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-4">Artistas</h3>
            {artists.length === 0 ? (
              <p className="text-sm text-text-secondary py-10 text-center">No hay artistas</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {artists.map((artist) => (
                  <button
                    key={artist.name}
                    onClick={() => play(artist.songs[0])}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div className="w-full aspect-square rounded-full overflow-hidden shadow-lg shadow-violet-950/40 bg-bg-card">
                      {artist.cover ? (
                        <img src={artist.cover} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent-violet/40 to-accent-pink/40 flex items-center justify-center">
                          <svg className="w-12 h-12 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-text-primary truncate max-w-[120px]">{artist.name}</p>
                      <p className="text-xs text-text-secondary">{artist.songs.length} {artist.songs.length === 1 ? "canción" : "canciones"}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Albums view */}
        {subView === "albums" && (
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-4">Álbumes</h3>
            {albums.length === 0 ? (
              <p className="text-sm text-text-secondary py-10 text-center">No hay álbumes</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {albums.map((album) => (
                  <button
                    key={album.name}
                    onClick={() => play(album.songs[0])}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden shadow-lg shadow-violet-950/40">
                      {album.cover ? (
                        <img src={album.cover} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent-violet to-accent-pink flex items-center justify-center">
                          <svg className="w-12 h-12 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-text-primary truncate max-w-[140px]">{album.name}</p>
                      <p className="text-xs text-text-secondary">{album.songs.length} {album.songs.length === 1 ? "canción" : "canciones"}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Playlist views (handled in sidebar click) */}
        {subView.startsWith("playlist-") && (
          <div>
            {playlists.filter((p) => `playlist-${p.id}` === subView).map((playlist) => (
              <div key={playlist.id}>
                <h3 className="text-lg font-bold text-text-primary mb-4">{playlist.name}</h3>
                {playlist.songIds.length === 0 ? (
                  <p className="text-sm text-text-secondary py-10 text-center">Este álbum está vacío</p>
                ) : (
                  <div className="space-y-0.5">
                    {playlist.songIds.map((songId, index) => {
                      const song = songs.find((s) => s.id === songId);
                      if (!song) return null;
                      return (
                        <div
                          key={song.id}
                          onClick={() => play(song)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group ${
                            currentSong?.id === song.id ? "bg-accent-violet/10" : "hover:bg-white/[0.04]"
                          }`}
                        >
                          <span className="w-6 text-center text-xs text-text-muted">{index + 1}</span>
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            {song.coverUrl ? (
                              <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-accent-violet to-accent-pink flex items-center justify-center">
                                <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-medium truncate ${currentSong?.id === song.id ? "text-accent-violet" : "text-text-primary"}`}>
                              {song.title}
                            </p>
                            <p className="text-xs text-text-secondary truncate">{song.artist}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromPlaylist(playlist.id, song.id);
                            }}
                            className="p-1.5 rounded-lg text-text-muted opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
