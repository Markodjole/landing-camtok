"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  HERO_DESTINATION,
  HERO_ORIGIN,
  HERO_PIN_STOPS,
  type LatLng,
} from "@/lib/heroRoute";
import { pointAtRouteProgress } from "@/lib/routeProgress";

const ROUTE_DURATION_MS = 60_000;
const ZOOM = 15;
const TILE_PX = 256;
const SUBDOMAINS = ["a", "b", "c", "d"] as const;
const PURPLE_RGB = "108, 35, 237";
const GREEN_RGB = "109, 255, 0";
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
  return `https://${sub}.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png`;
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

function centerOf(path: LatLng[]) {
  const lat = path.reduce((s, p) => s + p.lat, 0) / path.length;
  const lng = path.reduce((s, p) => s + p.lng, 0) / path.length;
  return { lat, lng };
}

/** Manhattan route map — dark tiles, green arrow, pins, zone blocks. */
export function HeroMapBackground() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathRef = useRef<LatLng[]>([]);
  const startRef = useRef(0);
  const [routeCenter, setRouteCenter] = useState(centerOf([HERO_ORIGIN, HERO_DESTINATION]));
  const [size, setSize] = useState({ w: 400, h: 280 });
  const [routeReady, setRouteReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const centerTileX = lngToTileX(routeCenter.lng, ZOOM);
  const centerTileY = latToTileY(routeCenter.lat, ZOOM);

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
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/hero-route");
        if (!res.ok) throw new Error("Route fetch failed");
        const data = (await res.json()) as { path?: LatLng[] };
        if (!data.path?.length) throw new Error("Empty route");
        if (cancelled) return;
        pathRef.current = data.path;
        setRouteCenter(centerOf(data.path));
        setRouteReady(true);
      } catch {
        if (!cancelled) setError("Map failed to load");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!routeReady) return;

    const track = trackRef.current;
    if (!track) return;
    let px = 0;
    let py = 0;
    let raf = 0;
    const tick = () => {
      px += 0.28;
      py += 0.16;
      track.style.transform = `translate(${-(px % TILE_PX)}px, ${-(py % TILE_PX)}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [routeReady]);

  useEffect(() => {
    if (!routeReady) return;

    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const originX = tiles.originX;
    const originY = tiles.originY;

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
      const p = latLngToPixel(lat, lng, originX, originY, ZOOM);
      return { x: p.x + panX, y: p.y + panY };
    };

    const drawMapPin = (
      x: number,
      y: number,
      kind: "bet" | "turn" | "zone" | "dest",
      t: number,
      pulse: number,
    ) => {
      const bob = Math.sin(t * 1.8 + pulse) * 2.5;
      const headY = y + bob - 10;
      const fill =
        kind === "dest" || kind === "zone"
          ? `rgba(${PURPLE_RGB}, 0.95)`
          : kind === "turn"
            ? "rgba(255, 255, 255, 0.92)"
            : `rgba(${GREEN_RGB}, 0.95)`;
      const ring =
        kind === "dest" || kind === "zone"
          ? `rgba(${PURPLE_RGB}, 0.5)`
          : kind === "turn"
            ? "rgba(255, 255, 255, 0.4)"
            : `rgba(${GREEN_RGB}, 0.5)`;
      const headR = kind === "dest" ? 8 : 7;

      ctx.save();
      ctx.shadowColor = fill;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.arc(x, headY, headR, Math.PI, 0);
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
      ctx.fillStyle =
        kind === "turn" ? `rgba(${PURPLE_RGB}, 0.9)` : "rgba(255, 255, 255, 0.85)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y + bob + 6, 4 + Math.sin(t * 3 + pulse) * 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = ring;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    };

    const drawZoneBlock = (x: number, y: number, t: number, i: number) => {
      const size = 72;
      const pulse = 0.12 + Math.sin(t * 1.2 + i) * 0.04;
      ctx.save();
      ctx.fillStyle = `rgba(${PURPLE_RGB}, ${pulse})`;
      ctx.strokeStyle = `rgba(${PURPLE_RGB}, 0.55)`;
      ctx.lineWidth = 1.5;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
      ctx.strokeRect(x - size / 2, y - size / 2, size, size);
      ctx.restore();
    };

    const drawArrow = (x: number, y: number, angle: number, t: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.strokeStyle = `rgba(${GREEN_RGB}, 0.45)`;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.shadowColor = GREEN;
      ctx.shadowBlur = 14;
      ctx.fillStyle = GREEN;
      ctx.strokeStyle = "#0a0a0a";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(11, 0);
      ctx.lineTo(-8, 6.5);
      ctx.lineTo(-4.5, 0);
      ctx.lineTo(-8, -6.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = `rgba(${GREEN_RGB}, ${0.35 + Math.sin(t * 4) * 0.15})`;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    startRef.current = performance.now();

    const draw = (now: number) => {
      const path = pathRef.current;
      if (path.length < 2) return;

      const elapsed = (now - startRef.current) % ROUTE_DURATION_MS;
      const progress = elapsed / ROUTE_DURATION_MS;
      const t = now / 1000;
      const panX = -((t * 16) % TILE_PX);
      const panY = -((t * 9) % TILE_PX);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const routePx = path.map((p) => project(p.lat, p.lng, panX, panY));

      ctx.save();
      ctx.strokeStyle = `rgba(${PURPLE_RGB}, 0.85)`;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.setLineDash([12, 9]);
      ctx.lineDashOffset = -t * 28;
      ctx.beginPath();
      ctx.moveTo(routePx[0]!.x, routePx[0]!.y);
      for (let i = 1; i < routePx.length; i++) {
        ctx.lineTo(routePx[i]!.x, routePx[i]!.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      const doneIdx = Math.max(2, Math.floor(progress * (routePx.length - 1)) + 1);
      ctx.save();
      ctx.strokeStyle = PURPLE;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(routePx[0]!.x, routePx[0]!.y);
      for (let i = 1; i < doneIdx; i++) {
        ctx.lineTo(routePx[i]!.x, routePx[i]!.y);
      }
      ctx.stroke();
      ctx.restore();

      HERO_PIN_STOPS.forEach(({ progress: p, kind }, i) => {
        const pin = pointAtRouteProgress(path, p);
        const px = project(pin.lat, pin.lng, panX, panY);
        if (px.x < -60 || px.x > w + 60 || px.y < -60 || px.y > h + 60) return;
        if (kind === "zone") drawZoneBlock(px.x, px.y, t, i);
        drawMapPin(px.x, px.y, kind, t, i);
      });

      const dest = project(HERO_DESTINATION.lat, HERO_DESTINATION.lng, panX, panY);
      drawZoneBlock(dest.x, dest.y, t, 99);
      drawMapPin(dest.x, dest.y, "dest", t, 99);

      const pos = pointAtRouteProgress(path, progress);
      const rider = project(pos.lat, pos.lng, panX, panY);
      drawArrow(rider.x, rider.y, (pos.heading * Math.PI) / 180, t);

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
  }, [routeReady, tiles.originX, tiles.originY]);

  return (
    <div ref={wrapRef} className="hero-map-bg" aria-hidden>
      {routeReady && (
        <>
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
        </>
      )}
      {!routeReady && !error && (
        <div className="hero-map-loading">Loading route…</div>
      )}
      {error && <div className="hero-map-fallback">{error}</div>}
    </div>
  );
}
