import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAuth } from "@/shared/utils/auth-guard";
import HomeContent from "@/features/home/components/home";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { FavoritesCarouselServer } from "@/features/home/components/favorites-carousel-server";
import { FavoritesCarouselSkeleton } from "@/features/home/components/favorites-carousel-skeleton";

export const metadata: Metadata = {
  title: "Dashboard - Windows Performance Tweaks",
  description:
    "Manage your Windows 10 and Windows 11 tweaks. View your favorite performance optimizations and tweak history.",
  openGraph: {
    title: "Dashboard - Windows Performance Tweaks",
    description: "Manage your Windows 10 and Windows 11 tweaks and performance optimizations.",
  },
};

export default async function HomePage() {
  // Ensure user is authenticated (redirects if not)
  await requireAuth();

  return (
    <Suspense>
      <ScrollArea className="h-full w-full">
        <main className="flex min-h-screen w-full items-center justify-center">
          <HomeContent>
            <div className="w-full max-w-6xl mt-12">
              <Suspense fallback={<FavoritesCarouselSkeleton />}>
                <FavoritesCarouselServer />
              </Suspense>
            </div>
          </HomeContent>
        </main>
      </ScrollArea>
    </Suspense>
  );
}



