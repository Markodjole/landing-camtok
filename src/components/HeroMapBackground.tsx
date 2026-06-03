"use client";

import { HeroMutedVideo } from "@/components/HeroMutedVideo";

/** Map panel loop — middle third crop from youtube.com/shorts/imtgCUDuKNM. */
const VIDEO_SRC = "/hero-map.mp4";

export function HeroMapBackground() {
  return (
    <div className="hero-map-bg" aria-hidden>
      <HeroMutedVideo src={VIDEO_SRC} className="hero-map-media" />
    </div>
  );
}
