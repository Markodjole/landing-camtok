import { NextResponse } from "next/server";
import { decodeGooglePolyline } from "@/lib/decodeGooglePolyline";
import { HERO_DESTINATION, HERO_ORIGIN } from "@/lib/heroRoute";

async function googleRoute(apiKey: string) {
  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set("origin", `${HERO_ORIGIN.lat},${HERO_ORIGIN.lng}`);
  url.searchParams.set("destination", `${HERO_DESTINATION.lat},${HERO_DESTINATION.lng}`);
  url.searchParams.set("mode", "bicycling");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    status?: string;
    routes?: Array<{ overview_polyline?: { points?: string } }>;
  };

  const encoded = data.routes?.[0]?.overview_polyline?.points;
  if (data.status !== "OK" || !encoded) return null;

  return decodeGooglePolyline(encoded);
}

async function osrmRoute() {
  const coords = `${HERO_ORIGIN.lng},${HERO_ORIGIN.lat};${HERO_DESTINATION.lng},${HERO_DESTINATION.lat}`;
  const url = `https://router.project-osrm.org/route/v1/bicycle/${coords}?overview=full&geometries=geojson`;

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    routes?: Array<{ geometry?: { coordinates?: Array<[number, number]> } }>;
  };

  const coordinates = data.routes?.[0]?.geometry?.coordinates;
  if (!coordinates?.length) return null;

  return coordinates.map(([lng, lat]) => ({ lat, lng }));
}

export async function GET() {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
    "";

  let path = apiKey ? await googleRoute(apiKey) : null;
  let source: "google" | "osrm" = "google";

  if (!path?.length) {
    path = await osrmRoute();
    source = "osrm";
  }

  if (!path?.length) {
    return NextResponse.json({ error: "No route found" }, { status: 502 });
  }

  return NextResponse.json({ path, source });
}
