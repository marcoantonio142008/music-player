import { getAudioElement } from "./audioElement";

let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;

/**
 * Lazily builds the analyser graph. createMediaElementSource can only be
 * called once per element, so this must stay a module-level singleton.
 */
export function getAnalyser(): AnalyserNode | null {
  if (typeof window === "undefined") return null;
  if (analyser) return analyser;

  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;

  try {
    ctx = new Ctor();
    const source = ctx.createMediaElementSource(getAudioElement());
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    return analyser;
  } catch {
    // Leave no half-built graph behind: a retry must not reuse a context
    // that already claimed this element via createMediaElementSource.
    ctx = null;
    return null;
  }
}

/** Browsers start the context suspended; it must resume on a user gesture. */
export function resumeAudio(): void {
  if (ctx && ctx.state === "suspended") void ctx.resume();
}
