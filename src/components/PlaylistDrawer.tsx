"use client";

import { useAudioStore } from "@/lib/audioStore";
import { accentFromSeed } from "@/lib/accent";

interface PlaylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlaylist: (id: string) => void;
}

export default function PlaylistDrawer({ isOpen, onClose, onSelectPlaylist }: PlaylistDrawerProps) {
  const playlists = useAudioStore((s) => s.playlists);
  const songs = useAudioStore((s) => s.songs);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="animate-slide-up fixed right-0 bottom-0 left-0 z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-t-2xl border-t border-white/[.07] bg-bg-secondary">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-white/[.14]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <h2 className="text-[15px] font-semibold tracking-[-.015em] text-text-primary">Tus álbumes</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-8 w-8 place-items-center rounded-lg text-text-muted transition-[color,background-color] duration-150 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-white/[.045] hover:text-text-primary active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Playlist list */}
        <div className="overflow-y-auto px-3 pb-8">
          {playlists.length === 0 ? (
            <div className="px-2 py-10 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl border border-white/[.07] bg-bg-card">
                <svg className="h-5 w-5 text-text-muted" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-[13px] text-text-secondary">No tenés álbumes aún</p>
              <p className="mt-1 text-[11.5px] text-text-muted">Creá uno desde el botón + en cualquier canción</p>
            </div>
          ) : (
            <div className="flex flex-col gap-px">
              {playlists.map((playlist) => {
                const playlistSongs = playlist.songIds
                  .map((id) => songs.find((s) => s.id === id))
                  .filter(Boolean);
                const firstCover = playlistSongs[0]?.coverUrl;

                return (
                  <button
                    key={playlist.id}
                    onClick={() => {
                      onSelectPlaylist(playlist.id);
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-[background-color] duration-150 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-white/[.045] active:scale-[.99]"
                  >
                    {/* Cover */}
                    <div className="h-12 w-12 flex-none overflow-hidden rounded-lg bg-bg-card">
                      {firstCover ? (
                        <img src={firstCover} alt="" className="h-full w-full object-cover saturate-[.9]" />
                      ) : (
                        <div
                          className="grid h-full w-full place-items-center text-text-secondary"
                          style={{ background: `color-mix(in srgb, ${accentFromSeed(playlist.name)} 22%, #17171a)` }}
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-text-primary">{playlist.name}</p>
                      <p className="text-[11.5px] text-text-muted">
                        <span className="font-mono">{playlist.songIds.length}</span>{" "}
                        {playlist.songIds.length === 1 ? "canción" : "canciones"}
                      </p>
                    </div>

                    {/* Arrow */}
                    <svg className="h-4 w-4 flex-none text-text-muted" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
