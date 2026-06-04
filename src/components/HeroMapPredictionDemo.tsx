"use client";

import { useEffect, useState } from "react";

/** Self-timed loop — not tied to map video playback. */
const LOOP_SEC = 12;
const PAUSE_SEC = 5;
const REWARD_DELAY_SEC = 1.5;
const ANIM_LEN_SEC = LOOP_SEC - PAUSE_SEC;

type DemoVariant = "turn" | "pin";
type DemoPhase = "idle" | "countdown" | "call" | "loading" | "pin" | "success";
type CountNum = 3 | 2 | 1;

type DemoState = {
  visible: boolean;
  variant: DemoVariant;
  phase: DemoPhase;
  count: CountNum | null;
  pressed: boolean;
  loading: boolean;
  showOk: boolean;
  showReward: boolean;
  rewardLabel: string;
};

const IDLE: DemoState = {
  visible: false,
  variant: "turn",
  phase: "idle",
  count: null,
  pressed: false,
  loading: false,
  showOk: false,
  showReward: false,
  rewardLabel: "",
};

function phaseTurn(p: number): DemoState {
  const successStart = 5;

  if (p < 3) {
    const count = (3 - Math.min(2, Math.floor(p))) as CountNum;
    return {
      visible: true,
      variant: "turn",
      phase: "countdown",
      count,
      pressed: false,
      loading: false,
      showOk: false,
      showReward: false,
      rewardLabel: "+5 tokens",
    };
  }

  if (p < 4.5) {
    return {
      visible: true,
      variant: "turn",
      phase: "call",
      count: null,
      pressed: p >= 3.85,
      loading: false,
      showOk: false,
      showReward: false,
      rewardLabel: "+5 tokens",
    };
  }

  if (p < successStart) {
    return {
      visible: true,
      variant: "turn",
      phase: "loading",
      count: null,
      pressed: false,
      loading: true,
      showOk: false,
      showReward: false,
      rewardLabel: "+5 tokens",
    };
  }

  if (p < ANIM_LEN_SEC) {
    return {
      visible: true,
      variant: "turn",
      phase: "success",
      count: null,
      pressed: false,
      loading: false,
      showOk: true,
      showReward: p >= successStart + REWARD_DELAY_SEC,
      rewardLabel: "+5 tokens",
    };
  }

  return IDLE;
}

function phasePin(p: number): DemoState {
  const successStart = 4.5;

  if (p < 4) {
    return {
      visible: true,
      variant: "pin",
      phase: "pin",
      count: null,
      pressed: p >= 3.35,
      loading: false,
      showOk: false,
      showReward: false,
      rewardLabel: "+10 tokens",
    };
  }

  if (p < successStart) {
    return {
      visible: true,
      variant: "pin",
      phase: "loading",
      count: null,
      pressed: false,
      loading: true,
      showOk: false,
      showReward: false,
      rewardLabel: "+10 tokens",
    };
  }

  if (p < ANIM_LEN_SEC) {
    return {
      visible: true,
      variant: "pin",
      phase: "success",
      count: null,
      pressed: false,
      loading: false,
      showOk: true,
      showReward: p >= successStart + REWARD_DELAY_SEC,
      rewardLabel: "+10 tokens",
    };
  }

  return IDLE;
}

function phaseFromLoopTime(loopT: number): DemoState {
  const t = loopT % LOOP_SEC;

  if (t < PAUSE_SEC) return IDLE;

  const p = t - PAUSE_SEC;
  const cycle = Math.floor(loopT / LOOP_SEC);
  const variant: DemoVariant = cycle % 2 === 0 ? "turn" : "pin";

  return variant === "turn" ? phaseTurn(p) : phasePin(p);
}

/** Map call demo on its own 12s loop. Decorative only. */
export function HeroMapPredictionDemo() {
  const [state, setState] = useState<DemoState>(IDLE);

  useEffect(() => {
    const startedAt = performance.now();
    let raf = 0;

    const tick = () => {
      const loopT = (performance.now() - startedAt) / 1000;
      setState(phaseFromLoopTime(loopT));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const {
    visible,
    variant,
    phase,
    count,
    pressed,
    loading,
    showOk,
    showReward,
    rewardLabel,
  } = state;

  return (
    <div
      className={`hero-map-demo${visible ? " is-visible" : ""}`}
      data-phase={phase}
      data-variant={variant}
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

      <div className={`hero-map-demo-pin${phase === "pin" ? " is-on" : ""}`}>
        <span className="hero-map-demo-pin-label">Time to pin</span>
        <span className={`hero-map-demo-btn${pressed ? " is-pressed" : ""}`}>
          <span className="hero-map-demo-btn-inner">
            <span className="hero-map-demo-btn-label">&lt; 34 sec</span>
          </span>
        </span>
      </div>

      <div className={`hero-map-demo-actions${phase === "call" ? " is-on" : ""}`}>
        <span className={`hero-map-demo-btn${pressed ? " is-pressed" : ""}`}>
          <span className="hero-map-demo-btn-inner">
            <span className="hero-map-demo-call-icon" aria-hidden>
              ↰
            </span>
            <span className="hero-map-demo-btn-label">Turn left</span>
          </span>
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
          {rewardLabel}
        </span>
      </div>
    </div>
  );
}
