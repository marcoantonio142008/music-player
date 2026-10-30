// Browser-only jsmediatags wrapper.
//
// The `build2/jsmediatags` entry already registers BlobFileReader,
// XhrFileReader and ArrayFileReader through its own Config, so there is
// nothing to wire up here: importing the module is enough. (An earlier
// version called `jsmediatags.addHandler`, which does not exist on this
// build and made every parse throw, so all songs silently fell back to
// filename + "Desconocido" + no cover.)

interface Picture {
  format: string;
  data: number[] | Uint8Array;
}

interface TagPayload {
  tags: {
    title?: string;
    artist?: string;
    album?: string;
    picture?: Picture;
  };
}

interface Jsmediatags {
  read: (
    file: File | Blob,
    callbacks: {
      onSuccess: (tag: TagPayload) => void;
      onError: (error: unknown) => void;
    }
  ) => void;
}

export interface ParsedTags {
  title: string;
  artist: string;
  album: string;
  coverUrl: string | null;
}

let jsmediatagsModule: Jsmediatags | null = null;

async function getJsmediatags(): Promise<Jsmediatags> {
  if (jsmediatagsModule) return jsmediatagsModule;

  const mod = await import("jsmediatags/build2/jsmediatags");
  const jsmediatags = ((mod as { default?: Jsmediatags }).default ??
    mod) as Jsmediatags;

  jsmediatagsModule = jsmediatags;
  return jsmediatags;
}

function readCoverPicture(pic: Picture): string {
  const bytes = new Uint8Array(pic.data);
  const blob = new Blob([bytes], { type: pic.format });
  return URL.createObjectURL(blob);
}

export async function parseAudioTags(file: File): Promise<ParsedTags> {
  const fallback: ParsedTags = {
    title: file.name.replace(/\.[^/.]+$/, ""),
    artist: "Desconocido",
    album: "Desconocido",
    coverUrl: null,
  };

  try {
    const jsmediatags = await getJsmediatags();

    return new Promise((resolve) => {
      jsmediatags.read(file, {
        onSuccess: (tag) => {
          const t = tag.tags;
          resolve({
            title: t.title || fallback.title,
            artist: t.artist || fallback.artist,
            album: t.album || fallback.album,
            coverUrl: t.picture ? readCoverPicture(t.picture) : null,
          });
        },
        onError: () => resolve(fallback),
      });
    });
  } catch {
    return fallback;
  }
}
