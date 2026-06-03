"use client";

import { useEffect, useState, type RefObject } from "react";

const LOOP_SEC = 12;
const ANIM_START_SEC = 6;

type DemoPhase = "idle" | "countdown" | "press" | "success";
type CountNum = 3 | 2 | 1;

type HeroMapPredictionDemoProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
};

function phaseFromTime(loopT: number): {
  visible: boolean;
  phase: DemoPhase;
  count: CountNum | null;
  pressed: boolean;
  showOk: boolean;
  ringProgress: number;
} {
  if (loopT < ANIM_START_SEC) {
    return {
      visible: false,
      phase: "idle",
      count: null,
      pressed: false,
      showOk: false,
      ringProgress: 0,
    };
  }

  const p = loopT - ANIM_START_SEC;
  const animLen = LOOP_SEC - ANIM_START_SEC;

  if (p < 1.85) {
    const count: CountNum = p < 0.62 ? 3 : p < 1.24 ? 2 : 1;
    return {
      visible: true,
      phase: "countdown",
      count,
      pressed: false,
      showOk: false,
      ringProgress: Math.min(1, p / 1.85),
    };
  }

  if (p < 3.35) {
    const pressT = p - 1.85;
    return {
      visible: true,
      phase: "press",
      count: null,
      pressed: pressT > 0.35,
      showOk: false,
      ringProgress: 1,
    };
  }

  if (p < animLen - 0.08) {
    return {
      visible: true,
      phase: "success",
      count: null,
      pressed: false,
      showOk: true,
      ringProgress: 1,
    };
  }

  return {
    visible: false,
    phase: "idle",
    count: null,
    pressed: false,
    showOk: false,
    ringProgress: 0,
  };
}

/** Prediction demo synced once per map video loop. Decorative only. */
export function HeroMapPredictionDemo({ videoRef }: HeroMapPredictionDemoProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [count, setCount] = useState<CountNum | null>(null);
  const [pressed, setPressed] = useState(false);
  const [showOk, setShowOk] = useState(false);
  const [ringProgress, setRingProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    let fallbackStart = performance.now();

    const apply = (loopT: number) => {
      const next = phaseFromTime(loopT);
      setVisible(next.visible);
      setPhase(next.phase);
      setCount(next.count);
      setPressed(next.pressed);
      setShowOk(next.showOk);
      setRingProgress(next.ringProgress);
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

  const ringOffset = 213.6 * (1 - ringProgress);

  return (
    <div
      className={`hero-map-demo${visible ? " is-visible" : ""}`}
      data-phase={phase}
      aria-hidden
    >
      <div className="hero-map-demo-card">
        <div
          className={`hero-map-demo-ring${phase === "countdown" ? " is-on" : ""}`}
          aria-hidden
        >
          <svg viewBox="0 0 80 80" className="hero-map-demo-ring-svg">
            <circle className="hero-map-demo-ring-track" cx="40" cy="40" r="34" />
            <circle
              className="hero-map-demo-ring-progress"
              cx="40"
              cy="40"
              r="34"
              style={{ strokeDashoffset: ringOffset }}
            />
          </svg>
        </div>

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

        <div className={`hero-map-demo-call${phase === "press" ? " is-on" : ""}`}>
          <div className="hero-map-demo-press">
            <span className={`hero-map-demo-btn${pressed ? " is-pressed" : ""}`}>
              Right
            </span>
            <span
              className={`hero-map-demo-ripple${pressed ? " is-on" : ""}`}
              aria-hidden
            />
          </div>
        </div>

        <div
          className={`hero-map-demo-success${phase === "success" && showOk ? " is-on" : ""}`}
        >
          <div className="hero-map-demo-check-wrap">
            <svg viewBox="0 0 52 52" className="hero-map-demo-check-svg" aria-hidden>
              <circle
                className={`hero-map-demo-check-circle${showOk ? " is-on" : ""}`}
                cx="26"
                cy="26"
                r="23"
              />
              <path
                className={`hero-map-demo-check-mark${showOk ? " is-on" : ""}`}
                d="M15 27l7 7 15-16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
