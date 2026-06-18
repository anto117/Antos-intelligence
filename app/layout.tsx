import type { Metadata, Viewport } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Antos Intelligence — AI Vision Platform | See the World Through AI",
  description:
    "Antos Intelligence is a premium AI vision platform that understands your world through webcam or uploaded images. Analyze food nutrition, room design, and human emotions in real-time using YOLOv8, MediaPipe, and Gemini AI.",
  keywords: [
    "Antos Intelligence",
    "AI vision",
    "computer vision",
    "food analysis",
    "room design",
    "emotion detection",
    "YOLOv8",
    "MediaPipe",
    "Gemini AI",
    "real-time analysis",
    "antosintelligence",
  ],
  authors: [{ name: "Antos Intelligence" }],
  creator: "Antos Intelligence",
  metadataBase: new URL("https://antosintelligence.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://antosintelligence.vercel.app",
    title: "Antos Intelligence — AI Vision Platform",
    description: "See your world through the lens of artificial intelligence.",
    siteName: "Antos Intelligence",
  },
  twitter: {
    card: "summary_large_image",
    title: "Antos Intelligence — AI Vision Platform",
    description: "See your world through the lens of artificial intelligence.",
    creator: "@antosintelligence",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://antosintelligence.vercel.app",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
