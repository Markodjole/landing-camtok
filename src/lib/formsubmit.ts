/** Inbox for FormSubmit. Set WAITLIST_TO_EMAIL or NEXT_PUBLIC_WAITLIST_TO_EMAIL on Vercel. */
export const FORM_INBOX =
  process.env.NEXT_PUBLIC_WAITLIST_TO_EMAIL?.trim() ||
  "marko.djordjevickg@gmail.com";

export type FormSubmitResult = { ok: true } | { ok: false; error: string };

async function postToFormSubmit(
  fields: Record<string, string>,
  failMessage: string,
): Promise<FormSubmitResult> {
  try {
    const res = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(FORM_INBOX)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _captcha: "false",
          _template: "table",
          ...fields,
        }),
      },
    );

    const raw = await res.text();
    let data: { success?: string; message?: string } = {};
    try {
      data = JSON.parse(raw) as { success?: string; message?: string };
    } catch {
      console.error("FormSubmit non-JSON response:", raw.slice(0, 200));
      return { ok: false, error: failMessage };
    }

    if (data.success === "true") {
      return { ok: true };
    }

    const message = data.message ?? "";
    if (/activation/i.test(message)) {
      return {
        ok: false,
        error:
          "Form is almost ready — the owner needs to confirm one email from FormSubmit, then try again.",
      };
    }

    console.error("FormSubmit error:", message || res.status);
    return { ok: false, error: failMessage };
  } catch (err) {
    console.error("FormSubmit error:", err);
    return {
      ok: false,
      error: "Network error. Check your connection and try again.",
    };
  }
}

export async function submitWaitlistEmail(
  email: string,
  note?: string,
): Promise<FormSubmitResult> {
  const trimmedNote = note?.trim().slice(0, 500);
  const bodyLines = [`New waitlist signup: ${email}`];
  if (trimmedNote) bodyLines.push("", "Message:", trimmedNote);

  return postToFormSubmit(
    {
      email,
      _subject: "Crosstown waitlist signup",
      message: bodyLines.join("\n"),
      ...(trimmedNote ? { note: trimmedNote } : {}),
    },
    "Could not join waitlist. Please try again.",
  );
}

export async function submitContactMessage(
  email: string,
  message: string,
): Promise<FormSubmitResult> {
  const trimmedMessage = message.trim().slice(0, 2000);
  if (!trimmedMessage) {
    return { ok: false, error: "Please enter a message." };
  }

  return postToFormSubmit(
    {
      email,
      _subject: "Crosstown contact message",
      message: trimmedMessage,
      _replyto: email,
    },
    "Could not send message. Please try again.",
  );
}
