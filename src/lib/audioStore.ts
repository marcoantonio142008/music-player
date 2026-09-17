"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Song, Playlist, PlaybackMode, PlayerState } from "./types";
import { parseAudioTags } from "./parseTags";
import { saveSongs, getAllSongs, deleteSong, savePlaylist, getAllPlaylists, deletePlaylist as deletePlaylistDB, type StoredSong } from "./db";

let audioRef: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (!audioRef) {
    audioRef = new Audio();
    audioRef.preload = "metadata";
  }
  return audioRef;
}

function generateId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

// Convert File to storable format
async function fileToStored(file: File, tags: { title: string; artist: string; album: string; coverUrl: string | null }, id: string, duration: number, liked: boolean): Promise<StoredSong> {
  const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });

  let coverBlob: Blob | undefined;
  if (tags.coverUrl) {
    const response = await fetch(tags.coverUrl);
    coverBlob = await response.blob();
  }

  return {
    id,
    title: tags.title,
    artist: tags.artist,
    album: tags.album,
    duration,
    liked,
    coverUrl: null, // will be reconstructed from coverBlob
    coverBlob,
    fileBlob,
    fileName: file.name,
    fileType: file.type,
  };
}

// Convert StoredSong back to playable Song
function storedToSong(stored: StoredSong): Song {
  const url = URL.createObjectURL(stored.fileBlob);
  let coverUrl: string | null = null;
  if (stored.coverBlob) {
    coverUrl = URL.createObjectURL(stored.coverBlob);
  } else if (stored.coverUrl) {
    coverUrl = stored.coverUrl;
  }

  return {
    id: stored.id,
    file: new File([stored.fileBlob], stored.fileName, { type: stored.fileType }),
    url,
    title: stored.title,
    artist: stored.artist,
    album: stored.album,
    duration: stored.duration,
    coverUrl,
    liked: stored.liked,
  };
}

export const useAudioStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // Library
      songs: [],
      searchQuery: "",

      // Playlists
      playlists: [],

      // Playback
      currentSong: null,
      isPlaying: false,
      progress: 0,
      currentTime: 0,
      volume: 1,
      isMuted: false,

      // Queue
      queue: [],
      queueIndex: -1,
      playbackMode: "none" as PlaybackMode,

      // UI
      isVisualizerOpen: false,

      // --- Library Actions ---
      addSongs: async (files: File[]) => {
        const existingIds = new Set(get().songs.map((s) => s.id));
        const newSongs: Song[] = [];
        const toStore: StoredSong[] = [];

        for (const file of files) {
          const id = generateId(file);
          if (existingIds.has(id)) continue;

          const tags = await parseAudioTags(file);

          // Get duration
          let duration = 0;
          try {
            const tempAudio = new Audio(URL.createObjectURL(file));
            await new Promise<void>((resolve) => {
              tempAudio.addEventListener("loadedmetadata", () => {
                duration = tempAudio.duration;
                resolve();
              });
              tempAudio.addEventListener("error", () => resolve());
            });
            URL.revokeObjectURL(tempAudio.src);
          } catch { /* ignore */ }

          const song: Song = {
            id,
            file,
            url: URL.createObjectURL(file),
            title: tags.title,
            artist: tags.artist,
            album: tags.album,
            duration,
            coverUrl: tags.coverUrl,
            liked: false,
          };

          newSongs.push(song);

          // Prepare for IndexedDB storage
          const stored = await fileToStored(file, tags, id, duration, false);
          toStore.push(stored);
        }

        if (newSongs.length === 0) return;

        // Save to IndexedDB
        try {
          await saveSongs(toStore);
        } catch (e) {
          console.error("Failed to save to IndexedDB:", e);
        }

        set((state) => {
          const updatedSongs = [...state.songs, ...newSongs];
          const currentSong = state.currentSong
            ? updatedSongs.find((s) => s.id === state.currentSong!.id) || state.currentSong
            : null;
          return {
            songs: updatedSongs,
            currentSong,
            queue: state.queue.length > 0
              ? state.queue.map((q) => updatedSongs.find((s) => s.id === q.id) || q)
              : updatedSongs,
          };
        });
      },

      removeSong: async (id: string) => {
        // Delete from IndexedDB
        try {
          await deleteSong(id);
        } catch (e) {
          console.error("Failed to delete from IndexedDB:", e);
        }

        set((state) => {
          const song = state.songs.find((s) => s.id === id);
          if (song) {
            URL.revokeObjectURL(song.url);
            if (song.coverUrl) URL.revokeObjectURL(song.coverUrl);
          }

          const songs = state.songs.filter((s) => s.id !== id);
          const queue = state.queue.filter((q) => q.id !== id);
          const currentSong =
            state.currentSong?.id === id ? null : state.currentSong;

          if (state.currentSong?.id === id) {
            const audio = getAudio();
            audio.pause();
            audio.src = "";
          }

          return { songs, queue, currentSong, isPlaying: false };
        });
      },

      setSearchQuery: (query: string) => set({ searchQuery: query }),

      // Load songs from IndexedDB on app start
      loadFromDB: async () => {
        try {
          const [storedSongs, storedPlaylists] = await Promise.all([
            getAllSongs(),
            getAllPlaylists(),
          ]);

          set((state) => {
            // Don't overwrite if already loaded
            const updates: Partial<PlayerState> = {};

            if (state.songs.length === 0 && storedSongs.length > 0) {
              updates.songs = storedSongs.map(storedToSong);
              updates.queue = updates.songs;
            }

            if (state.playlists.length === 0 && storedPlaylists.length > 0) {
              updates.playlists = storedPlaylists;
            }

            return updates;
          });
        } catch (e) {
          console.error("Failed to load from IndexedDB:", e);
        }
      },

      // --- Playlist Actions ---
      createPlaylist: async (name: string) => {
        const playlist: Playlist = {
          id: `playlist-${Date.now()}`,
          name,
          songIds: [],
          createdAt: Date.now(),
        };

        try {
          await savePlaylist(playlist);
        } catch (e) {
          console.error("Failed to save playlist:", e);
        }

        set((state) => ({
          playlists: [...state.playlists, playlist],
        }));
      },

      deletePlaylist: async (id: string) => {
        try {
          await deletePlaylistDB(id);
        } catch (e) {
          console.error("Failed to delete playlist:", e);
        }

        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== id),
        }));
      },

      addToPlaylist: async (playlistId: string, songIds: string[]) => {
        set((state) => {
          const playlists = state.playlists.map((p) => {
            if (p.id !== playlistId) return p;
            const newSongIds = [...new Set([...p.songIds, ...songIds])];
            return { ...p, songIds: newSongIds };
          });

          // Save to IndexedDB
          const updated = playlists.find((p) => p.id === playlistId);
          if (updated) {
            savePlaylist(updated).catch((e) =>
              console.error("Failed to update playlist:", e)
            );
          }

          return { playlists };
        });
      },

      removeFromPlaylist: (playlistId: string, songId: string) => {
        set((state) => {
          const playlists = state.playlists.map((p) => {
            if (p.id !== playlistId) return p;
            return { ...p, songIds: p.songIds.filter((id) => id !== songId) };
          });

          const updated = playlists.find((p) => p.id === playlistId);
          if (updated) {
            savePlaylist(updated).catch((e) =>
              console.error("Failed to update playlist:", e)
            );
          }

          return { playlists };
        });
      },

      renamePlaylist: (id: string, name: string) => {
        set((state) => {
          const playlists = state.playlists.map((p) =>
            p.id === id ? { ...p, name } : p
          );

          const updated = playlists.find((p) => p.id === id);
          if (updated) {
            savePlaylist(updated).catch((e) =>
              console.error("Failed to update playlist:", e)
            );
          }

          return { playlists };
        });
      },

      // --- Playback Actions ---
      play: (song?: Song) => {
        const audio = getAudio();
        const state = get();

        if (song) {
          if (state.currentSong?.id !== song.id) {
            audio.src = song.url;
          }
          audio.play().catch(() => {});
          set({
            currentSong: song,
            isPlaying: true,
            progress: 0,
            currentTime: 0,
            queue: state.queue.length > 0 ? state.queue : state.songs,
            queueIndex:
              state.queue.findIndex((q) => q.id === song.id) !== -1
                ? state.queue.findIndex((q) => q.id === song.id)
                : state.songs.findIndex((s) => s.id === song.id),
          });
        } else if (state.currentSong) {
          audio.play().catch(() => {});
          set({ isPlaying: true });
        }
      },

      pause: () => {
        getAudio().pause();
        set({ isPlaying: false });
      },

      togglePlay: () => {
        const state = get();
        if (state.isPlaying) {
          state.pause();
        } else {
          state.play();
        }
      },

      next: () => {
        const state = get();
        if (state.queue.length === 0) return;

        let nextIndex: number;
        if (state.playbackMode === "shuffle") {
          nextIndex = Math.floor(Math.random() * state.queue.length);
        } else if (state.playbackMode === "repeat-one") {
          nextIndex = state.queueIndex;
        } else {
          nextIndex = state.queueIndex + 1;
          if (nextIndex >= state.queue.length) {
            if (state.playbackMode === "repeat") {
              nextIndex = 0;
            } else {
              set({ isPlaying: false });
              return;
            }
          }
        }

        const nextSong = state.queue[nextIndex];
        if (nextSong) {
          const audio = getAudio();
          audio.src = nextSong.url;
          audio.play().catch(() => {});
          set({
            currentSong: nextSong,
            queueIndex: nextIndex,
            isPlaying: true,
            progress: 0,
            currentTime: 0,
          });
        }
      },

      previous: () => {
        const state = get();
        if (state.queue.length === 0) return;

        const audio = getAudio();
        if (audio.currentTime > 3) {
          audio.currentTime = 0;
          set({ currentTime: 0, progress: 0 });
          return;
        }

        let prevIndex = state.queueIndex - 1;
        if (prevIndex < 0) {
          prevIndex = state.playbackMode === "repeat" ? state.queue.length - 1 : 0;
        }

        const prevSong = state.queue[prevIndex];
        if (prevSong) {
          audio.src = prevSong.url;
          audio.play().catch(() => {});
          set({
            currentSong: prevSong,
            queueIndex: prevIndex,
            isPlaying: true,
            progress: 0,
            currentTime: 0,
          });
        }
      },

      seek: (time: number) => {
        const audio = getAudio();
        audio.currentTime = time;
        set({ currentTime: time });
      },

      setProgress: (progress: number) => set({ progress }),
      setDuration: (duration: number) => {
        set((state) => ({
          currentSong: state.currentSong
            ? { ...state.currentSong, duration }
            : null,
        }));
      },

      setVolume: (volume: number) => {
        const audio = getAudio();
        audio.volume = volume;
        set({ volume, isMuted: volume === 0 });
      },

      toggleMute: () => {
        const state = get();
        const audio = getAudio();
        const newMuted = !state.isMuted;
        audio.muted = newMuted;
        set({ isMuted: newMuted });
      },

      // --- Queue & Mode ---
      setPlaybackMode: (mode: PlaybackMode) => set({ playbackMode: mode }),

      toggleFavorite: async (id: string) => {
        const newState = !get().songs.find((s) => s.id === id)?.liked;

        set((state) => ({
          songs: state.songs.map((s) =>
            s.id === id ? { ...s, liked: !s.liked } : s
          ),
          currentSong:
            state.currentSong?.id === id
              ? { ...state.currentSong, liked: !state.currentSong.liked }
              : state.currentSong,
          queue: state.queue.map((q) =>
            q.id === id ? { ...q, liked: !q.liked } : q
          ),
        }));

        // Update in IndexedDB
        try {
          const allStored = await getAllSongs();
          const target = allStored.find((s) => s.id === id);
          if (target) {
            target.liked = newState;
            await saveSongs([target]);
          }
        } catch (e) {
          console.error("Failed to update favorite in IndexedDB:", e);
        }
      },

      // --- UI ---
      toggleVisualizer: () => set((state) => ({ isVisualizerOpen: !state.isVisualizerOpen })),
    }),
    {
      name: "mi-musica-storage",
      partialize: (state) => ({
        volume: state.volume,
        playbackMode: state.playbackMode,
      }),
    }
  )
);
