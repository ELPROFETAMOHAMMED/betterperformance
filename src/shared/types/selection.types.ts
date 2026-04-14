import type { Tweak } from "@/features/tweaks/types/tweak.types";
import type { Wallpaper } from "@/features/wallpapers/types/wallpaper.types";

export type SelectedTweakItem = {
  id: string;
  type: "tweak";
  item: Tweak;
};

export type SelectedWallpaperItem = {
  id: string;
  type: "wallpaper";
  item: Wallpaper;
};

export type SelectedItem = SelectedTweakItem | SelectedWallpaperItem;
