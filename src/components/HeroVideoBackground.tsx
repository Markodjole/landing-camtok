"use client";

import { useEffect, useRef } from "react";

/** Mixkit — following a bike through busy city streets (free license). */
const VIDEO_SRC = "/hero-bike-california.mp4";

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
  }, []);

  return (
    <div className="hero-video-bg" aria-hidden data-label="Live ride">
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
