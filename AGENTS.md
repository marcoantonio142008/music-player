<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Proyecto

Reproductor de música PWA en español (carpeta `music-player/`). Reproduce archivos locales del equipo: ID3 via `jsmediatags`, voz es-ES con Web Speech API, visualizador Canvas + Web Audio, favoritos, shuffle/repeat. Documentación de features y atajos en `README.md`.

## Stack

- Next.js 16.3.5 (App Router), React 19.2.8, TypeScript strict, Tailwind v4 (`@tailwindcss/postcss`), Zustand
- Alias `@/*` → `./src/*`
- PWA: `withPWAInit` de `@ducanh2912/next-pwa` (`dest: "public"`, `register: true`, desactivado en dev)

## Comandos

- `npm run dev` — `next dev`; **regenera el bloque** `BEGIN/END:nextjs-agent-rules` de este archivo
- `npm run build` — `next build --webpack`; **no quitar `--webpack`**
- `npm run lint`

## Reglas

- Leer `node_modules/next/dist/docs/` antes de usar cualquier API de Next:16 (cambios breaking respecto a versiones previas).
- **Nunca borrar el bloque** `<!-- BEGIN:nextjs-agent-rules --> … <!-- END:nextjs-agent-rules -->`; se regenera solo con `next dev` (`node_modules/next/dist/server/lib/generate-agent-files.js`).
- Typings propios en `src/types/jsmediatags.d.ts` y `src/types/dom.d.ts`; no usar `@ts-ignore`.
- Webpack alias `react-native-fs: false` con stub en `src/stubs/react-native-fs.js`.
- Commits convencionales, sin atribución a IA.
- `CLAUDE.md` solo contiene `@AGENTS.md`; no modificarlo.
