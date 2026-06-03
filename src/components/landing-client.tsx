"use client";

import { FormEvent, useEffect, useState } from "react";
import { submitContactMessage, submitWaitlistEmail } from "@/lib/formsubmit";

type FormStatus = "idle" | "loading" | "success" | "error";

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
            <img src="/crosstown-logo.png" alt="Crosstown" />
          </div>
        </a>
        <div className="nav-actions">
          <a href="#contact" className="nav-link">
            Contact
          </a>
          <a href="#early-access" className="nav-cta">
            Get early access
          </a>
        </div>
      </div>
    </header>
  );
}

export function WaitlistForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const website = String(fd.get("website") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    if (!email) return;

    setStatus("loading");
    setErrorMsg("");

    if (website) {
      setStatus("success");
      return;
    }

    const result = await submitWaitlistEmail(email.toLowerCase(), message);
    if (!result.ok) {
      setStatus("error");
      setErrorMsg(result.error);
      return;
    }

    setStatus("success");
    e.currentTarget.reset();
  }

  if (status === "success") {
    return (
      <p className="cta-note cta-success">
        You&apos;re on the list — we&apos;ll email you when Crosstown opens.
      </p>
    );
  }

  return (
    <>
      <form className="cta-email" onSubmit={onSubmit}>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp-field" aria-hidden />
        <div className="cta-email-row">
          <input
            type="email"
            name="email"
            placeholder="you@email.com"
            required
            autoComplete="email"
            disabled={status === "loading"}
          />
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Joining…" : "Join waitlist"}
          </button>
        </div>
        <textarea
          name="message"
          className="cta-email-message"
          placeholder="Optional — city, how you'd use Crosstown, etc."
          rows={3}
          maxLength={500}
          disabled={status === "loading"}
        />
      </form>
      {status === "error" && errorMsg ? (
        <p className="cta-note cta-error">{errorMsg}</p>
      ) : null}
    </>
  );
}

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const website = String(fd.get("website") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    if (!email || !message) return;

    setStatus("loading");
    setErrorMsg("");

    if (website) {
      setStatus("success");
      return;
    }

    const result = await submitContactMessage(email.toLowerCase(), message);
    if (!result.ok) {
      setStatus("error");
      setErrorMsg(result.error);
      return;
    }

    setStatus("success");
    e.currentTarget.reset();
  }

  if (status === "success") {
    return (
      <p className="cta-note cta-success">
        Message sent — we&apos;ll get back to you soon.
      </p>
    );
  }

  return (
    <>
      <form className="cta-email" onSubmit={onSubmit}>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp-field" aria-hidden />
        <div className="cta-email-row">
          <input
            type="email"
            name="email"
            placeholder="you@email.com"
            required
            autoComplete="email"
            disabled={status === "loading"}
          />
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Sending…" : "Send message"}
          </button>
        </div>
        <textarea
          name="message"
          className="cta-email-message"
          placeholder="Your message…"
          rows={4}
          maxLength={2000}
          required
          disabled={status === "loading"}
        />
      </form>
      {status === "error" && errorMsg ? (
        <p className="cta-note cta-error">{errorMsg}</p>
      ) : null}
    </>
  );
}
