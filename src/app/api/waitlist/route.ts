import { NextResponse } from "next/server";
import { getWaitlistInbox } from "@/lib/waitlist-inbox";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      website?: string;
    };

    if (body.website) {
      return NextResponse.json({ ok: true });
    }

    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const inbox = getWaitlistInbox();

    const res = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(inbox)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          _subject: "Crosstown waitlist signup",
          _captcha: "false",
          _template: "table",
          message: `New waitlist signup: ${email}`,
        }),
      },
    );

    const data = (await res.json()) as { success?: string; message?: string };

    if (!res.ok || data.success !== "true") {
      console.error("FormSubmit error:", data.message ?? res.status);
      return NextResponse.json(
        { error: "Could not join waitlist. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Waitlist error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
