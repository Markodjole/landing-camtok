import Image from "next/image";
import { ContactForm, NavBar, WaitlistForm } from "@/components/landing-client";
import { HeroMapBackground } from "@/components/HeroMapBackground";
import { HeroMapPredictionDemo } from "@/components/HeroMapPredictionDemo";
import { HeroVideoBackground } from "@/components/HeroVideoBackground";

export default function HomePage() {
  return (
    <>
      <NavBar />

      <main>
        <section className="hero">
          <div className="hero-glow purple" aria-hidden />
          <div className="hero-glow green" aria-hidden />
          <div className="hero-grid" aria-hidden />

          <div className="container hero-content">
            <div className="hero-copy">
              <div className="hero-copy-inner">
              <div className="hero-badge">
                <span className="hero-badge-dot" aria-hidden />
                Live city prediction game
              </div>
              <div className="hero-media-stack">
                <div className="hero-line hero-line-video">
                  <HeroVideoBackground />
                  <h1 className="hero-title-top">Watch the drive.</h1>
                </div>
                <div className="hero-bottom-panel">
                  <HeroMapBackground />
                  <HeroMapPredictionDemo />
                  <div className="hero-bottom-content">
                    <h1 className="hero-title-bottom">
                      <span>Call the next move.</span>
                    </h1>
                  </div>
                </div>
              </div>
              <p className="hero-lead">
                Crosstown is live POV prediction gaming. Real drivers, real
                streets, real-time GPS. Watch the stream, read the map, and call
                the next turn, zone, or route before it happens.
              </p>
              <div className="hero-actions">
                <a href="#early-access" className="btn-primary">
                  Join the waitlist
                </a>
                <a href="#how-it-works" className="btn-secondary">
                  How it works
                </a>
              </div>
              </div>
            </div>

            <div className="hero-logo-wrap">
              <div className="hero-logo-web" aria-hidden />
              <Image
                src="/crosstown-logo.png"
                alt="Crosstown"
                width={1024}
                height={269}
                priority
                className="hero-logo"
              />
            </div>
          </div>
        </section>

        <section id="how-it-works">
          <div className="container">
            <p className="section-label">How it works</p>
            <h2 className="section-title">Three steps. Zero scripts.</h2>
            <p className="section-lead">
              Every round is tied to live GPS and a shared room timeline, so
              calls lock before the outcome, and everyone sees the same truth.
            </p>

            <div className="steps">
              <article className="step">
                <div className="step-num">1</div>
                <h3>Watch live</h3>
                <p>
                  Join a live room. POV stream on top, map below. See where the
                  driver is heading in real time.
                </p>
              </article>
              <article className="step">
                <div className="step-num">2</div>
                <h3>Pick your call</h3>
                <p>
                  Left or right at the next junction? Which zone comes next?
                  How many straight crossroads? Lock in your call before the
                  window closes.
                </p>
              </article>
              <article className="step">
                <div className="step-num">3</div>
                <h3>Win on the move</h3>
                <p>
                  The route reveals the answer. Correct predictions score the
                  round. Skill beats luck when you read the city.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="predictions">
          <div className="container">
            <p className="section-label">What you predict</p>
            <h2 className="section-title">Calls built for the road</h2>
            <p className="section-lead">
              Not random clips. Live route-state prompts generated from GPS,
              grid zones, and upcoming decisions on the map.
            </p>

            <div className="call-grid">
              <article className="call-card">
                <div className="call-icon" aria-hidden>
                  ↰
                </div>
                <h3>Next turn</h3>
                <p>
                  Will they go left, right, or straight at the upcoming
                  junction?
                </p>
              </article>
              <article className="call-card">
                <div className="call-icon" aria-hidden>
                  ▦
                </div>
                <h3>Next zone</h3>
                <p>
                  Which city grid cell do they enter next, before they cross
                  the border?
                </p>
              </article>
              <article className="call-card">
                <div className="call-icon" aria-hidden>
                  ═
                </div>
                <h3>Straight streak</h3>
                <p>
                  How many crossroads in a row without turning? Count the
                  straight run.
                </p>
              </article>
              <article className="call-card">
                <div className="call-icon" aria-hidden>
                  ◎
                </div>
                <h3>Next step</h3>
                <p>
                  Predict the next maneuver on the route. A marker drops on the
                  map when the round opens.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section>
          <div className="container">
            <div className="features">
              <div className="feature">
                <h3>Live WebRTC stream</h3>
                <p>
                  Real POV feed from the driver&apos;s phone, not pre-recorded
                  video.
                </p>
              </div>
              <div className="feature">
                <h3>GPS-fair rounds</h3>
                <p>
                  Calls lock with distance rules. Outcomes settle from movement,
                  not opinions.
                </p>
              </div>
              <div className="feature">
                <h3>Map + video overlay</h3>
                <p>
                  See pins and zone signs inside the stream. The city becomes
                  the game board.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="early-access" className="cta-section">
          <div className="container">
            <div className="cta-box">
              <h2>Be first on Crosstown</h2>
              <p>
                We&apos;re opening live rooms city by city. Drop your email for
                early access at playcrosstown.com.
              </p>
              <WaitlistForm />
              <p className="cta-note">Drivers &amp; viewers welcome. No spam.</p>
            </div>
          </div>
        </section>

        <section id="for-you" className="for-you-section">
          <div className="container">
            <p className="section-label">Who it&apos;s for</p>
            <h2 className="section-title">Watch and predict, drive, or partner</h2>
            <p className="section-lead">
              Crosstown is a live room around a real drive, not a highlight reel.
              Pick the lane that fits you.
            </p>
            <div className="for-you-grid">
              <article className="for-you-card">
                <h3>Viewers</h3>
                <p>
                  Follow the POV stream and map, read the next junction, and
                  lock in your call before the window closes. Every outcome
                  settles from GPS.
                </p>
              </article>
              <article className="for-you-card">
                <h3>Drivers</h3>
                <p>
                  Stream from your phone, keep driving normally, and let viewers
                  predict your next moves. Early rooms opening city by city.
                </p>
              </article>
              <article className="for-you-card">
                <h3>Partners &amp; press</h3>
                <p>
                  Building something in mobility, media, or live entertainment?
                  We&apos;d love to hear from you. Reach out below.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="contact" className="cta-section contact-section">
          <div className="container">
            <div className="cta-box">
              <h2>Contact</h2>
              <p>
                Questions, partnerships, or press? Send a message and we&apos;ll
                reply by email.
              </p>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-inner">
          <div className="footer-brand">
            <div className="logo-mark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/crosstown-logo.png" alt="Crosstown" />
            </div>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <a href="#contact">Contact</a>
            <a href="#how-it-works">How it works</a>
          </nav>
          <span>© {new Date().getFullYear()} Crosstown</span>
          <span className="footer-map-attrib">
            Map ©{" "}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
              OpenStreetMap
            </a>{" "}
            ©{" "}
            <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">
              CARTO
            </a>
          </span>
        </div>
      </footer>
    </>
  );
}
