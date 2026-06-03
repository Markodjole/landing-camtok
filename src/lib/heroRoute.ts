export const HERO_ORIGIN = { lat: 40.7234, lng: -74.003 };
export const HERO_DESTINATION = { lat: 40.7536, lng: -73.9832 };

export type LatLng = { lat: number; lng: number };

export const HERO_PIN_STOPS: Array<{
  progress: number;
  kind: "bet" | "turn" | "zone";
}> = [
  { progress: 0.22, kind: "turn" },
  { progress: 0.48, kind: "zone" },
  { progress: 0.72, kind: "bet" },
];
