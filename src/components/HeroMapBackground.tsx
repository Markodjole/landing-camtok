"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const ZOOM = 14;
const TILE_PX = 256;
const CENTER = { lat: 40.758, lng: -73.9855 };
const SUBDOMAINS = ["a", "b", "c", "d"] as const;
const GREEN_RGB = "109, 255, 0";
const LOOP_MS = 18_000;

/** Manhattan street path — SoHo toward Midtown. */
const ROUTE = [
  { lat: 40.7234, lng: -74.003 },
  { lat: 40.731, lng: -73.997 },
  { lat: 40.739, lng: -73.991 },
  { lat: 40.747, lng: -73.985 },
  { lat: 40.754, lng: -73.98 },
  { lat: 40.761, lng: -73.974 },
];

function lngToTileX(lng: number, zoom: number) {
  return Math.floor(((lng + 180) / 360) * 2 ** zoom);
}

function latToTileY(lat: number, zoom: number) {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** zoom,
  );
}

function tileUrl(x: number, y: number, z: number, i: number) {
  const sub = SUBDOMAINS[i % SUBDOMAINS.length]!;
  return `https://${sub}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;
}

function latLngToPixel(
  lat: number,
  lng: number,
  originTileX: number,
  originTileY: number,
  zoom: number,
) {
  const scale = TILE_PX * 2 ** zoom;
  const worldX = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const worldY =
    (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return {
    x: worldX - originTileX * TILE_PX,
    y: worldY - originTileY * TILE_PX,
  };
}

function pointOnRoute(t: number) {
  const n = ROUTE.length - 1;
  const seg = (t % 1) * n;
  const i = Math.floor(seg);
  const f = seg - i;
  const a = ROUTE[i]!;
  const b = ROUTE[Math.min(i + 1, n)]!;
  return {
    lat: a.lat + (b.lat - a.lat) * f,
    lng: a.lng + (b.lng - a.lng) * f,
  };
}

/** Real Manhattan map tiles with one moving green dot. */
export function HeroMapBackground() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef(0);
  const [size, setSize] = useState({ w: 400, h: 280 });

  const centerTileX = lngToTileX(CENTER.lng, ZOOM);
  const centerTileY = latToTileY(CENTER.lat, ZOOM);

  const tiles = useMemo(() => {
    const cols = Math.ceil(size.w / TILE_PX) + 2;
    const rows = Math.ceil(size.h / TILE_PX) + 2;
    const startX = centerTileX - Math.floor(cols / 2);
    const startY = centerTileY - Math.floor(rows / 2);
    const list: Array<{ x: number; y: number; left: number; top: number; key: string }> =
      [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tx = startX + col;
        const ty = startY + row;
        list.push({
          x: tx,
          y: ty,
          left: col * TILE_PX,
          top: row * TILE_PX,
          key: `${tx}-${ty}`,
        });
      }
    }
    return { list, originX: startX, originY: startY, cols, rows };
  }, [size.w, size.h, centerTileX, centerTileY]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: wrap.clientWidth, h: wrap.clientHeight });
    });
    ro.observe(wrap);
    setSize({ w: wrap.clientWidth, h: wrap.clientHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const { originX, originY } = tiles;

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

    const project = (lat: number, lng: number) => {
      const p = latLngToPixel(lat, lng, originX, originY, ZOOM);
      const offsetX = (wrap.clientWidth - tiles.cols * TILE_PX) / 2;
      const offsetY = (wrap.clientHeight - tiles.rows * TILE_PX) / 2;
      return { x: p.x + offsetX, y: p.y + offsetY };
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
      const pos = pointOnRoute(t);
      const { x, y } = project(pos.lat, pos.lng);
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
  }, [tiles]);

  const offsetX = (size.w - tiles.cols * TILE_PX) / 2;
  const offsetY = (size.h - tiles.rows * TILE_PX) / 2;

  return (
    <div ref={wrapRef} className="hero-map-bg" aria-hidden>
      <div
        className="hero-map-track"
        style={{
          width: tiles.cols * TILE_PX,
          height: tiles.rows * TILE_PX,
          left: offsetX,
          top: offsetY,
        }}
      >
        {tiles.list.map((tile, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={tile.key}
            src={tileUrl(tile.x, tile.y, ZOOM, i)}
            alt=""
            width={TILE_PX}
            height={TILE_PX}
            loading="eager"
            decoding="async"
            draggable={false}
            style={{ left: tile.left, top: tile.top }}
            className="hero-map-tile"
          />
        ))}
      </div>
      <canvas ref={canvasRef} className="hero-map-overlay" />
    </div>
  );
}
