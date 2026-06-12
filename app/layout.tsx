import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers/providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#0f1c3a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://awardcraft.co.uk"
  ),
  title: {
    default: "AwardCraft — Premium Bespoke Awards & Trophies",
    template: "%s | AwardCraft",
  },
  description:
    "Shop premium bespoke awards, trophies, and recognition pieces. Fully customisable with engraving, logos, and materials. Trusted by 500+ UK organisations.",
  keywords: [
    "awards",
    "trophies",
    "engraving",
    "corporate awards",
    "bespoke awards",
    "recognition awards",
    "crystal trophies",
    "glass awards",
  ],
  authors: [{ name: "AwardCraft" }],
  creator: "AwardCraft",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName: "AwardCraft",
    title: "AwardCraft — Premium Bespoke Awards & Trophies",
    description:
      "Shop premium bespoke awards and trophies. Fully customisable. Trusted by 500+ UK organisations.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AwardCraft — Premium Bespoke Awards",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AwardCraft — Premium Bespoke Awards & Trophies",
    description: "Shop premium bespoke awards and trophies.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[--font-inter]">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
