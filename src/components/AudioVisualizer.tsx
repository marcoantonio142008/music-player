"use client";

import { useRef, useEffect } from "react";
import { getAnalyser, resumeAudio } from "@/lib/audioAnalyser";

export default function AudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Shared analyser graph; created once per page (module-level singleton).
    analyserRef.current = getAnalyser();
    resumeAudio();

    // Hoisted out of the draw loop: getComputedStyle forces a style recalc.
    let accent = "#d4d4d8";
    let frame = 0;

    // Hoisted out of the draw loop: allocating per frame means 60 arrays/sec.
    let dataArray: Uint8Array<ArrayBuffer> | null = null;
    let dataArrayLength = 0;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      // The accent lives in CSS; canvas needs a concrete color.
      if (frame % 30 === 0) {
        accent =
          getComputedStyle(document.documentElement)
            .getPropertyValue("--accent")
            .trim() || "#d4d4d8";
      }
      frame++;

      const analyser = analyserRef.current;
      if (!analyser) {
        // Draw idle state
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        const barCount = 32;
        const barWidth = width / barCount - 2;
        ctx.fillStyle = accent;
        for (let i = 0; i < barCount; i++) {
          const barHeight = 4 + Math.sin(Date.now() / 800 + i * 0.3) * 3;
          const x = i * (barWidth + 2);
          ctx.globalAlpha = 0.4 * (1 - (i / barCount) * 0.6);
          ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        }
        ctx.globalAlpha = 1;
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      let data = dataArray;
      if (!data || dataArrayLength !== bufferLength) {
        data = new Uint8Array(bufferLength);
        dataArray = data;
        dataArrayLength = bufferLength;
      }
      analyser.getByteFrequencyData(data);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barCount = Math.min(32, bufferLength);
      const barWidth = width / barCount - 2;
      const step = Math.floor(bufferLength / barCount);

      ctx.fillStyle = accent;
      for (let i = 0; i < barCount; i++) {
        const value = data[i * step];
        const barHeight = (value / 255) * height * 0.85;
        const x = i * (barWidth + 2);

        ctx.globalAlpha = 1 - (i / barCount) * 0.65;

        ctx.beginPath();
        ctx.roundRect(x, height - barHeight, barWidth, barHeight, 3);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

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
