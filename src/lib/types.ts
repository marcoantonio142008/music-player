export interface Song {
  id: string;
  file: File;
  url: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string | null;
  liked: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  createdAt: number;
}

export type PlaybackMode = "shuffle" | "repeat" | "repeat-one" | "none";

export interface PlayerState {
  // Library
  songs: Song[];
  searchQuery: string;

  // Playlists
  playlists: Playlist[];

  // Playback
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  volume: number;
  isMuted: boolean;

  // Queue & mode
  queue: Song[];
  queueIndex: number;
  playbackMode: PlaybackMode;

  // UI
  isVisualizerOpen: boolean;

  // Actions - Library
  addSongs: (files: File[]) => Promise<void>;
  removeSong: (id: string) => void;
  setSearchQuery: (query: string) => void;
  loadFromDB: () => Promise<void>;

  // Actions - Playlists
  createPlaylist: (name: string) => Promise<void>;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, songIds: string[]) => Promise<void>;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  renamePlaylist: (id: string, name: string) => void;

  // Actions - Playback
  play: (song?: Song) => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;

  // Actions - Queue & mode
  setPlaybackMode: (mode: PlaybackMode) => void;
  toggleFavorite: (id: string) => void;

  // Actions - UI
  toggleVisualizer: () => void;
}
