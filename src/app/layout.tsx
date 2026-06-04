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
  title: "Crosstown | Watch the drive. Call the next move.",
  description:
    "A live POV prediction game with neutral, rule-based outcomes and public fairness hashes. Call the next turn, zone, or route before it happens.",
  metadataBase: new URL("https://playcrosstown.com"),
  openGraph: {
    title: "Crosstown | Watch the drive. Call the next move.",
    description:
      "A live POV prediction game. Call turns, zones, and routes in real time on live GPS.",
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
