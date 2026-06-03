"use client";

import { useEffect, useRef } from "react";

/** Map panel loop — middle third crop from youtube.com/shorts/imtgCUDuKNM. */
const VIDEO_SRC = "/hero-map.mp4";

export function HeroMapBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
  }, []);

  return (
    <div className="hero-map-bg" aria-hidden>
      <video
        ref={videoRef}
        className="hero-map-media"
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
