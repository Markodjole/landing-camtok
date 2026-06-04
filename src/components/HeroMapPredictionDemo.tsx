"use client";

import { useEffect, useState } from "react";

/** Self-timed loop — not tied to map video playback. */
const LOOP_SEC = 12;
const PAUSE_SEC = 3.5;
const REWARD_DELAY_SEC = 0.45;
const ANIM_LEN_SEC = LOOP_SEC - PAUSE_SEC;

/** Shared segment boundaries (seconds into the active window). */
const INTRO_END = 3;
const ACTION_END = 5;
const LOADING_END = 6.9;
const SUCCESS_END = ANIM_LEN_SEC;
const OK_AT = LOADING_END;
const REWARD_AT = OK_AT + REWARD_DELAY_SEC;

type DemoVariant = "turn" | "pin";
type DemoPhase = "idle" | "countdown" | "call" | "loading" | "pin" | "success";
type CountNum = 3 | 2 | 1;
type PinBtnSec = 34 | 33;

type DemoState = {
  visible: boolean;
  variant: DemoVariant;
  phase: DemoPhase;
  count: CountNum | null;
  pinBtnSec: PinBtnSec | null;
  showPinLabel: boolean;
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
  pinBtnSec: null,
  showPinLabel: false,
  pressed: false,
  loading: false,
  showOk: false,
  showReward: false,
  rewardLabel: "",
};

function phaseForVariant(p: number, variant: DemoVariant): DemoState {
  const rewardLabel = variant === "turn" ? "+5 tokens" : "+10 tokens";

  if (p < INTRO_END) {
    if (variant === "turn") {
      const count = (3 - Math.min(2, Math.floor(p))) as CountNum;
      return {
        visible: true,
        variant,
        phase: "countdown",
        count,
        pinBtnSec: null,
        showPinLabel: false,
        pressed: false,
        loading: false,
        showOk: false,
        showReward: false,
        rewardLabel,
      };
    }

    const pinBtnSec: PinBtnSec | null = p < 1 ? 34 : p < 2 ? 33 : null;
    return {
      visible: true,
      variant,
      phase: "pin",
      count: null,
      pinBtnSec,
      showPinLabel: p >= 2,
      pressed: false,
      loading: false,
      showOk: false,
      showReward: false,
      rewardLabel,
    };
  }

  if (p < ACTION_END) {
    if (variant === "turn") {
      return {
        visible: true,
        variant,
        phase: "call",
        count: null,
        pinBtnSec: null,
        showPinLabel: false,
        pressed: p >= 4.35,
        loading: false,
        showOk: false,
        showReward: false,
        rewardLabel,
      };
    }
    return {
      visible: true,
      variant,
      phase: "pin",
      count: null,
      pinBtnSec: null,
      showPinLabel: true,
      pressed: p >= 4.35,
      loading: false,
      showOk: false,
      showReward: false,
      rewardLabel,
    };
  }

  if (p < LOADING_END) {
    return {
      visible: true,
      variant,
      phase: "loading",
      count: null,
      pinBtnSec: null,
      showPinLabel: false,
      pressed: false,
      loading: true,
      showOk: false,
      showReward: false,
      rewardLabel,
    };
  }

  if (p < SUCCESS_END) {
    return {
      visible: true,
      variant,
      phase: "success",
      count: null,
      pinBtnSec: null,
      showPinLabel: false,
      pressed: false,
      loading: false,
      showOk: p >= OK_AT,
      showReward: p >= REWARD_AT,
      rewardLabel,
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

  return phaseForVariant(p, variant);
}

function pinButtonLabel(pinBtnSec: PinBtnSec | null): string {
  if (pinBtnSec != null) return `< ${pinBtnSec} sec`;
  return "< 34 sec";
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
    pinBtnSec,
    showPinLabel,
    pressed,
    loading,
    showOk,
    showReward,
    rewardLabel,
  } = state;

  const pinOn = variant === "pin" && (phase === "pin" || phase === "countdown");

  return (
    <div
      className={`hero-map-demo${visible ? " is-visible" : ""}`}
      data-phase={phase}
      data-variant={variant}
      aria-hidden
    >
      <div
        className={`hero-map-demo-countdown${count != null ? " is-on" : ""}`}
      >
        {([3, 2, 1] as const).map((n) => (
          <span
            key={n}
            className={`hero-map-demo-num${count === n ? " is-lit" : ""}`}
          >
            {n}
          </span>
        ))}
      </div>

      <div className={`hero-map-demo-pin${pinOn ? " is-on" : ""}`}>
        <span
          className={`hero-map-demo-pin-label${showPinLabel ? " is-on" : ""}`}
        >
          Time to pin
        </span>
        <span className={`hero-map-demo-btn${pressed ? " is-pressed" : ""}`}>
          <span className="hero-map-demo-btn-inner">
            <span className="hero-map-demo-btn-label">
              {pinButtonLabel(pinBtnSec)}
            </span>
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
