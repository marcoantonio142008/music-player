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
        className="absolute top-full right-0 z-50 mt-1.5 min-w-[220px] rounded-xl border border-white/[.07] bg-bg-card py-1.5 shadow-[0_16px_40px_-16px_rgba(0,0,0,.85)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleCreateNew}
          className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] text-text-primary transition-colors duration-150 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-white/[.05]"
        >
          <svg className="h-4 w-4 flex-none text-text-muted" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Crear álbum nuevo
        </button>

        {playlists.length > 0 && (
          <>
            <div className="mx-3 my-1 h-px bg-white/[.07]" />
            <p className="px-3.5 py-1.5 text-[10.5px] font-medium uppercase tracking-[.09em] text-text-muted">
              Tus álbumes
            </p>
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => handleAdd(playlist.id)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] text-text-secondary transition-colors duration-150 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-white/[.05] hover:text-text-primary"
              >
                <svg className="h-4 w-4 flex-none" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="truncate">{playlist.name}</span>
                <span className="ml-auto font-mono text-[11px] text-text-muted">{playlist.songIds.length}</span>
              </button>
            ))}
          </>
        )}
      </div>
    </>
  );
}
