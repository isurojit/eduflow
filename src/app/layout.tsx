import type { Metadata, Viewport } from "next";
import { Manrope, DM_Sans } from "next/font/google";
import "./globals.css";
import { AppBootstrap } from "@/components/layout/app-bootstrap";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-display" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body" });


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#090708",
};

export const metadata: Metadata = {
  title: "EduFlow AI — Study Smarter. Grow Every Day.",
  description: "An AI-enriched learning workspace with planning, practice, analytics, document intelligence and a study copilot.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${dmSans.variable} noise min-h-screen font-[family-name:var(--font-body)] antialiased`}>
        <AppBootstrap>{children}</AppBootstrap>
      </body>
    </html>
  );
}
