import { fetchUserTweakHistory } from "@/features/history-tweaks/utils/tweak-history-server";
import { createClient } from "@/shared/utils/supabase/server";
import type { TweakHistoryEntry } from "@/features/tweaks/types/tweak.types";
import { FavoritesCarouselClient } from "./favorites-carousel-client";
import { FavoritesCarouselSkeleton } from "./favorites-carousel-skeleton";

export async function FavoritesCarouselServer() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const history = await fetchUserTweakHistory(user.id);
    const favorites = history.filter((entry) => entry.isFavorite);

    // If no favorites, don't render anything
    if (favorites.length === 0) {
      return null;
    }

    // Pass initial data to client component
    return <FavoritesCarouselClient initialFavorites={favorites} />;
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return null;
  }
}

