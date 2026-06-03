"use client";

import { useEffect, useRef } from "react";

/** Stylized panning city map — decorative hero background. */
export function HeroMapBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let animId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
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
      const block = 56;
      for (let y = -block; y < height + block; y += block) {
        for (let x = -block; x < width + block; x += block) {
          const gx = Math.floor((x + ox) / block);
          const gy = Math.floor((y + oy) / block);
          const h = hash(gx, gy);
          if (h < 0.18) continue;
          const pad = 5 + h * 4;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.025 + h * 0.035})`;
          ctx.fillRect(x + ox + pad, y + oy + pad, block - pad * 2, block - pad * 2);
        }
      }
    };

    const drawRoads = (ox: number, oy: number) => {
      ctx.lineCap = "square";
      const major = 112;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
      ctx.lineWidth = 2.5;
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

      ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
      ctx.lineWidth = 1;
      const minor = 56;
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
      const cx = width * 0.08;
      const cy = height * 0.15;
      return [
        { x: cx + width * 0.05, y: cy + height * 0.55 },
        { x: cx + width * 0.22, y: cy + height * 0.42 },
        { x: cx + width * 0.38, y: cy + height * 0.48 },
        { x: cx + width * 0.52, y: cy + height * 0.28 },
        { x: cx + width * 0.68, y: cy + height * 0.35 },
        { x: cx + width * 0.82, y: cy + height * 0.18 },
      ].map((p, i) => ({
        x: p.x + Math.sin(t * 0.7 + i * 0.9) * 6,
        y: p.y + Math.cos(t * 0.55 + i * 1.1) * 5,
      }));
    };

    const drawRoute = (t: number) => {
      const pts = routePoints(t);
      if (pts.length < 2) return;

      ctx.strokeStyle = "rgba(108, 35, 237, 0.45)";
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      ctx.lineDashOffset = -t * 28;
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

      const seg = (t * 0.12) % (pts.length - 1);
      const i = Math.floor(seg);
      const f = seg - i;
      const a = pts[i]!;
      const b = pts[Math.min(i + 1, pts.length - 1)]!;
      const vx = a.x + (b.x - a.x) * f;
      const vy = a.y + (b.y - a.y) * f;

      ctx.fillStyle = "rgba(109, 255, 0, 0.85)";
      ctx.beginPath();
      ctx.arc(vx, vy, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(109, 255, 0, 0.35)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(vx, vy, 10, 0, Math.PI * 2);
      ctx.stroke();
    };

    const draw = () => {
      frame += 1;
      const t = frame / 60;
      const ox = -(t * 14) % 56;
      const oy = -(t * 10) % 56;

      ctx.clearRect(0, 0, width, height);
      drawBlocks(ox, oy);
      drawRoads(ox, oy);
      drawRoute(t);

      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="hero-map-bg" aria-hidden>
      <canvas ref={canvasRef} className="hero-map-canvas" />
    </div>
  );
}
