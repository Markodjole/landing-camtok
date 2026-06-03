"use client";

import { HeroMutedVideo } from "@/components/HeroMutedVideo";

/** Hero loop — 1 min clip from youtube.com/watch?v=_lpOE6_9Udk (from 12:28). */
const VIDEO_SRC = "/hero-bike-california.mp4";

export function HeroVideoBackground() {
  return (
    <div className="hero-video-bg" aria-hidden>
      <HeroMutedVideo src={VIDEO_SRC} className="hero-video-media" />
    </div>
  );
}
