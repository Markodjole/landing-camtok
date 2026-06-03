"use client";

import { FormEvent, useEffect, useState } from "react";
import { submitWaitlistEmail } from "@/lib/waitlist-inbox";

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
        <a href="#early-access" className="nav-cta">
          Get early access
        </a>
      </div>
    </header>
  );
}

export function WaitlistForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const website = String(fd.get("website") ?? "").trim();
    if (!email) return;

    setStatus("loading");
    setErrorMsg("");

    if (website) {
      setStatus("success");
      return;
    }

    const result = await submitWaitlistEmail(email.toLowerCase());
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
      </form>
      {status === "error" && errorMsg ? (
        <p className="cta-note cta-error">{errorMsg}</p>
      ) : null}
    </>
  );
}
