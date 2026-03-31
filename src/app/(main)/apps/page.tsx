import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAuth } from "@/shared/utils/auth-guard";
import AppInstallerPage from "@/features/app-installer/app-installer-page";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

export const metadata: Metadata = {
  title: "App Installer - Betterperformance",
  description: 
    "Batch install Windows applications using winget. Search, select, and generate your custom installation script in seconds.",
  openGraph: {
    title: "App Installer - Betterperformance",
    description: "The ultimate winget script generator for Windows power users.",
  },
};

/**
 * Route page for the App Installer feature.
 * Protected by authentication guard and wrapped in a scroll area.
 */
export default async function AppsPage() {
  // Ensure user is authenticated before accessing the feature
  await requireAuth();

  return (
    <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-background/50 backdrop-blur-md animate-pulse">Loading App Installer...</div>}>
      <ScrollArea className="h-full w-full">
        <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
          <AppInstallerPage />
        </div>
      </ScrollArea>
    </Suspense>
  );
}
