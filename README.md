# Crosstown Landing

Marketing site for [playcrosstown.com](https://playcrosstown.com).

## Develop

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

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
