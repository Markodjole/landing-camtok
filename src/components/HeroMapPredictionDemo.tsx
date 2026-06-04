"use client";

import { useEffect, useState } from "react";

/** Self-timed loop — not tied to map video playback. */
const LOOP_SEC = 12;
const PAUSE_SEC = 5;
const REWARD_DELAY_SEC = 1.5;
const ANIM_LEN_SEC = LOOP_SEC - PAUSE_SEC;

type DemoPhase = "idle" | "countdown" | "call" | "loading" | "success";
type CountNum = 3 | 2 | 1;

function phaseFromLoopTime(loopT: number): {
  visible: boolean;
  phase: DemoPhase;
  count: CountNum | null;
  pressed: boolean;
  loading: boolean;
  showOk: boolean;
  showReward: boolean;
} {
  const t = loopT % LOOP_SEC;

  if (t < PAUSE_SEC) {
    return {
      visible: false,
      phase: "idle",
      count: null,
      pressed: false,
      loading: false,
      showOk: false,
      showReward: false,
    };
  }

  const p = t - PAUSE_SEC;
  const successStart = 5;

  if (p < 3) {
    const count = (3 - Math.min(2, Math.floor(p))) as CountNum;
    return {
      visible: true,
      phase: "countdown",
      count,
      pressed: false,
      loading: false,
      showOk: false,
      showReward: false,
    };
  }

  if (p < 4.5) {
    return {
      visible: true,
      phase: "call",
      count: null,
      pressed: p >= 3.85,
      loading: false,
      showOk: false,
      showReward: false,
    };
  }

  if (p < successStart) {
    return {
      visible: true,
      phase: "loading",
      count: null,
      pressed: false,
      loading: true,
      showOk: false,
      showReward: false,
    };
  }

  if (p < ANIM_LEN_SEC) {
    return {
      visible: true,
      phase: "success",
      count: null,
      pressed: false,
      loading: false,
      showOk: true,
      showReward: p >= successStart + REWARD_DELAY_SEC,
    };
  }

  return {
    visible: false,
    phase: "idle",
    count: null,
    pressed: false,
    loading: false,
    showOk: false,
    showReward: false,
  };
}

/** Map call demo on its own 12s loop. Decorative only. */
export function HeroMapPredictionDemo() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [count, setCount] = useState<CountNum | null>(null);
  const [pressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOk, setShowOk] = useState(false);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    const startedAt = performance.now();
    let raf = 0;

    const tick = () => {
      const loopT = (performance.now() - startedAt) / 1000;
      const next = phaseFromLoopTime(loopT);
      setVisible(next.visible);
      setPhase(next.phase);
      setCount(next.count);
      setPressed(next.pressed);
      setLoading(next.loading);
      setShowOk(next.showOk);
      setShowReward(next.showReward);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

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
          <span className="hero-map-demo-btn-label">Turn left</span>
        </span>
      </div>

      <div className={`hero-map-demo-loading${loading ? " is-on" : ""}`} aria-hidden>
        <span className="hero-map-demo-spinner" />
      </div>

      <div className={`hero-map-demo-result${showOk ? " is-on" : ""}`} aria-hidden>
        <svg
          viewBox="0 0 52 52"
          className={`hero-map-demo-ok${showOk ? " is-on" : ""}`}
        >
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
        <span className={`hero-map-demo-reward${showReward ? " is-on" : ""}`}>
          +5 tokens
        </span>
      </div>
    </div>
  );
}
