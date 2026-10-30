"use client";

import { useAudioStore } from "@/lib/audioStore";
import { placeholderTint } from "@/lib/accent";
import type { Song } from "@/lib/types";
import { useMemo, type ReactNode } from "react";

interface BibliotecaViewProps {
  subView: string;
  onSubViewChange: (view: string) => void;
  selectedPlaylistId?: string | null;
}

/** Placeholder art: one deterministic tint per seed, never a shared gradient. */
function tint(seed: string) {
  return { background: placeholderTint(seed) };
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

const ICONS: Record<string, ReactNode> = {
  all: (
    <svg className="h-[15px] w-[15px] flex-none" {...iconProps}>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </svg>
  ),
  favorites: (
    <svg className="h-[15px] w-[15px] flex-none" {...iconProps}>
      <path d="M12 20s-7-4.3-7-9.2A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7 2.8C19 15.7 12 20 12 20z" />
    </svg>
  ),
  artists: (
    <svg className="h-[15px] w-[15px] flex-none" {...iconProps}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" />
    </svg>
  ),
  albums: (
    <svg className="h-[15px] w-[15px] flex-none" {...iconProps}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  playlist: (
    <svg className="h-[15px] w-[15px] flex-none" {...iconProps}>
      <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
};

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
    { id: "all", label: "Todas mis canciones", icon: ICONS.all },
    { id: "favorites", label: "Favoritos", icon: ICONS.favorites },
    { id: "artists", label: "Artistas", icon: ICONS.artists },
    { id: "albums", label: "Álbumes", icon: ICONS.albums },
    ...playlists.map((p) => ({ id: `playlist-${p.id}`, label: p.name, icon: ICONS.playlist })),
  ];

  // If viewing a specific playlist
  if (selectedPlaylist) {
    return (
      <div>
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => onSubViewChange("all")}
            aria-label="Volver"
            className="grid h-8 w-8 place-items-center rounded-lg text-text-secondary transition-[color,background-color] duration-150 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-white/[.045] hover:text-text-primary active:scale-95"
          >
            <svg className="h-4 w-4" {...iconProps}>
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[clamp(22px,3vw,28px)] font-semibold tracking-[-.03em] text-text-primary">
              {selectedPlaylist.name}
            </h2>
            <p className="mt-1 text-[12px] text-text-muted">
              <span className="font-mono">{playlistSongs.length}</span>{" "}
              {playlistSongs.length === 1 ? "canción" : "canciones"}
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm(`¿Eliminar el álbum "${selectedPlaylist.name}"?`)) {
                deletePlaylist(selectedPlaylist.id);
                onSubViewChange("all");
              }
            }}
            aria-label="Eliminar álbum"
            className="grid h-8 w-8 place-items-center rounded-lg text-text-muted transition-[color,background-color] duration-150 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-white/[.045] hover:text-red-400 active:scale-95"
          >
            <svg className="h-4 w-4" {...iconProps}>
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {playlistSongs.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-text-muted">
            Este álbum está vacío. Agregá canciones desde la lista principal.
          </p>
        ) : (
          <div className="border-t border-white/[.07]">
            {playlistSongs.map((song, index) => (
              <LibraryRow
                key={song.id}
                song={song}
                index={index}
                isActive={currentSong?.id === song.id}
                isPlaying={isPlaying}
                onPlay={() => play(song)}
                onRemove={() => removeFromPlaylist(selectedPlaylist.id, song.id)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Sub-sidebar for library sections */}
      <div className="hidden w-[200px] flex-shrink-0 flex-col lg:flex">
        <p className="mb-3 px-2.5 text-[10.5px] font-medium uppercase tracking-[.09em] text-text-muted">
          Biblioteca
        </p>
        <nav className="flex flex-col gap-px" aria-label="Secciones de la biblioteca">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSubViewChange(item.id)}
              aria-current={subView === item.id ? "page" : undefined}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] transition-[color,background-color] duration-150 ease-[cubic-bezier(.22,1,.36,1)] active:scale-[.99] ${
                subView === item.id
                  ? "bg-white/[.06] text-text-primary"
                  : "text-text-secondary hover:bg-white/[.045] hover:text-text-primary"
              }`}
            >
              <span className={subView === item.id ? "opacity-100" : "opacity-75"}>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content area */}
      <div className="min-w-0 flex-1">
        {/* Mobile tabs */}
        <div className="scrollbar-hide mb-5 flex gap-5 overflow-x-auto border-b border-white/[.07] lg:hidden">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSubViewChange(item.id)}
              aria-current={subView === item.id ? "page" : undefined}
              className={`relative -mb-px flex-none whitespace-nowrap pb-2 text-[13px] transition-colors duration-150 ease-[cubic-bezier(.22,1,.36,1)] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full ${
                subView === item.id
                  ? "text-text-primary after:bg-accent"
                  : "text-text-muted after:bg-transparent hover:text-text-secondary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* All songs view */}
        {(subView === "all" || subView === "favorites") && (
          <div>
            <div className="mb-3.5 flex items-baseline gap-2.5">
              <h3 className="text-[15px] font-semibold tracking-[-.015em] text-text-primary">
                {subView === "favorites" ? "Favoritos" : "Todas mis canciones"}
              </h3>
              <span className="font-mono text-[11px] text-text-muted">
                {subView === "favorites" ? favorites.length : filteredSongs.length}
              </span>
            </div>
            {subView === "favorites" && favorites.length === 0 ? (
              <p className="py-10 text-center text-[13px] text-text-muted">
                No tenés canciones favoritas aún
              </p>
            ) : subView === "all" && filteredSongs.length === 0 ? (
              <p className="py-10 text-center text-[13px] text-text-muted">
                {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : "No hay canciones"}
              </p>
            ) : (
              <div className="border-t border-white/[.07]">
                {(subView === "favorites" ? favorites : filteredSongs).map((song, index) => (
                  <LibraryRow
                    key={song.id}
                    song={song}
                    index={index}
                    isActive={currentSong?.id === song.id}
                    isPlaying={isPlaying}
                    onPlay={() => play(song)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Artists view */}
        {subView === "artists" && (
          <div>
            <div className="mb-3.5 flex items-baseline gap-2.5">
              <h3 className="text-[15px] font-semibold tracking-[-.015em] text-text-primary">Artistas</h3>
              <span className="font-mono text-[11px] text-text-muted">{artists.length}</span>
            </div>
            {artists.length === 0 ? (
              <p className="py-10 text-center text-[13px] text-text-muted">No hay artistas</p>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {artists.map((artist) => (
                  <button
                    key={artist.name}
                    onClick={() => play(artist.songs[0])}
                    className="group flex flex-col items-center gap-3 text-center"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-full bg-bg-card after:absolute after:inset-0 after:rounded-full after:shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]">
                      {artist.cover ? (
                        <img src={artist.cover} alt="" className="h-full w-full object-cover saturate-[.9]" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-text-secondary" style={tint(artist.name)}>
                          <svg className="h-9 w-9" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-text-primary">{artist.name}</p>
                      <p className="text-[11.5px] text-text-muted">
                        <span className="font-mono">{artist.songs.length}</span>{" "}
                        {artist.songs.length === 1 ? "canción" : "canciones"}
                      </p>
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
            <div className="mb-3.5 flex items-baseline gap-2.5">
              <h3 className="text-[15px] font-semibold tracking-[-.015em] text-text-primary">Álbumes</h3>
              <span className="font-mono text-[11px] text-text-muted">{albums.length}</span>
            </div>
            {albums.length === 0 ? (
              <p className="py-10 text-center text-[13px] text-text-muted">No hay álbumes</p>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {albums.map((album) => (
                  <button
                    key={album.name}
                    onClick={() => play(album.songs[0])}
                    className="group flex flex-col gap-2.5 text-left"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-bg-card transition-transform duration-[250ms] ease-[cubic-bezier(.22,1,.36,1)] after:absolute after:inset-0 after:rounded-xl after:shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)] group-hover:-translate-y-[3px]">
                      {album.cover ? (
                        <img src={album.cover} alt="" className="h-full w-full object-cover saturate-[.9]" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-text-secondary" style={tint(album.name)}>
                          <svg className="h-9 w-9" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-text-primary">{album.name}</p>
                      <p className="text-[11.5px] text-text-muted">
                        <span className="font-mono">{album.songs.length}</span>{" "}
                        {album.songs.length === 1 ? "canción" : "canciones"}
                      </p>
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
                <div className="mb-3.5 flex items-baseline gap-2.5">
                  <h3 className="text-[15px] font-semibold tracking-[-.015em] text-text-primary">
                    {playlist.name}
                  </h3>
                  <span className="font-mono text-[11px] text-text-muted">{playlist.songIds.length}</span>
                </div>
                {playlist.songIds.length === 0 ? (
                  <p className="py-10 text-center text-[13px] text-text-muted">Este álbum está vacío</p>
                ) : (
                  <div className="border-t border-white/[.07]">
                    {playlist.songIds.map((songId, index) => {
                      const song = songs.find((s) => s.id === songId);
                      if (!song) return null;
                      return (
                        <LibraryRow
                          key={song.id}
                          song={song}
                          index={index}
                          isActive={currentSong?.id === song.id}
                          isPlaying={isPlaying}
                          onPlay={() => play(song)}
                          onRemove={() => removeFromPlaylist(playlist.id, song.id)}
                        />
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

function LibraryRow({
  song,
  index,
  isActive,
  isPlaying,
  onPlay,
  onRemove,
}: {
  song: Song;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onRemove?: () => void;
}) {
  return (
    <div
      onClick={onPlay}
      className="group relative grid cursor-pointer grid-cols-[24px_40px_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/[.07] px-[10px] py-2 transition-[background-color] duration-150 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-white/[.035] active:scale-[.998] md:grid-cols-[30px_44px_minmax(0,2fr)_minmax(0,1fr)_56px]"
    >
      <div className="grid place-items-center">
        {isActive && isPlaying ? (
          <span className="eq" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        ) : (
          <>
            <span className="font-mono text-[11px] text-text-muted group-hover:hidden">{index + 1}</span>
            <svg className="hidden h-[11px] w-[11px] text-text-primary group-hover:block" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </>
        )}
      </div>

      <div className="relative h-10 w-10 flex-none overflow-hidden rounded-lg bg-bg-card md:h-11 md:w-11">
        {song.coverUrl ? (
          <img src={song.coverUrl} alt="" className="h-full w-full object-cover saturate-[.9]" />
        ) : (
          <div className="grid h-full w-full place-items-center text-text-secondary" style={tint(song.title)}>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className={`truncate text-[13.5px] font-medium ${isActive ? "text-accent" : "text-text-primary"}`}>
          {song.title}
        </p>
        <p className="truncate text-[11.5px] text-text-muted">{song.artist}</p>
      </div>

      <p className="hidden min-w-0 truncate text-[12px] text-text-muted md:block">{song.album}</p>

      <span className="hidden text-right font-mono text-[11.5px] text-text-muted md:block">
        {formatTime(song.duration)}
      </span>

      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Quitar del álbum"
          title="Quitar del álbum"
          className="grid h-[26px] w-[26px] place-items-center rounded-lg text-text-muted transition-[color,opacity] duration-150 ease-[cubic-bezier(.22,1,.36,1)] hover:text-red-400 md:absolute md:top-1/2 md:right-1.5 md:z-20 md:-translate-y-1/2 md:bg-bg-card md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100"
        >
          <svg className="h-4 w-4" {...iconProps}>
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
