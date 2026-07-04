import type { Metadata, Viewport } from "next";
import { Fraunces, Poppins } from "next/font/google";
import "./globals.css";

// Fraunces = warm display serif (headlines); Poppins = friendly rounded body/UI
// (matches the lavender design). Kept under the old CSS-var names so tailwind +
// call sites need no changes — the fonts loaded into them just changed.
const cormorant = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const mulish = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mulish",
});

const nunito = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
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
  themeColor: "#8171d4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${mulish.variable} ${nunito.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
