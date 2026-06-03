"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const GREEN_RGB = "109, 255, 0";
const LOOP_MS = 18_000;
const MAP_PX = 1280;
const ZOOM = 13;
const ORIGIN_TILE_X = 4822;
const ORIGIN_TILE_Y = 6156;

/** SoHo → Midtown on the bundled map image. */
const ROUTE = [
  { lat: 40.7234, lng: -74.003 },
  { lat: 40.731, lng: -73.997 },
  { lat: 40.739, lng: -73.991 },
  { lat: 40.747, lng: -73.985 },
  { lat: 40.754, lng: -73.98 },
  { lat: 40.761, lng: -73.974 },
];

function latLngToPixel(
  lat: number,
  lng: number,
  originTileX: number,
  originTileY: number,
  zoom: number,
) {
  const tilePx = 256;
  const scale = tilePx * 2 ** zoom;
  const worldX = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const worldY =
    (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return {
    x: worldX - originTileX * tilePx,
    y: worldY - originTileY * tilePx,
  };
}

function toNorm(lat: number, lng: number) {
  const p = latLngToPixel(lat, lng, ORIGIN_TILE_X, ORIGIN_TILE_Y, ZOOM);
  return { x: p.x / MAP_PX, y: p.y / MAP_PX };
}

const ROUTE_NORM = ROUTE.map((p) => toNorm(p.lat, p.lng));

function pointOnRoute(t: number) {
  const n = ROUTE_NORM.length - 1;
  const seg = (t % 1) * n;
  const i = Math.floor(seg);
  const f = seg - i;
  const a = ROUTE_NORM[i]!;
  const b = ROUTE_NORM[Math.min(i + 1, n)]!;
  return {
    x: a.x + (b.x - a.x) * f,
    y: a.y + (b.y - a.y) * f,
  };
}

function coverPoint(
  nx: number,
  ny: number,
  containerW: number,
  containerH: number,
  imageW: number,
  imageH: number,
) {
  const scale = Math.max(containerW / imageW, containerH / imageH);
  const displayedW = imageW * scale;
  const displayedH = imageH * scale;
  const offsetX = (containerW - displayedW) / 2;
  const offsetY = (containerH - displayedH) / 2;
  return {
    x: offsetX + nx * displayedW,
    y: offsetY + ny * displayedH,
  };
}

/** Bundled Manhattan street map + one moving green dot. No pins, no zones. */
export function HeroMapBackground() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawDot = (x: number, y: number) => {
      ctx.save();
      ctx.strokeStyle = `rgba(${GREEN_RGB}, 0.45)`;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.shadowColor = `rgba(${GREEN_RGB}, 1)`;
      ctx.shadowBlur = 14;
      ctx.fillStyle = `rgba(${GREEN_RGB}, 1)`;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    startRef.current = performance.now();

    const draw = (now: number) => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const t = ((now - startRef.current) % LOOP_MS) / LOOP_MS;
      const norm = pointOnRoute(t);
      const { x, y } = coverPoint(norm.x, norm.y, w, h, MAP_PX, MAP_PX);
      drawDot(x, y);

      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="hero-map-bg" aria-hidden>
      <Image
        src="/hero-manhattan-map.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hero-map-image"
        draggable={false}
      />
      <canvas ref={canvasRef} className="hero-map-overlay" />
    </div>
  );
}
