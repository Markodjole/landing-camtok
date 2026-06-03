"use client";

import { useEffect, useRef } from "react";

type HeroMutedVideoProps = {
  src: string;
  className: string;
};

/** Autoplay background clip — always silent, no playback controls. */
export function HeroMutedVideo({ src, className }: HeroMutedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const enforceMute = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
    };

    enforceMute();
    video.play().catch(() => {});

    video.addEventListener("volumechange", enforceMute);
    return () => video.removeEventListener("volumechange", enforceMute);
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      controls={false}
      controlsList="nodownload nofullscreen noremoteplayback"
      disablePictureInPicture
      disableRemotePlayback
      tabIndex={-1}
      aria-hidden
    />
  );
}
