import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Browser form posts to FormSubmit — needs a public env var at build time.
    // Accept WAITLIST_TO_EMAIL on Vercel so you don't need to rename it.
    NEXT_PUBLIC_WAITLIST_TO_EMAIL:
      process.env.NEXT_PUBLIC_WAITLIST_TO_EMAIL ??
      process.env.WAITLIST_TO_EMAIL ??
      "",
  },
};

export default nextConfig;
