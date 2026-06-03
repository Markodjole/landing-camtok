"use client";

import { useEffect, useState, type RefObject } from "react";

const LOOP_SEC = 12;
const ANIM_START_SEC = 6;

type DemoPhase = "idle" | "countdown" | "call" | "loading" | "success";
type CountNum = 3 | 2 | 1;

type HeroMapPredictionDemoProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
};

function phaseFromTime(loopT: number): {
  visible: boolean;
  phase: DemoPhase;
  count: CountNum | null;
  callLit: boolean;
  loading: boolean;
  showOk: boolean;
} {
  if (loopT < ANIM_START_SEC) {
    return {
      visible: false,
      phase: "idle",
      count: null,
      callLit: false,
      loading: false,
      showOk: false,
    };
  }

  const p = loopT - ANIM_START_SEC;
  const animEnd = LOOP_SEC - ANIM_START_SEC - 0.06;

  if (p >= animEnd) {
    return {
      visible: false,
      phase: "idle",
      count: null,
      callLit: false,
      loading: false,
      showOk: false,
    };
  }

  if (p < 3) {
    const count = (3 - Math.min(2, Math.floor(p))) as CountNum;
    return {
      visible: true,
      phase: "countdown",
      count,
      callLit: false,
      loading: false,
      showOk: false,
    };
  }

  if (p < 5.4) {
    return {
      visible: true,
      phase: "call",
      count: null,
      callLit: p >= 4.15,
      loading: false,
      showOk: false,
    };
  }

  if (p < 6.35) {
    return {
      visible: true,
      phase: "loading",
      count: null,
      callLit: false,
      loading: true,
      showOk: false,
    };
  }

  return {
    visible: true,
    phase: "success",
    count: null,
    callLit: false,
    loading: false,
    showOk: true,
  };
}

/** Subtle map hint synced once per video loop. Decorative only. */
export function HeroMapPredictionDemo({ videoRef }: HeroMapPredictionDemoProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [count, setCount] = useState<CountNum | null>(null);
  const [callLit, setCallLit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOk, setShowOk] = useState(false);

  useEffect(() => {
    let raf = 0;
    let fallbackStart = performance.now();

    const apply = (loopT: number) => {
      const next = phaseFromTime(loopT);
      setVisible(next.visible);
      setPhase(next.phase);
      setCount(next.count);
      setCallLit(next.callLit);
      setLoading(next.loading);
      setShowOk(next.showOk);
    };

    const tick = () => {
      const video = videoRef.current;

      if (video && video.readyState >= 2 && !video.paused && video.currentTime > 0.05) {
        const dur = video.duration;
        const loop =
          Number.isFinite(dur) && dur > 0
            ? video.currentTime % dur
            : video.currentTime % LOOP_SEC;
        apply(loop);
      } else {
        const elapsed = (performance.now() - fallbackStart) / 1000;
        apply(elapsed % LOOP_SEC);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [videoRef]);

  return (
    <div
      className={`hero-map-demo${visible ? " is-visible" : ""}`}
      data-phase={phase}
      aria-hidden
    >
      <div className="hero-map-demo-countdown">
        {([3, 2, 1] as const).map((n) => (
          <span
            key={n}
            className={`hero-map-demo-num${count === n ? " is-lit" : ""}`}
          >
            {n}
          </span>
        ))}
      </div>

      <p className={`hero-map-demo-call${phase === "call" ? " is-on" : ""}`}>
        <span className={`hero-map-demo-call-text${callLit ? " is-lit" : ""}`}>
          Turn left
        </span>
      </p>

      <div className={`hero-map-demo-loading${loading ? " is-on" : ""}`} aria-hidden>
        <span className="hero-map-demo-spinner" />
      </div>

      <svg
        viewBox="0 0 32 32"
        className={`hero-map-demo-ok${showOk ? " is-on" : ""}`}
        aria-hidden
      >
        <circle className="hero-map-demo-ok-ring" cx="16" cy="16" r="13" />
        <path
          className="hero-map-demo-ok-mark"
          d="M9 16l4.5 4.5L23 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
