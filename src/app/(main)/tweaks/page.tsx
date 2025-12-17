import type { Metadata } from "next";
import { requireAuth } from "@/shared/utils/auth-guard";
import { fetchTweakCategories } from "@/features/tweaks/utils/tweaks-server";
import TweaksPageClient from "@/features/tweaks/components/tweaks-page-client";

export const metadata: Metadata = {
  title: "Windows Tweaks - PowerShell Scripts & Performance Optimization",
  description:
    "Browse and customize Windows tweaks for all Windows versions (Windows 7, 8, 10, 11). Create custom PowerShell scripts for system optimization. Safe, reversible Windows performance tweaks with code preview.",
  keywords: [
    "Windows tweaks",
    "PowerShell scripts",
    "Tweaks for Windows",
    "Windows performance scripts",
    "custom Windows tweaks",
    "Windows 7 tweaks",
    "Windows 8 tweaks",
    "Windows 10 tweaks",
    "Windows 11 tweaks",
  ],
  openGraph: {
    title: "Windows Tweaks - PowerShell Scripts & Performance Optimization",
    description:
      "Browse and customize Windows tweaks for all Windows versions. Create custom PowerShell scripts for system optimization.",
  },
};

export default async function TweaksPage() {
  // Ensure user is authenticated (redirects if not)
  await requireAuth();

  // Fetch data on the server
  const categories = await fetchTweakCategories();

  return (
    <TweaksPageClient categories={categories} />
  );
}



