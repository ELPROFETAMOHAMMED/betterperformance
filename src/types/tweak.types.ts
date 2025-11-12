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
}

export interface TweakCategory {
  id: string;
  name: string;
  icon: string;
  tweaks: Tweak[];
}
