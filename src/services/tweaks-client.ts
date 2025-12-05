import { createClient } from "@/utils/supabase/client";
import type { TweakCategory, Tweak } from "@/types/tweak.types";

const CACHE_KEY = "bp:tweaksCache";
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  categories: TweakCategory[];
  timestamp: number;
}

export async function fetchTweakCategoriesClient(): Promise<TweakCategory[]> {
  const supabase = createClient();
  
  // Fetch all tweaks and categories
  const { data: tweaks, error: tweaksError } = await supabase
    .from("tweaks")
    .select("*, tweak_metadata");
  if (tweaksError) throw tweaksError;

  // Fetch categories
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("*");
  if (catError) throw catError;

  // Parse tweak_metadata if it's a string
  const parsedTweaks = tweaks.map((t: any) => ({
    ...t,
    tweak_metadata:
      typeof t.tweak_metadata === "string"
        ? JSON.parse(t.tweak_metadata)
        : t.tweak_metadata,
  }));

  // Group tweaks by category
  const grouped: TweakCategory[] = categories.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    tweaks: parsedTweaks.filter((t: Tweak) => t.category_id === cat.id),
  }));

  return grouped;
}

export function getCachedTweaks(): TweakCategory[] | null {
  if (typeof window === "undefined") return null;
  
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    
    const cached: CachedData = JSON.parse(raw);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - cached.timestamp < CACHE_EXPIRY_MS) {
      return cached.categories;
    }
    
    // Cache expired, remove it
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.error("Failed to read cached tweaks:", error);
    return null;
  }
}

export function setCachedTweaks(categories: TweakCategory[]): void {
  if (typeof window === "undefined") return;
  
  try {
    const cached: CachedData = {
      categories,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.error("Failed to cache tweaks:", error);
    // If storage is full, try to clear old cache
    try {
      localStorage.removeItem(CACHE_KEY);
      const cached: CachedData = {
        categories,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch (e) {
      console.error("Failed to update cache after cleanup:", e);
    }
  }
}

export async function fetchTweakCategoriesWithCache(): Promise<TweakCategory[]> {
  // Try to get cached data first
  const cached = getCachedTweaks();
  if (cached) {
    // Return cached data immediately, but fetch fresh data in background
    fetchTweakCategoriesClient()
      .then((fresh) => {
        setCachedTweaks(fresh);
      })
      .catch((error) => {
        console.error("Background fetch failed:", error);
        // Keep using cached data if background fetch fails
      });
    
    return cached;
  }
  
  // No cache, fetch fresh data
  const categories = await fetchTweakCategoriesClient();
  setCachedTweaks(categories);
  return categories;
}
