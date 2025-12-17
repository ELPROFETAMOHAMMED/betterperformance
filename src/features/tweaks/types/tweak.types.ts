export interface TweakHistoryEntry {
  id: string;
  userId: string;
  createdAt: string;
  name?: string;
  tweaks: { id: string }[] | string | unknown;
  isFavorite?: boolean;
}

export interface Tweak {
  id: string;
  title: string;
  description?: string;
  code?: string;
  category_id?: string;
  download_count: number;
  favorite_count: number;
  report_count?: number;
  image?: string;
  notes?: string;
  is_visible: boolean;
  tweak_comment?: string;
  docs?: string;
  default_tweak_value?: string;
}

export interface TweakCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  tweaks?: Tweak[];
}
