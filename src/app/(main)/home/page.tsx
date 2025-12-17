import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAuth } from "@/shared/utils/auth-guard";
import HomeContent from "@/features/home/components/home";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

export const metadata: Metadata = {
  title: "Dashboard - Windows Performance Tweaks",
  description:
    "Manage your Windows tweaks. View your favorite performance optimizations and tweak history.",
  openGraph: {
    title: "Dashboard - Windows Performance Tweaks",
    description: "Manage your Windows tweaks and performance optimizations.",
  },
};

export default async function HomePage() {
  // Ensure user is authenticated (redirects if not)
  await requireAuth();

  return (
    <Suspense>
      <ScrollArea className="h-full w-full">
        <div className="flex min-h-[calc(100vh-4rem)] w-full justify-center">
          <HomeContent />
        </div>
      </ScrollArea>
    </Suspense>
  );
}

