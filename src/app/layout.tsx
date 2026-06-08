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
  title: "Crosstown | Watch the ride. Call the next move.",
  description:
    "A live iGaming product built on real-world movement prediction. Watch POV rides, call the next turn, zone, or route—neutral, rule-based outcomes and public fairness hashes.",
  metadataBase: new URL("https://playcrosstown.com"),
  openGraph: {
    title: "Crosstown | Watch the ride. Call the next move.",
    description:
      "A live iGaming product built on real-world movement prediction. Watch city rides on POV and map—call turns, zones, and routes in real time.",
    url: "https://playcrosstown.com",
    siteName: "Crosstown",
    type: "website",
  },
  icons: {
    icon: "/crosstown-logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#6c23ed",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
