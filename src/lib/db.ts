const DB_NAME = "mi-musica-db";
const DB_VERSION = 2;
const SONGS_STORE = "songs";
const PLAYLISTS_STORE = "playlists";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SONGS_STORE)) {
        db.createObjectStore(SONGS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(PLAYLISTS_STORE)) {
        db.createObjectStore(PLAYLISTS_STORE, { keyPath: "id" });
      }
    };
  });
}

export interface StoredSong {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  liked: boolean;
  coverUrl: string | null;
  coverBlob?: Blob;
  fileBlob: Blob;
  fileName: string;
  fileType: string;
}

export async function saveSong(song: StoredSong): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SONGS_STORE, "readwrite");
    const store = tx.objectStore(SONGS_STORE);
    const request = store.put(song);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function saveSongs(songs: StoredSong[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SONGS_STORE, "readwrite");
    const store = tx.objectStore(SONGS_STORE);
    for (const song of songs) {
      store.put(song);
    }
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getAllSongs(): Promise<StoredSong[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SONGS_STORE, "readonly");
    const store = tx.objectStore(SONGS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function deleteSong(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SONGS_STORE, "readwrite");
    const store = tx.objectStore(SONGS_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function clearAllSongs(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SONGS_STORE, "readwrite");
    const store = tx.objectStore(SONGS_STORE);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

// --- Playlists ---

export interface StoredPlaylist {
  id: string;
  name: string;
  songIds: string[];
  createdAt: number;
}

export async function savePlaylist(playlist: StoredPlaylist): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PLAYLISTS_STORE, "readwrite");
    const store = tx.objectStore(PLAYLISTS_STORE);
    const request = store.put(playlist);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function getAllPlaylists(): Promise<StoredPlaylist[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PLAYLISTS_STORE, "readonly");
    const store = tx.objectStore(PLAYLISTS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function deletePlaylist(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PLAYLISTS_STORE, "readwrite");
    const store = tx.objectStore(PLAYLISTS_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}
