# Crosstown Landing

Marketing site for [playcrosstown.com](https://playcrosstown.com).

## Develop

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Waitlist emails (free — no API key)

Signups go to FormSubmit and forward to your inbox. The deployed site works out of the box; override the inbox with an env var if you want a different address.

Optional `.env.local`:

```bash
NEXT_PUBLIC_WAITLIST_TO_EMAIL=your@gmail.com
```

After changing the inbox, submit the form **once** from the live site — FormSubmit sends a one-time activation link to that address; click it. After that, every signup emails you automatically.

On Vercel: add `NEXT_PUBLIC_WAITLIST_TO_EMAIL` under **Settings → Environment Variables** (Production), then redeploy.

Uses [FormSubmit](https://formsubmit.co) — free, works with Gmail, no account signup.

## Deploy to Vercel

```bash
pnpm install
vercel login
vercel --prod
```

Then in the Vercel dashboard:

1. **Project → Settings → Domains** → add `playcrosstown.com` and `www.playcrosstown.com`
2. At your domain registrar, set DNS to Vercel (A record `76.76.21.21` or CNAME to `cname.vercel-dns.com`)
3. SSL is automatic once DNS propagates

## Stack

- Next.js 15 (App Router)
- Static-friendly — no backend required for the landing page
