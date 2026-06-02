import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crosstown — Watch the drive. Call the next move.",
  description:
    "Live dashcam prediction game. Watch real city drives, bet on the next turn, zone, and route — before the driver decides.",
  metadataBase: new URL("https://playcrosstown.com"),
  openGraph: {
    title: "Crosstown — Watch the drive. Call the next move.",
    description:
      "Live dashcam prediction game. Bet on turns, zones, and routes in real time.",
    url: "https://playcrosstown.com",
    siteName: "Crosstown",
    type: "website",
  },
  icons: {
    icon: "/crosstown-brand.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.className}>
      <body>{children}</body>
    </html>
  );
}
