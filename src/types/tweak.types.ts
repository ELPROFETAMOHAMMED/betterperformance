// Represents a saved tweak history/configuration for a user
export interface TweakHistoryEntry {
  id: string;
  userId: string;
  createdAt: string;
  name?: string;
  tweaks: Tweak[];
}
export interface TweakMetadata {
  report: number;
  downloadCount: number;
  tweakComment: string;
}

export interface Tweak {
  id: string;
  title: string;
  icon: string;
  description: string;
  tweak_metadata: TweakMetadata;
  code?: string;
  category_id: string;
}

export interface TweakCategory {
  id: string;
  name: string;
  icon: string;
  tweaks: Tweak[];
}
