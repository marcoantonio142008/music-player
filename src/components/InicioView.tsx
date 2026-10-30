"use client";

import { useAudioStore } from "@/lib/audioStore";
import { placeholderTint } from "@/lib/accent";
import type { Song } from "@/lib/types";
import SongItem from "./SongItem";

/** Placeholder art: one deterministic tint per song, never a shared gradient. */
function tint(seed: string) {
  return { background: placeholderTint(seed) };
}

export default function InicioView() {
  const songs = useAudioStore((s) => s.songs);
  const play = useAudioStore((s) => s.play);
  const favorites = songs.filter((s) => s.liked);
  const recentSongs = songs.slice(-8).reverse();

  return (
    <div className="stagger flex flex-col gap-[34px]">
      {/* Greeting */}
      <div>
        <h1 className="text-[clamp(28px,4vw,40px)] font-semibold leading-[1.06] tracking-[-.035em] text-text-primary">
          {getGreeting()}
        </h1>
        <p className="mt-[7px] text-[13px] text-text-secondary">
          {songs.length === 0
            ? "No hay canciones cargadas"
            : `${songs.length} ${songs.length === 1 ? "canción" : "canciones"} en tu biblioteca`}
        </p>
      </div>

      {/* Quick play grid - Favoritos */}
      {favorites.length > 0 && (
        <section>
          <SectionHead title="Favoritos" count={favorites.length} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.slice(0, 6).map((song) => (
              <button
                key={song.id}
                onClick={() => play(song)}
                className="group flex min-w-0 items-center gap-[11px] rounded-xl border border-transparent p-[7px] text-left transition-[background-color,border-color] duration-150 ease-[cubic-bezier(.22,1,.36,1)] hover:border-white/[.07] hover:bg-white/[.045] active:scale-[.995]"
              >
                <CoverArt song={song} className="h-11 w-11 rounded-lg" iconClassName="h-4 w-4" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-text-primary">{song.title}</span>
                  <span className="block truncate text-[11.5px] text-text-muted">{song.artist}</span>
                </span>
                <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-white/[.08] text-text-primary opacity-0 transition-[opacity,transform] duration-150 ease-[cubic-bezier(.22,1,.36,1)] -translate-x-[3px] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
                  <svg className="ml-px h-3 w-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Recently added */}
      {recentSongs.length > 0 && (
        <section>
          <SectionHead title="Agregadas recientemente" />
          <div className="scrollbar-hide flex gap-[14px] overflow-x-auto pb-1.5">
            {recentSongs.map((song) => (
              <button
                key={song.id}
                onClick={() => play(song)}
                className="group w-[148px] flex-none text-left"
              >
                <CoverArt
                  song={song}
                  className="h-[148px] w-[148px] rounded-xl transition-transform duration-[250ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-[3px]"
                  iconClassName="h-9 w-9"
                  ring
                />
                <span className="mt-[9px] block truncate text-[13px] font-medium text-text-primary">{song.title}</span>
                <span className="block truncate text-[11.5px] text-text-muted">{song.artist}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* All songs - using SongItem with full controls */}
      {songs.length > 0 && (
        <section>
          <SectionHead title="Todas tus canciones" count={songs.length} />
          <div className="border-t border-white/[.07]">
            {songs.map((song, index) => (
              <SongItem key={song.id} song={song} index={index} />
            ))}
          </div>
        </section>
      )}

      {songs.length === 0 && <EmptyState />}
    </div>
  );
}

function SectionHead({ title, count }: { title: string; count?: number }) {
  return (
    <div className="mb-3.5 flex items-baseline gap-2.5">
      <h2 className="text-[15px] font-semibold tracking-[-.015em] text-text-primary">{title}</h2>
      {count !== undefined && (
        <span className="font-mono text-[11px] text-text-muted">{count}</span>
      )}
    </div>
  );
}

function CoverArt({
  song,
  className,
  iconClassName,
  ring = false,
}: {
  song: Song;
  className: string;
  iconClassName: string;
  ring?: boolean;
}) {
  return (
    <span
      className={`relative block flex-none overflow-hidden bg-bg-card ${className} ${
        ring ? "after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]" : ""
      }`}
    >
      {song.coverUrl ? (
        <img src={song.coverUrl} alt="" className="h-full w-full object-cover saturate-[.9]" />
      ) : (
        <span
          className="grid h-full w-full place-items-center text-text-secondary"
          style={tint(song.title)}
        >
          <svg className={iconClassName} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </span>
      )}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 grid h-14 w-14 place-items-center rounded-xl border border-white/[.07] bg-bg-card" aria-hidden="true">
        <span className="flex h-[18px] items-end gap-[3px]">
          <i className="block h-[9px] w-[2px] rounded-[1px] bg-text-muted" />
          <i className="block h-[18px] w-[2px] rounded-[1px] bg-text-secondary" />
          <i className="block h-[13px] w-[2px] rounded-[1px] bg-text-muted" />
        </span>
      </div>
      <h3 className="text-[15px] font-semibold tracking-[-.015em] text-text-primary">Tu biblioteca está vacía</h3>
      <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-text-muted">
        Importá tu música para comenzar a reproducir
      </p>
      <button
        onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
        className="mt-6 inline-flex h-9 items-center gap-[7px] rounded-xl border border-white/[.13] px-4 text-[13px] font-medium text-text-primary transition-[background-color,border-color] duration-150 ease-[cubic-bezier(.22,1,.36,1)] hover:border-white/[.2] hover:bg-white/[.06] active:scale-[.99]"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Importar música
      </button>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}
