import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAuth } from "@/shared/utils/auth-guard";
import { fetchTweakCategories } from "@/features/tweaks/utils/tweaks-server";
import TweaksPageClient from "@/features/tweaks/components/tweaks-page-client";

export const metadata: Metadata = {
  title: "Windows Tweaks - PowerShell Scripts & Performance Optimization",
  description:
    "Browse and customize Windows 10 and Windows 11 tweaks. Create custom PowerShell scripts for system optimization. Safe, reversible Windows performance tweaks with code preview.",
  keywords: [
    "Windows tweaks",
    "PowerShell scripts",
    "Windows 10 tweaks",
    "Windows 11 tweaks",
    "Twix for Windows",
    "Windows performance scripts",
    "custom Windows tweaks",
  ],
  openGraph: {
    title: "Windows Tweaks - PowerShell Scripts & Performance Optimization",
    description:
      "Browse and customize Windows 10 and Windows 11 tweaks. Create custom PowerShell scripts for system optimization.",
  },
};

export default async function TweaksPage() {
  // Ensure user is authenticated (redirects if not)
  await requireAuth();

  // Fetch data on the server
  const categories = await fetchTweakCategories();

  return (
    <Suspense>
      <TweaksPageClient categories={categories} />
    </Suspense>
  );
}



