import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marley's Wildcard — Playable Demo",
  description: "Play Marley's Wildcard: you vs. Max and Roxy, hosted by Marley with co-host Aiden. A Rovyn Entertainment Studio production.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#16181D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
