import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MovieVerse — Curated Movie Collections & Streaming",
    template: "%s | MovieVerse",
  },
  description:
    "Discover hand-picked movie collections from top YouTube curators. Posters, ratings, trailers and one-click streaming — powered by TMDB.",
  keywords: [
    "movies",
    "movie collections",
    "top 10 movies",
    "netflix movies",
    "watch movies",
    "tmdb",
    "streaming",
  ],
  authors: [{ name: "MovieVerse" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "MovieVerse",
    title: "MovieVerse — Curated Movie Collections & Streaming",
    description:
      "Hand-picked movie collections from top YouTube curators, enriched with TMDB data and one-click streaming.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MovieVerse — Curated Movie Collections & Streaming",
    description:
      "Hand-picked movie collections from top YouTube curators, enriched with TMDB data and one-click streaming.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} min-h-screen font-sans`}>
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
