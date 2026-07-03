import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Mulish, Nunito } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mulish",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "The Clarity Method — Guided Healing & Nervous System Regulation",
  description:
    "Take a 5-minute assessment to find out what's really going on underneath — then get a personalized daily practice built around it.",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Clarity" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#00a855",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${mulish.variable} ${nunito.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
