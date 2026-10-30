# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Un solo usuario: el dueño del equipo, en su propia máquina, escuchando su colección de archivos de audio locales. No hay cuentas, ni sesiones compartidas, ni escenario multiusuario que diseñar. La app se abre desde el navegador del mismo equipo donde viven los archivos, muchas veces como PWA instalada.

## Product Purpose

Reproducir la música local del usuario desde el navegador, con la biblioteca persistida entre sesiones, sin subir nada a un servidor. Éxito = abrir la app, encontrar rápido lo que se quiere escuchar y que suene, sin fricción ni cuentas.

## Positioning

Control total con cero nube para el audio: los archivos nunca salen del equipo y la biblioteca vive en el navegador (IndexedDB). Un servicio de streaming no puede ofrecer eso, y el reproductor del sistema no ofrece la capa de biblioteca, playlists, favoritos, búsqueda por voz y visualización que sí da la app.

## Operating Context

- Los archivos se importan arrastrándolos o eligiéndolos desde el disco local; no hay subida ni sincronización.
- Se usa en sesiones cortas y repetidas: elegir algo y escuchar.
- Funciona en Chrome/Edge (búsqueda por voz y visualización dependen de Web Speech API y Web Audio API); el usuario asume esa dependencia.
- La app es instalable como PWA y funciona offline para sus propios assets; los audios son locales por definición.
- La búsqueda automática de portadas consulta la iTunes Search API con artista y título derivados del nombre del archivo. Es la única llamada de red de la app: el audio nunca se envía y la portada queda guardada en IndexedDB como cualquier otro dato local.

## Capabilities and Constraints

Confirmado y en funcionamiento: importación por drag & drop y selector de archivos, extracción de metadatos ID3 (título, artista, álbum, carátula), biblioteca persistida en IndexedDB, favoritos, playlists, modos normal/shuffle/repeat/repeat-one, controles completos de reproducción (play/pause, siguiente/anterior, volumen, mute, seek), atajos de teclado, búsqueda por voz en es-ES, visualizador de frecuencias en Canvas, y PWA instalable.

Restricciones técnicas: todo corre en el cliente; no hay backend ni API de música. Los formatos dependen del soporte nativo del navegador (MP3, WAV, OGG, FLAC, M4A, AAC).

Decisión abierta: no se definió si la app se publicará para otras personas. Todo trabajo futuro debe asumir uso personal salvo que el usuario diga lo contrario.

## Brand Commitments

- Nombre visible: **Mi Música**.
- Voz de producto: español rioplatense con voseo ("Arrastrá", "Marcá", "Seleccioná"). Es un compromiso, no una preferencia estilística.
- Identidad visual: abierta a rediseño. El tema violeta oscuro (`#1a1025`) fue un primer intento que el usuario descartó porque no quedó como quería; no es un compromiso de marca.

## Evidence on Hand

- App funcional en `music-player/` (Next.js 16, React 19, Tailwind v4, Zustand).
- `music-player/README.md` documenta features, stack, atajos y estructura.
- Iconos PWA en `music-player/public/icon-192.svg` y `icon-512.svg`; manifest en `public/manifest.json`.
- No existen testimonios, métricas de uso, casos de estudio ni material de prensa. No inventarlos.

## Product Principles

1. **Los archivos son del usuario.** Ninguna función futura puede requerir subir audio ni depender de un servicio externo para reproducir.
2. **Cero fricción de entrada.** Importar y escuchar debe seguir siendo el camino más corto de la app.
3. **La biblioteca es el centro.** Favoritos, playlists y búsqueda existen para encontrar rápido, no para decorar.
4. **El español rioplatense no se negocia.** Todo copy nuevo respeta el voseo y el registro actual.
5. **La identidad visual se rediseña desde cero.** El violeta actual no es un compromiso de marca: se reemplaza sin arrastrarlo.
