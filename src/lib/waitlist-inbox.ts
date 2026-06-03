/** Inbox for FormSubmit waitlist notifications. Override with WAITLIST_TO_EMAIL on Vercel. */
const DEFAULT_WAITLIST_INBOX = "marko.djordjevickg@gmail.com";

export function getWaitlistInbox(): string {
  return (
    process.env.WAITLIST_TO_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_WAITLIST_TO_EMAIL?.trim() ||
    DEFAULT_WAITLIST_INBOX
  );
}
