"use client";

import { useEffect, useRef, useState } from "react";
import { decodeGooglePolyline } from "@/lib/decodeGooglePolyline";
import { loadGoogleMaps } from "@/lib/loadGoogleMaps";
import { pointAtRouteProgress } from "@/lib/routeProgress";

const ROUTE_DURATION_MS = 60_000;
const PURPLE = "#6c23ed";
const GREEN = "#6dff00";

/** SoHo → Bryant Park — real Manhattan bike ride (~2.4 mi). */
const ORIGIN = { lat: 40.7234, lng: -74.003 };
const DESTINATION = { lat: 40.7536, lng: -73.9832 };

const PIN_STOPS: Array<{ progress: number; kind: "bet" | "turn" | "zone" }> = [
  { progress: 0.22, kind: "turn" },
  { progress: 0.48, kind: "zone" },
  { progress: 0.72, kind: "bet" },
];

function latLngLiteral(p: google.maps.LatLng | google.maps.LatLngLiteral) {
  if (typeof (p as google.maps.LatLng).lat === "function") {
    const ll = p as google.maps.LatLng;
    return { lat: ll.lat(), lng: ll.lng() };
  }
  const ll = p as google.maps.LatLngLiteral;
  return { lat: ll.lat, lng: ll.lng };
}

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1a1f" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a96" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d0d0f" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2c2c34" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#3a3a44" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3d3d48" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1624" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#222228" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#252530" }],
  },
];

function pinIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path fill="${color}" stroke="rgba(0,0,0,0.35)" stroke-width="1"
      d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z"/>
    <circle cx="14" cy="14" r="5" fill="rgba(255,255,255,0.9)"/>
  </svg>`;
  return {
    url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(28, 36),
    anchor: new google.maps.Point(14, 36),
  };
}

function riderIcon(heading: number) {
  return {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    scale: 6,
    fillColor: GREEN,
    fillOpacity: 1,
    strokeColor: "#0a0a0a",
    strokeWeight: 1.5,
    rotation: heading,
  };
}

/** Real Google Maps route ride through Manhattan — ~1 min loop. */
export function HeroMapBackground() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const riderRef = useRef<google.maps.Marker | null>(null);
  const routeAheadRef = useRef<google.maps.Polyline | null>(null);
  const routeDoneRef = useRef<google.maps.Polyline | null>(null);
  const pinRefs = useRef<google.maps.Marker[]>([]);
  const pathRef = useRef<Array<{ lat: number; lng: number }>>([]);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
    if (!apiKey) {
      setError("Map unavailable");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const g = await loadGoogleMaps(apiKey);
        if (cancelled) return;

        const map = new g.maps.Map(el, {
          center: ORIGIN,
          zoom: 14,
          disableDefaultUI: true,
          gestureHandling: "none",
          keyboardShortcuts: false,
          clickableIcons: false,
          styles: MAP_STYLES,
          backgroundColor: "#0d0d0f",
        });
        mapRef.current = map;

        const directions = new g.maps.DirectionsService();
        const requestRoute = (mode: google.maps.TravelMode) =>
          new Promise<google.maps.DirectionsResult>((resolve, reject) => {
            directions.route(
              {
                origin: ORIGIN,
                destination: DESTINATION,
                travelMode: mode,
                provideRouteAlternatives: false,
              },
              (res, status) => {
                if (status === g.maps.DirectionsStatus.OK && res) resolve(res);
                else reject(new Error(`Directions failed: ${status}`));
              },
            );
          });

        let result: google.maps.DirectionsResult;
        try {
          result = await requestRoute(g.maps.TravelMode.BICYCLING);
        } catch {
          result = await requestRoute(g.maps.TravelMode.DRIVING);
        }

        if (cancelled) return;

        const route = result.routes[0];
        if (!route) throw new Error("No route returned");

        let path: Array<{ lat: number; lng: number }> = [];
        const poly = route.overview_polyline as
          | string
          | { points?: string }
          | undefined;
        const encoded =
          typeof poly === "string" ? poly : poly?.points;
        if (encoded) {
          path = decodeGooglePolyline(encoded);
        } else if (route.overview_path?.length) {
          path = route.overview_path.map(latLngLiteral);
        } else {
          for (const leg of route.legs ?? []) {
            for (const step of leg.steps ?? []) {
              step.path?.forEach((p) => path.push(latLngLiteral(p)));
            }
          }
        }

        if (path.length < 2) {
          throw new Error("Empty route");
        }

        pathRef.current = path;

        const bounds = new g.maps.LatLngBounds();
        path.forEach((p) => bounds.extend(p));
        map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });

        routeAheadRef.current = new g.maps.Polyline({
          map,
          path,
          strokeColor: PURPLE,
          strokeOpacity: 0.35,
          strokeWeight: 5,
          zIndex: 1,
        });

        routeDoneRef.current = new g.maps.Polyline({
          map,
          path: [path[0]!],
          strokeColor: PURPLE,
          strokeOpacity: 0.95,
          strokeWeight: 6,
          zIndex: 2,
        });

        const dest = path[path.length - 1]!;
        new g.maps.Marker({
          map,
          position: dest,
          icon: pinIcon(PURPLE),
          zIndex: 4,
        });

        pinRefs.current = PIN_STOPS.map(({ progress, kind }) => {
          const p = pointAtRouteProgress(path, progress);
          const color =
            kind === "zone" ? PURPLE : kind === "turn" ? "#ffffff" : GREEN;
          return new g.maps.Marker({
            map,
            position: { lat: p.lat, lng: p.lng },
            icon: pinIcon(color),
            zIndex: 3,
          });
        });

        const startPos = pointAtRouteProgress(path, 0);
        riderRef.current = new g.maps.Marker({
          map,
          position: { lat: startPos.lat, lng: startPos.lng },
          icon: riderIcon(startPos.heading),
          zIndex: 5,
        });

        startRef.current = performance.now();
        setReady(true);

        const tick = (now: number) => {
          if (cancelled || !mapRef.current || pathRef.current.length < 2) return;

          const elapsed = (now - startRef.current) % ROUTE_DURATION_MS;
          const progress = elapsed / ROUTE_DURATION_MS;
          const pos = pointAtRouteProgress(pathRef.current, progress);

          riderRef.current?.setPosition({ lat: pos.lat, lng: pos.lng });
          riderRef.current?.setIcon(riderIcon(pos.heading));

          const doneCount = Math.max(
            2,
            Math.floor(progress * (pathRef.current.length - 1)) + 1,
          );
          routeDoneRef.current?.setPath(pathRef.current.slice(0, doneCount));

          map.panTo({ lat: pos.lat, lng: pos.lng });

          rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Map failed to load");
        }
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      routeAheadRef.current?.setMap(null);
      routeDoneRef.current?.setMap(null);
      riderRef.current?.setMap(null);
      pinRefs.current.forEach((m) => m.setMap(null));
      pinRefs.current = [];
      mapRef.current = null;
    };
  }, []);

  return (
    <div ref={wrapRef} className="hero-map-bg" aria-hidden>
      {!ready && !error && <div className="hero-map-loading">Loading route…</div>}
      {error && <div className="hero-map-fallback">{error}</div>}
    </div>
  );
}
