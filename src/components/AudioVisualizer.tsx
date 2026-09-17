"use client";

import { useRef, useEffect, useCallback } from "react";
import { useAudioStore } from "@/lib/audioStore";

export default function AudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const isPlaying = useAudioStore((s) => s.isPlaying);

  const setupAudioContext = useCallback(() => {
    if (audioContextRef.current && analyserRef.current) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    // Get the audio element from the store
    const audioEl = document.querySelector("audio");
    if (!audioEl) return;

    const source = audioContext.createMediaElementSource(audioEl);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      if (!analyserRef.current) {
        // Draw idle state
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        const barCount = 32;
        const barWidth = width / barCount - 2;
        for (let i = 0; i < barCount; i++) {
          const barHeight = 4 + Math.sin(Date.now() / 800 + i * 0.3) * 3;
          const x = i * (barWidth + 2);
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, "rgba(139, 92, 246, 0.3)");
          gradient.addColorStop(1, "rgba(236, 72, 153, 0.3)");
          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        }
        return;
      }

      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barCount = Math.min(32, bufferLength);
      const barWidth = width / barCount - 2;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step];
        const barHeight = (value / 255) * height * 0.85;
        const x = i * (barWidth + 2);

        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, "#8b5cf6");
        gradient.addColorStop(0.5, "#a855f7");
        gradient.addColorStop(1, "#ec4899");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, height - barHeight, barWidth, barHeight, 3);
        ctx.fill();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Setup audio context on first play
  useEffect(() => {
    if (isPlaying) {
      setupAudioContext();
    }
  }, [isPlaying, setupAudioContext]);

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={600}
        height={120}
        className="w-full h-[120px] rounded-xl"
      />
    </div>
  );
}
