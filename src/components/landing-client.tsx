"use client";

import { FormEvent, useEffect, useState } from "react";

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="container nav-inner">
        <a href="#" aria-label="Crosstown home">
          <div className="logo-mark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/crosstown-brand.png" alt="" />
          </div>
        </a>
        <a href="#early-access" className="nav-cta">
          Get early access
        </a>
      </div>
    </header>
  );
}

export function WaitlistForm() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    if (!email) return;
    window.location.href = `mailto:hello@playcrosstown.com?subject=Crosstown%20waitlist&body=Please%20add%20me%3A%20${encodeURIComponent(email)}`;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="cta-note" style={{ color: "var(--green)" }}>
        Thanks — your email client should open. We&apos;ll be in touch.
      </p>
    );
  }

  return (
    <form className="cta-email" onSubmit={onSubmit}>
      <input
        type="email"
        name="email"
        placeholder="you@email.com"
        required
        autoComplete="email"
      />
      <button type="submit">Join waitlist</button>
    </form>
  );
}
