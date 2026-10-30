/**
 * Automatic cover lookup against the iTunes Search API.
 *
 * Why this API: it answers with `Access-Control-Allow-Origin: *`, so the
 * browser calls it directly with no proxy and no key, and its artwork URLs
 * accept a size suffix swap (`100x100bb.jpg` -> `600x600bb.jpg`) on the same
 * path, so the big version is a string replace instead of a second request.
 *
 * Cost: this is the only network call the player makes. It sends the artist
 * and title parsed from the file name, nothing else.
 *
 * Rate limit: Apple allows roughly 20 requests per minute per IP and starts
 * answering 403 past that. Every call funnels through `schedule()`, which
 * serializes requests and spaces them MIN_INTERVAL_MS apart, so a bulk import
 * trickles in the background instead of getting the whole library blocked.
 */

const SEARCH_ENDPOINT = "https://itunes.apple.com/search";
const MIN_INTERVAL_MS = 3200;
const REQUEST_TIMEOUT_MS = 8000;
const MAX_RESULTS = 8;

/** A result that survived scoring, already upscaled to 600x600. */
export interface CoverMatch {
  artworkUrl: string;
  trackName: string;
  artistName: string;
  albumName: string;
}

interface ITunesResult {
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
}

let chain: Promise<unknown> = Promise.resolve();
let lastRequestAt = 0;

/** Serializes every API call and enforces the minimum gap between them. */
function schedule<T>(task: () => Promise<T>): Promise<T> {
  const result = chain.then(async () => {
    const wait = MIN_INTERVAL_MS - (Date.now() - lastRequestAt);
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
    lastRequestAt = Date.now();
    return task();
  });

  // A failed task must not poison the queue for the next song.
  chain = result.catch(() => undefined);
  return result;
}

/**
 * Splits "Artist - Title" out of a file name.
 *
 * Songs without embedded tags usually keep the downloader's naming, which is
 * the only metadata available. Only a *spaced* hyphen counts as a separator:
 * "12th-street-rag" is a title, not artist "12th" + title "street-rag".
 */
export function parseFileName(fileName: string): {
  artist: string | null;
  title: string;
} {
  const base = fileName.replace(/\.[^/.]+$/, "").trim();
  const parts = base.split(/\s+-\s+/);

  if (parts.length >= 2) {
    const title = parts[parts.length - 1].trim();
    const artist = parts.slice(0, -1).join(" - ").trim();
    if (title && artist && artist.length <= 80) return { artist, title };
  }

  return { artist: null, title: base };
}

/**
 * Lowercase, accent-free, punctuation-free form used for querying and for
 * comparing results. Bracketed segments go first (iTunes appends the feature
 * list there), then explicit feature credits.
 */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\[[^\]]*\]|\([^)]*\)/g, " ")
    .replace(/\b(?:feat|ft|featuring)\b.*$/, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Token overlap weighted toward recall, so extra words hurt less than gaps. */
function tokenScore(query: string, candidate: string): number {
  if (!query || !candidate) return 0;
  if (query === candidate) return 1;

  const queryTokens = query.split(" ").filter(Boolean);
  const candidateTokens = new Set(candidate.split(" ").filter(Boolean));
  if (queryTokens.length === 0 || candidateTokens.size === 0) return 0;

  let shared = 0;
  for (const token of queryTokens) {
    if (candidateTokens.has(token)) shared += 1;
  }

  const recall = shared / queryTokens.length;
  const precision = shared / candidateTokens.size;
  return recall * 0.7 + precision * 0.3;
}

/** `.../100x100bb.jpg` -> `.../600x600bb.jpg`, keeping the real extension. */
function upscaleArtwork(url: string): string {
  return url.replace(/\/(\d+)x(\d+)bb\.(jpg|png)$/i, "/600x600bb.$3");
}

async function requestSearch(term: string): Promise<ITunesResult[]> {
  const url = `${SEARCH_ENDPOINT}?term=${encodeURIComponent(term)}&entity=song&limit=${MAX_RESULTS}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`iTunes search failed: ${response.status}`);
    }
    const payload = (await response.json()) as { results?: ITunesResult[] };
    return payload.results ?? [];
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Returns the best cover for a file name, or null when nothing is convincing
 * enough. Null is a valid, cached answer: it means "this song is not in the
 * catalogue", not "try again later".
 */
export async function findCover(fileName: string): Promise<CoverMatch | null> {
  const { artist, title } = parseFileName(fileName);
  const titleTerm = normalize(title);
  if (!titleTerm) return null;

  const artistTerm = artist ? normalize(artist) : "";
  const term = [artistTerm, titleTerm].filter(Boolean).join(" ");

  const results = await schedule(() => requestSearch(term));

  let best: CoverMatch | null = null;
  let bestScore = 0;

  for (const result of results) {
    if (!result.trackName || !result.artworkUrl100) continue;

    const titleScore = tokenScore(titleTerm, normalize(result.trackName));
    // Below this the result is a different song that happens to share a word.
    if (titleScore < 0.75) continue;

    // The artist is a tiebreaker, never a gate. iTunes credits a track to its
    // lead artist and album, so requiring a match would reject the right
    // answer: "Sucker for Pain" is listed under Lil Wayne, while the file name
    // says "Logic & Ty Dolla $ign".
    const artistScore = artistTerm
      ? tokenScore(artistTerm, normalize(result.artistName ?? ""))
      : 0;
    const score = titleScore * 0.8 + artistScore * 0.2;

    if (score > bestScore) {
      bestScore = score;
      best = {
        artworkUrl: upscaleArtwork(result.artworkUrl100),
        trackName: result.trackName,
        artistName: result.artistName ?? "",
        albumName: result.collectionName ?? "",
      };
    }
  }

  return best;
}

export async function downloadCover(artworkUrl: string): Promise<Blob> {
  const response = await fetch(artworkUrl);
  if (!response.ok) {
    throw new Error(`Cover download failed: ${response.status}`);
  }

  const blob = await response.blob();
  if (blob.size === 0) throw new Error("Cover download was empty");

  // mzstatic serves image/jpeg; guard anyway so <img> never receives a
  // mislabelled blob it refuses to decode.
  const type = blob.type.startsWith("image/") ? blob.type : "image/jpeg";
  return new Blob([blob], { type });
}
