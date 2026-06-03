"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type Ref,
} from "react";

type HeroMutedVideoProps = {
  src: string;
  className: string;
};

function lockSilent(video: HTMLVideoElement) {
  video.muted = true;
  video.volume = 0;
  video.setAttribute("muted", "");
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

/** Autoplay background clip — always silent, no playback controls. */
export const HeroMutedVideo = forwardRef<HTMLVideoElement, HeroMutedVideoProps>(
  function HeroMutedVideo({ src, className }, forwardedRef) {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const setVideoRef = useCallback(
      (node: HTMLVideoElement | null) => {
        videoRef.current = node;
        assignRef(forwardedRef, node);
      },
      [forwardedRef],
    );

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
        ref={setVideoRef}
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
  },
);
