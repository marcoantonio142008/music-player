# Mi Música — Reproductor de música local

Reproductor de música local PWA construido con Next.js, con visualización de audio en tiempo real, búsqueda por voz y soporte para metadatos ID3.

## Características

- **Importación de archivos**: Arrastrá archivos o seleccioná una carpeta desde el botón
- **Metadatos ID3**: Extrae título, artista, álbum y carátula automáticamente
- **Búsqueda por voz**: Botón de micrófono con Web Speech API (es-ES)
- **Visualización de audio**: Barras de frecuencia animadas via Canvas + Web Audio API
- **Favoritos**: Marcá canciones como favoritas, se guardan entre sesiones
- **Modos de reproducción**: Normal, shuffle, repeat, repeat-one
- **Controles completos**: Play/pause, siguiente, anterior, volumen, mute, seek
- **Atajos de teclado**: Espacio, flechas, N/P/M/V/L
- **PWA instalable**: Funciona offline (assets de la app, no los audios)
- **Diseño dark**: Fondo oscuro con acentos gradiente violeta-rosa

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Zustand (estado global + persistencia localStorage)
- jsmediatags (parseo de ID3)
- @ducanh2912/next-pwa (service worker)
- Web Audio API (visualización)
- Web Speech API (búsqueda por voz)

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd music-player

# Instalar dependencias
npm install

# Correr en desarrollo
npm run dev -- --webpack
```

Abrí http://localhost:3000 en tu navegador.

## Build para producción

```bash
npm run build -- --webpack
npm start
```

## Atajos de teclado

| Tecla | Acción |
|-------|--------|
| Espacio | Play / Pausa |
| ← → | Seek ±5 segundos |
| Shift + ← → | Canción anterior / siguiente |
| ↑ ↓ | Subir / bajar volumen |
| N | Siguiente canción |
| P | Canción anterior |
| M | Silenciar |
| V | Abrir / cerrar visualización |
| L | Toggle favorito |

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx          ← Layout raíz con metadata PWA
│   ├── page.tsx            ← Biblioteca principal
│   └── globals.css         ← Estilos globales y animaciones
├── components/
│   ├── SearchBar.tsx       ← Búsqueda con micrófono
│   ├── SongList.tsx        ← Lista de canciones
│   ├── SongItem.tsx        ← Item individual
│   ├── Player.tsx          ← Mini-reproductor inferior
│   ├── ProgressBar.tsx     ← Barra de progreso gradiente
│   └── AudioVisualizer.tsx ← Visualización Canvas
├── hooks/
│   ├── useVoiceSearch.ts   ← Web Speech API
│   └── useKeyboardShortcuts.ts
└── lib/
    ├── audioStore.ts       ← Estado global Zustand
    ├── parseTags.ts        ← Parseo ID3
    └── types.ts            ← Definiciones de tipos
```

## Formatos soportados

MP3, WAV, OGG, FLAC, M4A, AAC — todos los formatos que el navegador soporte nativamente.

## Notas

- Los archivos de audio se cargan desde tu disco local, no se suben a ningún servidor
- Los favoritos y preferencias se guardan en localStorage del navegador
- La visualización de audio requiere que estés reproduciendo una canción
- La búsqueda por voz funciona solo en Chrome/Edge (no soportada en Firefox/Safari)
