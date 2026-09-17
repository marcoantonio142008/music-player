"use client";

import { useAudioStore } from "@/lib/audioStore";

interface AddToPlaylistMenuProps {
  songId: string;
  onClose: () => void;
}

export default function AddToPlaylistMenu({ songId, onClose }: AddToPlaylistMenuProps) {
  const playlists = useAudioStore((s) => s.playlists);
  const addToPlaylist = useAudioStore((s) => s.addToPlaylist);
  const createPlaylist = useAudioStore((s) => s.createPlaylist);

  const handleAdd = async (playlistId: string) => {
    await addToPlaylist(playlistId, [songId]);
    onClose();
  };

  const handleCreateNew = async () => {
    const name = prompt("Nombre del nuevo álbum:");
    if (name?.trim()) {
      await createPlaylist(name.trim());
      const newPlaylists = useAudioStore.getState().playlists;
      const newPlaylist = newPlaylists[newPlaylists.length - 1];
      if (newPlaylist) {
        await addToPlaylist(newPlaylist.id, [songId]);
      }
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      {/* Menu - positioned relative to parent */}
      <div
        className="absolute right-0 top-full mt-1 z-50 bg-bg-card border border-white/10 rounded-xl shadow-2xl shadow-black/40 py-2 min-w-[220px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-text-primary hover:bg-white/5 transition-colors"
        >
          <svg className="w-4 h-4 text-accent-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Crear álbum nuevo
        </button>

        {playlists.length > 0 && (
          <>
            <div className="h-px bg-white/5 mx-3 my-1" />
            <p className="px-4 py-1.5 text-[11px] text-text-muted font-medium uppercase tracking-wider">
              Tus álbumes
            </p>
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => handleAdd(playlist.id)}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="truncate">{playlist.name}</span>
                <span className="text-xs text-text-muted ml-auto">{playlist.songIds.length}</span>
              </button>
            ))}
          </>
        )}
      </div>
    </>
  );
}
