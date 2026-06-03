"use client";

import { useEffect, useRef } from "react";

type HeroMutedVideoProps = {
  src: string;
  className: string;
};

function lockSilent(video: HTMLVideoElement) {
  video.muted = true;
  video.volume = 0;
  video.setAttribute("muted", "");
}

/** Autoplay background clip — always silent, no playback controls. */
export function HeroMutedVideo({ src, className }: HeroMutedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    lockSilent(video);

    const onMediaEvent = () => lockSilent(video);
    const events = [
      "loadedmetadata",
      "loadeddata",
      "canplay",
      "play",
      "playing",
      "volumechange",
    ] as const;

    for (const event of events) {
      video.addEventListener(event, onMediaEvent);
    }

    video.play().catch(() => {});

    return () => {
      for (const event of events) {
        video.removeEventListener(event, onMediaEvent);
      }
    };
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
      preload="metadata"
      controls={false}
      controlsList="nodownload nofullscreen noremoteplayback"
      disablePictureInPicture
      disableRemotePlayback
      tabIndex={-1}
      aria-hidden
    />
  );
}
