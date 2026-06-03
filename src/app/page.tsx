import Image from "next/image";
import { NavBar, WaitlistForm } from "@/components/landing-client";

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
            <div>
              <div className="hero-badge">
                <span className="hero-badge-dot" aria-hidden />
                Live city prediction game
              </div>
              <h1>
                Watch the drive.
                <br />
                <span>Call the next move.</span>
              </h1>
              <p className="hero-lead">
                Crosstown is live dashcam betting — real drivers, real streets,
                real-time GPS. Watch the stream, read the map, and bet on the
                next turn, zone, or route before it happens.
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

            <div className="hero-logo-wrap">
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
              Every market is tied to live GPS and a shared room timeline — so
              bets lock before the outcome, and everyone sees the same truth.
            </p>

            <div className="steps">
              <article className="step">
                <div className="step-num">1</div>
                <h3>Watch live</h3>
                <p>
                  Join a live room. Dashcam on top, map below. See where the
                  driver is heading in real time.
                </p>
              </article>
              <article className="step">
                <div className="step-num">2</div>
                <h3>Pick your call</h3>
                <p>
                  Left or right at the next junction? Which zone comes next?
                  How many straight crossroads? Stake before the window locks.
                </p>
              </article>
              <article className="step">
                <div className="step-num">3</div>
                <h3>Win on the move</h3>
                <p>
                  The route reveals the answer. Correct predictions split the
                  pool. Skill beats luck when you read the city.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="markets">
          <div className="container">
            <p className="section-label">What you bet on</p>
            <h2 className="section-title">Markets built for the road</h2>
            <p className="section-lead">
              Not random clips — live route-state markets generated from GPS,
              grid zones, and upcoming decisions on the map.
            </p>

            <div className="bet-grid">
              <article className="bet-card">
                <div className="bet-icon" aria-hidden>
                  ↰
                </div>
                <h3>Next turn</h3>
                <p>
                  Will they go left, right, or straight at the upcoming
                  junction?
                </p>
              </article>
              <article className="bet-card">
                <div className="bet-icon" aria-hidden>
                  ▦
                </div>
                <h3>Next zone</h3>
                <p>
                  Which city grid cell do they enter next — before they cross
                  the border?
                </p>
              </article>
              <article className="bet-card">
                <div className="bet-icon" aria-hidden>
                  ═
                </div>
                <h3>Straight streak</h3>
                <p>
                  How many crossroads in a row without turning? Count the
                  straight run.
                </p>
              </article>
              <article className="bet-card">
                <div className="bet-icon" aria-hidden>
                  ◎
                </div>
                <h3>Next step</h3>
                <p>
                  Predict the next maneuver on the route — pin drops on the map
                  when the market opens.
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
                  Real dashcam feed from the driver&apos;s phone — not
                  pre-recorded video.
                </p>
              </div>
              <div className="feature">
                <h3>GPS-fair markets</h3>
                <p>
                  Bets lock with distance rules. Outcomes settle from movement,
                  not opinions.
                </p>
              </div>
              <div className="feature">
                <h3>Map + video overlay</h3>
                <p>
                  See pins and zone signs inside the stream — the city becomes
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
            <a href="mailto:hello@playcrosstown.com">Contact</a>
            <a href="#how-it-works">How it works</a>
          </nav>
          <span>© {new Date().getFullYear()} Crosstown</span>
        </div>
      </footer>
    </>
  );
}
