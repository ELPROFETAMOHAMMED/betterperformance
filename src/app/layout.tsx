import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import ThemeProvider from "@/shared/providers/theme-provider";
import { AnimatedBackground } from "@/shared/components/layout/animated-background";

export const metadata: Metadata = {
  title: {
    default: "BetterPerformance - Windows Tweaks & Performance Optimization",
    template: "%s | BetterPerformance",
  },
  description:
    "Optimize Windows systems (Windows 7, 8, 10, 11) with safe, reversible tweaks. Get the best Windows performance tweaks, PowerShell scripts, and system optimization tools. Free Windows tweaks for better performance.",
  keywords: [
    "Windows tweaks",
    "Windows performance tweaks",
    "Tweaks for Windows",
    "Windows optimization",
    "PowerShell tweaks",
    "Windows 7 tweaks",
    "Windows 8 tweaks",
    "Windows 10 tweaks",
    "Windows 11 tweaks",
    "system performance",
    "Windows registry tweaks",
    "Windows speed up",
    "PC optimization",
    "Windows performance boost",
    "tweak Windows",
    "Windows tweaker",
    "performance optimization Windows",
    "Windows system tweaks",
  ],
  authors: [{ name: "BetterPerformance" }],
  creator: "BetterPerformance",
  publisher: "BetterPerformance",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://betterperformance.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "BetterPerformance",
    title: "BetterPerformance - Windows Tweaks & Performance Optimization",
    description:
      "Optimize Windows systems (Windows 7, 8, 10, 11) with safe, reversible tweaks. Get the best Windows performance tweaks and system optimization tools.",
    images: [
      {
        url: "/assets/Aplication-logo.png",
        width: 1200,
        height: 630,
        alt: "BetterPerformance - Windows Performance Optimization",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BetterPerformance - Windows Tweaks & Performance Optimization",
    description:
      "Optimize Windows systems (Windows 7, 8, 10, 11) with safe, reversible tweaks. Get the best Windows performance tweaks and system optimization tools.",
    images: ["/assets/Aplication-logo.png"],
    creator: "@betterperformance",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "ccqSSNcqvgyup2dNB05tVdD7IKuRJFFN6CXlXoXOd2Q",
  },
  icons: {
    icon: [
      { url: "/assets/Aplication-logo.png", type: "image/png" },
      { url: "/assets/Aplication-logo.png", type: "image/png", sizes: "32x32" },
      { url: "/assets/Aplication-logo.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [
      { url: "/assets/Aplication-logo.png", type: "image/png" },
    ],
    shortcut: "/assets/Aplication-logo.png",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "BetterPerformance",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Windows",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Optimize Windows systems (Windows 7, 8, 10, 11) with safe, reversible tweaks. Get the best Windows performance tweaks, PowerShell scripts, and system optimization tools.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://betterperformance.vercel.app",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1000",
  },
  featureList: [
    "Windows Tweaks",
    "PowerShell Scripts",
    "Performance Optimization",
    "System Optimization",
    "Safe Reversible Changes",
    "Windows 7, 8, 10, 11 Support",
    "100% Free",
    "Open Source",
  ],
  keywords:
    "Windows tweaks, Windows performance tweaks, Tweaks for Windows, Windows performance, better performance Windows, Windows optimization, PowerShell tweaks, Windows 7 tweaks, Windows 8 tweaks, Windows 10 tweaks, Windows 11 tweaks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <AnimatedBackground />
        </ThemeProvider>
      </body>
    </html>
  );
}



