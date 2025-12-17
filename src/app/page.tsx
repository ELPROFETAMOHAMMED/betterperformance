import { createClient } from "@/shared/utils/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import LandingPage from "@/features/landing/components/landing-page";

export const metadata: Metadata = {
  title: "Windows Performance Tweaks - BetterPerformance",
  description:
    "Free Windows performance tweaks for all Windows versions (Windows 7, 8, 10, 11). Optimize your PC with safe, reversible PowerShell scripts. Get better performance with curated Windows optimization tweaks.",
  keywords: [
    "Windows tweaks",
    "Windows performance tweaks",
    "Tweaks for Windows",
    "Windows performance",
    "better performance Windows",
    "Windows optimization",
    "PowerShell tweaks",
    "Windows 7 tweaks",
    "Windows 8 tweaks",
    "Windows 10 tweaks",
    "Windows 11 tweaks",
  ],
  openGraph: {
    title: "Windows Performance Tweaks - BetterPerformance",
    description:
      "Free Windows performance tweaks for all Windows versions. Optimize your PC with safe, reversible PowerShell scripts.",
  },
};

export default async function LandingRoute() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If authenticated, redirect to home
  if (user) {
    return redirect("/home");
  }

  // Show landing page for unauthenticated users
  const landingStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "BetterPerformance - Windows Performance Tweaks",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Windows",
    description:
      "Free Windows performance tweaks for all Windows versions (Windows 7, 8, 10, 11). Optimize your PC with safe, reversible PowerShell scripts.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "Windows Performance Tweaks",
      "PowerShell Script Generation",
      "Safe Reversible Changes",
      "System Optimization",
      "Performance Boost",
      "Windows 7, 8, 10, 11 Support",
    ],
    keywords:
      "Windows tweaks, Windows performance tweaks, Tweaks for Windows, Windows performance, better performance Windows, Windows 7 tweaks, Windows 8 tweaks, Windows 10 tweaks, Windows 11 tweaks",
  };

  return (
    <>
      <Script
        id="landing-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(landingStructuredData),
        }}
      />
      <LandingPage />
    </>
  );
}



