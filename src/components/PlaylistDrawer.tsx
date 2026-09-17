"use client";

import { useAudioStore } from "@/lib/audioStore";

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
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card rounded-t-2xl max-h-[70vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <h2 className="text-lg font-bold text-text-primary">Tus álbumes</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-text-muted"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Playlist list */}
        <div className="overflow-y-auto px-5 pb-8">
          {playlists.length === 0 ? (
            <div className="py-10 text-center">
              <svg className="w-12 h-12 mx-auto mb-3 text-text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-sm text-text-secondary">No tenés álbumes aún</p>
              <p className="text-xs text-text-muted mt-1">Creá uno desde el botón + en cualquier canción</p>
            </div>
          ) : (
            <div className="space-y-1">
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
                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                  >
                    {/* Cover */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {firstCover ? (
                        <img src={firstCover} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent-violet/40 to-accent-pink/40 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{playlist.name}</p>
                      <p className="text-xs text-text-secondary">{playlist.songIds.length} canciones</p>
                    </div>

                    {/* Arrow */}
                    <svg className="w-4 h-4 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
