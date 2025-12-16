
import { createClient } from "@/shared/utils/supabase/server";
import { FavoritesCarouselClient } from "./favorites-carousel-client";

export async function FavoritesCarouselServer() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }   

    // Pass initial data to client component
    return <FavoritesCarouselClient initialFavorites={[]} />;
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return null;
  }
}

