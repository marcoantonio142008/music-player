let audio: HTMLAudioElement | null = null;

/** Single shared <audio> element. Every consumer must go through this. */
export function getAudioElement(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio();
    audio.preload = "metadata";
  }
  return audio;
}
