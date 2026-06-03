"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const ZOOM = 15;
const TILE_PX = 256;
const CENTER = { lat: 40.7589, lng: -73.9851 }; // Midtown Manhattan
const SUBDOMAINS = ["a", "b", "c", "d"] as const;
const PURPLE = "#6c23ed";
const GREEN = "#6dff00";

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
  const originWorldX = originTileX * TILE_PX;
  const originWorldY = originTileY * TILE_PX;
  return { x: worldX - originWorldX, y: worldY - originWorldY };
}

type PinDef = { lat: number; lng: number; kind: "bet" | "turn" | "zone" };

const PINS: PinDef[] = [
  { lat: 40.7614, lng: -73.991, kind: "turn" },
  { lat: 40.7562, lng: -73.982, kind: "zone" },
  { lat: 40.7528, lng: -73.976, kind: "bet" },
  { lat: 40.764, lng: -73.978, kind: "turn" },
  { lat: 40.7545, lng: -73.988, kind: "zone" },
];

const ROUTE: Array<{ lat: number; lng: number }> = [
  { lat: 40.7515, lng: -73.994 },
  { lat: 40.7555, lng: -73.987 },
  { lat: 40.7595, lng: -73.981 },
  { lat: 40.7635, lng: -73.975 },
  { lat: 40.766, lng: -73.97 },
];

/** Colored Manhattan map with route, pins, and moving arrow — fills hero bottom panel. */
export function HeroMapBackground() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 400, h: 320 });

  const centerTileX = lngToTileX(CENTER.lng, ZOOM);
  const centerTileY = latToTileY(CENTER.lat, ZOOM);

  const tiles = useMemo(() => {
    const cols = Math.ceil(size.w / TILE_PX) + 3;
    const rows = Math.ceil(size.h / TILE_PX) + 3;
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
    const track = trackRef.current;
    if (!track) return;
    let px = 0;
    let py = 0;
    let raf = 0;
    const tick = () => {
      px += 0.32;
      py += 0.18;
      track.style.transform = `translate(${-(px % TILE_PX)}px, ${-(py % TILE_PX)}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
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

    const project = (lat: number, lng: number, panX: number, panY: number) => {
      const p = latLngToPixel(lat, lng, tiles.originX, tiles.originY, ZOOM);
      return { x: p.x + panX, y: p.y + panY };
    };

    const drawPin = (
      x: number,
      y: number,
      kind: PinDef["kind"],
      t: number,
      i: number,
    ) => {
      const bob = Math.sin(t * 1.8 + i) * 2.5;
      const headY = y + bob - 11;
      const fill =
        kind === "zone" ? PURPLE : kind === "turn" ? "#ffffff" : GREEN;
      const r = kind === "bet" ? 8 : 7;

      ctx.save();
      ctx.shadowColor = fill;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(x, headY, r, Math.PI, 0);
      ctx.lineTo(x, y + bob + 5);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    };

    const drawArrow = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.shadowColor = GREEN;
      ctx.shadowBlur = 12;
      ctx.fillStyle = GREEN;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-7, 6);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-7, -6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    };

    const draw = () => {
      frame++;
      const t = frame / 60;
      const panX = -((t * 16) % TILE_PX);
      const panY = -((t * 9) % TILE_PX);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const routePx = ROUTE.map((p) => project(p.lat, p.lng, panX, panY));
      if (routePx.length >= 2) {
        ctx.save();
        ctx.strokeStyle = PURPLE;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = PURPLE;
        ctx.shadowBlur = 8;
        ctx.setLineDash([12, 7]);
        ctx.lineDashOffset = -t * 28;
        ctx.beginPath();
        ctx.moveTo(routePx[0]!.x, routePx[0]!.y);
        for (let i = 1; i < routePx.length; i++) {
          ctx.lineTo(routePx[i]!.x, routePx[i]!.y);
        }
        ctx.stroke();
        ctx.restore();

        const seg = (t * 0.14) % (routePx.length - 1);
        const idx = Math.floor(seg);
        const f = seg - idx;
        const a = routePx[idx]!;
        const b = routePx[Math.min(idx + 1, routePx.length - 1)]!;
        const vx = a.x + (b.x - a.x) * f;
        const vy = a.y + (b.y - a.y) * f;
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        drawArrow(vx, vy, angle);
      }

      PINS.forEach((pin, i) => {
        const p = project(pin.lat, pin.lng, panX, panY);
        if (p.x < -24 || p.x > w + 24 || p.y < -24 || p.y > h + 24) return;
        drawPin(p.x, p.y, pin.kind, t, i);
      });

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [tiles.originX, tiles.originY]);

  return (
    <div ref={wrapRef} className="hero-map-bg" aria-hidden>
      <div
        ref={trackRef}
        className="hero-map-track"
        style={{
          width: tiles.cols * TILE_PX,
          height: tiles.rows * TILE_PX,
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
