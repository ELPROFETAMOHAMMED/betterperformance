import type { SelectedItem } from "@/shared/types/selection.types";

export type FavoriteItemType = "tweak" | "wallpaper";

export type ToggleFavoriteInput = {
  itemType: FavoriteItemType;
  itemId: string;
};

export type ToggleFavoriteResult = {
  success: boolean;
  isFavorite: boolean;
};

export type FavoriteItem = {
  id: string;
  itemType: "selection";
  tweak: null;
  wallpaper: null;
  selection: {
    name: string;
    items: SelectedItem[];
    createdAt: string;
  };
  createdAt: string;
};
