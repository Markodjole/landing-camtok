import type { Metadata, Viewport } from "next";
import { Exo_2 } from "next/font/google";
import "./globals.css";

const exo2 = Exo_2({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-exo2",
  weight: ["400", "500"],
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
    icon: "/crosstown-logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#5b14e4",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={exo2.variable}>
      <body className={exo2.className}>{children}</body>
    </html>
  );
}
