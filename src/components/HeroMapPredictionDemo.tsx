"use client";

/** Looping prediction demo over the hero map panel. Decorative only. */
export function HeroMapPredictionDemo() {
  return (
    <div className="hero-map-demo" aria-hidden>
      <div className="hero-map-demo-card">
        <div className="hero-map-demo-ring" aria-hidden>
          <svg viewBox="0 0 80 80" className="hero-map-demo-ring-svg">
            <circle className="hero-map-demo-ring-track" cx="40" cy="40" r="34" />
            <circle className="hero-map-demo-ring-progress" cx="40" cy="40" r="34" />
          </svg>
        </div>

        <div className="hero-map-demo-countdown">
          <span className="hero-map-demo-num hero-map-demo-num-3">3</span>
          <span className="hero-map-demo-num hero-map-demo-num-2">2</span>
          <span className="hero-map-demo-num hero-map-demo-num-1">1</span>
        </div>

        <div className="hero-map-demo-call">
          <p className="hero-map-demo-kicker">Next turn</p>
          <div className="hero-map-demo-actions">
            <span className="hero-map-demo-option">Left</span>
            <span className="hero-map-demo-option hero-map-demo-option-active">
              Right
            </span>
            <span className="hero-map-demo-option">Straight</span>
          </div>
          <div className="hero-map-demo-press">
            <span className="hero-map-demo-btn">Right</span>
            <span className="hero-map-demo-ripple" aria-hidden />
          </div>
        </div>

        <div className="hero-map-demo-success">
          <div className="hero-map-demo-check-wrap">
            <svg viewBox="0 0 52 52" className="hero-map-demo-check-svg" aria-hidden>
              <circle className="hero-map-demo-check-circle" cx="26" cy="26" r="23" />
              <path
                className="hero-map-demo-check-mark"
                d="M15 27l7 7 15-16"
                fill="none"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="hero-map-demo-success-title">Correct</p>
          <p className="hero-map-demo-success-sub">Right at the junction</p>
        </div>
      </div>
    </div>
  );
}
