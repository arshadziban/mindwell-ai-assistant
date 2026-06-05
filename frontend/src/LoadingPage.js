import React, { useState, useEffect, useRef } from "react";

const loadingStyles = `
  @keyframes progressBar {
    0% { width: 0%; }
    20% { width: 18%; }
    40% { width: 37%; }
    65% { width: 64%; }
    85% { width: 83%; }
    100% { width: 95%; }
  }

  @keyframes pulseText {
    0%, 100% { opacity: 0.45; }
    50% { opacity: 1; }
  }
`;

export default function LoadingPage() {
  const canvasRef = useRef(null);
  const [step, setStep] = useState(0);

  const steps = [
    "Reviewing your responses",
    "Evaluating health signals",
    "Applying evidence-based patterns",
    "Preparing tailored recommendations",
    "Finalizing your report",
  ];

  useEffect(() => {
    const interval = setInterval(() => setStep((s) => Math.min(s + 1, 4)), 2400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const SIZE = window.innerWidth < 640 ? 240 : 340;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = SIZE + "px";
    canvas.style.height = SIZE + "px";
    ctx.scale(dpr, dpr);

    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const R = 130;

    const N = 560;
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = golden * i;
      pts.push({
        ox: radiusAtY * Math.cos(theta),
        oy: y,
        oz: radiusAtY * Math.sin(theta),
        size: 0.55 + Math.random() * 0.8,
      });
    }

    let frame;
    const render = (ts) => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      const t = ts * 0.00042;
      const cosY = Math.cos(t);
      const sinY = Math.sin(t);
      const tilt = 0.32;
      const cosX = Math.cos(tilt);
      const sinX = Math.sin(tilt);

      const projected = [];
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        let x = p.ox * cosY + p.oz * sinY;
        let z = -p.ox * sinY + p.oz * cosY;
        let y = p.oy;

        const y2 = y * cosX - z * sinX;
        const z2 = y * sinX + z * cosX;
        y = y2;
        z = z2;

        const scale = 1 / (1 - z * 0.15);
        const sx = cx + x * R * scale;
        const sy = cy + y * R * scale;
        const depth = (z + 1) / 2;

        projected.push({ sx, sy, depth, size: p.size });
      }

      projected.sort((a, b) => a.depth - b.depth);

      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const alpha = 0.08 + p.depth * 0.68;
        const r = p.size * (0.45 + p.depth * 0.65);

        const teal = [14, 116, 138];
        const cyan = [10, 90, 110];
        const mix = p.depth;
        const cr = Math.round(teal[0] + (cyan[0] - teal[0]) * mix);
        const cg = Math.round(teal[1] + (cyan[1] - teal[1]) * mix);
        const cb = Math.round(teal[2] + (cyan[2] - teal[2]) * mix);

        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
        ctx.fill();
      }

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="min-h-screen bg-transparent flex flex-col overflow-hidden">
      <style>{loadingStyles}</style>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="flex flex-col items-center py-6 sm:py-10">
          <img src="/logo_horizontal.png" alt="Mind Well Logo" className="h-[34px] sm:h-[38px] w-auto mb-5 sm:mb-6" />

          <div className="relative mb-6 sm:mb-8">
            <canvas ref={canvasRef} style={{ display: "block" }} />
          </div>

          <p
            className="text-slate-700 text-xs sm:text-sm font-semibold mb-4 sm:mb-5 tracking-wide text-center px-2"
            style={{ animation: "pulseText 2.5s ease-in-out infinite" }}
          >
            {steps[step]}
          </p>

          <div className="w-48 sm:w-64">
            <div className="h-[4px] bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #0E748A 0%, #0A5266 100%)', animation: "progressBar 14s ease-out forwards" }}
              />
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-2 sm:mt-3 text-center">Please wait while your report is generated</p>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-white/30 border-t border-slate-300 shadow-sm">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex flex-col items-center justify-center">
          <p className="text-[10px] sm:text-[11px] text-slate-600 text-center">© Mind Well. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
