import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://diksyo.app"),
  title: {
    template: "%s | Diksyo - Tagalog Dictionary",
    default: "Diksyo | The Modern Tagalog Dictionary & Learning Engine",
  },
  description: "Diksyo is your ultimate Tagalog dictionary (diksyonaryo) and personal engine for mastering the Filipino language through active recall and spaced repetition.",
  keywords: ["Tagalog dictionary", "diksyonaryo", "Filipino dictionary", "learn Tagalog", "Tagalog translation"],
  openGraph: {
    title: "Diksyo | The Modern Tagalog Dictionary",
    description: "Your ultimate Tagalog dictionary and learning engine.",
    url: "https://diksyo.app",
    siteName: "Diksyo",
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diksyo | The Modern Tagalog Dictionary",
    description: "Your ultimate Tagalog dictionary and learning engine.",
  },
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
          lang="en"
          className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
      >
      <body className="min-h-full flex flex-col">
      {children}
      <Toaster position="top-center" />
      <Analytics />
      <SpeedInsights />
      </body>
      </html>
  );
}