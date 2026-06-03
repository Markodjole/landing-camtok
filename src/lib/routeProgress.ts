import type { LatLng } from "./decodeGooglePolyline";

export type RouteProgress = {
  lat: number;
  lng: number;
  heading: number;
};

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function haversineM(a: LatLng, b: LatLng) {
  const r = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

function bearing(a: LatLng, b: LatLng) {
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/** 0–1 progress along a polyline by distance. */
export function pointAtRouteProgress(
  path: LatLng[],
  progress: number,
): RouteProgress {
  if (path.length === 0) return { lat: 0, lng: 0, heading: 0 };
  if (path.length === 1) return { ...path[0]!, heading: 0 };

  const clamped = Math.max(0, Math.min(1, progress));
  const segments: Array<{ a: LatLng; b: LatLng; len: number }> = [];
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]!;
    const b = path[i + 1]!;
    const len = haversineM(a, b);
    segments.push({ a, b, len });
    total += len;
  }
  if (total === 0) return { ...path[0]!, heading: 0 };

  let remaining = clamped * total;
  for (const seg of segments) {
    if (remaining <= seg.len || seg === segments[segments.length - 1]) {
      const t = seg.len === 0 ? 0 : remaining / seg.len;
      const lat = seg.a.lat + (seg.b.lat - seg.a.lat) * t;
      const lng = seg.a.lng + (seg.b.lng - seg.a.lng) * t;
      return { lat, lng, heading: bearing(seg.a, seg.b) };
    }
    remaining -= seg.len;
  }

  const last = path[path.length - 1]!;
  const prev = path[path.length - 2]!;
  return { ...last, heading: bearing(prev, last) };
}
