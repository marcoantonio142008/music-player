// Browser-only jsmediatags wrapper
// Dynamically import to avoid pulling in ReactNativeFileReader

let jsmediatagsModule: any = null;

async function getJsmediatags() {
  if (jsmediatagsModule) return jsmediatagsModule;

  // Import only the browser-compatible parts
  const [
    { default: jsmediatags },
    BlobFileReader,
    XhrFileReader,
  ] = await Promise.all([
    import("jsmediatags/build2/jsmediatags"),
    import("jsmediatags/build2/BlobFileReader"),
    import("jsmediatags/build2/XhrFileReader"),
  ]);

  jsmediatags.addHandler("BlobFileReader", BlobFileReader.default || BlobFileReader);
  jsmediatags.addHandler("XhrFileReader", XhrFileReader.default || XhrFileReader);

  jsmediatagsModule = jsmediatags;
  return jsmediatags;
}

export interface ParsedTags {
  title: string;
  artist: string;
  album: string;
  coverUrl: string | null;
}

function readCoverPicture(pic: { format: string; data: number[] }): string {
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
        onSuccess: (tag: { tags: any }) => {
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
