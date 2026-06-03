"use client";

import { useEffect, useRef } from "react";

/** Hero loop — 1 min clip from youtube.com/watch?v=_lpOE6_9Udk (from 12:28). */
const VIDEO_SRC = "/hero-bike-california.mp4";

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
  }, []);

  return (
    <div className="hero-video-bg" aria-hidden>
      <video
        ref={videoRef}
        className="hero-video-media"
        src={VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
    </div>
  );
}
