"use client";

import { useEffect } from "react";

/**
 * Accent derivation for the "Chrome Frío" theme.
 *
 * The whole UI reads a single `--accent` custom property. It is written once per
 * song: from the cover art when available, otherwise from a deterministic hash
 * of the title. Everything here fails soft — a broken cover must never break
 * playback.
 */

const DEFAULT_ACCENT = "#d4d4d8";
const cache = new Map<string, string>();

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Deterministic fallback: same seed always yields the same muted hue. */
export function accentFromSeed(seed: string): string {
  const source = seed.trim() || "sin-titulo";
  const hue = hashSeed(source) % 360;
  return `hsl(${hue}, 14%, 64%)`;
}

/**
 * Cover placeholder. More saturated than the accent on purpose: at tile size
 * a 14% hue is indistinguishable from grey, so each song ends up looking the
 * same. Still muted enough to sit quietly next to real artwork.
 */
export function placeholderTint(seed: string): string {
  const source = seed.trim() || "sin-titulo";
  const hue = hashSeed(source) % 360;
  return `hsl(${hue}, 32%, 36%)`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) return [0, 0, lightness];

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));

  let hue: number;
  if (max === rn) hue = ((gn - bn) / delta) % 6;
  else if (max === gn) hue = (bn - rn) / delta + 2;
  else hue = (rn - gn) / delta + 4;

  hue *= 60;
  if (hue < 0) hue += 360;

  return [hue, saturation, lightness];
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("cover-load-failed"));
    image.src = url;
  });
}

async function sampleCover(coverUrl: string, seed: string): Promise<string> {
  const image = await loadImage(coverUrl);

  const canvas = document.createElement("canvas");
  canvas.width = 40;
  canvas.height = 40;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return accentFromSeed(seed);

  ctx.drawImage(image, 0, 0, 40, 40);

  // Throws SecurityError when the canvas is tainted by a cross-origin cover.
  const { data } = ctx.getImageData(0, 0, 40, 40);

  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count += 1;
  }

  if (count === 0) return accentFromSeed(seed);

  const [hue, rawSaturation, rawLightness] = rgbToHsl(r / count, g / count, b / count);

  // Clamp saturation/lightness: guarantees readable contrast over #0b0b0c and
  // keeps cover art from producing neon accents.
  const saturation = Math.min(0.45, Math.max(0.18, rawSaturation));
  const lightness = Math.min(0.72, Math.max(0.55, rawLightness));

  return `hsl(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`;
}

/** Average the cover down to a single muted color. Never throws. */
export async function accentFromCover(
  coverUrl: string | null | undefined,
  seed: string
): Promise<string> {
  if (!coverUrl) return accentFromSeed(seed);

  const cached = cache.get(coverUrl);
  if (cached) return cached;

  let accent: string;
  try {
    accent = await sampleCover(coverUrl, seed);
  } catch {
    // CORS taint, broken image, no canvas — fall back to the deterministic hue.
    accent = accentFromSeed(seed);
  }

  cache.set(coverUrl, accent);
  return accent;
}

export interface AccentSong {
  id: string;
  title: string;
  coverUrl: string | null;
}

// Two consumers can be alive at once (player bar + Now Playing overlay).
// The accent is only reset once the last one unmounts.
let consumers = 0;

/**
 * Keeps `--accent` in sync with the current song. Mount it wherever the theme
 * must follow playback — more than one instance is safe.
 */
export function useAccentFromCover(song: AccentSong | null): void {
  const songId = song?.id ?? null;
  const title = song?.title ?? "";
  const coverUrl = song?.coverUrl ?? null;

  useEffect(() => {
    if (!songId) return;

    consumers += 1;
    let active = true;

    const apply = (color: string) => {
      if (active) document.documentElement.style.setProperty("--accent", color);
    };

    // Seed first so the theme never flashes the previous song's accent.
    apply(accentFromSeed(title));
    void accentFromCover(coverUrl, title).then(apply);

    return () => {
      active = false;
      consumers -= 1;
      if (consumers === 0) {
        document.documentElement.style.setProperty("--accent", DEFAULT_ACCENT);
      }
    };
  }, [songId, title, coverUrl]);
}
