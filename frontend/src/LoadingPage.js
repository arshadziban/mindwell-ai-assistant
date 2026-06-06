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

  @keyframes progressComplete {
    0% { width: 95%; }
    100% { width: 100%; }
  }

  @keyframes pulseText {
    0%, 100% { opacity: 0.45; }
    50% { opacity: 1; }
  }
`;

export default function LoadingPage({ done = false, onComplete }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const sizeRef = useRef(0);
  const [step, setStep] = useState(0);
  const [completing, setCompleting] = useState(false);

  const steps = [
    "Reviewing your responses",
    "Evaluating health signals",
    "Applying evidence-based patterns",
    "Preparing tailored recommendations",
    "Finalizing your report",
  ];

  // Cycle steps indefinitely while waiting
  useEffect(() => {
    if (completing) return;
    const interval = setInterval(() => setStep((s) => (s + 1) % steps.length), 2400);
    return () => clearInterval(interval);
  }, [completing]);

  // When server responds, play completion then hand off
  useEffect(() => {
    if (!done) return;
    setCompleting(true);
    setStep(steps.length - 1);
    const t = setTimeout(() => { if (onComplete) onComplete(); }, 1200);
    return () => clearTimeout(t);
  }, [done]);

  // Draw globe — called whenever SIZE changes
  const drawGlobe = (SIZE) => {
    const canvas = canvasRef.current;
    if (!canvas || SIZE < 1) return;

    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = SIZE + "px";
    canvas.style.height = SIZE + "px";
    ctx.scale(dpr, dpr);

    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const R = SIZE * 0.38;
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

    const tilt = 0.32;
    const cosX = Math.cos(tilt);
    const sinX = Math.sin(tilt);

    const render = (ts) => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      const t = ts * 0.00042;
      const cosY = Math.cos(t);
      const sinY = Math.sin(t);

      const projected = [];
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        const x = p.ox * cosY + p.oz * sinY;
        const z0 = -p.ox * sinY + p.oz * cosY;
        const y2 = p.oy * cosX - z0 * sinX;
        const z = p.oy * sinX + z0 * cosX;
        const scale = 1 / (1 - z * 0.15);
        projected.push({
          sx: cx + x * R * scale,
          sy: cy + y2 * R * scale,
          depth: (z + 1) / 2,
          size: p.size,
        });
      }

      projected.sort((a, b) => a.depth - b.depth);

      for (const p of projected) {
        const alpha = 0.08 + p.depth * 0.68;
        const r = p.size * (0.45 + p.depth * 0.65);
        const mix = p.depth;
        const cr = Math.round(14 + (10 - 14) * mix);
        const cg = Math.round(116 + (90 - 116) * mix);
        const cb = Math.round(138 + (110 - 138) * mix);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);
  };

  // Use ResizeObserver on the container so the canvas fills available width
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      // Defer to next frame to avoid "ResizeObserver loop" browser warning
      requestAnimationFrame(() => {
        const entry = entries[0];
        if (!entry) return;
        const available = Math.floor(entry.contentRect.width);
        const SIZE = Math.min(available, 340);
        if (SIZE !== sizeRef.current && SIZE > 0) {
          sizeRef.current = SIZE;
          drawGlobe(SIZE);
        }
      });
    });

    observer.observe(container);
    return () => {
      observer.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <style>{loadingStyles}</style>

      <main className="flex-1 flex items-center justify-center px-6 pb-16 pt-4">
        <div className="flex flex-col items-center w-full" style={{ maxWidth: 400 }}>

          {/* Logo — scales with viewport */}
          <img
            src={`${process.env.PUBLIC_URL}/logo_horizontal.png`}
            alt="MindWell"
            className="object-contain mb-6 sm:mb-8"
            style={{ height: "clamp(28px, 6vw, 48px)", maxWidth: "60vw" }}
          />

          {/* Globe container — fills available width up to 340px */}
          <div
            ref={containerRef}
            className="w-full flex items-center justify-center mb-6 sm:mb-8"
            style={{ maxWidth: 340 }}
          >
            <canvas ref={canvasRef} style={{ display: "block" }} />
          </div>

          {/* Step label */}
          <p
            className="font-semibold text-slate-700 text-center mb-4 sm:mb-5 px-2"
            style={{
              fontSize: "clamp(11px, 3vw, 14px)",
              animation: "pulseText 2.5s ease-in-out infinite",
            }}
          >
            {steps[step]}
          </p>

          {/* Progress bar */}
          <div className="w-full" style={{ maxWidth: 280 }}>
            <div className="h-[4px] bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #0E748A 0%, #0A5266 100%)",
                  animation: completing
                    ? "progressComplete 0.6s ease-out forwards"
                    : "progressBar 30s ease-out forwards",
                }}
              />
            </div>
            <p
              className="text-slate-500 mt-2 sm:mt-3 text-center"
              style={{ fontSize: "clamp(10px, 2.5vw, 11px)" }}
            >
              {completing ? "Preparing your report…" : "Please wait while your report is generated"}
            </p>
          </div>

        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-white/30 border-t border-slate-300 shadow-sm">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-center">
          <p className="text-slate-600 text-center" style={{ fontSize: "clamp(10px, 2.5vw, 11px)" }}>
            © Mind Well. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
