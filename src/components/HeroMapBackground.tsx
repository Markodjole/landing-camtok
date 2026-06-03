"use client";

import { useEffect, useRef } from "react";

const PURPLE_RGB = "108, 35, 237";
const GREEN_RGB = "109, 255, 0";

/** World-space pin locations — scroll with the panned grid. */
const MAP_PINS: Array<{ wx: number; wy: number; kind: "bet" | "turn" | "zone" }> = [
  { wx: 140, wy: 180, kind: "turn" },
  { wx: 320, wy: 260, kind: "zone" },
  { wx: 480, wy: 140, kind: "bet" },
  { wx: 620, wy: 320, kind: "turn" },
  { wx: 780, wy: 200, kind: "zone" },
  { wx: 920, wy: 380, kind: "bet" },
  { wx: 1080, wy: 160, kind: "turn" },
  { wx: 1240, wy: 280, kind: "zone" },
];

/** Animated panning city map — full hero backdrop. */
export function HeroMapBackground() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let animId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      if (width < 1 || height < 1) return;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const hash = (x: number, y: number) => {
      const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return n - Math.floor(n);
    };

    const drawBlocks = (ox: number, oy: number) => {
      const block = 52;
      for (let y = -block; y < height + block; y += block) {
        for (let x = -block; x < width + block; x += block) {
          const gx = Math.floor((x + ox) / block);
          const gy = Math.floor((y + oy) / block);
          const h = hash(gx, gy);
          if (h < 0.12) continue;
          const pad = 4 + h * 5;
          ctx.fillStyle = `rgba(${PURPLE_RGB}, ${0.14 + h * 0.14})`;
          ctx.fillRect(x + ox + pad, y + oy + pad, block - pad * 2, block - pad * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.04 + h * 0.05})`;
          ctx.fillRect(x + ox + pad + 2, y + oy + pad + 2, block - pad * 2 - 4, block - pad * 2 - 4);
        }
      }
    };

    const drawRoads = (ox: number, oy: number) => {
      ctx.lineCap = "square";
      const major = 104;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = 3;
      for (let x = (-ox % major) - major; x < width + major; x += major) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = (-oy % major) - major; y < height + major; y += major) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(255, 255, 255, 0.11)";
      ctx.lineWidth = 1.5;
      const minor = 52;
      for (let x = (-ox % minor) - minor; x < width + minor; x += minor) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = (-oy % minor) - minor; y < height + minor; y += minor) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const routePoints = (t: number) => {
      const cx = width * 0.06;
      const cy = height * 0.1;
      return [
        { x: cx + width * 0.08, y: cy + height * 0.62 },
        { x: cx + width * 0.24, y: cy + height * 0.5 },
        { x: cx + width * 0.4, y: cy + height * 0.56 },
        { x: cx + width * 0.55, y: cy + height * 0.34 },
        { x: cx + width * 0.7, y: cy + height * 0.42 },
        { x: cx + width * 0.86, y: cy + height * 0.22 },
      ].map((p, i) => ({
        x: p.x + Math.sin(t * 0.7 + i * 0.9) * 8,
        y: p.y + Math.cos(t * 0.55 + i * 1.1) * 7,
      }));
    };

    const drawMapPin = (
      x: number,
      y: number,
      kind: "bet" | "turn" | "zone",
      t: number,
      pulse: number,
    ) => {
      const bob = Math.sin(t * 1.8 + pulse) * 2.5;
      const headY = y + bob - 10;
      const fill =
        kind === "zone"
          ? `rgba(${PURPLE_RGB}, 0.95)`
          : kind === "turn"
            ? "rgba(255, 255, 255, 0.92)"
            : `rgba(${GREEN_RGB}, 0.95)`;
      const ring =
        kind === "zone"
          ? `rgba(${PURPLE_RGB}, 0.5)`
          : kind === "turn"
            ? "rgba(255, 255, 255, 0.4)"
            : `rgba(${GREEN_RGB}, 0.5)`;

      ctx.save();
      ctx.shadowColor = fill;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.arc(x, headY, 7, Math.PI, 0);
      ctx.lineTo(x, y + bob + 5);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(x, headY, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = kind === "turn" ? `rgba(${PURPLE_RGB}, 0.9)` : "rgba(0,0,0,0.35)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y + bob + 6, 4 + Math.sin(t * 3 + pulse) * 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = ring;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    };

    const drawPins = (ox: number, oy: number, t: number) => {
      const span = 1300;
      MAP_PINS.forEach((pin, i) => {
        let px = ((pin.wx + ox) % span) - 80;
        if (px < -40) px += span;
        const py = ((pin.wy + oy * 0.85) % (height + 200)) - 40;
        if (px < -20 || px > width + 20 || py < -20 || py > height + 20) return;
        drawMapPin(px, py, pin.kind, t, i * 1.7);
      });
    };

    const drawRoute = (t: number) => {
      const pts = routePoints(t);
      if (pts.length < 2 || width < 1) return;

      ctx.strokeStyle = `rgba(${PURPLE_RGB}, 0.85)`;
      ctx.lineWidth = 4;
      ctx.setLineDash([14, 10]);
      ctx.lineDashOffset = -t * 32;
      ctx.beginPath();
      ctx.moveTo(pts[0]!.x, pts[0]!.y);
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1]!;
        const curr = pts[i]!;
        const mx = (prev.x + curr.x) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, mx, (prev.y + curr.y) / 2);
        ctx.quadraticCurveTo(curr.x, curr.y, curr.x, curr.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      const seg = (t * 0.14) % (pts.length - 1);
      const i = Math.floor(seg);
      const f = seg - i;
      const a = pts[i]!;
      const b = pts[Math.min(i + 1, pts.length - 1)]!;
      const vx = a.x + (b.x - a.x) * f;
      const vy = a.y + (b.y - a.y) * f;

      ctx.fillStyle = "rgba(109, 255, 0, 1)";
      ctx.beginPath();
      ctx.arc(vx, vy, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(109, 255, 0, 0.5)";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(vx, vy, 12, 0, Math.PI * 2);
      ctx.stroke();
    };

    const draw = () => {
      if (width > 0 && height > 0) {
        frame += 1;
        const t = frame / 60;
        const ox = -(t * 16) % 52;
        const oy = -(t * 11) % 52;
        ctx.clearRect(0, 0, width, height);
        drawBlocks(ox, oy);
        drawRoads(ox, oy);
        drawPins(ox, oy, t);
        drawRoute(t);
      }
      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="hero-map-bg" aria-hidden>
      <canvas ref={canvasRef} className="hero-map-canvas" />
    </div>
  );
}
