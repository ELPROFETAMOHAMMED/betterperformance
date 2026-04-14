import type { Tweak } from "@/features/tweaks/types/tweak.types";
import type { Wallpaper } from "@/features/wallpapers/types/wallpaper.types";

export type FavoriteItemType = "tweak" | "wallpaper";

export type FavoriteItem =
  | {
      id: string;
      itemType: "tweak";
      tweak: Tweak;
      wallpaper: null;
      createdAt: string;
    }
  | {
      id: string;
      itemType: "wallpaper";
      tweak: null;
      wallpaper: Wallpaper;
      createdAt: string;
    };

export type ToggleFavoriteInput = {
  itemType: FavoriteItemType;
  itemId: string;
};

export type ToggleFavoriteResult = {
  success: boolean;
  isFavorite: boolean;
};
