/** Inbox for FormSubmit waitlist notifications. Override with NEXT_PUBLIC_WAITLIST_TO_EMAIL. */
export const WAITLIST_INBOX =
  process.env.NEXT_PUBLIC_WAITLIST_TO_EMAIL?.trim() ||
  "marko.djordjevickg@gmail.com";

export async function submitWaitlistEmail(email: string): Promise<
  | { ok: true }
  | { ok: false; error: string }
> {
  try {
    const res = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(WAITLIST_INBOX)}`,
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

    const raw = await res.text();
    let data: { success?: string; message?: string } = {};
    try {
      data = JSON.parse(raw) as { success?: string; message?: string };
    } catch {
      console.error("FormSubmit non-JSON response:", raw.slice(0, 200));
      return {
        ok: false,
        error: "Could not join waitlist. Please try again.",
      };
    }

    if (data.success === "true") {
      return { ok: true };
    }

    const message = data.message ?? "";
    if (/activation/i.test(message)) {
      return {
        ok: false,
        error:
          "Waitlist is almost ready — the form owner needs to confirm one email from FormSubmit, then try again.",
      };
    }

    console.error("FormSubmit error:", message || res.status);
    return {
      ok: false,
      error: "Could not join waitlist. Please try again.",
    };
  } catch (err) {
    console.error("Waitlist error:", err);
    return {
      ok: false,
      error: "Network error. Check your connection and try again.",
    };
  }
}
