"use client";

import { useEffect, useRef } from "react";

const ANIM_START_SEC = 10;
const ANIM_LEN_SEC = 2;

/** Subtle map hint synced once per video loop. Decorative only. */
export function HeroMapPredictionDemo() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = rootRef.current?.closest(".hero-bottom-panel");
    const video = panel?.querySelector("video");
    if (!video) return;

    let raf = 0;

    const tick = () => {
      const el = rootRef.current;
      if (!el) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const dotEls = el.querySelectorAll<HTMLElement>(".hero-map-demo-dot");
      const t = video.currentTime;
      const inWindow =
        t >= ANIM_START_SEC && t < ANIM_START_SEC + ANIM_LEN_SEC - 0.04;

      if (!inWindow) {
        el.style.opacity = "0";
        el.dataset.step = "idle";
        el.style.setProperty("--press", "0");
        el.style.setProperty("--ok", "0");
        dotEls.forEach((dot) => {
          dot.style.transform = "scale(0.8)";
          dot.style.background = "rgba(255, 255, 255, 0.12)";
        });
        raf = requestAnimationFrame(tick);
        return;
      }

      const p = (t - ANIM_START_SEC) / ANIM_LEN_SEC;
      el.style.opacity = "0.22";

      if (p < 0.55) {
        el.dataset.step = "countdown";
        el.style.setProperty("--press", "0");
        el.style.setProperty("--ok", "0");
        const active = Math.min(2, Math.floor(p / 0.18));
        dotEls.forEach((dot, i) => {
          const on = i === active;
          dot.style.transform = on ? "scale(1.15)" : "scale(0.78)";
          dot.style.background = on
            ? "rgba(109, 255, 0, 0.38)"
            : "rgba(255, 255, 255, 0.12)";
        });
      } else if (p < 0.78) {
        el.dataset.step = "press";
        el.style.setProperty("--ok", "0");
        const press = Math.min(1, (p - 0.55) / 0.14);
        el.style.setProperty("--press", String(press));
      } else {
        el.dataset.step = "success";
        el.style.setProperty("--press", "0");
        el.style.setProperty("--ok", String(Math.min(1, (p - 0.78) / 0.16)));
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={rootRef} className="hero-map-demo" data-step="idle" aria-hidden>
      <div className="hero-map-demo-dots">
        <span className="hero-map-demo-dot" />
        <span className="hero-map-demo-dot" />
        <span className="hero-map-demo-dot" />
      </div>
      <div className="hero-map-demo-hit" aria-hidden>
        <svg viewBox="0 0 24 24" className="hero-map-demo-chevron">
          <path
            d="M9 7l5 5-5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <svg viewBox="0 0 32 32" className="hero-map-demo-ok" aria-hidden>
        <path
          d="M9 16l4.5 4.5L23 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
