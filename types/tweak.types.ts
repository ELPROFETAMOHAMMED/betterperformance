export interface TweakMetadata {
  report: number;
  downloadCount: number;
  tweakComment: string;
}

export interface Tweak {
  id: string;
  title: string;
  icon: string; // Nombre del icono como string
  description: string;
  tweak_metadata: TweakMetadata;
  code?: string; // Código PowerShell que se agregará al editor
}

export interface TweakCategory {
  id: string;
  name: string;
  icon: string; // Nombre del icono como string
  tweaks: Tweak[];
}

