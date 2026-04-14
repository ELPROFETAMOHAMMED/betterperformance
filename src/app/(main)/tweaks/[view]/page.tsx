import { requireAuth } from "@/shared/utils/auth-guard";
import { fetchTweakCategories } from "@/features/tweaks/utils/tweaks-server";
import { getWallpapers } from "@/features/wallpapers/services/get-wallpapers";
import TweaksPageClient from "@/features/tweaks/components/tweaks-page-client";
import { redirect } from "next/navigation";

interface TweakViewPageProps {
  params: Promise<{ view: string }>;
}

const VALID_VIEWS = ["library", "wallpapers", "popular", "favorites", "history", "reported"];

export default async function TweakViewPage({ params }: TweakViewPageProps) {
  const { view } = await params;

  if (!VALID_VIEWS.includes(view)) {
    redirect("/tweaks/library");
  }

  // Ensure user is authenticated
  await requireAuth();

  // Fetch categories on the server
  const categories = await fetchTweakCategories();

  const wallpapersPageData =
    view === "wallpapers" ? await getWallpapers({ page: 1, pageSize: 60 }) : null;

  return (
    <div className="h-full w-full">
      <TweaksPageClient
        categories={categories}
        activeTab={view}
        wallpapersPageData={wallpapersPageData}
      />
    </div>
  );
}
