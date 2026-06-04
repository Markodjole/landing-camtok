"use client";

import { useRef } from "react";
import { HeroMapPredictionDemo } from "@/components/HeroMapPredictionDemo";
import { HeroMutedVideo } from "@/components/HeroMutedVideo";

const MAP_VIDEO_SRC = "/hero-map.mp4";

type HeroBottomPanelProps = {
  title: React.ReactNode;
};

export function HeroBottomPanel({ title }: HeroBottomPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="hero-bottom-panel">
      <div className="hero-map-bg" aria-hidden>
        <HeroMutedVideo
          ref={videoRef}
          src={MAP_VIDEO_SRC}
          className="hero-map-media"
        />
      </div>
      <HeroMapPredictionDemo />
      <div className="hero-bottom-content">
        <h1 className="hero-title-bottom">{title}</h1>
      </div>
    </div>
  );
}
