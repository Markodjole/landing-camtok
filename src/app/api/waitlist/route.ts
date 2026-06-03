import { NextResponse } from "next/server";
import { submitWaitlistEmail } from "@/lib/waitlist-inbox";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = (await req.json()) as {
    email?: string;
    website?: string;
    message?: string;
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

  const message = String(body.message ?? "").trim();

  const result = await submitWaitlistEmail(email, message);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
