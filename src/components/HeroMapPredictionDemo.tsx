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
  pressed: boolean;
  loading: boolean;
  showOk: boolean;
} {
  if (loopT < ANIM_START_SEC) {
    return {
      visible: false,
      phase: "idle",
      count: null,
      pressed: false,
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
      pressed: false,
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
      pressed: false,
      loading: false,
      showOk: false,
    };
  }

  if (p < 4.65) {
    return {
      visible: true,
      phase: "call",
      count: null,
      pressed: p >= 4.1,
      loading: false,
      showOk: false,
    };
  }

  if (p < 5.15) {
    return {
      visible: true,
      phase: "loading",
      count: null,
      pressed: false,
      loading: true,
      showOk: false,
    };
  }

  return {
    visible: true,
    phase: "success",
    count: null,
    pressed: false,
    loading: false,
    showOk: true,
  };
}

/** Map call demo synced once per video loop. Decorative only. */
export function HeroMapPredictionDemo({ videoRef }: HeroMapPredictionDemoProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [count, setCount] = useState<CountNum | null>(null);
  const [pressed, setPressed] = useState(false);
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
      setPressed(next.pressed);
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

      <div className={`hero-map-demo-actions${phase === "call" ? " is-on" : ""}`}>
        <span className={`hero-map-demo-btn${pressed ? " is-pressed" : ""}`}>
          <svg viewBox="0 0 24 24" className="hero-map-demo-btn-arrow" aria-hidden>
            <path
              d="M14 7l-5 5 5 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Turn left
        </span>
      </div>

      <div className={`hero-map-demo-loading${loading ? " is-on" : ""}`} aria-hidden>
        <span className="hero-map-demo-spinner" />
      </div>

      <div className={`hero-map-demo-result${showOk ? " is-on" : ""}`} aria-hidden>
        <svg viewBox="0 0 52 52" className="hero-map-demo-ok">
          <circle className="hero-map-demo-ok-ring" cx="26" cy="26" r="22" />
          <path
            className="hero-map-demo-ok-mark"
            d="M14 27l8 8 16-18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="hero-map-demo-reward">+5 tokens</span>
      </div>
    </div>
  );
}
